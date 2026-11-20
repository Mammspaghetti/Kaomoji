import { Component, DestroyRef, WritableSignal, computed, inject, input, signal } from '@angular/core';
import { MascotteEtat } from '../../mascotte-etat';
import { MascotteStatut } from '../../mascotte-statut';
import { Bowl } from '../bowl';

/** Positions des croquettes dans la gamelle (left %, bottom px, rotation). */
const POSITIONS = [
  { left: 22, bottom: 0, rot: -15 },
  { left: 40, bottom: 0, rot: 20 },
  { left: 58, bottom: 0, rot: -30 },
  { left: 31, bottom: 9, rot: 40 },
  { left: 49, bottom: 9, rot: -10 },
  { left: 67, bottom: 3, rot: 25 },
  { left: 13, bottom: 4, rot: 10 },
  { left: 40, bottom: 17, rot: -35 },
];

/** Gamelle dessinée, avec ses actions : nourrir, remplir, voler. */
@Component({
  selector: 'app-bowl-view',
  templateUrl: './bowl-view.html',
  styleUrl: './bowl-view.css',
})
export class BowlView {
  protected readonly statut = inject(MascotteStatut);
  protected readonly etat = inject(MascotteEtat);
  private readonly timers: ReturnType<typeof setTimeout>[] = [];

  readonly bowl = input.required<Bowl>();

  /** Secousse de la gamelle quand on nourrit / quand on vole. */
  protected readonly miam = signal(false);
  protected readonly secoue = signal(false);

  protected readonly croquettes = computed(() =>
    POSITIONS.slice(0, Math.min(this.bowl().level(), POSITIONS.length)),
  );

  protected readonly nourrirDesactive = computed(
    () => this.bowl().isEmpty() || this.statut.isGave() || this.statut.phase() !== 'normal',
  );

  protected readonly message = computed(() => {
    const b = this.bowl();
    if (this.statut.phase() !== 'normal') return 'Il n’est pas là… 💫';
    if (this.statut.isGave()) return 'Elle va exploser ! 🤢';
    if (b.isEmpty()) return 'Gamelle vide ! 😿';
    if (this.statut.faim() <= 0) return 'Plus faim… attention ! 😬';
    return `${b.level()}/${b.capacity} croquettes`;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timers.forEach((t) => clearTimeout(t)));
  }

  protected nourrir(): void {
    if (this.nourrirDesactive()) return;
    if (this.statut.manger(this.bowl())) this.flash(this.miam, 400);
  }

  protected remplir(): void {
    this.bowl().fill();
  }

  protected voler(): void {
    this.statut.voler(this.bowl());
    this.flash(this.secoue, 600);
  }

  private flash(drapeau: WritableSignal<boolean>, ms: number): void {
    drapeau.set(true);
    this.timers.push(setTimeout(() => drapeau.set(false), ms));
  }
}
