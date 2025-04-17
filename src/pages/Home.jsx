import React, { useState, useEffect } from "react";
import {
  fetchTeams,
  addTeam,
  updateTeam,
  deleteTeam,
} from "../services/teamService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Home = () => {
  const [teams, setTeams] = useState([]);
  const [member1, setMember1] = useState("");
  const [member2, setMember2] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchTeams().then(setTeams);
  }, []);

  const handleAddTeam = async () => {
    if (!member1.trim() || !member2.trim()) return;
    const newTeam = {
      members: `${member1} / ${member2}`,
    };
    try {
      const addedTeam = await addTeam(newTeam);
      setTeams([...teams, addedTeam]);
      setMember1("");
      setMember2("");
    } catch {
      alert("Erreur lors de l'ajout.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette équipe ?")) return;
    await deleteTeam(id);
    setTeams(teams.filter((t) => t.id !== id));
  };

  const handleUpdate = async (id, updatedMembers) => {
    try {
      const updated = await updateTeam(id, { members: updatedMembers });
      setTeams(teams.map((t) => (t.id === id ? updated : t)));
      setEditingId(null);
    } catch {
      alert("Erreur lors de la modification");
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Liste des équipes inscrites", 14, 20);
    const tableData = filteredTeams.map((team, index) => [
      `${index + 1}) ${team.members}`,
    ]);
    autoTable(doc, {
      head: [["Membres"]],
      body: tableData,
      startY: 30,
      styles: {
        fontSize: 12,
      },
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: 255,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });
    doc.save("equipes.pdf");
  };

  const filteredTeams = teams.filter((t) =>
    t.members.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 font-sans">
      <h1 className="text-3xl font-bold mb-6">Liste des équipes inscrites</h1>

      <input
        type="text"
        placeholder="🔍 Rechercher un joueur..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2 border border-gray-300 rounded"
      />

      <div className="mb-6 space-y-2">
        <h2 className="text-xl font-semibold">Ajouter une équipe</h2>
        <div className="flex gap-2 flex-col md:flex-row">
          <input
            placeholder="Nom du joueur 1"
            value={member1}
            onChange={(e) => setMember1(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded"
          />
          <input
            placeholder="Nom du joueur 2"
            value={member2}
            onChange={(e) => setMember2(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded"
          />
          <button
            onClick={handleAddTeam}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Ajouter
          </button>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={handleExportPDF}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          📄 Export PDF
        </button>
      </div>

      <ul className="space-y-4">
        {filteredTeams.map((team, index) => (
          <li
            key={team.id}
            className="bg-gray-100 p-4 rounded shadow flex flex-col md:flex-row md:items-center justify-between"
          >
            <div className="mb-2 md:mb-0">
              <strong>{index + 1})</strong>{" "}
              {editingId === team.id ? (
                <input
                  value={team.members}
                  onChange={(e) =>
                    setTeams(
                      teams.map((t) =>
                        t.id === team.id
                          ? { ...t, members: e.target.value }
                          : t
                      )
                    )
                  }
                  className="border border-gray-300 px-2 py-1 rounded"
                />
              ) : (
                team.members
              )}
            </div>

            <div className="flex gap-2">
              {editingId === team.id ? (
                <button
                  onClick={() => handleUpdate(team.id, team.members)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              ) : (
                <button
                  onClick={() => setEditingId(team.id)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  ✏️ Modifier
                </button>
              )}
              <button
                onClick={() => handleDelete(team.id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                🗑️ Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
