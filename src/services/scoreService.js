const API_URL = 'https://pbp-backend-pesw.onrender.com/api/scores';

export const saveScores = async (tournamentId, scores) => {
  localStorage.setItem(`scores_${tournamentId}`, JSON.stringify(scores));
  return true;
};

export const loadScores = async (tournamentId) => {
  const savedScores = localStorage.getItem(`scores_${tournamentId}`);
  return savedScores ? JSON.parse(savedScores) : {};
};

export const deleteScores = async (tournamentId) => {
  localStorage.removeItem(`scores_${tournamentId}`);
  return true;
};
