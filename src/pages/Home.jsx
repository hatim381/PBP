import React, { useEffect, useState } from 'react';
import { fetchTeams, addTeam, updateTeam, deleteTeam, deleteAllTeams } from '../services/teamService';
import TeamForm from '../components/TeamForm';
import TeamItem from '../components/TeamItem';

const Home = () => {
  const [teams, setTeams] = useState([]);
  const [editTeam, setEditTeam] = useState(null);
  const [drawExplanation, setDrawExplanation] = useState('');
  const [waitingTeams, setWaitingTeams] = useState([]);
  const [pools, setPools] = useState([]);
  const [scores, setScores] = useState({});
  const [qualifiedTeams, setQualifiedTeams] = useState([]);

  useEffect(() => {
    fetchTeams().then(setTeams);
  }, []);

  const handleSubmit = async (teamData) => {
    try {
      if (teamData.id) {
        await updateTeam(teamData.id, teamData);
      } else {
        await addTeam(teamData);
      }
      setEditTeam(null);
      fetchTeams().then(setTeams);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    }
  };

  const buildBracket = (pool, poolSize) => {
    if (poolSize === 4) {
      const [A, B, C, D] = pool;
      return [
        { num: 1, key: 'M1', teams: [A.members, B.members] },
        { num: 2, key: 'M2', teams: [C.members, D.members] },
        { num: 3, key: 'M3', type: 'winners', fromMatches: ['M1', 'M2'], label: '→ Qualifie le 1er' },
        { num: 4, key: 'M4', type: 'losers', fromMatches: ['M1', 'M2'] },
        { num: 5, key: 'M5', type: 'mixed', fromWinner: 'M4', fromLoser: 'M3', label: '→ Qualifie le 2e' }
      ];
    } else {  // poolSize === 3
      const [A, B, C] = pool;
      return [
        { num: 1, key: 'M1', teams: [A.members, B.members] },
        { num: 2, key: 'M2', type: 'loserVsC', fromMatch: 'M1', teams: [C.members] },
        { num: 3, key: 'M3', type: 'winners', fromMatches: ['M1', 'M2'], label: '→ Les 2 gagnants sont qualifiés' }
      ];
    }
  };

  const generatePools = () => {
    const valid = teams.filter(t => { const [a, b] = t.members.split(' / '); return a && b && a !== b; });
    let s = [...valid].sort(() => Math.random() - 0.5);
    const best = [];
    const wait = [];
    let expl = '';

    for (let p4 = Math.floor(s.length / 4); p4 >= 0; p4--) {
      const rem = s.length - p4 * 4;
      if (rem % 3 === 0) {
        const p3 = rem / 3;
        let copy = [...s];
        for (let i = 0; i < p4; i++) best.push(copy.splice(0, 4));
        for (let i = 0; i < p3; i++) best.push(copy.splice(0, 3));
        expl = `✅ ${p4} poule(s) de 4 et ${p3} poule(s) de 3`;
        break;
      }
    }

    setPools(best.map((pl, i) => ({
      name: String.fromCharCode(65 + i),
      bracket: buildBracket(pl, pl.length)
    })));
    setWaitingTeams(wait);
    setDrawExplanation(expl);
    setScores({});
  };

  const scoreKey = (pool, key) => `${pool}-${key}`;
  const handleScoreChange = (pool, key, side, v) => setScores(prev => ({ ...prev, [scoreKey(pool, key)]: { ...(prev[scoreKey(pool, key)] || {}), [side]: v } }));

  const getMatchResult = (pool, matchKey) => {
    const sc = scores[scoreKey(pool.name, matchKey)];
    if (sc && sc.score1 != null && sc.score2 != null && sc.score1 !== sc.score2) {
      return sc.score1 > sc.score2 ? 0 : 1;
    }
    return null;
  };

  const getTeamName = (pool, match) => {
    const matchKey = match.key;
    const matchResult = getMatchResult(pool, matchKey);

    if (match.teams) {
      return match.teams;
    }

    if (match.type === 'winners') {
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

    if (match.type === 'loserVsC') {
      const result = getMatchResult(pool, match.fromMatch);
      const loser = result !== null ? getTeamName(pool, pool.bracket.find(m => m.key === match.fromMatch))[result === 0 ? 1 : 0] : '...';
      return [loser, match.teams[0]];
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
    return `Match ${match.num} : ${teams[0]} vs ${teams[1]} ${match.label || ''}`;
  };

  // Ajout de la fonction pour déterminer les qualifiés
  const determineQualifiedTeams = (pool) => {
    const qualified = [];
    const matches = pool.bracket;
    
    if (pool.bracket.length === 5) { // Poule de 4
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
    } else { // Poule de 3
      const m3Result = getMatchResult(pool, 'M3');
      if (m3Result !== null) {
        const teams = getTeamName(pool, matches.find(m => m.key === 'M3'));
        qualified.push({ team: teams[0], rank: 1, pool: pool.name });
        qualified.push({ team: teams[1], rank: 2, pool: pool.name });
      }
    }
    
    return qualified;
  };

  // Mettre à jour les qualifiés quand les scores changent
  useEffect(() => {
    const allQualified = pools.flatMap(determineQualifiedTeams);
    setQualifiedTeams(allQualified);
  }, [scores, pools]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Tournoi de Pétanque
      </h1>

      <div className="mb-8">
        <TeamForm
          onSubmit={handleSubmit}
          editTeam={editTeam}
        />
      </div>

      {/* Section des qualifiés */}
      {qualifiedTeams.length > 0 && (
        <div className="mb-8 bg-gradient-to-r from-primary-100 to-accent-100 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-primary-800 mb-4">
            🏆 Équipes Qualifiées
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Équipes ({teams.length})</h2>
          <div className="flex gap-4">
            <button
              onClick={generatePools}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg shadow-lg hover:bg-primary-700 transition-colors"
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
                className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors"
              >
                🗑️ Tout supprimer
              </button>
            )}
          </div>
        </div>

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
    </div>
  );
};

export default Home;
