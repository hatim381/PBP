import React from 'react';

const TournamentTypeSelector = ({ selectedType, onTypeChange }) => {
  const types = [
    { id: 'single', name: 'Tête à tête', players: 1 },
    { id: 'double', name: 'Doublette', players: 2 },
    { id: 'triple', name: 'Triplette', players: 3 }
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">Type de concours</h3>
      <div className="flex gap-4">
        {types.map(type => (
          <button
            key={type.id}
            onClick={() => onTypeChange(type)}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedType?.id === type.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {type.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TournamentTypeSelector;
