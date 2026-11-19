import { computed, signal } from '@angular/core';
import { ObjectKind, SceneObject } from './scene-object';

export interface BowlOptions {
  id: string;
  x: number;
  y: number;
  /** Nombre maximal de portions que la gamelle peut contenir. */
  capacity?: number;
  /** Portions présentes au départ (par défaut : pleine). */
  level?: number;
  /** Portions consommées à chaque repas. */
  portion?: number;
}

/** Gamelle : un stock de nourriture limité, que le personnage consomme et qu'on peut remplir. */
export class Bowl implements SceneObject {
  readonly kind: ObjectKind = 'bowl';
  readonly emoji = '🥣';
  readonly label = 'Gamelle';

  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly capacity: number;
  readonly portion: number;

  private readonly _level: ReturnType<typeof signal<number>>;
  readonly level;
  readonly isEmpty = computed(() => this._level() < this.portion);
  readonly isFull = computed(() => this._level() >= this.capacity);

  constructor(options: BowlOptions) {
    this.id = options.id;
    this.x = options.x;
    this.y = options.y;
    this.capacity = Math.max(1, options.capacity ?? 5);
    this.portion = Math.max(1, options.portion ?? 1);
    this._level = signal(this.clamp(options.level ?? this.capacity));
    this.level = this._level.asReadonly();
  }

  /** Sert une portion. Renvoie false si la gamelle est vide. */
  take(): boolean {
    if (this.isEmpty()) return false;
    this._level.update((n) => n - this.portion);
    return true;
  }

  /** Ajoute `amount` portions (par défaut : jusqu'à la capacité). Renvoie la quantité ajoutée. */
  fill(amount = this.capacity): number {
    const avant = this._level();
    this._level.set(this.clamp(avant + amount));
    return this._level() - avant;
  }

  /** Vide complètement la gamelle (vol de nourriture). */
  empty(): void {
    this._level.set(0);
  }

  private clamp(n: number): number {
    return Math.min(this.capacity, Math.max(0, n));
  }
}
