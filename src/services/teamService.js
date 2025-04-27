const API_URL = 'https://pbp-backend-pesw.onrender.com/api/teams';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options = {}, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(1000 * (i + 1)); // Exponential backoff
    }
  }
};

export const fetchTeams = async () => {
  try {
    const data = await fetchWithRetry(API_URL);
    console.log('Teams fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    // Utiliser les données du localStorage en cas d'échec
    const cachedTeams = localStorage.getItem('teams');
    if (cachedTeams) {
      return JSON.parse(cachedTeams);
    }
    throw error;
  }
};

export const addTeam = async (teamData) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Add team error:', error);
    throw error;
  }
};

export const updateTeam = async (id, teamData) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData)
    });

    if (!response.ok) throw new Error('Erreur lors de la modification');
    return await response.json();
  } catch (error) {
    console.error('Update team error:', error);
    throw error;
  }
};

export const deleteTeam = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    if (response.status === 404) {
      throw new Error('Équipe non trouvée');
    }
    
    if (!response.ok) {
      throw new Error('Erreur serveur');
    }
    
    // Ne pas attendre de JSON en retour
    return true;
  } catch (error) {
    console.error('Delete team error:', error);
    throw new Error('Impossible de supprimer l\'équipe');
  }
};

export const deleteAllTeams = async () => {
  try {
    const teams = await fetchTeams();
    
    // Supprimer chaque équipe individuellement
    await Promise.all(teams.map(team => deleteTeam(team._id || team.id)));
    
    return true;
  } catch (error) {
    console.error('Delete all teams error:', error);
    throw new Error('Impossible de supprimer toutes les équipes');
  }
};
