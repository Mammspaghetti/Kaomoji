import { DestroyRef, Injectable, WritableSignal, computed, inject, signal } from '@angular/core';
import { Humeur } from './kaomoji-face/humeur';
import { Bowl } from './objects/bowl';

const DUREE_COURTE = 2500;
const DUREE_JALOUSIE = 10000;

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

  /** 0 = rassasiée, 5 = affamée. Au-delà de 2 elle est grognon. */
  readonly faim = signal(2);
  /** Croquettes mangées sans avoir faim. */
  readonly surpoids = signal(0);
  readonly cadeaux = signal(1);
  /** Monte quand un rival reçoit un cadeau, baisse quand elle en reçoit un. */
  readonly niveauJalousie = signal(0);
  readonly humeurImposee = signal<Humeur | null>(null);

  // États temporaires
  readonly isTriste = signal(false);
  readonly aUnCadeau = signal(false);
  readonly isReclame = signal(false);
  readonly isJaloux = signal(false);
  readonly isVole = signal(false);
  readonly message = signal('');

  readonly isGros = computed(() => this.surpoids() > 0);
  readonly isGave = computed(() => this.surpoids() >= this.surpoidsMax);
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
    if (this.isVole()) return { texte: 'C’EST MAL DE VOLER ! 😡', type: 'message', niveau: 0 };
    if (this.message()) return { texte: this.message(), type: 'message', niveau: 0 };
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

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timers.forEach((t) => clearTimeout(t)));
  }

  /** Impose une humeur (ou `null` pour revenir au calcul automatique). */
  imposer(humeur: Humeur | null): void {
    this.humeurImposee.set(humeur);
  }

  /** La gamelle sert une croquette. Renvoie false si elle est vide ou si la mascotte est gavée. */
  manger(gamelle: Bowl): boolean {
    if (gamelle.isEmpty() || this.isGave()) return false;
    gamelle.take();
    this.imposer(null);
    if (this.faim() > 0) {
      this.faim.update((f) => f - 1);
    } else {
      this.surpoids.update((s) => s + 1);
      this.afficher(this.isGave() ? 'JE VAIS EXPLOSER ! 🤢' : 'J’AI PLUS FAIM ! 🐷');
    }
    return true;
  }

  /** On vole la nourriture : gamelle vidée, mascotte affamée (et elle reperd ses kilos). */
  voler(gamelle: Bowl): void {
    gamelle.empty();
    this.imposer(null);
    this.faim.set(this.faimMax);
    this.surpoids.set(0);
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
