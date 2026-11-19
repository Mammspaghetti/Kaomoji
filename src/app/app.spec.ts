import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("affiche l'écran titre sur /", async () => {
    const harness = await RouterTestingHarness.create('/');
    expect(harness.routeNativeElement?.querySelector('app-accueil .titre')).toBeTruthy();
  });

  it('affiche la mascotte sur /mascotte', async () => {
    const harness = await RouterTestingHarness.create('/mascotte');
    const el = harness.routeNativeElement!;
    expect(el.querySelector('.mascotte-nom')?.textContent).toContain('Kaomoji-san');
    expect(el.querySelector('app-kaomoji')).toBeTruthy();
    expect(el.querySelector('app-gamelle')).toBeTruthy();
  });
});
