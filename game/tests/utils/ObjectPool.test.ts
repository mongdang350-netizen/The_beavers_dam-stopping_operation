import { ObjectPool } from '@/utils/ObjectPool';

describe('ObjectPool', () => {
  it('reuses released objects', () => {
    let created = 0;
    const pool = new ObjectPool(
      () => ({ id: created++, value: 0 }),
      (obj) => {
        obj.value = 0;
      },
    );

    const one = pool.acquire();
    one.value = 7;
    pool.release(one);
    const two = pool.acquire();

    expect(two.id).toBe(one.id);
    expect(two.value).toBe(0);
  });

  it('clears pooled items', () => {
    const pool = new ObjectPool(() => ({ id: 1 }));
    const obj = pool.acquire();
    pool.release(obj);
    expect(pool.size()).toBe(1);
    pool.clear();
    expect(pool.size()).toBe(0);
  });
});

