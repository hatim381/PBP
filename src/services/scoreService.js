const API_URL = 'https://pbp-backend-pesw.onrender.com/api';

export const fetchScores = async (tournamentId) => {
  try {
    const response = await fetch(`${API_URL}/scores/${tournamentId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Fetch scores error:', error);
    throw error;
  }
};

export const saveScore = async (scoreData) => {
  try {
    const response = await fetch(`${API_URL}/scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scoreData),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Save score error:', error);
    throw error;
  }
};
