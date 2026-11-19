import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Kaomoji } from './kaomoji';

describe('Kaomoji', () => {
  let component: Kaomoji;
  let fixture: ComponentFixture<Kaomoji>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Kaomoji],
    }).compileComponents();

    fixture = TestBed.createComponent(Kaomoji);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
