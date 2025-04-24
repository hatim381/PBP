const API_URL = 'https://pbp-backend-pesw.onrender.com/api/teams';

export const fetchTeams = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('API Response:', data); // Debug
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
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
      body: JSON.stringify(teamData),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
