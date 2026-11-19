import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bowl } from '../bowl';
import { BowlView } from './bowl-view';
import { MascotteStatut } from '../../mascotte-statut';

describe('BowlView', () => {
  let statut: MascotteStatut;

  async function creer(bowl: Bowl): Promise<ComponentFixture<BowlView>> {
    await TestBed.configureTestingModule({ imports: [BowlView] }).compileComponents();
    statut = TestBed.inject(MascotteStatut);
    const fixture = TestBed.createComponent(BowlView);
    fixture.componentRef.setInput('bowl', bowl);
    await fixture.whenStable();
    return fixture;
  }

  const bouton = (fixture: ComponentFixture<BowlView>, texte: string): HTMLButtonElement => {
    const el: HTMLElement = fixture.nativeElement;
    return Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.includes(texte))!;
  };

  const el = (fixture: ComponentFixture<BowlView>) => fixture.nativeElement as HTMLElement;

  it('dessine une croquette par portion et indique le niveau', async () => {
    const fixture = await creer(new Bowl({ id: 'b', x: 0, y: 0, capacity: 5, level: 3 }));
    expect(el(fixture).querySelectorAll('.croquette').length).toBe(3);
    expect(el(fixture).querySelector('.etiquette')?.textContent).toContain('3/5 croquettes');
  });

  it('nourrit : une croquette de moins, la faim baisse, la gamelle secoue', async () => {
    const bowl = new Bowl({ id: 'b', x: 0, y: 0, capacity: 5 });
    const fixture = await creer(bowl);
    bouton(fixture, 'Nourrir').click();
    await fixture.whenStable();
    expect(bowl.level()).toBe(4);
    expect(statut.faim()).toBe(1);
    expect(el(fixture).querySelectorAll('.croquette').length).toBe(4);
    expect(el(fixture).querySelector('.gamelle-bol')?.classList).toContain('miam');
  });

  it('remplit la gamelle, puis grise « Remplir »', async () => {
    const bowl = new Bowl({ id: 'b', x: 0, y: 0, capacity: 3, level: 1 });
    const fixture = await creer(bowl);
    bouton(fixture, 'Remplir').click();
    await fixture.whenStable();
    expect(bowl.level()).toBe(3);
    expect(bouton(fixture, 'Remplir').disabled).toBe(true);
  });

  it('grise « Nourrir » et « Voler » quand elle est vide', async () => {
    const fixture = await creer(new Bowl({ id: 'b', x: 0, y: 0, capacity: 3, level: 0 }));
    expect(bouton(fixture, 'Nourrir').disabled).toBe(true);
    expect(bouton(fixture, 'Voler').disabled).toBe(true);
    expect(el(fixture).querySelector('.etiquette')?.textContent).toContain('Gamelle vide');
  });

  it('vole : gamelle vidée, mascotte affamée, la gamelle tremble', async () => {
    const bowl = new Bowl({ id: 'b', x: 0, y: 0, capacity: 5 });
    const fixture = await creer(bowl);
    bouton(fixture, 'Voler').click();
    await fixture.whenStable();
    expect(bowl.isEmpty()).toBe(true);
    expect(statut.faim()).toBe(5);
    expect(el(fixture).querySelector('.gamelle')?.classList).toContain('secoue');
  });

  it('refuse de nourrir une mascotte gavée', async () => {
    const bowl = new Bowl({ id: 'b', x: 0, y: 0, capacity: 5 });
    const fixture = await creer(bowl);
    statut.surpoids.set(statut.surpoidsMax);
    await fixture.whenStable();
    expect(bouton(fixture, 'Nourrir').disabled).toBe(true);
    expect(el(fixture).querySelector('.etiquette')?.textContent).toContain('exploser');
  });
});
