import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const FinalBracket = ({ qualifiedTeams, scores, onScoreChange }) => {
  const [showSummary, setShowSummary] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const pdfRef = useRef();

  const handleExportPDF = async () => {
    const element = pdfRef.current;
    if (!element) return;

    try {
      // Préparer l'élément pour la capture
      const originalStyles = {
        maxHeight: element.style.maxHeight,
        overflow: element.style.overflow,
        width: element.style.width,
        height: element.style.height,
      };

      // Ajuster les styles pour la capture
      element.style.maxHeight = 'none';
      element.style.overflow = 'visible';
      element.style.width = '1000px'; // Largeur fixe pour le PDF
      element.style.height = 'auto';

      // Masquer les boutons d'export et de fermeture
      const buttonsToHide = element.querySelectorAll('.export-button, .close-button');
      buttonsToHide.forEach(button => button.style.display = 'none');

      // Attendre que les changements de style soient appliqués
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capturer le contenu
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1000,
        windowHeight: element.scrollHeight,
        height: element.scrollHeight,
        width: 1000,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-pdf-content]');
          if (clonedElement) {
            clonedElement.style.transform = 'none';
            clonedElement.style.animation = 'none';
          }
        }
      });

      // Restaurer les styles originaux
      Object.assign(element.style, originalStyles);
      buttonsToHide.forEach(button => button.style.display = '');

      // Créer le PDF
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      let heightLeft = imgHeight;
      let position = 0;
      let page = 1;

      pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Ajouter des pages supplémentaires si nécessaire
      while (heightLeft >= 0) {
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, -pageHeight * page, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        page++;
      }

      pdf.save('tournoi-petanque.pdf');

    } catch (error) {
      console.error('Erreur export PDF:', error);
      alert('Erreur lors de l\'export PDF. Veuillez réessayer.');
    }
  };

  // Simple confetti effect function
  const createConfetti = () => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
    return Array.from({ length: 50 }, (_, i) => (
      <div
        key={i}
        className="absolute animate-float"
        style={{
          left: `${Math.random() * 100}%`,
          top: `-20px`,
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          transform: `rotate(${Math.random() * 360}deg)`,
          animation: `float ${2 + Math.random() * 2}s linear infinite`,
        }}
      />
    ));
  };

  const rounds = [
    { name: "8èmes de finale", matches: 8 },
    { name: "Quarts de finale", matches: 4 },
    { name: "Demi-finales", matches: 2 },
    { name: "Finale", matches: 1 }
  ];

  const getMatchWinner = (roundIndex, matchIndex) => {
    const matchId = `R${roundIndex + 1}M${matchIndex + 1}`;
    const matchScores = scores[matchId];
    if (!matchScores || matchScores.score1 === matchScores.score2) return null;
    
    const teams = getMatchTeams(roundIndex, matchIndex);
    return matchScores.score1 > matchScores.score2 ? teams.team1 : teams.team2;
  };

  const getMatchTeams = (roundIndex, matchIndex) => {
    if (roundIndex === 0) {
      const team1Index = matchIndex * 2;
      const team2Index = matchIndex * 2 + 1;
      return {
        team1: qualifiedTeams[team1Index]?.team || "À déterminer",
        team2: qualifiedTeams[team2Index]?.team || "À déterminer"
      };
    }

    // Pour les tours suivants, on cherche les vainqueurs des matchs précédents
    const prevRoundIndex = roundIndex - 1;
    const prevMatch1Index = matchIndex * 2;
    const prevMatch2Index = matchIndex * 2 + 1;

    const winner1 = getMatchWinner(prevRoundIndex, prevMatch1Index);
    const winner2 = getMatchWinner(prevRoundIndex, prevMatch2Index);

    return {
      team1: winner1 || "Vainqueur match précédent",
      team2: winner2 || "Vainqueur match précédent"
    };
  };

  const getTournamentSummary = () => {
    const summary = [];
    rounds.forEach((round, roundIndex) => {
      const roundMatches = [];
      for (let i = 0; i < round.matches; i++) {
        const { team1, team2 } = getMatchTeams(roundIndex, i);
        const matchId = `R${roundIndex + 1}M${i + 1}`;
        const matchScores = scores[matchId];
        if (matchScores) {
          roundMatches.push({
            match: i + 1,
            team1,
            team2,
            score: `${matchScores.score1}-${matchScores.score2}`,
            winner: getMatchWinner(roundIndex, i)
          });
        }
      }
      if (roundMatches.length > 0) {
        summary.push({ round: round.name, matches: roundMatches });
      }
    });
    return summary;
  };

  const getWinner = () => {
    const finalMatch = getMatchTeams(3, 0);
    const finalScore = scores['R4M1'];
    if (finalScore) {
      return getMatchWinner(3, 0);
    }
    return null;
  };

  return (
    <div className="mt-8 px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Phase Finale</h2>
      
      {/* Tableau des matchs - version desktop */}
      <div className="hidden md:flex justify-between gap-4 lg:gap-8 overflow-x-auto pb-4">
        {rounds.map((round, roundIndex) => (
          <div key={round.name} className="flex-1 min-w-[250px]">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center">{round.name}</h3>
            <div className="space-y-4">
              {Array.from({ length: round.matches }, (_, matchIndex) => {
                const { team1, team2 } = getMatchTeams(roundIndex, matchIndex);
                const matchId = `R${roundIndex + 1}M${matchIndex + 1}`;
                return (
                  <div key={matchId} className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm mb-2">Match {matchIndex + 1}</div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>{team1}</span>
                        <input
                          type="number"
                          min="0"
                          className="w-16 px-2 py-1 border rounded text-center"
                          value={scores[matchId]?.score1 || ''}
                          onChange={(e) => onScoreChange(matchId, 'score1', Number(e.target.value))}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span>{team2}</span>
                        <input
                          type="number"
                          min="0"
                          className="w-16 px-2 py-1 border rounded text-center"
                          value={scores[matchId]?.score2 || ''}
                          onChange={(e) => onScoreChange(matchId, 'score2', Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Tableau des matchs - version mobile */}
      <div className="md:hidden space-y-8">
        {rounds.map((round, roundIndex) => (
          <div key={round.name} className="bg-white rounded-xl shadow-lg p-4">
            <h3 className="text-xl font-semibold mb-4 text-center bg-primary-50 py-2 rounded-lg">
              {round.name}
            </h3>
            <div className="space-y-4">
              {Array.from({ length: round.matches }, (_, matchIndex) => {
                const { team1, team2 } = getMatchTeams(roundIndex, matchIndex);
                const matchId = `R${roundIndex + 1}M${matchIndex + 1}`;
                return (
                  <div key={matchId} className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm mb-3 font-medium text-primary-600">Match {matchIndex + 1}</div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="flex-1">{team1}</span>
                        <input
                          type="number"
                          min="0"
                          className="w-16 px-2 py-1 border rounded text-center"
                          value={scores[matchId]?.score1 || ''}
                          onChange={(e) => onScoreChange(matchId, 'score1', Number(e.target.value))}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex-1">{team2}</span>
                        <input
                          type="number"
                          min="0"
                          className="w-16 px-2 py-1 border rounded text-center"
                          value={scores[matchId]?.score2 || ''}
                          onChange={(e) => onScoreChange(matchId, 'score2', Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bouton récapitulatif */}
      <div className="mt-8 text-center">
        <button
          onClick={() => setShowSummary(true)}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-summary text-white rounded-xl shadow-colored hover:scale-105 transition-all duration-300 font-bold text-base sm:text-lg flex items-center justify-center gap-3 mx-auto"
        >
          <span className="text-xl sm:text-2xl">📋</span>
          Voir le récapitulatif
        </button>
      </div>

      {/* Modal Récapitulatif */}
      {showSummary && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-slideIn">
          <div ref={pdfRef} data-pdf-content className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 w-full max-w-[1000px] max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-4xl font-black bg-gradient-shine bg-200% animate-shine bg-clip-text text-transparent flex items-center gap-3">
                <span className="text-3xl animate-float">🎯</span>
                Récapitulatif du Tournoi
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleExportPDF}
                  className="export-button px-6 py-3 bg-gradient-primary text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-bold"
                >
                  <span className="text-xl">📄</span>
                  Exporter en PDF
                </button>
                <button
                  onClick={() => setShowSummary(false)}
                  className="close-button text-gray-500 hover:text-red-600 text-3xl transition-all transform hover:rotate-90 duration-300"
                >
                  ×
                </button>
              </div>
            </div>

            {getWinner() && (
              <div className="mb-12 p-8 bg-gradient-primary text-white rounded-2xl shadow-xl text-center transform hover:scale-105 transition-all duration-500">
                <div className="relative">
                  <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                    <div className="text-6xl animate-float">👑</div>
                  </div>
                  <div className="text-6xl mb-4 animate-float">🏆</div>
                  <div className="absolute top-0 right-4 text-4xl animate-float delay-100">🎉</div>
                  <div className="absolute top-0 left-4 text-4xl animate-float delay-200">🎊</div>
                </div>
                <h4 className="text-3xl font-black mb-3 text-yellow-900 uppercase tracking-wider">
                  Champion du tournoi
                </h4>
                <p className="text-4xl font-black text-primary-700 tracking-wide bg-white bg-opacity-70 py-6 px-8 rounded-xl inline-block shadow-inner">
                  {getWinner()}
                </p>
                <div className="mt-6 text-yellow-700 animate-pulse text-xl font-bold">
                  Félicitations ! 🌟
                </div>
              </div>
            )}

            <div className="space-y-6 sm:space-y-10">
              {getTournamentSummary().map((round, roundIndex) => (
                <div key={round.round} 
                     className="bg-white/90 backdrop-blur p-4 sm:p-6 lg:p-8 rounded-xl shadow-xl border border-primary-100">
                  <h4 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 text-primary-700 flex flex-wrap items-center gap-3">
                    <span className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-shine bg-200% animate-shine text-white rounded-full flex items-center justify-center text-base sm:text-lg font-black shadow">
                      {roundIndex + 1}
                    </span>
                    {round.round}
                  </h4>
                  <div className="grid gap-4 sm:gap-6">
                    {round.matches.map((match) => (
                      <div 
                        key={match.match} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-4 sm:p-6 rounded-xl gap-4"
                      >
                        <span className="text-sm font-bold text-primary-600 bg-primary-100 px-3 py-1 sm:px-4 sm:py-2 rounded-full shadow self-start sm:self-center">
                          Match {match.match}
                        </span>
                        <div className="flex flex-wrap items-center gap-4">
                          <span className={`px-4 py-3 rounded-lg transition-all duration-300 ${
                            match.winner === match.team1 
                              ? 'bg-green-100 text-green-800 font-black shadow-inner scale-105' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}>
                            {match.team1}
                          </span>
                          <span className="px-5 py-3 bg-primary-100 text-primary-800 font-black rounded-xl shadow-inner min-w-[80px] text-center">
                            {match.score}
                          </span>
                          <span className={`px-4 py-3 rounded-lg transition-all duration-300 ${
                            match.winner === match.team2 
                              ? 'bg-green-100 text-green-800 font-black shadow-inner scale-105' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}>
                            {match.team2}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalBracket;
