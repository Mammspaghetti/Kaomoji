import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavBar } from './nav-bar';
import { MascotteEtat } from '../mascotte-etat';
import { MascotteStatut } from '../mascotte-statut';
import { HUMEURS, VISAGES } from '../kaomoji-face/humeur';

describe('NavBar', () => {
  let fixture: ComponentFixture<NavBar>;
  let etat: MascotteEtat;
  let statut: MascotteStatut;

  const bouton = (texte: string): HTMLButtonElement => {
    const el: HTMLElement = fixture.nativeElement;
    return Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes(texte),
    )!;
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [NavBar] }).compileComponents();
    etat = TestBed.inject(MascotteEtat);
    statut = TestBed.inject(MascotteStatut);
    fixture = TestBed.createComponent(NavBar);
    await fixture.whenStable();
  });

  it('affiche une entrée par émotion', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('.humeur').length).toBe(HUMEURS.length);
  });

  it("impose l'émotion au clic, et « Automatique » rend la main au statut", async () => {
    const el: HTMLElement = fixture.nativeElement;
    el.querySelectorAll<HTMLButtonElement>('.humeur')[HUMEURS.indexOf('triste')].click();
    await fixture.whenStable();
    expect(etat.humeur()).toBe('triste');
    expect(etat.humeurImposee()).toBe('triste');

    bouton('Automatique').click();
    await fixture.whenStable();
    expect(etat.humeurImposee()).toBeNull();
    expect(etat.humeur()).toBe('neutre');
  });

  it('importe un visage via le formulaire et l\'associe à l\'émotion choisie', async () => {
    const el: HTMLElement = fixture.nativeElement;
    const saisie = el.querySelector<HTMLInputElement>('.import input')!;
    const cible = el.querySelector<HTMLSelectElement>('.import select')!;
    saisie.value = '(^o^)';
    cible.value = 'jaloux';
    el.querySelector<HTMLFormElement>('.import')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(etat.visages().jaloux).toBe('(^o^)');
    expect(etat.humeur()).toBe('jaloux');
    expect(saisie.value).toBe('');
  });

  it('rétablit le visage par défaut', async () => {
    etat.associer('triste', '(^o^)');
    await fixture.whenStable();
    fixture.nativeElement.querySelector('.reset').click();
    await fixture.whenStable();
    expect(etat.visages().triste).toBe(VISAGES.triste);
  });

  it('renomme le personnage et conserve le nom', async () => {
    const el: HTMLElement = fixture.nativeElement;
    const champ = el.querySelector<HTMLInputElement>('.renommer input')!;
    expect(champ.value).toBe('Kaomoji-san');
    champ.value = '  Mochi ';
    el.querySelector<HTMLFormElement>('.renommer')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(etat.nom()).toBe('Mochi');
    expect(localStorage.getItem('kaomoji.nom')).toBe('Mochi');
  });

  it('refuse un nom vide et remet le nom actuel dans le champ', async () => {
    const el: HTMLElement = fixture.nativeElement;
    const champ = el.querySelector<HTMLInputElement>('.renommer input')!;
    champ.value = '   ';
    el.querySelector<HTMLFormElement>('.renommer')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(etat.nom()).toBe('Kaomoji-san');
    expect(champ.value).toBe('Kaomoji-san');
  });

  it('les interactions font réagir le statut', async () => {
    bouton('Offrir un cadeau').click();
    await fixture.whenStable();
    expect(statut.cadeaux()).toBe(2);
    expect(etat.humeur()).toBe('cadeau');

    bouton('Cadeau à un rival').click();
    await fixture.whenStable();
    expect(statut.niveauJalousie()).toBe(1);
    expect(etat.humeur()).toBe('jaloux');
  });

  it("grise « Reprendre » et « Supprimer » quand il n'y a plus de cadeau", async () => {
    statut.cadeaux.set(0);
    await fixture.whenStable();
    expect(bouton('Reprendre').disabled).toBe(true);
    expect(bouton('Supprimer').disabled).toBe(true);
  });
});
