import { Bowl } from './bowl';
import { SceneObject } from './scene-object';

/** Objets présents au départ. Crée de nouvelles instances à chaque appel (la gamelle a un état). */
export function createDefaultObjects(): SceneObject[] {
  return [
    new Bowl({ id: 'bowl', x: 50, y: 78, capacity: 5 }),
    { id: 'plant', kind: 'decor', emoji: '🪴', label: 'Plante', x: 12, y: 74 },
  ];
}
