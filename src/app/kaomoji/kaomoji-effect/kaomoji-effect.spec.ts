import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KaomojiEffect } from './kaomoji-effect';

describe('KaomojiEffect', () => {
  let fixture: ComponentFixture<KaomojiEffect>;
  const hote = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({ imports: [KaomojiEffect] }).compileComponents();
    fixture = TestBed.createComponent(KaomojiEffect);
    fixture.detectChanges();
  });
  afterEach(() => vi.useRealTimers());

  it('n’a aucun effet par défaut', () => {
    expect(hote().className).toBe('');
  });

  it.each([1, 2, 3, 4, 5])('applique le niveau d’obésité %i', (n) => {
    fixture.componentRef.setInput('gros', n);
    fixture.detectChanges();
    expect(hote().classList).toContain(`effet-gros-${n}`);
  });

  it('chaque pat-pat monte d’un niveau, jusqu’au niveau 3', () => {
    for (const n of [1, 2, 3, 3]) {
      hote().click();
      fixture.detectChanges();
      expect(hote().classList).toContain(`effet-pat-${n}`);
    }
  });

  it('joue une animation à chaque pat-pat quand le navigateur le permet', () => {
    const animate = vi.fn();
    hote().animate = animate;
    hote().click();
    hote().click();
    expect(animate).toHaveBeenCalledTimes(2);
  });

  it('écrasé au sol à 20 pat-pat d’affilée, puis se redresse', () => {
    for (let i = 0; i < 19; i++) hote().click();
    fixture.detectChanges();
    expect(hote().classList).not.toContain('effet-ecrase');
    hote().click();
    fixture.detectChanges();
    expect(hote().classList).toContain('effet-ecrase');
    vi.advanceTimersByTime(1600);
    fixture.detectChanges();
    expect(hote().classList).not.toContain('effet-ecrase');
  });

  it('émet le nombre de pat-pat de la série, puis « calme »', () => {
    const pats: number[] = [];
    let calme = 0;
    fixture.componentInstance.pat.subscribe((n) => pats.push(n));
    fixture.componentInstance.calme.subscribe(() => calme++);
    hote().click();
    hote().click();
    hote().click();
    expect(pats).toEqual([1, 2, 3]);
    vi.advanceTimersByTime(1600);
    expect(calme).toBe(1);
    hote().click();
    expect(pats).toEqual([1, 2, 3, 1]);
  });

  it('se calme après un moment sans tapotement', () => {
    hote().click();
    fixture.detectChanges();
    vi.advanceTimersByTime(1600);
    fixture.detectChanges();
    expect(hote().className).toBe('');
  });

  it('garde le gros pendant qu’on tapote', () => {
    fixture.componentRef.setInput('gros', 3);
    hote().click();
    fixture.detectChanges();
    expect(hote().classList).toContain('effet-gros-3');
    expect(hote().classList).toContain('effet-pat-1');
  });
});
