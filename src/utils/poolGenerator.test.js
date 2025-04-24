import { generatePools } from './poolGenerator';

test('correctly generates pools for 29 teams', () => {
  const teams = Array.from({ length: 29 }, (_, i) => `Team ${i + 1}`);
  const { pools, waitingList } = generatePools(teams);

  // Vérifie qu'il y a 5 poules de 4 équipes
  expect(pools.filter(pool => pool.length === 4).length).toBe(5);

  // Vérifie qu'il y a 3 poules de 3 équipes
  expect(pools.filter(pool => pool.length === 3).length).toBe(3);

  // Vérifie qu'il n'y a pas d'équipe en liste d'attente
  expect(waitingList.length).toBe(0);
});
