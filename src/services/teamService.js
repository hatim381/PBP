const API_URL = "https://pbp-backend-pesw.onrender.com/api/teams";

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
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la suppression");
  }

  return response.json();
}
