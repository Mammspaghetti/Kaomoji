import { Bowl } from './bowl';

describe('Bowl', () => {
  const creer = (level?: number) => new Bowl({ id: 'b', x: 0, y: 0, capacity: 3, level });

  it('est pleine par défaut', () => {
    const b = creer();
    expect(b.level()).toBe(3);
    expect(b.isFull()).toBe(true);
  });

  it('sert une portion à la fois jusqu\'à être vide', () => {
    const b = creer(2);
    expect(b.take()).toBe(true);
    expect(b.take()).toBe(true);
    expect(b.isEmpty()).toBe(true);
    expect(b.take()).toBe(false);
    expect(b.level()).toBe(0);
  });

  it('se remplit sans dépasser la capacité', () => {
    const b = creer(1);
    expect(b.fill(1)).toBe(1);
    expect(b.level()).toBe(2);
    expect(b.fill()).toBe(1);
    expect(b.level()).toBe(3);
    expect(b.fill()).toBe(0);
  });

  it('borne le niveau initial à la capacité', () => {
    expect(creer(99).level()).toBe(3);
  });
});
