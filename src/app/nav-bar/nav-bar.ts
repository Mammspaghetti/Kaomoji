import { Component, inject, signal } from '@angular/core';
import { HUMEURS, Humeur, LIBELLES } from '../kaomoji/kaomoji-face/humeur';
import { MascotteEtat } from '../mascotte-etat';
import { MascotteStatut } from '../mascotte-statut';
import { Succes } from '../succes/succes';

@Component({
  selector: 'app-nav-bar',
  host: { '[class.ouverte]': 'ouverte()' },
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
})
export class NavBar {
  protected readonly etat = inject(MascotteEtat);
  protected readonly statut = inject(MascotteStatut);
  protected readonly succes = inject(Succes);
  protected readonly humeurs = HUMEURS;
  protected readonly libelles = LIBELLES;

  /** Ouverte d'office sur grand écran ; fermée sur téléphone pour laisser voir le personnage. */
  protected readonly ouverte = signal(this.estLarge());

  protected basculer(): void {
    this.ouverte.update((o) => !o);
  }

  protected fermer(): void {
    this.ouverte.set(false);
  }

  /** Sur téléphone, le menu recouvre la scène : on le referme après une action pour voir la réaction. */
  protected apresClic(event: Event): void {
    if (!this.estLarge() && (event.target as HTMLElement).closest('button')) this.fermer();
  }

  private estLarge(): boolean {
    return typeof matchMedia !== 'function' || matchMedia('(min-width: 768px)').matches;
  }

  /** Valide le nouveau nom ; un nom invalide est remplacé par le nom actuel dans le champ. */
  protected renommer(champ: HTMLInputElement): void {
    if (!this.etat.renommer(champ.value)) champ.value = this.etat.nom();
  }

  protected importer(humeur: string, saisie: HTMLInputElement): void {
    if (this.etat.associer(humeur as Humeur, saisie.value)) saisie.value = '';
  }
}
