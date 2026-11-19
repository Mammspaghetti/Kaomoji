import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KaomojiFace } from './kaomoji-face';
import { Humeur, PEAUX, VISAGES } from './humeur';

describe('KaomojiFace', () => {
  async function creer(entrees: Record<string, unknown> = {}): Promise<HTMLElement> {
    const fixture: ComponentFixture<KaomojiFace> = TestBed.createComponent(KaomojiFace);
    for (const [nom, valeur] of Object.entries(entrees)) fixture.componentRef.setInput(nom, valeur);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('affiche le visage neutre par défaut', async () => {
    const el = await creer();
    expect(el.querySelector('.kaomoji-face')?.textContent).toContain(VISAGES.neutre);
  });

  it("affiche le visage associé à l'humeur", async () => {
    const el = await creer({ humeur: 'triste' });
    expect(el.querySelector('.kaomoji-face')?.textContent).toContain(VISAGES.triste);
  });

  it('affiche le visage fourni à la place du visage par défaut', async () => {
    const el = await creer({ humeur: 'triste', visage: '(^o^)' });
    expect(el.querySelector('.kaomoji-face')?.textContent).toContain('(^o^)');
  });

  it("applique une peau et des effets propres à l'humeur", async () => {
    const attendus: [Humeur, string][] = [
      ['triste', '.larme'],
      ['gros', '.burp'],
      ['jaloux', '.hmpf'],
      ['tresJaloux', '.yeux'],
      ['grognon', '.colere'],
      ['tresGrognon', '.trescolere'],
    ];
    for (const [humeur, effet] of attendus) {
      TestBed.resetTestingModule();
      const el = await creer({ humeur });
      expect(el.querySelector('.kaomoji-bulle')?.classList).toContain(`humeur-${humeur}`);
      expect(el.querySelector(effet), `${humeur} → ${effet}`).toBeTruthy();
    }
  });

  it('lance une table quand il est très grognon', async () => {
    expect((await creer({ humeur: 'tresGrognon' })).querySelector('.table-lancee')).toBeTruthy();
    TestBed.resetTestingModule();
    expect((await creer({ humeur: 'neutre' })).querySelector('.table-lancee')).toBeNull();
  });

  it('a des oreilles et des joues, de la couleur de son humeur', async () => {
    const el = await creer({ humeur: 'jaloux' });
    expect(el.querySelectorAll('.oreille').length).toBe(2);
    expect(el.querySelector<HTMLElement>('.zone')?.style.getPropertyValue('--peau')).toBe(PEAUX.jaloux);
    expect(el.querySelectorAll('.joue').length).toBe(2);
  });

  it('agite les bras quand il réclame son cadeau', async () => {
    expect((await creer({ reclame: true })).querySelectorAll('.bras').length).toBe(2);
    TestBed.resetTestingModule();
    expect((await creer()).querySelector('.bras')).toBeNull();
  });
});
