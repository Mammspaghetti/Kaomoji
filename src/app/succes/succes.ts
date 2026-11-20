import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { MascotteStatut } from '../mascotte-statut';

const CLE_STOCKAGE = 'kaomoji.succes';

export interface SuccesDef {
  id: string;
  titre: string;
  /** Comment l'obtenir. */
  description: string;
}

export const SUCCES: readonly SuccesDef[] = [
  { id: 'macron-explosion', titre: 'Macron explosion', description: 'Le gaver jusqu’à ce qu’il explose.' },
  { id: 'oh-djadja', titre: 'Oh Djadja', description: 'L’écraser à force de pat-pat.' },
  { id: 'jealous-bitch', titre: 'Jealous Bitch', description: 'Le rendre jaloux.' },
];

/** Succès débloqués (conservés d'une session à l'autre) et ouverture de leur fenêtre. */
@Injectable({ providedIn: 'root' })
export class Succes {
  private readonly statut = inject(MascotteStatut);

  readonly liste = SUCCES;
  readonly debloques = signal<ReadonlySet<string>>(this.lire());
  readonly nombre = computed(() => this.debloques().size);
  /** Fenêtre des succès ouverte ? */
  readonly ouvert = signal(false);

  constructor() {
    effect(() => {
      if (this.statut.phase() === 'explosion') this.debloquer('macron-explosion');
    });
    effect(() => {
      if (this.statut.ecrasements() > 0) this.debloquer('oh-djadja');
    });
    effect(() => {
      if (this.statut.isJaloux()) this.debloquer('jealous-bitch');
    });
  }

  estDebloque(id: string): boolean {
    return this.debloques().has(id);
  }

  ouvrir(): void {
    this.ouvert.set(true);
  }

  fermer(): void {
    this.ouvert.set(false);
  }

  private debloquer(id: string): void {
    untracked(() => {
      if (this.debloques().has(id)) return;
      const suivants = new Set(this.debloques()).add(id);
      this.debloques.set(suivants);
      try {
        localStorage.setItem(CLE_STOCKAGE, JSON.stringify([...suivants]));
      } catch {
        // stockage indisponible : le succès reste valable pour la session
      }
    });
  }

  private lire(): Set<string> {
    try {
      const brut = JSON.parse(localStorage.getItem(CLE_STOCKAGE) ?? '[]');
      const ids = new Set(SUCCES.map((s) => s.id));
      return new Set(Array.isArray(brut) ? brut.filter((i) => ids.has(i)) : []);
    } catch {
      return new Set();
    }
  }
}
