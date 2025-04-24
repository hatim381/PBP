import React from "react";

const TeamItem = ({ team, onEdit, onDelete }) => {
  const handleDelete = async () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'équipe "${team.members}" ?`)) {
      try {
        await onDelete(team);
      } catch (error) {
        alert("Erreur lors de la suppression de l'équipe");
        console.error(error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center">
        <span className="font-medium">{team.members}</span>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(team)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamItem;
