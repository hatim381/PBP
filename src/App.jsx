import React, { useState } from 'react';
import Home from './pages/Home';
import Calendar from './components/Calendar';
import PhotoGallery from './components/PhotoGallery';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
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
      <nav className="bg-white shadow-lg mb-4">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-6 py-3 rounded-xl transition-all ${
                activeTab === 'home' ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              🎯 Tournoi
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-6 py-3 rounded-xl transition-all ${
                activeTab === 'calendar' ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              📅 Calendrier
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-6 py-3 rounded-xl transition-all ${
                activeTab === 'photos' ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              📸 Photos
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
