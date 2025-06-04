import React, { useState } from 'react';

const TeamItem = ({ team, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(team.members);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editValue.trim()) return;
    
    try {
      await onEdit({
        ...team,
        members: editValue.trim()
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error editing team:', error);
      alert('Erreur lors de la modification. Veuillez réessayer.');
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 hover:shadow-md transition-shadow">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-grow px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
            >
              ✅
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditValue(team.members);
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              ❌
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <span className="text-sm sm:text-base font-medium flex-grow">
          {team.members}
        </span>
        <div className="flex gap-1 sm:gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(team)}
            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamItem;
