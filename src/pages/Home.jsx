import React, { useEffect, useState } from 'react';
import { fetchTeams, addTeam, updateTeam, deleteTeam, deleteAllTeams } from '../services/teamService';
import { fetchScores, saveScores, deleteScores } from '../services/scoreService';
import { saveTournament, fetchTournament } from '../services/tournamentService';
import TeamForm from '../components/TeamForm';
import TeamItem from '../components/TeamItem';
import FinalBracket from '../components/FinalBracket';

const Home = () => {
  // Initialize states with localStorage data
  const [teams, setTeams] = useState(() => {
    const savedTeams = localStorage.getItem('teams');
    return savedTeams ? JSON.parse(savedTeams) : [];
  });
  
  // Effect for loading teams
  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoading(true);
        const data = await fetchTeams();
        if (Array.isArray(data) && data.length > 0) {
          setTeams(data);
          localStorage.setItem('teams', JSON.stringify(data));
        }
      } catch (error) {
        console.error('Error loading teams:', error);
        // If API fails, keep using localStorage data
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, []);

  // Effect to persist teams in localStorage
  useEffect(() => {
    localStorage.setItem('teams', JSON.stringify(teams));
  }, [teams]);

  // États pour les données principales
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [tournamentId] = useState(() => localStorage.getItem('tournamentId') || Date.now().toString());

  const buildBracket = (pool, poolSize) => {
    if (!Array.isArray(pool) || pool.length !== poolSize) {
      return [];
    }

    if (poolSize === 4) {
      const [A, B, C, D] = pool;
      return [
        { num: 1, key: 'M1', teams: [A.members, B.members] },
        { num: 2, key: 'M2', teams: [C.members, D.members] },
        { num: 3, key: 'M3', type: 'winners', fromMatches: ['M1', 'M2'], label: '→ Qualifie le 1er' },
        { num: 4, key: 'M4', type: 'losers', fromMatches: ['M1', 'M2'] },
        { num: 5, key: 'M5', type: 'mixed', fromWinner: 'M4', fromLoser: 'M3', label: '→ Qualifie le 2e' }
      ];
    } else if (poolSize === 3) {
      const [A, B, C] = pool;
      return [
        { num: 1, key: 'M1', teams: [A.members, B.members] },
        { num: 2, key: 'M2', type: 'winnerVsC', fromMatch: 'M1', teamC: C.members, label: 'Gagnant M1 vs C' },
        { num: 3, key: 'M3', type: 'losers', fromMatch: 'M1', fromMatch2: 'M2', label: '→ Perdant M1 vs Perdant M2' }
      ];
    }
    return [];
  };

  const generatePools = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setPools([]); // Effacer les poules existantes

    // Filtrer les équipes valides
    const validTeams = teams.filter(t => {
      const [a, b] = t.members.split(' / ');
      return a && b && a !== b && a.trim() && b.trim();
    });

    // Animation de "réflexion"
    await new Promise(resolve => setTimeout(resolve, 800));

    // Génération des poules
    let s = [...validTeams].sort(() => Math.random() - 0.5);
    const best = [];
    let expl = '';

    // Optimiser la répartition
    for (let p4 = Math.floor(s.length / 4); p4 >= 0; p4--) {
      const rem = s.length - p4 * 4;
      if (rem % 3 === 0) {
        const p3 = rem / 3;
        let copy = [...s];
        if (p4 + p3 > 0) {
          for (let i = 0; i < p4; i++) best.push(copy.splice(0, 4));
          for (let i = 0; i < p3; i++) best.push(copy.splice(0, 3));
          expl = `✅ ${p4} poule(s) de 4 et ${p3} poule(s) de 3`;
          break;
        }
      }
    }

    setPools(best.map((pool, index) => ({
      name: String.fromCharCode(65 + index),
      teams: pool,
      bracket: buildBracket(pool, pool.length)
    })));
    
    setDrawExplanation(expl);
    setScores({});
    setIsGenerating(false);
  };

  const scoreKey = (pool, key) => `${pool}-${key}`;
  const handleScoreChange = async (pool, key, side, v) => {
    const newScores = {
      ...scores,
      [scoreKey(pool, key)]: { ...(scores[scoreKey(pool, key)] || {}), [side]: v }
    };
    setScores(newScores);
    
    // Sauvegarder automatiquement après chaque modification
    await saveScores(tournamentId, newScores);
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

  const handleSaveScores = async () => {
    if (Object.keys(scores).length === 0) {
      alert('Aucun score à sauvegarder');
      return;
    }
    const success = await saveScores(tournamentId, scores);
    if (success) {
      alert('Scores sauvegardés avec succès');
    } else {
      alert('Erreur lors de la sauvegarde des scores');
    }
  };

  const handleClearPools = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir effacer toutes les poules et les scores ?')) {
      await deleteScores(tournamentId);
      setPools([]);
      setScores({});
      setQualifiedTeams([]);
      localStorage.removeItem('pools');
    }
  };

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

  const handleTeamEdit = async (teamData) => {
    try {
      await updateTeam(teamData.id, {
        name: teamData.members,
        members: teamData.members
      });
      setTeams(currentTeams => 
        currentTeams.map(team => 
          team.id === teamData.id ? {...team, members: teamData.members} : team
        )
      );
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header et Form existants */}
        <h1 className="text-2xl sm:text-4xl font-bold text-center text-primary-800 mb-6">
          Tournoi de Pétanque
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <TeamForm 
            onSubmit={handleSubmit} 
            editTeam={editTeam}
            className="max-w-xl mx-auto" 
          />
        </div>

        {/* Actions Buttons */}
        <div className="flex flex-wrap justify-center gap-3 my-6">
          <button
            onClick={() => setShowTeamSummary(true)}
            className="px-6 py-3 bg-white text-gray-700 rounded-xl shadow hover:shadow-lg
                     transition-all duration-300 flex items-center gap-2"
          >
            <span>📋</span> Récapitulatif
          </button>
          
          <button
            onClick={generatePools}
            disabled={isGenerating || !teams?.length}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl shadow-lg hover:bg-blue-600
                     transition-all duration-300 flex items-center gap-2"
          >
            <span>🎲</span> Générer les poules
          </button>

          {teams?.length > 0 && (
            <button
              onClick={async () => {
                if (window.confirm('Supprimer toutes les équipes ?')) {
                  try {
                    await deleteAllTeams();
                    setTeams([]);
                    setPools([]);
                    setQualifiedTeams([]);
                    setScores({});
                  } catch (error) {
                    console.error('Erreur:', error);
                    alert('Erreur lors de la suppression');
                  }
                }
              }}
              className="px-6 py-3 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600
                       transition-all duration-300 flex items-center gap-2"
            >
              <span>🗑️</span> Tout supprimer
            </button>
          )}
        </div>

        {/* Teams List */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Équipes ({teams?.length || 0})
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {teams?.map(team => (
              <TeamItem
                key={team.id}
                team={team}
                onEdit={handleTeamEdit}
                onDelete={async () => {
                  try {
                    await deleteTeam(team.id);
                    setTeams(teams.filter(t => t.id !== team.id));
                  } catch (error) {
                    console.error('Erreur:', error);
                    alert('Erreur lors de la suppression');
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Modal Récapitulatif */}
        {showTeamSummary && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Récapitulatif des équipes</h3>
                <button
                  onClick={() => setShowTeamSummary(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2">
                {teams?.map((team, index) => (
                  <div key={team.id} className="p-3 bg-gray-50 rounded-lg">
                    {index + 1}. {team.members}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {pools.map((pool, index) => (
            <div
              key={pool.name}
              className="bg-white rounded-xl shadow-lg p-4 sm:p-6 transform transition-all duration-300 hover:shadow-xl"
              style={{
                animationDelay: `${index * 150}ms`
              }}
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full">
                  Poule {pool.name}
                </span>
              </h3>
              {pool.bracket.map(match => (
                <div key={match.key} className="mb-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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

          {pools.length > 0 && (
          <div className="flex justify-center gap-4 my-6">
            <button
              onClick={handleSaveScores}
              className="px-6 py-3 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition-all duration-300 flex items-center gap-2"
            >
              💾 Sauvegarder les scores
            </button>
            <button
              onClick={handleClearPools}
              className="px-6 py-3 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 transition-all duration-300 flex items-center gap-2"
            >
              🗑️ Effacer les poules
            </button>
          </div>
        )}
        </div>

        {/* Section des équipes qualifiées */}
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

        {/* Tableau final si suffisamment d'équipes qualifiées */}
        {qualifiedTeams.length >= 16 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-center mb-6">Phase Finale</h2>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
