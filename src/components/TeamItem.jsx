import React, { useState, useEffect } from "react";

const TeamForm = ({ onSubmit, editTeam }) => {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");

  useEffect(() => {
    if (editTeam) {
      const [p1, p2] = editTeam.members.split(" / ");
      setPlayer1(p1 || "");
      setPlayer2(p2 || "");
    }
  }, [editTeam]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!player1 || !player2) {
      alert("Les deux joueurs sont obligatoires");
      return;
    }

    const data = {
      id: editTeam?.id,
      name: `${player1} / ${player2}`,
      members: `${player1} / ${player2}`,
      email: "",
      phone: "",
    };

    onSubmit(data);

    setPlayer1("");
    setPlayer2("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl p-6 shadow-md space-y-4"
    >
      <h2 className="text-xl font-semibold text-gray-700">
        {editTeam ? "Modifier l'équipe" : "Ajouter une équipe"}
      </h2>

      <input
        type="text"
        placeholder="Nom du joueur 1"
        value={player1}
        onChange={(e) => setPlayer1(e.target.value)}
        required
        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="text"
        placeholder="Nom du joueur 2"
        value={player2}
        onChange={(e) => setPlayer2(e.target.value)}
        required
        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
      >
        {editTeam ? "Modifier" : "Ajouter"}
      </button>
    </form>
  );
};

export default TeamForm;
