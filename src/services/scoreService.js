const API_URL = 'https://pbp-backend-pesw.onrender.com/api/scores';

export const saveScores = async (tournamentId, scores) => {
  try {
    // Sauvegarder en local
    localStorage.setItem(`scores_${tournamentId}`, JSON.stringify(scores));
    
    // Sauvegarder sur le serveur
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tournamentId, scores })
    });
    return true;
  } catch (error) {
    console.error('Error saving scores:', error);
    return false;
  }
};

export const loadScores = async (tournamentId) => {
  try {
    // Essayer d'abord de charger depuis le localStorage
    const localScores = localStorage.getItem(`scores_${tournamentId}`);
    if (localScores) {
      return JSON.parse(localScores);
    }

    // Sinon charger depuis le serveur
    const response = await fetch(`${API_URL}/${tournamentId}`);
    if (response.ok) {
      const scores = await response.json();
      localStorage.setItem(`scores_${tournamentId}`, JSON.stringify(scores));
      return scores;
    }
    return {};
  } catch (error) {
    console.error('Error loading scores:', error);
    return {};
  }
};

export const deleteScores = async (tournamentId) => {
  try {
    localStorage.removeItem(`scores_${tournamentId}`);
    await fetch(`${API_URL}/${tournamentId}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error deleting scores:', error);
    return false;
  }
};
