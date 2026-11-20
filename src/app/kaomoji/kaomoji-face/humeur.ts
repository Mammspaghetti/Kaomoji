export type Humeur =
  | 'neutre'
  | 'confus'
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
  confus: '(@_@)',
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
  confus: 'Confus',
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

/** Fond de la bulle (et des oreilles) selon l'humeur : pastel doux, qui vire au vert, au rouge… */
export const PEAUX: Record<Humeur, string> = {
  neutre: 'linear-gradient(145deg, #fdfcf8, #ece4da)',
  confus: 'linear-gradient(145deg, #efe6fa, #c3b0e0)',
  content: 'linear-gradient(145deg, #fffaf3, #ffdcc9)',
  triste: 'linear-gradient(145deg, #e3edf7, #a9c1dd)',
  tresJaloux: 'radial-gradient(circle, #9be36b, #1f6b12)',
  jaloux: 'linear-gradient(145deg, #d8f5c4, #7cbf5a)',
  gave: 'linear-gradient(145deg, #e5f0c8, #a9c27a)',
  gros: 'linear-gradient(145deg, #ffd9e0, #e98da0)',
  tresGrognon: 'linear-gradient(145deg, #ffc9bd, #e8604c)',
  grognon: 'linear-gradient(145deg, #ffe8dc, #f2a58a)',
  cadeau: 'linear-gradient(145deg, #fff3c4, #ffd36e)',
};
