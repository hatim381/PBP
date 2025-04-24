import React, { useEffect, useState } from 'react';
import { fetchTeams, addTeam, updateTeam, deleteTeam, deleteAllTeams } from '../services/teamService';
import { fetchScores, saveScore } from '../services/scoreService';
import { saveTournament, fetchTournament } from '../services/tournamentService';
import TeamForm from '../components/TeamForm';
import TeamItem from '../components/TeamItem';
import FinalBracket from '../components/FinalBracket';

const Home = () => {
  // États pour les données principales
  const [teams, setTeams] = useState([]);
  const [pools, setPools] = useState(() => {
    const savedPools = localStorage.getItem('pools');
    return savedPools ? JSON.parse(savedPools) : [];
  });
  const [scores, setScores] = useState(() => {
    const savedScores = localStorage.getItem('scores');
    return savedScores ? JSON.parse(savedScores) : {};
  });

  // États UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editTeam, setEditTeam] = useState(null);
  const [showTeamSummary, setShowTeamSummary] = useState(false);
  const [drawExplanation, setDrawExplanation] = useState('');
  const [waitingTeams, setWaitingTeams] = useState([]);
  const [qualifiedTeams, setQualifiedTeams] = useState([]);
  const [finalScores, setFinalScores] = useState({});

  // Fonction de soumission du formulaire
  const handleSubmit = async (teamData) => {
    try {
      const processedData = {
        ...teamData,
        name: teamData.members,
        members: teamData.members,
      };

      if (teamData.id) {
        await updateTeam(teamData.id, processedData);
      } else {
        await addTeam(processedData);
      }
      setEditTeam(null);
      const freshTeams = await fetchTeams();
      setTeams(freshTeams);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  // Fonction pour construire les brackets
  const buildBracket = (pool, poolSize) => {
    if (!Array.isArray(pool) || pool.length !== poolSize) {
      console.error('Format de pool invalide:', pool);
      return [];
    }

    if (poolSize === 4) {
      const [A, B, C, D] = pool.map(team => ({
        ...team,
        members: team.members || 'Équipe non définie'
      }));
      
      return [
        { num: 1, key: 'M1', teams: [A.members, B.members] },
        { num: 2, key: 'M2', teams: [C.members, D.members] },
        { num: 3, key: 'M3', type: 'winners', fromMatches: ['M1', 'M2'], label: '→ Qualifie le 1er' },
        { num: 4, key: 'M4', type: 'losers', fromMatches: ['M1', 'M2'] },
        { num: 5, key: 'M5', type: 'mixed', fromWinner: 'M4', fromLoser: 'M3', label: '→ Qualifie le 2e' }
      ];
    } else if (poolSize === 3) {
      const [A, B, C] = pool.map(team => ({
        ...team,
        members: team.members || 'Équipe non définie'
      }));

      return [
        { num: 1, key: 'M1', teams: [A.members, B.members] },
        { num: 2, key: 'M2', type: 'winnerVsC', fromMatch: 'M1', teamC: C.members, label: 'Gagnant M1 vs C' },
        { num: 3, key: 'M3', type: 'losers', fromMatch: 'M1', fromMatch2: 'M2', label: '→ Perdant M1 vs Perdant M2' }
      ];
    }
    return [];
  };

  // Sauvegarder les scores quand ils changent
  useEffect(() => {
    localStorage.setItem('scores', JSON.stringify(scores));
  }, [scores]);

  // Sauvegarder les poules quand elles changent
  useEffect(() => {
    localStorage.setItem('pools', JSON.stringify(pools));
  }, [pools]);

  const generatePools = () => {
    // Valider et filtrer les équipes valides
    const valid = teams.filter(t => {
      const [a, b] = t.members.split(' / ');
      return a && b && a !== b && a.trim() && b.trim();
    });

    if (valid.length < 3) {
      alert('Il faut au moins 3 équipes pour générer les poules');
      return;
    }

    let s = [...valid].sort(() => Math.random() - 0.5);
    const best = [];
    const wait = [];
    let expl = '';

    // Optimiser la répartition des équipes
    for (let p4 = Math.floor(s.length / 4); p4 >= 0; p4--) {
      const rem = s.length - p4 * 4;
      if (rem % 3 === 0) {
        const p3 = rem / 3;
        let copy = [...s];
        const poolCount = p4 + p3;
        
        if (poolCount > 0) {
          for (let i = 0; i < p4; i++) best.push(copy.splice(0, 4));
          for (let i = 0; i < p3; i++) best.push(copy.splice(0, 3));
          expl = `✅ ${p4} poule(s) de 4 et ${p3} poule(s) de 3`;
          break;
        }
      }
    }

    if (best.length === 0) {
      alert('Impossible de créer des poules valides avec ce nombre d\'équipes');
      return;
    }

    setPools(best.map((pl, i) => ({
      name: String.fromCharCode(65 + i),
      bracket: buildBracket(pl, pl.length)
    })));
    setWaitingTeams(wait);
    setDrawExplanation(expl);
    setScores({}); // Réinitialiser les scores pour un nouveau tirage
    localStorage.setItem('scores', JSON.stringify({}));
  };

  const scoreKey = (pool, key) => `${pool}-${key}`;
  const handleScoreChange = (pool, key, side, v) => {
    setScores(prev => {
      const newScores = {
        ...prev,
        [scoreKey(pool, key)]: { ...(prev[scoreKey(pool, key)] || {}), [side]: v }
      };
      localStorage.setItem('scores', JSON.stringify(newScores));
      return newScores;
    });
  };

  const getMatchResult = (pool, matchKey) => {
    const sc = scores[scoreKey(pool.name, matchKey)];
    if (sc && sc.score1 != null && sc.score2 != null && sc.score1 !== sc.score2) {
      return sc.score1 > sc.score2 ? 0 : 1;
    }
    return null;
  };

  const getTeamName = (pool, match) => {
    if (match.teams) {
      return match.teams;
    }

    if (match.type === 'winnerVsC') {
      const result = getMatchResult(pool, 'M1');
      if (result === null) {
        return ['Gagnant M1', match.teamC];
      }
      const firstMatch = pool.bracket.find(m => m.key === 'M1');
      const winner = firstMatch.teams[result];
      return [winner, match.teamC];
    }

    if (match.type === 'losers') {
      const result1 = getMatchResult(pool, 'M1');
      const result2 = getMatchResult(pool, 'M2');
      
      if (result1 === null) return ['Perdant M1', 'En attente...'];
      
      const match1 = pool.bracket.find(m => m.key === 'M1');
      const loser1 = match1.teams[result1 === 0 ? 1 : 0];
      
      if (result2 === null) return [loser1, 'Perdant M2'];
      
      const match2 = pool.bracket.find(m => m.key === 'M2');
      const [winner, teamC] = getTeamName(pool, match2);
      const loser2 = result2 === 0 ? teamC : winner;
      
      return [loser1, loser2];
    }

    if (match.type === 'winners' && pool.bracket.length === 3) {
      const match1 = pool.bracket.find(m => m.key === 'M1');
      const match2 = pool.bracket.find(m => m.key === 'M2');
      const result1 = getMatchResult(pool, 'M1');
      const result2 = getMatchResult(pool, 'M2');
      
      if (result1 === null || result2 === null) {
        return ['En attente...', 'En attente...'];
      }
      
      const winner1 = match1.teams[result1];
      const winner2 = match2.teams[result2];
      return [winner1, winner2];
    }

    if (match.type === 'winners') {
      if (pool.bracket.length === 3) { // Logique spéciale pour poule de 3
        const [match1, match2] = match.fromMatches;
        const result1 = getMatchResult(pool, match1);
        const result2 = getMatchResult(pool, match2);
        
        if (result1 === null || result2 === null) return ['...', '...'];
        
        // Le gagnant du premier match contre le gagnant du deuxième match
        const winner1 = pool.bracket.find(m => m.key === match1).teams[result1];
        const winner2 = pool.bracket.find(m => m.key === match2).teams[result2];
        return [winner1, winner2];
      }
      const [match1, match2] = match.fromMatches;
      const result1 = getMatchResult(pool, match1);
      const result2 = getMatchResult(pool, match2);
      const team1 = result1 !== null ? getTeamName(pool, pool.bracket.find(m => m.key === match1))[result1] : '...';
      const team2 = result2 !== null ? getTeamName(pool, pool.bracket.find(m => m.key === match2))[result2] : '...';
      return [team1, team2];
    }

    if (match.type === 'losers') {
      const [match1, match2] = match.fromMatches;
      const result1 = getMatchResult(pool, match1);
      const result2 = getMatchResult(pool, match2);
      const team1 = result1 !== null ? getTeamName(pool, pool.bracket.find(m => m.key === match1))[result1 === 0 ? 1 : 0] : '...';
      const team2 = result2 !== null ? getTeamName(pool, pool.bracket.find(m => m.key === match2))[result2 === 0 ? 1 : 0] : '...';
      return [team1, team2];
    }

    if (match.type === 'mixed') {
      const winnerResult = getMatchResult(pool, match.fromWinner);
      const loserResult = getMatchResult(pool, match.fromLoser);
      const winner = winnerResult !== null ? getTeamName(pool, pool.bracket.find(m => m.key === match.fromWinner))[winnerResult] : '...';
      const loser = loserResult !== null ? getTeamName(pool, pool.bracket.find(m => m.key === match.fromLoser))[loserResult === 0 ? 1 : 0] : '...';
      return [loser, winner];
    }

    return ['...', '...'];
  };

  const renderMatch = (pool, match) => {
    const teams = getTeamName(pool, match);
    let matchText = `Match ${match.num} : ${teams[0]} vs ${teams[1]}`;
    
    if (match.type === 'loserVsC') {
      matchText = `Match ${match.num} : ${teams[0]} vs ${teams[1]}`;
    }
    
    return `${matchText} ${match.label || ''}`;
  };

  const determineQualifiedTeams = (pool) => {
    const qualified = [];
    const matches = pool.bracket;
    
    if (pool.bracket.length === 5) {
      const m3Result = getMatchResult(pool, 'M3');
      const m5Result = getMatchResult(pool, 'M5');
      
      if (m3Result !== null) {
        const winner = getTeamName(pool, matches.find(m => m.key === 'M3'))[m3Result];
        qualified.push({ team: winner, rank: 1, pool: pool.name });
      }
      
      if (m5Result !== null) {
        const winner = getTeamName(pool, matches.find(m => m.key === 'M5'))[m5Result];
        qualified.push({ team: winner, rank: 2, pool: pool.name });
      }
    } else if (pool.bracket.length === 3) {
      // Pour les poules de 3
      const m2Result = getMatchResult(pool, 'M2');
      const m3Result = getMatchResult(pool, 'M3');
      
      if (m2Result !== null) {
        // Le gagnant du match 2 (Gagnant M1 vs C) est 1er
        const m2Teams = getTeamName(pool, matches.find(m => m.key === 'M2'));
        const winner = m2Teams[m2Result];
        qualified.push({ team: winner, rank: 1, pool: pool.name });
      }
      
      if (m3Result !== null) {
        // Le gagnant du match 3 (entre les perdants) est 2ème
        const m3Teams = getTeamName(pool, matches.find(m => m.key === 'M3'));
        const winner = m3Teams[m3Result];
        qualified.push({ team: winner, rank: 2, pool: pool.name });
      }
    }
    
    return qualified;
  };

  // Mettre à jour les qualifiés quand les scores changent
  useEffect(() => {
    const allQualified = pools.flatMap(determineQualifiedTeams);
    setQualifiedTeams(allQualified);
  }, [scores, pools]);

  // Chargement initial des équipes
  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoading(true);
        const data = await fetchTeams();
        console.log('Teams loaded from API:', data); // Debug log
        
        if (Array.isArray(data)) {
          setTeams(data);
        } else {
          console.error('Invalid data format received:', data);
          setError('Format de données invalide');
        }
      } catch (err) {
        console.error('Error loading teams:', err);
        setError('Erreur lors du chargement des équipes');
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, []); // S'exécute une seule fois au montage

  const clearPools = () => {
    if (window.confirm('Êtes-vous sûr de vouloir effacer toutes les poules ?')) {
      setPools([]);
      setScores({});
      setQualifiedTeams([]);
      localStorage.removeItem('pools');
      localStorage.removeItem('scores');
    }
  };

  return (
    <div className="p-2 sm:p-6 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8 text-center">
        Tournoi de Pétanque
      </h1>

      {loading && (
        <div className="text-center py-2 sm:py-4">
          Chargement des équipes...
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="mb-4 sm:mb-8">
        <TeamForm
          onSubmit={handleSubmit}
          editTeam={editTeam}
        />
      </div>

      {/* Section des qualifiés */}
      {qualifiedTeams.length > 0 && (
        <div className="mb-4 sm:mb-8 bg-gradient-to-r from-primary-100 to-accent-100 p-3 sm:p-6 rounded-xl shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold text-primary-800 mb-3 sm:mb-4">
            🏆 Équipes Qualifiées
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {qualifiedTeams.map((qualified, idx) => (
              <div 
                key={idx}
                className="bg-white p-4 rounded-lg shadow-md transform hover:scale-105 transition-transform"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {qualified.rank === 1 ? '🥇' : '🥈'}
                  </span>
                  <div>
                    <p className="font-semibold text-primary-700">
                      {qualified.team}
                    </p>
                    <p className="text-sm text-gray-600">
                      Poule {qualified.pool} - {qualified.rank === 1 ? '1er' : '2ème'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold">Équipes ({teams.length})</h2>
          <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => setShowTeamSummary(true)}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-primary-100 text-primary-700 rounded-lg shadow text-sm sm:text-base"
            >
              📋 Voir le récapitulatif
            </button>
            <button
              onClick={generatePools}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 text-white rounded-lg shadow-lg text-sm sm:text-base"
            >
              🎲 Générer les poules
            </button>
            {teams.length > 0 && (
              <button
                onClick={async () => {
                  if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les équipes ?')) {
                    try {
                      await deleteAllTeams();
                      setTeams([]);
                      setPools([]);
                      setQualifiedTeams([]);
                      setScores({});
                    } catch (error) {
                      console.error('Erreur:', error);
                      alert('Erreur lors de la suppression des équipes');
                    }
                  }
                }}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg shadow-lg text-sm sm:text-base"
              >
                🗑️ Tout supprimer
              </button>
            )}
          </div>
        </div>

        {/* Modal de récapitulatif */}
        {showTeamSummary && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-primary-700">
                  Récapitulatif des équipes
                </h3>
                <button
                  onClick={() => setShowTeamSummary(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                {teams.map((team, index) => (
                  <div 
                    key={team.id}
                    className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
                  >
                    <span className="font-medium">
                      {index + 1}. {team.members}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(team => (
            <TeamItem
              key={team.id}
              team={team}
              onEdit={() => setEditTeam(team)}
              onDelete={async () => {
                try {
                  await deleteTeam(team.id);
                  const updatedTeams = teams.filter(t => t.id !== team.id);
                  setTeams(updatedTeams);
                } catch (error) {
                  console.error('Erreur lors de la suppression:', error);
                  alert('Erreur lors de la suppression de l\'équipe');
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Afficher le bouton d'effacement des poules si des poules existent */}
      {pools.length > 0 && (
        <div className="mt-4 mb-8 flex justify-center">
          <button
            onClick={clearPools}
            className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <span>🗑️</span>
            Effacer les poules
          </button>
        </div>
      )}

      {/* Section des poules avec style amélioré */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pools.map(pool => (
          <div key={pool.name} 
               className="bg-white rounded-xl shadow-lg p-6 transform hover:shadow-xl transition-all">
            <h2 className="text-2xl font-bold text-primary-700 mb-6 flex items-center gap-2">
              <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full">
                Poule {pool.name}
              </span>
            </h2>
            {pool.bracket.map(match => (
              <div key={match.key} 
                   className="mb-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-primary-600">
                      {renderMatch(pool, match)}
                    </span>
                  </div>
                  <div className="flex justify-center gap-4 items-center">
                    <input
                      type="number"
                      min="0"
                      className="w-16 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-center"
                      value={scores[scoreKey(pool.name, match.key)]?.score1 || ''}
                      onChange={e => handleScoreChange(pool.name, match.key, 'score1', Number(e.target.value))}
                    />
                    <span className="text-xl font-bold text-primary-500">-</span>
                    <input
                      type="number"
                      min="0"
                      className="w-16 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 text-center"
                      value={scores[scoreKey(pool.name, match.key)]?.score2 || ''}
                      onChange={e => handleScoreChange(pool.name, match.key, 'score2', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Afficher la phase finale si on a assez d'équipes qualifiées */}
      {qualifiedTeams.length >= 16 && (
        <FinalBracket
          qualifiedTeams={qualifiedTeams}
          scores={finalScores}
          onScoreChange={(matchId, side, value) => {
            setFinalScores(prev => ({
              ...prev,
              [matchId]: { ...(prev[matchId] || {}), [side]: value }
            }));
          }}
        />
      )}
    </div>
  );
};

export default Home;
