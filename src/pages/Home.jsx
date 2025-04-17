import React, { useEffect, useState } from "react";
import {
  fetchTeams,
  addTeam,
  deleteTeam,
  updateTeam,
} from "../services/teamService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Home = () => {
  const [teams, setTeams] = useState([]);
  const [member1, setMember1] = useState("");
  const [member2, setMember2] = useState("");
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [search, setSearch] = useState("");

  const fetchAndSetTeams = async () => {
    const data = await fetchTeams();
    setTeams(data);
  };

  useEffect(() => {
    fetchAndSetTeams();
  }, []);

  const handleAddTeam = async () => {
    if (!member1.trim() || !member2.trim()) {
      alert("Veuillez remplir les deux noms de joueurs.");
      return;
    }

    const fullName = `${member1} / ${member2}`;
    const newTeam = {
      name: fullName,
      members: fullName,
    };

    console.log("Envoi de l'équipe :", newTeam); // Debug

    try {
      await addTeam(newTeam);
      fetchAndSetTeams();
      setMember1("");
      setMember2("");
    } catch (error) {
      alert("Erreur lors de l'ajout de l'équipe");
      console.error("Erreur d'ajout :", error.message);
    }
  };

  const handleDelete = async (id) => {
    await deleteTeam(id);
    fetchAndSetTeams();
  };

  const handleEdit = (id, currentValue) => {
    setEditId(id);
    setEditValue(currentValue);
  };

  const handleUpdate = async (id) => {
    await updateTeam(id, {
      name: editValue,
      members: editValue,
    });
    setEditId(null);
    setEditValue("");
    fetchAndSetTeams();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Liste des équipes inscrites", 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [["#", "Membres"]],
      body: teams.map((team, index) => [index + 1, team.members]),
    });
    doc.save("equipes.pdf");
  };

  const filteredTeams = teams.filter((team) =>
    team.members.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center">Liste des équipes inscrites</h1>

      <input
        type="text"
        placeholder="Rechercher un joueur..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-gray-300 rounded p-2 w-full mb-4"
      />

      <div className="bg-white p-4 rounded shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Ajouter une équipe</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Nom du joueur 1"
            value={member1}
            onChange={(e) => setMember1(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Nom du joueur 2"
            value={member2}
            onChange={(e) => setMember2(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
          />
          <button
            onClick={handleAddTeam}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full sm:w-auto"
          >
            Ajouter
          </button>
        </div>
        <button
          onClick={handleExportPDF}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Export PDF
        </button>
      </div>

      <ul className="space-y-4">
        {filteredTeams.map((team, index) => (
          <li
            key={team.id}
            className="bg-gray-100 p-4 rounded shadow-sm flex flex-col sm:flex-row sm:items-center justify-between"
          >
            <div className="text-lg font-medium">
              {index + 1}){" "}
              {editId === team.id ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="border border-gray-300 p-1 rounded w-full sm:w-96"
                />
              ) : (
                team.members
              )}
            </div>
            <div className="mt-2 sm:mt-0 flex gap-2">
              {editId === team.id ? (
                <button
                  onClick={() => handleUpdate(team.id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                  Enregistrer
                </button>
              ) : (
                <button
                  onClick={() => handleEdit(team.id, team.members)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Modifier
                </button>
              )}
              <button
                onClick={() => handleDelete(team.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
