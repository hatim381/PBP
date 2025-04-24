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
    if (!player1.trim() || !player2.trim()) {
      alert("Les deux joueurs sont obligatoires");
      return;
    }

    onSubmit({
      id: editTeam?.id,
      members: `${player1.trim()} / ${player2.trim()}`
    });

    setPlayer1("");
    setPlayer2("");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 sm:p-6 shadow-md space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
        {editTeam ? "Modifier l'équipe" : "Ajouter une équipe"}
      </h2>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <input
          type="text"
          placeholder="Joueur 1"
          value={player1}
          onChange={(e) => setPlayer1(e.target.value)}
          required
          className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
        />

        <input
          type="text"
          placeholder="Joueur 2"
          value={player2}
          onChange={(e) => setPlayer2(e.target.value)}
          required
          className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
      >
        {editTeam ? "Modifier" : "Ajouter"}
      </button>
    </form>
  );
};

export default TeamForm;
