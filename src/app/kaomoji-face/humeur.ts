export type Humeur =
  | 'neutre'
  | 'content'
  | 'triste'
  | 'tresJaloux'
  | 'jaloux'
  | 'gave'
  | 'gros'
  | 'tresGrognon'
  | 'grognon'
  | 'cadeau';

export const VISAGES: Record<Humeur, string> = {
  neutre: '( o _ o)',
  content: '(˃ᆺ˂)',
  triste: '(T w T)',
  tresJaloux: '8(>_<)8',
  jaloux: '(¬_¬)',
  gave: '(×﹏×)',
  gros: '(｡>﹏<｡)',
  tresGrognon: 'ヽ(ಠ益ಠヽ)',
  grognon: 'ಠ益ಠ',
  cadeau: '(> w <)',
};

export const LIBELLES: Record<Humeur, string> = {
  neutre: 'Neutre',
  content: 'Content',
  triste: 'Triste',
  tresJaloux: 'Très jaloux',
  jaloux: 'Jaloux',
  gave: 'Gavé',
  gros: 'Gros',
  tresGrognon: 'Très grognon',
  grognon: 'Grognon',
  cadeau: 'Cadeau',
};

export const HUMEURS = Object.keys(VISAGES) as Humeur[];
