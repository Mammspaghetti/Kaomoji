import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Kaomoji } from './kaomoji';

describe('Kaomoji', () => {
  let fixture: ComponentFixture<Kaomoji>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [Kaomoji] }).compileComponents();
    fixture = TestBed.createComponent(Kaomoji);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('assemble la barre de navigation et la scène', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('app-nav-bar')).toBeTruthy();
    expect(el.querySelector('app-scene')).toBeTruthy();
  });
});
