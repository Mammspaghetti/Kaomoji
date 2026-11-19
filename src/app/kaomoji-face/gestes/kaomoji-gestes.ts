import { Component, input } from '@angular/core';

/** Gestes qui sortent de la bulle : table lancée, bras qui s'agitent. À placer dans un parent `position: relative`. */
@Component({
  selector: 'app-kaomoji-gestes',
  templateUrl: './kaomoji-gestes.html',
  styleUrl: './kaomoji-gestes.css',
})
export class KaomojiGestes {
  readonly tableLancee = input(false);
  readonly bras = input(false);
}
