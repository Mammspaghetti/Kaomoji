import { Component, input } from '@angular/core';

/** Ce qui dépasse de la bulle : oreilles, table lancée, bras qui s'agitent. À placer dans un parent `position: relative`. */
@Component({
  selector: 'app-kaomoji-gestes',
  templateUrl: './kaomoji-gestes.html',
  styleUrl: './kaomoji-gestes.css',
})
export class KaomojiGestes {
  readonly tableLancee = input(false);
  readonly bras = input(false);
}
