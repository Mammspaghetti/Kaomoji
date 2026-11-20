import { Component, inject } from '@angular/core';
import { Succes } from '../succes';

/** Fenêtre qui liste les succès, débloqués ou non. Se ferme par ✕, Échap ou un clic à côté. */
@Component({
  selector: 'app-succes-popup',
  host: { '(document:keydown.escape)': 'succes.fermer()' },
  templateUrl: './succes-popup.html',
  styleUrl: './succes-popup.css',
})
export class SuccesPopup {
  protected readonly succes = inject(Succes);
}
