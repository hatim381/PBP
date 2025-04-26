import React, { useState } from 'react';

const Calendar = () => {
  const [activeMonth, setActiveMonth] = useState('mai');

  const getImageUrl = (month) => {
    if (month === 'mai') {
      return '/images/Mai.png';
    }
    return '/images/Juin.png';
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex flex-col items-center gap-6">
        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setActiveMonth('mai')}
            className={`px-6 py-3 rounded-xl transition-all ${
              activeMonth === 'mai' 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Mai 2024
          </button>
          <button
            onClick={() => setActiveMonth('juin')}
            className={`px-6 py-3 rounded-xl transition-all ${
              activeMonth === 'juin' 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Juin 2024
          </button>
        </div>

        {/* Calendar Display */}
        <div className="w-full bg-white rounded-xl shadow-lg p-4">
          <img 
            src={getImageUrl(activeMonth)}
            alt={`Calendrier ${activeMonth} 2024`}
            className="w-full h-auto rounded-lg shadow-md"
            onError={(e) => {
              console.error('Image load error:', e);
              e.target.src = getImageUrl(activeMonth);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
