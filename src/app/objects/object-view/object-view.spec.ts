import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bowl } from '../bowl';
import { ObjectView } from './object-view';
import { SceneObject } from '../scene-object';

describe('ObjectView', () => {
  async function creer(objet: SceneObject): Promise<ComponentFixture<ObjectView>> {
    await TestBed.configureTestingModule({ imports: [ObjectView] }).compileComponents();
    const fixture = TestBed.createComponent(ObjectView);
    fixture.componentRef.setInput('object', objet);
    await fixture.whenStable();
    return fixture;
  }

  it('affiche un simple décor à sa position, sans commandes', async () => {
    const fixture = await creer({ id: 'p', kind: 'decor', emoji: '🪴', label: 'Plante', x: 10, y: 20 });
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.emoji')?.textContent).toContain('🪴');
    expect(el.querySelector('button')).toBeNull();
    expect(el.style.left).toBe('10%');
    expect(el.style.top).toBe('20%');
  });

  it('délègue le rendu de la gamelle à app-bowl-view', async () => {
    const fixture = await creer(new Bowl({ id: 'b', x: 0, y: 0 }));
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('app-bowl-view')).toBeTruthy();
    expect(el.querySelector('.emoji')).toBeNull();
  });
});
