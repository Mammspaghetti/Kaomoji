import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, vi } from 'vitest';

import { MascotteStatut } from './mascotte-statut';
import { Bowl } from './objects/bowl';

describe('MascotteStatut', () => {
  let s: MascotteStatut;
  const gamelle = (capacity = 20) => new Bowl({ id: 'b', x: 0, y: 0, capacity });

  beforeEach(() => {
    vi.useFakeTimers();
    s = TestBed.inject(MascotteStatut);
  });
  afterEach(() => vi.useRealTimers());

  it('est neutre au départ', () => {
    expect(s.humeur()).toBe('neutre');
  });

  it('est grognon quand elle a faim, très grognon sans cadeau', () => {
    s.faim.set(5);
    expect(s.humeur()).toBe('grognon');
    s.cadeaux.set(0);
    expect(s.humeur()).toBe('tresGrognon');
    expect(s.bandeau()?.texte).toContain('JE VEUX UN CADEAU');
  });

  it('mange : la faim baisse, puis elle grossit, puis elle est gavée', () => {
    const g = gamelle(40);
    s.manger(g);
    s.manger(g);
    expect(s.faim()).toBe(0);
    expect(s.humeur()).toBe('neutre');

    // +1 niveau d'obésité tous les 5 repas : 4 repas ne suffisent pas
    for (let i = 0; i < s.repasParNiveau - 1; i++) s.manger(g);
    expect(s.surpoids()).toBe(0);
    expect(s.humeur()).toBe('neutre');
    s.manger(g);
    expect(s.surpoids()).toBe(1);
    expect(s.humeur()).toBe('gros');
    expect(s.bandeau()).toMatchObject({ type: 'message' });

    // 5 gamelles pleines de plus et elle est gavée
    for (let i = 0; i < (s.surpoidsMax - 1) * s.repasParNiveau; i++) s.manger(g);
    expect(s.surpoids()).toBe(s.surpoidsMax);
    expect(s.humeur()).toBe('gave');
    expect(s.manger(g)).toBe(false);
    expect(g.level()).toBe(40 - 2 - s.surpoidsMax * s.repasParNiveau);
  });

  it('ne mange pas quand la gamelle est vide', () => {
    const g = gamelle(1);
    g.empty();
    expect(s.manger(g)).toBe(false);
    expect(s.faim()).toBe(2);
  });

  it('le STOP grossit avec le surpoids', () => {
    s.faim.set(0);
    s.surpoids.set(3);
    vi.advanceTimersByTime(3000);
    expect(s.bandeau()).toEqual({ texte: 'STOP!!!', type: 'stop', niveau: 3 });
  });

  it('vole : gamelle vidée, affamée, kilos perdus, puis le message disparaît', () => {
    const g = gamelle(5);
    s.surpoids.set(2);
    s.voler(g);
    expect(g.isEmpty()).toBe(true);
    expect(s.faim()).toBe(5);
    expect(s.surpoids()).toBe(0);
    expect(s.bandeau()?.texte).toContain('VOLER');
    vi.advanceTimersByTime(2500);
    expect(s.isVole()).toBe(false);
  });

  it('devient jalouse quand un rival reçoit un cadeau, très jalouse au niveau max', () => {
    s.cadeauRival();
    expect(s.humeur()).toBe('jaloux');
    vi.advanceTimersByTime(10000);
    expect(s.humeur()).toBe('neutre');

    s.cadeauRival();
    s.cadeauRival();
    expect(s.isTresJaloux()).toBe(true);
    vi.advanceTimersByTime(10000);
    expect(s.humeur()).toBe('tresJaloux');
    s.offrirCadeau();
    expect(s.niveauJalousie()).toBe(2);
  });

  it('réagit aux cadeaux : content, réclame, triste (réactions temporaires)', () => {
    s.offrirCadeau();
    expect(s.humeur()).toBe('cadeau');
    vi.advanceTimersByTime(2500);
    expect(s.humeur()).toBe('neutre');

    s.reprendreCadeau();
    expect(s.isReclame()).toBe(true);
    expect(s.humeur()).toBe('grognon');
    vi.advanceTimersByTime(2500);
    expect(s.isReclame()).toBe(false);

    s.supprimerCadeau();
    expect(s.humeur()).toBe('triste');
    vi.advanceTimersByTime(2500);
    expect(s.humeur()).toBe('neutre');
  });

  it("une humeur imposée prime sur le statut jusqu'à la prochaine interaction", () => {
    s.imposer('gave');
    expect(s.humeur()).toBe('gave');
    s.offrirCadeau();
    expect(s.humeurImposee()).toBeNull();
    expect(s.humeur()).toBe('cadeau');
  });

  describe('explosion', () => {
    /** Amène la mascotte à un cheveu du gavage, puis lui donne la croquette de trop. */
    const gaver = (g: Bowl) => {
      s.faim.set(0);
      s.surpoids.set(s.surpoidsMax - 1);
      s.repasGaves.set(s.repasParNiveau - 1);
      s.manger(g);
    };

    it('gavée, elle tremble puis explose, disparaît, et revient toute petite 10 s après', () => {
      gaver(gamelle());
      expect(s.humeur()).toBe('gave');
      expect(s.phase()).toBe('normal');

      vi.advanceTimersByTime(1500);
      expect(s.phase()).toBe('explosion');
      expect(s.bandeau()?.texte).toContain('MACRON EXPLOSION');

      vi.advanceTimersByTime(1000);
      expect(s.phase()).toBe('absent');

      vi.advanceTimersByTime(8999);
      expect(s.phase()).toBe('absent');
      vi.advanceTimersByTime(1);
      expect(s.phase()).toBe('normal');
      expect(s.taille()).toBe(0);
      expect(s.echelle()).toBe(0.5);
      expect(s.surpoids()).toBe(0);
      expect(s.faim()).toBe(5);
    });

    it('ne mange plus tant qu’elle est en train d’exploser ou absente', () => {
      const g = gamelle();
      gaver(g);
      vi.advanceTimersByTime(1500);
      expect(s.manger(g)).toBe(false);
      vi.advanceTimersByTime(1000);
      expect(s.manger(g)).toBe(false);
    });

    it('lui voler sa nourriture avant le BOUM annule l’explosion', () => {
      const g = gamelle();
      gaver(g);
      s.voler(g);
      vi.advanceTimersByTime(20000);
      expect(s.phase()).toBe('normal');
      expect(s.taille()).toBe(5);
    });

    it('un petit grandit à chaque repas jusqu’à sa taille normale, sans grossir', () => {
      const g = gamelle();
      s.taille.set(0);
      s.faim.set(5);
      for (let i = 1; i <= s.tailleMax; i++) {
        expect(s.manger(g)).toBe(true);
        expect(s.taille()).toBe(i);
      }
      expect(s.isPetit()).toBe(false);
      expect(s.echelle()).toBe(1);
      expect(s.surpoids()).toBe(0);
      expect(s.faim()).toBe(0);
    });

    it('invite à nourrir un petit', () => {
      s.taille.set(1);
      expect(s.bandeau()?.texte).toContain('NOURRIS-MOI');
    });
  });
});
