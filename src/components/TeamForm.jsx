import React, { useState, useEffect } from 'react';

const TeamForm = ({ onSubmit, editTeam, tournamentType }) => {
  const [players, setPlayers] = useState(
    Array(tournamentType?.players || 2).fill('')
  );

  useEffect(() => {
    if (editTeam) {
      setPlayers(editTeam.members.split(' / '));
    } else {
      setPlayers(Array(tournamentType?.players || 2).fill(''));
    }
  }, [editTeam, tournamentType]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation adaptée au format tête à tête
    if (tournamentType.id === 'single') {
      if (!players[0].trim()) {
        alert('Veuillez entrer le nom du joueur');
        return;
      }
    } else {
      // Validation existante pour doublettes et triplettes
      if (players.some(p => !p.trim())) {
        alert('Veuillez remplir tous les noms des joueurs');
        return;
      }
    }

    try {
      await onSubmit({
        id: editTeam?.id,
        members: tournamentType.id === 'single' ? players[0] : players.map(p => p.trim()).join(' / '),
        type: tournamentType.id
      });
      
      setPlayers(Array(tournamentType?.players || 2).fill(''));
    } catch (error) {
      alert('Erreur lors de l\'ajout');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {players.map((player, index) => (
        <input
          key={index}
          type="text"
          value={player}
          onChange={(e) => {
            const newPlayers = [...players];
            newPlayers[index] = e.target.value;
            setPlayers(newPlayers);
          }}
          placeholder={`Joueur ${index + 1}`}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
      ))}
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        {editTeam ? 'Modifier l\'équipe' : 'Ajouter l\'équipe'}
      </button>
    </form>
  );
};

export default TeamForm;
