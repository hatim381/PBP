const API_URL = "http://127.0.0.1:5000/api/teams";

export async function getTeams() {
  const res = await fetch(API_URL);
  return await res.json();
}

export async function addTeam(teamData) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(teamData),
  });
  return await res.json();
}

export async function deleteTeam(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  return await res.json();
}

export async function updateTeam(id, teamData) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(teamData),
  });
  return await res.json();
}
