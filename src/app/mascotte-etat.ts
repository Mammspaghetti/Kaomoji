import { Injectable, computed, inject, signal } from '@angular/core';
import { HUMEURS, Humeur, VISAGES } from './kaomoji-face/humeur';
import { MascotteStatut } from './mascotte-statut';

const CLE_STOCKAGE = 'kaomoji.visages';
const CLE_NOM = 'kaomoji.nom';
const NOM_PAR_DEFAUT = 'Kaomoji-san';
const LONGUEUR_MAX = 30;

type VisagesPerso = Partial<Record<Humeur, string>>;

/** Humeur affichée et visages associés. Le statut vital est géré par {@link MascotteStatut}. */
@Injectable({ providedIn: 'root' })
export class MascotteEtat {
  private readonly statut = inject(MascotteStatut);

  readonly humeur = this.statut.humeur;
  /** Humeur choisie à la main (null = automatique, déduite du statut). */
  readonly humeurImposee = this.statut.humeurImposee;

  /** Visages importés par l'utilisateur, qui remplacent ceux par défaut. */
  readonly visagesPerso = signal<VisagesPerso>(this.lire());

  readonly visages = computed<Record<Humeur, string>>(() => ({
    ...VISAGES,
    ...this.visagesPerso(),
  }));

  readonly visage = computed(() => this.visages()[this.humeur()]);

  /** Nom du personnage, modifiable et conservé d'une session à l'autre. */
  readonly nom = signal(this.lireNom());

  /** Renomme le personnage. Renvoie false si le nom est vide ou trop long. */
  renommer(nom: string): boolean {
    const n = nom.trim();
    if (!n || n.length > LONGUEUR_MAX) return false;
    this.nom.set(n);
    try {
      localStorage.setItem(CLE_NOM, n);
    } catch {
      // stockage indisponible : le nom reste valable pour la session
    }
    return true;
  }

  choisir(humeur: Humeur): void {
    this.statut.imposer(humeur);
  }

  /** Repasse en humeur automatique. */
  liberer(): void {
    this.statut.imposer(null);
  }

  /** Tire une humeur au hasard, différente de l'actuelle. */
  aleatoire(): void {
    const autres = HUMEURS.filter((h) => h !== this.humeur());
    this.statut.imposer(autres[Math.floor(Math.random() * autres.length)]);
  }

  /** Associe un visage importé à une humeur et l'affiche. Renvoie false si invalide. */
  associer(humeur: Humeur, visage: string): boolean {
    const v = visage.trim();
    if (!v || v.length > LONGUEUR_MAX || !HUMEURS.includes(humeur)) return false;
    this.ecrire({ ...this.visagesPerso(), [humeur]: v });
    this.statut.imposer(humeur);
    return true;
  }

  /** Rétablit le visage par défaut d'une humeur. */
  reinitialiser(humeur: Humeur): void {
    const reste = { ...this.visagesPerso() };
    delete reste[humeur];
    this.ecrire(reste);
  }

  private ecrire(valeur: VisagesPerso): void {
    this.visagesPerso.set(valeur);
    try {
      localStorage.setItem(CLE_STOCKAGE, JSON.stringify(valeur));
    } catch {
      // stockage indisponible : le visage reste valable pour la session
    }
  }

  private lireNom(): string {
    try {
      const n = localStorage.getItem(CLE_NOM)?.trim();
      return n && n.length <= LONGUEUR_MAX ? n : NOM_PAR_DEFAUT;
    } catch {
      return NOM_PAR_DEFAUT;
    }
  }

  private lire(): VisagesPerso {
    try {
      const brut = JSON.parse(localStorage.getItem(CLE_STOCKAGE) ?? '{}');
      const resultat: VisagesPerso = {};
      for (const h of HUMEURS) {
        const v = brut?.[h];
        if (typeof v === 'string' && v.length <= LONGUEUR_MAX) resultat[h] = v;
      }
      return resultat;
    } catch {
      return {};
    }
  }
}
