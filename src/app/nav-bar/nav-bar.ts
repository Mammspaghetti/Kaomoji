import { Component, inject } from '@angular/core';
import { HUMEURS, Humeur, LIBELLES } from '../kaomoji-face/humeur';
import { MascotteEtat } from '../mascotte-etat';
import { MascotteStatut } from '../mascotte-statut';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
})
export class NavBar {
  protected readonly etat = inject(MascotteEtat);
  protected readonly statut = inject(MascotteStatut);
  protected readonly humeurs = HUMEURS;
  protected readonly libelles = LIBELLES;

  /** Valide le nouveau nom ; un nom invalide est remplacé par le nom actuel dans le champ. */
  protected renommer(champ: HTMLInputElement): void {
    if (!this.etat.renommer(champ.value)) champ.value = this.etat.nom();
  }

  protected importer(humeur: string, saisie: HTMLInputElement): void {
    if (this.etat.associer(humeur as Humeur, saisie.value)) saisie.value = '';
  }
}
