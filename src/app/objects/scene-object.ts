export type ObjectKind = 'decor' | 'bowl';

/**
 * Contrat commun à tous les objets posables dans la scène.
 * Les positions sont en % de la scène (centre de l'objet).
 */
export interface SceneObject {
  readonly id: string;
  readonly kind: ObjectKind;
  readonly emoji: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
}
