import { Component, computed, input } from '@angular/core';
import { KaomojiGestes } from './gestes/kaomoji-gestes';
import { Humeur, LIBELLES, PEAUX, VISAGES } from './humeur';

@Component({
  selector: 'app-kaomoji-face',
  imports: [KaomojiGestes],
  templateUrl: './kaomoji-face.html',
  styleUrl: './kaomoji-face.css',
})
export class KaomojiFace {
  readonly humeur = input<Humeur>('neutre');
  /** Visage à afficher ; par défaut celui associé à l'humeur. */
  readonly visage = input<string>();
  /** Bras qui s'agitent : le personnage réclame son cadeau. */
  readonly reclame = input(false);

  protected readonly texte = computed(() => this.visage() ?? VISAGES[this.humeur()]);
  protected readonly peau = computed(() => PEAUX[this.humeur()]);
  protected readonly libelle = computed(() => LIBELLES[this.humeur()]);

  /** Kaomoji qui tournent autour du visage. */
  protected readonly roue = ['ヽ(｀Д´)ﾉ', 'ಠ益ಠ', 'Σ(ಠ_ಠ)', 'ヽ(`д´*)ノ', 'ಠ_ಠ', '(ノಠ益ಠ)ノ'];
}
