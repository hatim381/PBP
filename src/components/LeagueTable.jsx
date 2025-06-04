import React from 'react';

const PLAYER_SCORES = [
  { name: "Houned ADAMALY", scores: [6, 0, 4], total: 10 },
  { name: "Mohssine ISSADJI", scores: [0, 6, 2], total: 8 },
  { name: "Mourtaza SADECCALY", scores: [4, 4, 0], total: 8 },
  { name: "Hatim SABIR DIVANE", scores: [1, 6, 0], total: 7 },
  { name: "Abasse AIMADALY", scores: [0, 0, 6], total: 6 },
  { name: "Hatim SAIFOUDINE", scores: [0, 6, null], total: 6 },
  { name: "Issac GANIVALA", scores: [6, 0, 0], total: 6 },
  { name: "Kassim AMMAR", scores: [6, 0, 0], total: 6 },
  { name: "Khouzéma MAMODBAY", scores: [6, 0, 0], total: 6 },
  { name: "Michaël ACHIKHOUSSEN", scores: [0, 2, 4], total: 6 },
  { name: "Saiffoudine ADAMALY", scores: [6, 0, 0], total: 6 },
  { name: "Adnane SADECCALY", scores: [4, 0, 0], total: 4 },
  { name: "Danyal SADECCALY", scores: [0, 0, 4], total: 4 },
  { name: "Johar FATEALY", scores: [4, 0, 0], total: 4 },
  { name: "Mahmod MOOSSINBHAY", scores: [4, 0, 0], total: 4 },
  { name: "Youssouf ISMAELBAY", scores: [4, 0, null], total: 4 },
  { name: "Mustafa FASSY", scores: [2, 1, 0], total: 3 },
  { name: "Zouzar MOOSSINBHAY", scores: [1, 0, 2], total: 3 },
  { name: "Houssen ACHIKHOUSSEN", scores: [2, 0, 0], total: 2 },
  { name: "Idrisse MOUSTAPHA", scores: [0, 2, 0], total: 2 },
  { name: "Moufadal INATHOSSENE", scores: [2, 0, 0], total: 2 },
  { name: "Sheikh Houssen MOSHINE", scores: [2, 0, null], total: 2 },
  { name: "Yussuf GADIA", scores: [2, 0, 0], total: 2 },
  { name: "Amar SAIFOUDINE", scores: [1, 0, 0], total: 1 },
  { name: "Mourtaza ZAVAR", scores: [1, 0, 0], total: 1 },
  { name: "Sadik ABASSE", scores: [0, 1, 0], total: 1 },
  { name: "Sheikh Houssen AKBARALY", scores: [1, 0, 0], total: 1 },
  { name: "Taha HATIM", scores: [0, 1, 0], total: 1 },
  { name: "Youssouf RADJEBAY", scores: [0, 1, 0], total: 1 },
  { name: "Amin LAKOUBAY", scores: [0, 0, 0], total: 0 },
  { name: "Bachir MOUNAVARALY", scores: [0, 0, 0], total: 0 },
  { name: "Hatim ADNANE", scores: [0, 0, 0], total: 0 },
  { name: "Housseni MAMODHOUSSEN", scores: [0, 0, 0], total: 0 },
  { name: "Idris SEIFUDDIN", scores: [0, 0, 0], total: 0 },
  { name: "Iltaf DJAFARDJI", scores: [0, 0, 0], total: 0 },
  { name: "Ismaël KOURBANY", scores: [0, 0, 0], total: 0 },
  { name: "Jamilhoussen MAMODALY", scores: [0, 0, 0], total: 0 },
  { name: "Keich GANIVALA", scores: [0, 0, 0], total: 0 },
  { name: "Khouzema EMADALY", scores: [0, 0, 0], total: 0 },
  { name: "Kourech TAHERALY", scores: [0, 0, 0], total: 0 },
  { name: "Koureich AKBARALY", scores: [0, 0, 0], total: 0 },
  { name: "Malik TAYABALY", scores: [0, 0, 0], total: 0 },
  { name: "Mikael ABISMA", scores: [0, 0, 0], total: 0 },
  { name: "Mohamad FASSY", scores: [0, 0, 0], total: 0 },
  { name: "Moufaddal SHABBIR", scores: [0, 0, 0], total: 0 },
  { name: "Moufaddel SADECCALY", scores: [0, 0, 0], total: 0 },
  { name: "Mourtaza TAHERALY", scores: [0, 0, 0], total: 0 },
  { name: "Mouslim ISMAEL", scores: [0, 0, 0], total: 0 },
  { name: "Shabbir (Sokat) FAZILY-ABAS", scores: [0, 0, 0], total: 0 }
].sort((a, b) => b.total - a.total); // Tri par total décroissant

const LeagueTable = () => {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-6">Classement de la Ligue</h2>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Position</th>
              <th className="px-4 py-3 text-left">Joueur</th>
              <th className="px-4 py-3 text-center">31/01</th>
              <th className="px-4 py-3 text-center">21/02</th>
              <th className="px-4 py-3 text-center">04/04</th>
              <th className="px-4 py-3 text-center font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {PLAYER_SCORES.map((player, index) => (
              <tr key={player.name} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3 font-medium">{player.name}</td>
                {player.scores.map((score, i) => (
                  <td key={i} className="px-4 py-3 text-center">
                    {score ?? '-'}
                  </td>
                ))}
                <td className="px-4 py-3 text-center font-bold">{player.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeagueTable;
