const API_URL = 'https://pbp-backend-pesw.onrender.com/api/pools';

export const savePools = async (tournamentId, pools) => {
  try {
    localStorage.setItem(`pools_${tournamentId}`, JSON.stringify(pools));
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tournament_id: tournamentId, pools })
    });
    return true;
  } catch (error) {
    console.error('Save pools error:', error);
    return false;
  }
};

export const loadPools = async (tournamentId) => {
  try {
    const localPools = localStorage.getItem(`pools_${tournamentId}`);
    if (localPools) {
      return JSON.parse(localPools);
    }
    const response = await fetch(`${API_URL}/${tournamentId}`);
    const data = await response.json();
    if (data.pools) {
      localStorage.setItem(`pools_${tournamentId}`, JSON.stringify(data.pools));
      return data.pools;
    }
    return [];
  } catch (error) {
    console.error('Load pools error:', error);
    const localPools = localStorage.getItem(`pools_${tournamentId}`);
    return localPools ? JSON.parse(localPools) : [];
  }
};
