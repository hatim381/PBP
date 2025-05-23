import { render, screen } from '@testing-library/react';
import App from './App';
import { generatePools } from './utils/poolGenerator'; // Importez la fonction de génération des poules

test('renders PBP header', () => {
  render(<App />);
  const headerElement = screen.getByText(/PBP/i);
  expect(headerElement).toBeInTheDocument();
});

test('correctly generates pools for 29 teams', () => {
  const teams = Array.from({ length: 29 }, (_, i) => `Team ${i + 1}`);
  const { pools, waitingList } = generatePools(teams);

  // Vérifie qu'il y a 5 poules de 4 et 3 poules de 3
  expect(pools.filter(pool => pool.length === 4).length).toBe(5);
  expect(pools.filter(pool => pool.length === 3).length).toBe(3);

  // Vérifie qu'il n'y a pas d'équipe en liste d'attente
  expect(waitingList.length).toBe(0);
});
