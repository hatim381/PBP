const API_URL = 'https://pbp-backend-pesw.onrender.com/api/scores';

export const saveScores = async (tournamentId, scores) => {
  try {
    // Sauvegarder localement
    localStorage.setItem(`scores_${tournamentId}`, JSON.stringify(scores));
    
    // Envoyer au serveur
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tournament_id: tournamentId, scores })
    });

    if (!response.ok) throw new Error('Failed to save scores');
    return true;
  } catch (error) {
    console.error('Save scores error:', error);
    return false;
  }
};

export const loadScores = async (tournamentId) => {
  try {
    // Essayer d'abord le localStorage
    const localScores = localStorage.getItem(`scores_${tournamentId}`);
    if (localScores) {
      return JSON.parse(localScores);
    }

    // Sinon charger du serveur
    const response = await fetch(`${API_URL}/${tournamentId}`);
    if (!response.ok) throw new Error('Failed to load scores');
    const data = await response.json();
    localStorage.setItem(`scores_${tournamentId}`, JSON.stringify(data));
    return data;
  } catch (error) {
    console.error('Load scores error:', error);
    return {};
  }
};

export const deleteScores = async (tournamentId) => {
  try {
    // Supprimer du localStorage d'abord
    localStorage.removeItem(`scores_${tournamentId}`);
    
    const response = await fetch(`${API_URL}/${tournamentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Échec de la suppression');
    }

    return true;
  } catch (error) {
    console.error('Error deleting scores:', error);
    // Si l'erreur vient du serveur, on considère quand même que c'est ok
    // car on a déjà supprimé du localStorage
    return true;
  }
};
