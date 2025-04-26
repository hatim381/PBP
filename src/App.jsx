import React from 'react';
import Home from './pages/Home';
import Calendar from './components/Calendar';

function App() {
  const [activeTab, setActiveTab] = React.useState('tournoi');

  return (
    <div>
      {/* Navigation */}
      <div className="flex justify-center gap-4 p-4 bg-white shadow-md mb-4">
        <button
          onClick={() => setActiveTab('tournoi')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
            activeTab === 'tournoi' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <span>🎯</span>
          Tournoi
        </button>
        <button
          onClick={() => setActiveTab('calendrier')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
            activeTab === 'calendrier' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <span>📅</span>
          Calendrier
        </button>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4">
        {activeTab === 'tournoi' ? <Home /> : <Calendar />}
      </div>
    </div>
  );
}

export default App;
