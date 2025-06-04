import React, { useState } from 'react';
import Home from './pages/Home';
import Calendar from './components/Calendar';
import PhotoGallery from './components/PhotoGallery';
import LeagueTable from './components/LeagueTable';

function App() {
  const [activeTab, setActiveTab] = useState('tournament');

  const renderContent = () => {
    switch (activeTab) {
      case 'tournament':
        return <Home />;
      case 'league':
        return <LeagueTable />;
      case 'calendar':
        return <Calendar />;
      case 'photos':
        return <PhotoGallery />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation unique */}
      <nav className="sticky top-0 z-50 bg-white shadow-lg p-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setActiveTab('tournament')}
              className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'tournament' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              🎯 Tournoi
            </button>
            <button
              onClick={() => setActiveTab('league')}
              className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'league' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              🏆 Ligue
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'calendar' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              📅 Calendrier
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'photos' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              📸 Photos
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-6">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
