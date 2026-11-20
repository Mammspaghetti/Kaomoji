import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MascotteStatut } from '../../mascotte-statut';
import { Succes } from '../succes';
import { SuccesPopup } from './succes-popup';

describe('Succès', () => {
  let fixture: ComponentFixture<SuccesPopup>;
  let succes: Succes;
  let statut: MascotteStatut;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [SuccesPopup] }).compileComponents();
    succes = TestBed.inject(Succes);
    statut = TestBed.inject(MascotteStatut);
    fixture = TestBed.createComponent(SuccesPopup);
    fixture.detectChanges();
  });

  it('est fermée par défaut, et s’ouvre avec la liste des succès', () => {
    expect(el().querySelector('[role=dialog]')).toBeNull();
    succes.ouvrir();
    fixture.detectChanges();
    expect(el().querySelectorAll('li').length).toBe(3);
    expect(el().textContent).toContain('Macron explosion');
    expect(el().textContent).toContain('Oh Djadja');
    expect(el().textContent).toContain('Jealous Bitch');
    expect(el().querySelectorAll('li.debloque').length).toBe(0);
  });

  it('se ferme par la croix, par un clic à côté, et par Échap', () => {
    const ouvrir = () => {
      succes.ouvrir();
      fixture.detectChanges();
    };
    ouvrir();
    el().querySelector<HTMLButtonElement>('.fermer')!.click();
    fixture.detectChanges();
    expect(el().querySelector('[role=dialog]')).toBeNull();

    ouvrir();
    el().querySelector<HTMLElement>('.voile')!.click();
    fixture.detectChanges();
    expect(succes.ouvert()).toBe(false);

    ouvrir();
    el().querySelector<HTMLElement>('.fenetre')!.click(); // dans la fenêtre : reste ouverte
    expect(succes.ouvert()).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(succes.ouvert()).toBe(false);
  });

  it('débloque « Jealous Bitch » quand on le rend jaloux', () => {
    statut.cadeauRival();
    TestBed.tick();
    expect(succes.estDebloque('jealous-bitch')).toBe(true);
    expect(succes.estDebloque('oh-djadja')).toBe(false);
  });

  it('débloque « Oh Djadja » quand on l’écrase', () => {
    for (let i = 1; i <= 20; i++) statut.tapoter(i);
    TestBed.tick();
    expect(succes.estDebloque('oh-djadja')).toBe(true);
  });

  it('débloque « Macron explosion » quand il explose, et le garde en mémoire', () => {
    vi.useFakeTimers();
    try {
      statut.faim.set(0);
      statut.surpoids.set(statut.surpoidsMax - 1);
      statut.repasGaves.set(statut.repasParNiveau - 1);
      statut.manger({ isEmpty: () => false, take: () => true } as never);
      vi.advanceTimersByTime(1600);
      TestBed.tick();
      expect(succes.estDebloque('macron-explosion')).toBe(true);
      expect(JSON.parse(localStorage.getItem('kaomoji.succes')!)).toContain('macron-explosion');
    } finally {
      vi.useRealTimers();
    }
  });
});
