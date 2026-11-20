import { Component, computed, inject, signal } from '@angular/core';
import { KaomojiFace } from '../kaomoji/kaomoji-face/kaomoji-face';
import { KaomojiEffect, NiveauGros } from '../kaomoji/kaomoji-effect/kaomoji-effect';
import { MascotteEtat } from '../mascotte-etat';
import { MascotteStatut } from '../mascotte-statut';
import { createDefaultObjects } from '../objects/default-objects';
import { ObjectView } from '../objects/object-view/object-view';
import { SceneObject } from '../objects/scene-object';

/** Feuilles qui tombent sur le fond (position %, durée et retard en secondes). */
const FEUILLES = [
  { e: '🍁', left: 5, duree: 9, retard: 0 },
  { e: '🍂', left: 20, duree: 11, retard: 1 },
  { e: '🍁', left: 35, duree: 10, retard: 2 },
  { e: '🍂', left: 50, duree: 12, retard: 0.5 },
  { e: '🍁', left: 65, duree: 9, retard: 1.5 },
  { e: '🍂', left: 80, duree: 11, retard: 2.5 },
  { e: '🍁', left: 92, duree: 12, retard: 3 },
];

/** Nombre de pat-pat d'affilée à partir duquel il est complètement perdu. */
const PATS_CONFUS = 5;

/** Éclats projetés par l'explosion (un par direction, tous les 45°). */
const ECLATS = ['🍖', '✨', '💥', '🦴', '🍖', '✨', '💥', '🦴'];

/** Scène en trois couches : fond, objets, personnage (devant). */
@Component({
  selector: 'app-scene',
  imports: [KaomojiFace, KaomojiEffect, ObjectView],
  templateUrl: './scene.html',
  styleUrl: './scene.css',
})
export class Scene {
  protected readonly etat = inject(MascotteEtat);
  protected readonly statut = inject(MascotteStatut);
  protected readonly objects = signal<SceneObject[]>(createDefaultObjects());
  /** Surpoids (1 à 5) = niveau d'obésité. */
  protected readonly niveauGros = computed(() => Math.min(5, this.statut.surpoids()) as NiveauGros);
  /** Tapoter le rend neutre ; beaucoup, confus. */
  protected tapoter(nombre: number): void {
    this.etat.choisir(nombre >= PATS_CONFUS ? 'confus' : 'neutre');
    this.tapote = true;
  }

  /** Fin des pat-pat : retour à l'humeur déduite du statut. */
  protected calmer(): void {
    if (this.tapote) this.etat.liberer();
    this.tapote = false;
  }

  private tapote = false;
  protected readonly feuilles = FEUILLES;
  protected readonly eclats = ECLATS;
}
