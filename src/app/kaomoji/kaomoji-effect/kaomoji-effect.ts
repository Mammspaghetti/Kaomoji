import { Component, ElementRef, computed, inject, input, output, signal, viewChild } from '@angular/core';

export type Niveau = 0 | 1 | 2 | 3;
export type NiveauGros = Niveau | 4 | 5;

/** Délai sans tapotement avant que le personnage se calme. */
const DELAI_CALME_MS = 1500;

/** Nombre de pat-pat d'affilée qui l'écrasent complètement au sol. */
export const PATS_ECRASE = 20;

/** Un pat-pat : la tête s'enfonce sous la main puis rebondit. Plus on tapote, plus c'est appuyé. */
const PATS: Record<1 | 2 | 3, Keyframe[]> = {
  1: [
    { transform: 'scale(1, 1)' },
    { transform: 'scale(1.04, 0.92)', offset: 0.35 },
    { transform: 'scale(1, 1)' },
  ],
  2: [
    { transform: 'scale(1, 1) rotate(0deg)' },
    { transform: 'scale(1.08, 0.82) rotate(-2deg)', offset: 0.35 },
    { transform: 'scale(0.98, 1.04) rotate(1deg)', offset: 0.7 },
    { transform: 'scale(1, 1) rotate(0deg)' },
  ],
  3: [
    { transform: 'scale(1, 1) rotate(0deg)' },
    { transform: 'scale(1.14, 0.72) rotate(-4deg)', offset: 0.3 },
    { transform: 'scale(0.96, 1.08) rotate(3deg)', offset: 0.6 },
    { transform: 'scale(1.03, 0.97) rotate(-1deg)', offset: 0.8 },
    { transform: 'scale(1, 1) rotate(0deg)' },
  ],
};

/**
 * Effets sur son contenu : obésité (5 niveaux) et pat-pat (3 niveaux).
 * Chaque clic est un tapotement sur la tête ; tapoter à la suite fait monter le niveau
 * (1 → 3) ; à 20 d'affilée il est écrasé au sol. Puis le personnage se calme.
 */
@Component({
  selector: 'app-kaomoji-effect',
  host: {
    '[class]': 'classe()',
    '(click)': 'tapoter()',
  },
  template: `
    <ng-content />
    @if (tapote() > 0) {
      <!-- Main gantée blanche, à plat, paume vers le bas (vue de côté) -->
      <svg #main class="main" viewBox="0 0 92 52" aria-hidden="true">
        <path class="pouce" d="M24 34 C26 46 48 46 52 34 Z" />
        <path
          class="gant"
          d="M14 15 H62 C74 15 88 17 89 23 C90 29 84 34 74 34 H14 Z"
        />
        <path class="doigts" d="M58 21 H84 M56 27.5 H85" />
        <rect class="gant" x="3" y="11" width="13" height="27" rx="5" />
      </svg>
    }
  `,
  styleUrl: './kaomoji-effect.css',
})
export class KaomojiEffect {
  private readonly hote = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** Niveau d'obésité, de 1 à 5 (0 = aucun). */
  readonly gros = input<NiveauGros>(0);

  /** Émis à chaque pat-pat avec le nombre de pat-pat de la série en cours. */
  readonly pat = output<number>();
  /** Émis quand la série de pat-pat est terminée. */
  readonly calme = output<void>();

  private readonly main = viewChild<ElementRef<SVGElement>>('main');
  private readonly serie = signal(0);

  /** Niveau de pat-pat en cours (0 = calme). */
  protected readonly tapote = signal<Niveau>(0);
  private minuteur?: ReturnType<typeof setTimeout>;

  protected readonly classe = computed(() => {
    const classes: string[] = [];
    if (this.gros() > 0) classes.push(`effet-gros-${this.gros()}`);
    if (this.tapote() > 0) classes.push(`effet-pat-${this.tapote()}`);
    if (this.serie() >= PATS_ECRASE) classes.push('effet-ecrase');
    return classes.join(' ');
  });

  protected tapoter(): void {
    const niveau = Math.min(3, this.tapote() + 1) as 1 | 2 | 3;
    this.tapote.set(niveau);
    clearTimeout(this.minuteur);
    this.minuteur = setTimeout(() => this.apaiser(), DELAI_CALME_MS);
    this.serie.update((n) => n + 1);
    this.pat.emit(this.serie());
    this.jouer(niveau);
    this.baisserMain();
  }

  private apaiser(): void {
    this.tapote.set(0);
    this.serie.set(0);
    this.calme.emit();
  }

  /** La main s'abaisse sur la tête à chaque pat-pat. */
  private baisserMain(): void {
    // la main n'existe qu'après le prochain rendu
    queueMicrotask(() => {
      const el = this.main()?.nativeElement;
      if (typeof el?.animate !== 'function') return;
      if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
      el.animate(
        [{ translate: '0 -14px' }, { translate: '0 8px', offset: 0.4 }, { translate: '0 -14px' }],
        { duration: 280, easing: 'ease-out' },
      );
    });
  }

  /** Relance l'animation à chaque clic, sans se battre avec le « gros » (composition additive). */
  private jouer(niveau: 1 | 2 | 3): void {
    if (typeof this.hote.animate !== 'function') return; // jsdom
    if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    this.hote.animate(PATS[niveau], { duration: 280, easing: 'ease-out', composite: 'add' });
  }
}
