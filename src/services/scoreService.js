const API_URL = 'https://pbp-backend-pesw.onrender.com/api/scores';

export const saveScores = async (tournamentId, scores) => {
  try {
    // Sauvegarder dans localStorage
    localStorage.setItem(`scores_${tournamentId}`, JSON.stringify(scores));
    
    // Sauvegarder sur le serveur
    const promises = Object.entries(scores).map(([key, score]) => {
      const [poolName, matchKey] = key.split('-');
      return fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournament_id: tournamentId,
          pool_name: poolName,
          match_key: matchKey,
          score1: score.score1,
          score2: score.score2
        })
      });
    });
    
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Error saving scores:', error);
    return false;
  }
};

export const deleteScores = async (tournamentId) => {
  try {
    // Supprimer du localStorage
    localStorage.removeItem(`scores_${tournamentId}`);
    
    // Supprimer du serveur
    await fetch(`${API_URL}/${tournamentId}`, {
      method: 'DELETE'
    });
    return true;
  } catch (error) {
    console.error('Error deleting scores:', error);
    return false;
  }
};
