const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/teams";

export async function fetchTeams() {
  const response = await fetch(API_URL);
  return response.json();
}

export async function addTeam(teamData) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(teamData),
  });

  if (!response.ok) {
    throw new Error("Erreur lors de l'ajout de l'équipe");
  }

  return response.json();
}

export async function updateTeam(id, updatedData) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la modification");
  }

  return response.json();
}

export async function deleteTeam(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur lors de la suppression");
  }

  return response.json();
}

export async function deleteAllTeams() {
  const teams = await fetchTeams();
  const deletePromises = teams.map(team => deleteTeam(team.id));
  await Promise.all(deletePromises);
  return { message: "Toutes les équipes ont été supprimées" };
}
