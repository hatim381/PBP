import React, { useEffect, useState } from "react";
import { getTeams, addTeam, deleteTeam, updateTeam } from "../services/teamService";
import TeamForm from "../components/TeamForm";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Home = () => {
  const [teams, setTeams] = useState([]);
  const [editTeam, setEditTeam] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const data = await getTeams();
    setTeams(data);
  };

  const handleAddOrUpdate = async (team) => {
    if (team.id) {
      const updated = await updateTeam(team.id, team);
      setTeams((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditTeam(null);
    } else {
      const newTeam = await addTeam(team);
      setTeams((prev) => [...prev, newTeam]);
    }
  };

  const handleDelete = async (id) => {
    await deleteTeam(id);
    setTeams((prev) => prev.filter((t) => t.id !== id));
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Titre
    doc.setFontSize(16);
    doc.setTextColor(33, 37, 41);
    doc.text("Liste des équipes inscrites", 14, 20);

    // Tableau des équipes
    autoTable(doc, {
      startY: 30,
      headStyles: { fillColor: [33, 150, 243] }, // bleu
      styles: { fontSize: 11 },
      head: [["N°", "Membres"]],
      body: teams.map((t, i) => [i + 1, t.members]),
    });

    doc.save("equipes.pdf");
  };

  const filtered = teams.filter((t) =>
    t.members.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-blue-700 text-center mb-6">
          Liste des équipes inscrites
        </h1>

        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">📌 Modalités</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Concours PBP en doublettes constituées – Dimanche 27 avril</li>
            <li>Inscriptions auprès de Sadik ABASSE (pas dans les groupes)</li>
            <li>Boulodrome : 16 Rue Louis Armand, 77330 Ozoir-la-Ferrière</li>
            <li>Tarif :
              <ul className="list-disc ml-5">
                <li>15 € membres PBP</li>
                <li>25 € non membres</li>
                <li>5 € -18 ans</li>
              </ul>
            </li>
            <li>24 équipes maximum</li>
            <li className="font-bold text-red-600">⚠ Clôture : Mercredi 23 avril à 18h ⚠</li>
          </ul>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Rechercher un joueur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <TeamForm onSubmit={handleAddOrUpdate} editTeam={editTeam} />

        <div className="flex justify-center mt-6">
          <button
            onClick={handleExportPDF}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl shadow"
          >
            📄 Export PDF
          </button>
        </div>

        <div className="mt-10 space-y-4">
          {filtered.map((team, index) => (
            <div
              key={team.id}
              className="bg-gray-50 border border-gray-300 rounded-xl p-4 shadow-sm flex justify-between items-center"
            >
              <span className="text-gray-800 font-medium">
                {index + 1}) {team.members}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditTeam(team)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => handleDelete(team.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
