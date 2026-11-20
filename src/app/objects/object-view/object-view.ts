import { Component, computed, input } from '@angular/core';
import { Bowl } from '../bowl';
import { BowlView } from '../bowl-view/bowl-view';
import { SceneObject } from '../scene-object';

/** Affiche un objet de la scène à sa position ; délègue le rendu des objets interactifs. */
@Component({
  selector: 'app-object',
  imports: [BowlView],
  host: {
    '[style.left.%]': 'object().x',
    '[style.top.%]': 'object().y',
  },
  templateUrl: './object-view.html',
  styleUrl: './object-view.css',
})
export class ObjectView {
  readonly object = input.required<SceneObject>();

  protected readonly bowl = computed(() => {
    const o = this.object();
    return o instanceof Bowl ? o : null;
  });
}
