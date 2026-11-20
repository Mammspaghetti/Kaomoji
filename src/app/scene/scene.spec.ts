import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Scene } from './scene';
import { MascotteEtat } from '../mascotte-etat';
import { MascotteStatut } from '../mascotte-statut';
import { createDefaultObjects } from '../objects/default-objects';

describe('Scene', () => {
  let fixture: ComponentFixture<Scene>;
  let el: HTMLElement;

  const bouton = (texte: string): HTMLButtonElement =>
    Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.includes(texte))!;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [Scene] }).compileComponents();
    fixture = TestBed.createComponent(Scene);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('contient un fond, des objets et le personnage', () => {
    expect(el.querySelector('.fond')).toBeTruthy();
    expect(el.querySelectorAll('.objets app-object').length).toBe(createDefaultObjects().length);
    expect(el.querySelector('.personnage app-kaomoji-face')).toBeTruthy();
    expect(el.querySelector('.bol-nom')?.textContent).toContain('Kaomoji');
  });

  describe('pat-pat', () => {
    const tapoter = async (fois: number) => {
      const effet = el.querySelector<HTMLElement>('app-kaomoji-effect')!;
      for (let i = 0; i < fois; i++) effet.click();
      await fixture.whenStable();
    };

    it('le rend neutre, même s’il était grognon', async () => {
      TestBed.inject(MascotteEtat).choisir('grognon');
      await tapoter(1);
      expect(TestBed.inject(MascotteEtat).humeur()).toBe('neutre');
    });

    it('beaucoup de pat-pat (5) le rendent confus', async () => {
      await tapoter(4);
      expect(TestBed.inject(MascotteEtat).humeur()).toBe('neutre');
      await tapoter(1);
      expect(TestBed.inject(MascotteEtat).humeur()).toBe('confus');
    });

    it('il reprend son humeur normale quand on arrête', () => {
      vi.useFakeTimers();
      try {
        const effet = el.querySelector<HTMLElement>('app-kaomoji-effect')!;
        for (let i = 0; i < 5; i++) effet.click();
        vi.advanceTimersByTime(1600);
        expect(TestBed.inject(MascotteEtat).humeurImposee()).toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });
  });

  it('affiche le nom du personnage et suit son renommage', async () => {
    TestBed.inject(MascotteEtat).renommer('Mochi');
    await fixture.whenStable();
    expect(el.querySelector('.bol-nom')?.textContent).toContain('Mochi');
  });

  it("affiche le visage de l'émotion choisie", async () => {
    TestBed.inject(MascotteEtat).associer('triste', '(^o^)');
    await fixture.whenStable();
    expect(el.querySelector('.kaomoji-face')?.textContent).toContain('(^o^)');
  });

  it('la gamelle nourrit le personnage : la légende suit sa faim', async () => {
    expect(el.querySelector('.legende')?.textContent).toContain('Faim : 2/5');
    bouton('Nourrir').click();
    await fixture.whenStable();
    expect(el.querySelector('.legende')?.textContent).toContain('Faim : 1/5');
    expect(el.querySelector('.etiquette')?.textContent).toContain('4/5 croquettes');
  });

  it('gaver la mascotte affiche un STOP et change son visage', async () => {
    const statut = TestBed.inject(MascotteStatut);
    statut.faim.set(0);
    statut.repasGaves.set(statut.repasParNiveau - 1); // le repas suivant fait grossir
    bouton('Nourrir').click();
    await fixture.whenStable();
    expect(statut.humeur()).toBe('gros');
    expect(el.querySelector('.bandeau')).toBeTruthy();
    expect(el.querySelector('.kaomoji-bulle')?.classList).toContain('humeur-gros');
  });

  it('voler la nourriture la rend grognonne et affiche un message', async () => {
    bouton('Voler').click();
    await fixture.whenStable();
    expect(TestBed.inject(MascotteStatut).humeur()).toBe('grognon');
    expect(el.querySelector('.bandeau')?.textContent).toContain('VOLER');
  });

  it('montre une explosion à la place du personnage, puis une place vide', async () => {
    const statut = TestBed.inject(MascotteStatut);
    statut.phase.set('explosion');
    await fixture.whenStable();
    expect(el.querySelector('app-kaomoji-face')).toBeNull();
    expect(el.querySelector('.boum')).toBeTruthy();
    expect(el.querySelectorAll('.eclat').length).toBe(8);
    expect(el.querySelector('.bandeau')?.textContent).toContain('MACRON EXPLOSION');

    statut.phase.set('absent');
    await fixture.whenStable();
    expect(el.querySelector('.boum')).toBeNull();
    expect(el.querySelector('.espace')).toBeTruthy();

    statut.phase.set('normal');
    await fixture.whenStable();
    expect(el.querySelector('app-kaomoji-face')).toBeTruthy();
  });

  it('indique la croissance d’un petit dans la légende', async () => {
    TestBed.inject(MascotteStatut).taille.set(2);
    await fixture.whenStable();
    expect(el.querySelector('.legende')?.textContent).toContain('Croissance : 2/5');
  });
});
