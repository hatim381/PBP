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
    // Organiser les équipes par type
    const organizedTeams = {
      single: data.filter(team => team.type === 'single'),
      double: data.filter(team => team.type === 'double'),
      triple: data.filter(team => team.type === 'triple')
    };
    localStorage.setItem('teams', JSON.stringify(organizedTeams));
    return organizedTeams;
  } catch (error) {
    console.error('Error fetching teams:', error);
    const cachedTeams = localStorage.getItem('teams');
    if (cachedTeams) {
      return JSON.parse(cachedTeams);
    }
    return { single: [], double: [], triple: [] };
  }
};

export const addTeam = async (teamData) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData)
    });

    if (!response.ok) throw new Error('Erreur lors de l\'ajout de l\'équipe');
    
    const newTeam = await response.json();
    
    // Mettre à jour le cache local
    const teams = JSON.parse(localStorage.getItem('teams') || '{"single":[],"double":[],"triple":[]}');
    teams[teamData.type] = [...teams[teamData.type], newTeam];
    localStorage.setItem('teams', JSON.stringify(teams));
    
    return newTeam;
  } catch (error) {
    console.error('Add team error:', error);
    throw error;
  }
};

export const updateTeam = async (id, teamData) => {
  try {
    const team = {
      id: id,
      name: teamData.members,
      members: teamData.members,
      type: teamData.type || 'double'
    };

    const response = await fetchWithRetry(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(team)
    });

    // Mise à jour du cache local
    const cachedTeams = JSON.parse(localStorage.getItem('teams') || '{"single":[],"double":[],"triple":[]}');
    const typeTeams = cachedTeams[team.type] || [];
    const updatedTeams = typeTeams.map(t => t.id === id ? response : t);
    cachedTeams[team.type] = updatedTeams;
    localStorage.setItem('teams', JSON.stringify(cachedTeams));

    return response;
  } catch (error) {
    console.error('Update team error:', error);
    throw new Error('Impossible de modifier l\'équipe');
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

export const initializeSinglePlayers = async () => {
  const players = [
    "Kourech Taheraly",
    "Michaël Achikhoussen",
    "Mourtaza Sadeccaly",
    "Sadik Abasse",
    "Naïm Taheraly",
    "Danyal Moizaly",
    "Mehboob Koytcha",
    "Danyal Sadeccaly",
    "Hatim Moïse",
    "Adnane Sadeccaly",
    "Anil Chopra",
    "Moudar Akbaraly",
    "Sheikh Houssen Akbaraly",
    "Sabir Hassanbay",
    "Johar Fatealy",
    "Saifoudine Hassanaly",
    "Azad Fassy",
    "Moufadal Inathossene",
    "Issac Ganivala",
    "Keich Ganivala",
    "Jamil Mamodaly",
    "Hatim Sabir Divane",
    "Sheikh Houssen Moshine",
    "Sefoudine Fassy"
  ];

  try {
    // Créer une équipe pour chaque joueur
    for (const player of players) {
      await addTeam({
        members: player,
        type: 'single',
        name: player
      });
    }
    return true;
  } catch (error) {
    console.error('Error initializing single players:', error);
    return false;
  }
};
