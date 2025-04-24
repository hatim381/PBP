const API_URL = 'https://pbp-backend-pesw.onrender.com/api';

export const saveTournament = async (tournamentData) => {
  try {
    const response = await fetch(`${API_URL}/tournaments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tournamentData),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Save tournament error:', error);
    throw error;
  }
};

export const fetchTournament = async (tournamentId) => {
  try {
    const response = await fetch(`${API_URL}/tournaments/${tournamentId}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Fetch tournament error:', error);
    throw error;
  }
};
