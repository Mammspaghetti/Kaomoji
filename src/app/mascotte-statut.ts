import { DestroyRef, Injectable, WritableSignal, computed, inject, signal } from '@angular/core';
import { Humeur } from './kaomoji/kaomoji-face/humeur';
import { PATS_CONFUS, PATS_ECRASE, PATS_REFUS } from './kaomoji/pat-pat';
import { Bowl } from './objects/bowl';

const DUREE_COURTE = 2500;
const DUREE_JALOUSIE = 10000;
/** Gavée, elle tremble un instant avant d'exploser. */
const DUREE_GAVE = 1500;
const DUREE_EXPLOSION = 1000;
/** Délai entre l'explosion et sa réapparition. */
const DUREE_ABSENCE = 5000;

/** normal : présente · explosion : le BOUM · absent : elle va réapparaître, toute petite. */
export type Phase = 'normal' | 'explosion' | 'absent';

/** Texte affiché au-dessus du personnage : message temporaire ou « STOP » de plus en plus gros. */
export interface Bandeau {
  texte: string;
  type: 'message' | 'stop';
  niveau: number;
}

/**
 * Statut vital de la mascotte (faim, poids, cadeaux, jalousie) et réactions temporaires.
 * L'humeur affichée en découle, sauf si l'utilisateur en impose une (`humeurImposee`) ;
 * toute interaction relâche l'humeur imposée.
 */
@Injectable({ providedIn: 'root' })
export class MascotteStatut {
  readonly faimMax = 5;
  readonly surpoidsMax = 5;
  readonly jalousieMax = 3;
  /** Nombre de repas pour qu'un petit atteigne sa taille normale. */
  readonly tailleMax = 5;

  /** 0 = rassasiée, 5 = affamée. Au-delà de 2 elle est grognon. */
  readonly faim = signal(2);
  /** Niveau d'obésité, de 0 à `surpoidsMax` : +1 tous les `repasParNiveau` repas pris sans avoir faim. */
  readonly surpoids = signal(0);
  /** Repas pris sans avoir faim depuis le dernier niveau d'obésité. */
  readonly repasGaves = signal(0);
  /** Repas gavés qu'il faut pour gagner un niveau d'obésité (= une gamelle pleine). */
  readonly repasParNiveau = 5;
  readonly cadeaux = signal(1);
  /** Monte quand un rival reçoit un cadeau, baisse quand elle en reçoit un. */
  readonly niveauJalousie = signal(0);
  readonly humeurImposee = signal<Humeur | null>(null);

  /** Taille de 0 (tout petit, après une explosion) à `tailleMax` (normale). On grandit en mangeant. */
  readonly taille = signal(5);
  readonly phase = signal<Phase>('normal');

  // États temporaires
  readonly isTriste = signal(false);
  readonly aUnCadeau = signal(false);
  readonly isReclame = signal(false);
  readonly isJaloux = signal(false);
  readonly isVole = signal(false);
  readonly message = signal('');

  readonly isGros = computed(() => this.surpoids() > 0);
  readonly isGave = computed(() => this.surpoids() >= this.surpoidsMax);
  /** Facteur d'échelle du personnage : 0,5 pour un petit, 1 à taille normale. */
  readonly echelle = computed(() => 0.5 + (0.5 * this.taille()) / this.tailleMax);
  readonly isPetit = computed(() => this.taille() < this.tailleMax);
  readonly isTresJaloux = computed(() => this.niveauJalousie() >= this.jalousieMax);
  readonly isGrognon = computed(() => this.faim() > 2 || this.isReclame());
  readonly isTresGrognon = computed(() => this.isGrognon() && this.cadeaux() === 0);

  /** Humeur déduite du statut (même ordre de priorité que l'ancien visage). */
  readonly humeurCalculee = computed<Humeur>(() => {
    if (this.isTriste()) return 'triste';
    if (this.isTresJaloux()) return 'tresJaloux';
    if (this.isJaloux()) return 'jaloux';
    if (this.isGave()) return 'gave';
    if (this.isGros()) return 'gros';
    if (this.isTresGrognon()) return 'tresGrognon';
    if (this.aUnCadeau()) return 'cadeau';
    return this.isGrognon() ? 'grognon' : 'neutre';
  });

  /** Humeur affichée : celle imposée par l'utilisateur, sinon celle du statut. */
  readonly humeur = computed(() => this.humeurImposee() ?? this.humeurCalculee());

  readonly bandeau = computed<Bandeau | null>(() => {
    if (this.phase() === 'explosion') return { texte: 'MACRON EXPLOSION 💥', type: 'message', niveau: 0 };
    if (this.phase() === 'absent') {
      return { texte: 'Il va revenir, tout petit… 💫', type: 'message', niveau: 0 };
    }
    if (this.isVole()) return { texte: 'C’EST MAL DE VOLER ! 😡', type: 'message', niveau: 0 };
    if (this.message()) return { texte: this.message(), type: 'message', niveau: 0 };
    if (this.isPetit()) return { texte: 'NOURRIS-MOI POUR GRANDIR ! 🍖', type: 'message', niveau: 0 };
    if (this.isTresJaloux()) {
      return { texte: 'C’EST TOUJOURS LES AUTRES ! 💚😡', type: 'message', niveau: 0 };
    }
    if (this.isGros()) {
      return { texte: 'STOP' + '!'.repeat(this.surpoids()), type: 'stop', niveau: this.surpoids() };
    }
    if (this.isTresGrognon()) return { texte: 'JE VEUX UN CADEAU ! 🤬', type: 'message', niveau: 0 };
    return null;
  });

  private readonly timers = new Map<object, ReturnType<typeof setTimeout>>();
  private timerPhase?: ReturnType<typeof setTimeout>;
  /** Plus longue série de pat-pat en cours. */
  private pats = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.timers.forEach((t) => clearTimeout(t));
      clearTimeout(this.timerPhase);
    });
  }

  /** Impose une humeur (ou `null` pour revenir au calcul automatique). */
  imposer(humeur: Humeur | null): void {
    this.humeurImposee.set(humeur);
  }

  /**
   * La gamelle sert une croquette. Un petit grandit à chaque repas ; à taille normale, trop manger
   * la fait grossir puis exploser. Renvoie false si elle est vide, si la mascotte est gavée ou absente.
   */
  manger(gamelle: Bowl): boolean {
    if (this.phase() !== 'normal' || gamelle.isEmpty() || this.isGave()) return false;
    gamelle.take();
    this.imposer(null);
    if (this.isPetit()) {
      this.taille.update((t) => t + 1);
      if (this.faim() > 0) this.faim.update((f) => f - 1);
      if (!this.isPetit()) this.afficher('JE SUIS GRAND ! 🎉');
    } else if (this.faim() > 0) {
      this.faim.update((f) => f - 1);
    } else {
      this.repasGaves.update((n) => n + 1);
      if (this.repasGaves() < this.repasParNiveau) {
        this.afficher('J’AI PLUS FAIM ! 🐷');
      } else {
        this.repasGaves.set(0);
        this.surpoids.update((s) => s + 1);
        this.afficher(this.isGave() ? 'JE VAIS EXPLOSER ! 🤢' : 'JE GROSSIS ! 🐷');
        if (this.isGave()) this.programmerExplosion();
      }
    }
    return true;
  }

  /**
   * Un pat-pat, le n-ième de la série : neutre, puis confus, puis il en a assez, puis écrasé et furieux.
   */
  tapoter(nombre: number): void {
    this.pats = Math.max(this.pats, nombre);
    if (nombre >= PATS_ECRASE) {
      this.imposer('tresGrognon');
      if (nombre === PATS_ECRASE) this.afficher('Mais ça va pas, mais t’es taré ! 😡');
      return;
    }
    this.imposer(nombre >= PATS_CONFUS ? 'confus' : 'neutre');
    if (nombre === 1) this.afficher('Oh djadja… 😳');
    if (nombre === PATS_REFUS) this.afficher('Y a pas moyen djadja ! 😵');
  }

  /**
   * Fin d'une série de pat-pat : ça défoule, il perd un niveau d'obésité.
   * S'il a été écrasé il reste furieux jusqu'à la prochaine interaction.
   */
  finTapotage(): void {
    if (this.pats === 0) return;
    if (this.pats < PATS_ECRASE) this.imposer(null);
    this.pats = 0;
    if (this.surpoids() > 0) this.surpoids.update((s) => s - 1);
    this.repasGaves.set(0);
  }

  /** On vole la nourriture : gamelle vidée, mascotte affamée (et elle reperd ses kilos). */
  voler(gamelle: Bowl): void {
    gamelle.empty();
    this.imposer(null);
    this.faim.set(this.faimMax);
    this.surpoids.set(0);
    this.repasGaves.set(0);
    this.programmer(this.isVole, true, false, DUREE_COURTE);
  }

  offrirCadeau(): void {
    this.imposer(null);
    this.cadeaux.update((n) => n + 1);
    this.niveauJalousie.update((n) => Math.max(0, n - 1));
    this.annuler(this.isReclame, false);
    this.afficher('MERCI POUR LE CADEAU ! 🎁');
    this.programmer(this.aUnCadeau, true, false, DUREE_COURTE);
  }

  reprendreCadeau(): void {
    if (this.cadeaux() === 0) return;
    this.imposer(null);
    this.cadeaux.update((n) => n - 1);
    this.annuler(this.aUnCadeau, false);
    this.afficher('REND-LE-MOI ! 😠');
    this.programmer(this.isReclame, true, false, DUREE_COURTE);
  }

  supprimerCadeau(): void {
    if (this.cadeaux() === 0) return;
    this.imposer(null);
    this.cadeaux.update((n) => n - 1);
    this.annuler(this.aUnCadeau, false);
    this.afficher('Mon cadeau sniff !! 😭');
    this.programmer(this.isTriste, true, false, DUREE_COURTE);
  }

  /** Une autre mascotte reçoit un cadeau : jalouse pendant 10 s. */
  cadeauRival(): void {
    this.imposer(null);
    this.niveauJalousie.update((n) => Math.min(this.jalousieMax, n + 1));
    this.afficher('Une autre mascotte a reçu un cadeau ?! ET MOI ?! 😤', DUREE_JALOUSIE);
    this.programmer(this.isJaloux, true, false, DUREE_JALOUSIE);
  }

  /** Gavée → BOUM → absente → réapparaît toute petite. Voler la nourriture à temps l'annule. */
  private programmerExplosion(): void {
    clearTimeout(this.timerPhase);
    this.timerPhase = setTimeout(() => {
      if (!this.isGave()) return;
      this.phase.set('explosion');
      this.timerPhase = setTimeout(() => {
        this.phase.set('absent');
        this.timerPhase = setTimeout(
          () => this.reapparaitre(),
          DUREE_ABSENCE - DUREE_EXPLOSION,
        );
      }, DUREE_EXPLOSION);
    }, DUREE_GAVE);
  }

  private reapparaitre(): void {
    this.phase.set('normal');
    this.surpoids.set(0);
    this.repasGaves.set(0);
    this.taille.set(0);
    this.faim.set(this.faimMax);
    this.imposer(null);
    this.afficher('ME REVOILÀ ! 🐣', DUREE_COURTE);
  }

  private afficher(texte: string, ms = DUREE_COURTE): void {
    this.programmer(this.message, texte, '', ms);
  }

  private programmer<T>(cle: WritableSignal<T>, actif: T, repos: T, ms: number): void {
    clearTimeout(this.timers.get(cle));
    cle.set(actif);
    this.timers.set(
      cle,
      setTimeout(() => cle.set(repos), ms),
    );
  }

  private annuler<T>(cle: WritableSignal<T>, repos: T): void {
    clearTimeout(this.timers.get(cle));
    cle.set(repos);
  }
}
