import { Component, inject, signal } from '@angular/core';
import { KaomojiFace } from '../kaomoji-face/kaomoji-face';
import { MascotteEtat } from '../mascotte-etat';
import { MascotteStatut } from '../mascotte-statut';
import { createDefaultObjects } from '../objects/default-objects';
import { ObjectView } from '../objects/object-view';
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

/** Scène en trois couches : fond, objets, personnage (devant). */
@Component({
  selector: 'app-scene',
  imports: [KaomojiFace, ObjectView],
  templateUrl: './scene.html',
  styleUrl: './scene.css',
})
export class Scene {
  protected readonly etat = inject(MascotteEtat);
  protected readonly statut = inject(MascotteStatut);
  protected readonly objects = signal<SceneObject[]>(createDefaultObjects());
  protected readonly feuilles = FEUILLES;
}
