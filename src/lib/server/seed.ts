import { getSql } from "@/lib/db";
import { buildKnockout } from "@/lib/engine/bracket";
import { distributeTeams, proposePoolConfigs } from "@/lib/engine/pools";
import { roundRobinPairs } from "@/lib/engine/matches";
import { mulberry32, poolLetters, shuffle } from "@/lib/engine/rng";
import type { MatchPhase, MatchStatus } from "@/lib/engine/types";

const PLAYERS: {
  id: string;
  first: string;
  last: string;
  club: string;
  license: string;
  phone: string;
  email: string;
}[] = [
  { id: "pl-01", first: "Jean", last: "Dupont", club: "PBP", license: "75123401", phone: "0612340101", email: "jean.dupont@pbp.fr" },
  { id: "pl-02", first: "Karim", last: "Ben Ali", club: "PBP", license: "75123402", phone: "0612340102", email: "karim.benali@pbp.fr" },
  { id: "pl-03", first: "Pierre", last: "Moreau", club: "ASPTT Paris", license: "75123403", phone: "0612340103", email: "p.moreau@asptt.fr" },
  { id: "pl-04", first: "Antoine", last: "Lefevre", club: "ASPTT Paris", license: "75123404", phone: "0612340104", email: "a.lefevre@asptt.fr" },
  { id: "pl-05", first: "Hassan", last: "El Amrani", club: "Boule du 18e", license: "75123405", phone: "0612340105", email: "h.elamrani@boule18.fr" },
  { id: "pl-06", first: "Luc", last: "Bernard", club: "Boule du 18e", license: "75123406", phone: "0612340106", email: "l.bernard@boule18.fr" },
  { id: "pl-07", first: "Marc", last: "Petit", club: "Montmartre PC", license: "75123407", phone: "0612340107", email: "m.petit@mmpc.fr" },
  { id: "pl-08", first: "Yves", last: "Laurent", club: "Montmartre PC", license: "75123408", phone: "0612340108", email: "y.laurent@mmpc.fr" },
  { id: "pl-09", first: "Paul", last: "Girard", club: "PBP", license: "75123409", phone: "0612340109", email: "paul.girard@pbp.fr" },
  { id: "pl-10", first: "Ahmed", last: "Traoré", club: "Pétanque Vincennes", license: "75123410", phone: "0612340110", email: "a.traore@pv.fr" },
  { id: "pl-11", first: "Nicolas", last: "Roux", club: "PBP", license: "75123411", phone: "0612340111", email: "n.roux@pbp.fr" },
  { id: "pl-12", first: "Thomas", last: "Blanc", club: "La Boule Joyeuse", license: "75123412", phone: "0612340112", email: "t.blanc@lbj.fr" },
  { id: "pl-13", first: "François", last: "Martin", club: "PBP", license: "75123413", phone: "0612340113", email: "f.martin@pbp.fr" },
  { id: "pl-14", first: "David", last: "Simon", club: "Club de Neuilly", license: "75123414", phone: "0612340114", email: "d.simon@neuilly.fr" },
  { id: "pl-15", first: "Julien", last: "Morel", club: "PBP", license: "75123415", phone: "0612340115", email: "j.morel@pbp.fr" },
  { id: "pl-16", first: "Rachid", last: "Khelifi", club: "Boule du 18e", license: "75123416", phone: "0612340116", email: "r.khelifi@boule18.fr" },
  { id: "pl-17", first: "Olivier", last: "Garnier", club: "ASPTT Paris", license: "75123417", phone: "0612340117", email: "o.garnier@asptt.fr" },
  { id: "pl-18", first: "Sébastien", last: "Faure", club: "Pétanque Vincennes", license: "75123418", phone: "0612340118", email: "s.faure@pv.fr" },
  { id: "pl-19", first: "Mehdi", last: "Bouaziz", club: "PBP", license: "75123419", phone: "0612340119", email: "m.bouaziz@pbp.fr" },
  { id: "pl-20", first: "Christophe", last: "Vidal", club: "Montmartre PC", license: "75123420", phone: "0612340120", email: "c.vidal@mmpc.fr" },
  { id: "pl-21", first: "André", last: "Chevalier", club: "PBP", license: "75123421", phone: "0612340121", email: "a.chevalier@pbp.fr" },
  { id: "pl-22", first: "Philippe", last: "Robin", club: "La Boule Joyeuse", license: "75123422", phone: "0612340122", email: "p.robin@lbj.fr" },
  { id: "pl-23", first: "Jacques", last: "Perrin", club: "Club de Neuilly", license: "75123423", phone: "0612340123", email: "j.perrin@neuilly.fr" },
  { id: "pl-24", first: "Michel", last: "Lambert", club: "PBP", license: "75123424", phone: "0612340124", email: "m.lambert@pbp.fr" },
  { id: "pl-25", first: "Hugo", last: "Renard", club: "PBP", license: "75123425", phone: "0612340125", email: "h.renard@pbp.fr" },
  { id: "pl-26", first: "Ibrahim", last: "Diallo", club: "Boule du 18e", license: "75123426", phone: "0612340126", email: "i.diallo@boule18.fr" },
  { id: "pl-27", first: "Éric", last: "Noel", club: "ASPTT Paris", license: "75123427", phone: "0612340127", email: "e.noel@asptt.fr" },
  { id: "pl-28", first: "Pascal", last: "Marchand", club: "Pétanque Vincennes", license: "75123428", phone: "0612340128", email: "p.marchand@pv.fr" },
  { id: "pl-29", first: "Alain", last: "Rousseau", club: "PBP", license: "75123429", phone: "0612340129", email: "a.rousseau@pbp.fr" },
  { id: "pl-30", first: "Nabil", last: "Haddad", club: "Montmartre PC", license: "75123430", phone: "0612340130", email: "n.haddad@mmpc.fr" },
  { id: "pl-31", first: "Laurent", last: "Muller", club: "PBP", license: "75123431", phone: "0612340131", email: "l.muller@pbp.fr" },
  { id: "pl-32", first: "Sami", last: "Ben Youssef", club: "Boule du 18e", license: "75123432", phone: "0612340132", email: "s.benyoussef@boule18.fr" },
];

const TEAM_NAMES = [
  "Les Aces",
  "Boule d'Or",
  "Tireurs du 18",
  "Les Copains",
  "Cochonnet Magique",
  "Les Inoxydables",
  "Pointer & Tirer",
  "La Raffutée",
  "Nord-Sud",
  "Les Moustaches",
  "Carreau Royal",
  "Les Voisins",
  "Palet d'Acier",
  "Belle Époque",
  "Les Fauves",
  "Dernière Boule",
  "Trio Gagnant",
  "Les Batignolles",
  "Fanny Club",
  "Pétanque & Pastis",
];

type SeedLock = Promise<void>;
const globalRef = globalThis as typeof globalThis & { __pbpSeed__?: SeedLock };

export async function ensureSeed(): Promise<void> {
  if (globalRef.__pbpSeed__) {
    await globalRef.__pbpSeed__;
    return;
  }
  globalRef.__pbpSeed__ = (async () => {
    const sql = await getSql();
    const existing = await sql<{ id: string }>`
      select id from tournaments
      where id in ('t-gp-2026', 't-open-2026', 't-challenge-2026', 't-automne-2025')
    `;
    if (existing.length >= 4) return;

    const playerParams: unknown[] = [];
    const playerRows = PLAYERS.map((p, i) => {
      const b = i * 8;
      playerParams.push(p.id, p.first, p.last, p.phone, p.email, p.license, p.club, "active");
      return `($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},$${b + 6},$${b + 7},$${b + 8})`;
    });
    await sql.query(
      `insert into players (id, first_name, last_name, phone, email, license_number, club, status)
       values ${playerRows.join(",")}
       on conflict (id) do nothing`,
      playerParams,
    );

    await seedGrandPrix(sql);
    await seedOpenRentree(sql);
    await seedChallengeExpress(sql);
    await seedTropheeAutomne(sql);
  })().catch((err) => {
    globalRef.__pbpSeed__ = undefined;
    throw err;
  });
  await globalRef.__pbpSeed__;
}

type Sql = Awaited<ReturnType<typeof getSql>>;

async function insertTournament(
  sql: Sql,
  t: {
    id: string;
    name: string;
    description: string;
    date: string;
    startTime: string;
    venue: string;
    address: string;
    courts: number;
    maxTeams: number;
    format: string;
    groupSize: number;
    qualified: number;
    status: string;
    rules: string;
  },
) {
  await sql`
    insert into tournaments (
      id, name, description, date, start_time, venue_name, address,
      court_count, max_teams, team_format, competition_format,
      group_size, qualified_per_group, status, rules
    ) values (
      ${t.id}, ${t.name}, ${t.description}, ${t.date}, ${t.startTime},
      ${t.venue}, ${t.address}, ${t.courts}, ${t.maxTeams}, ${t.format},
      'groups_then_knockout', ${t.groupSize}, ${t.qualified}, ${t.status}, ${t.rules}
    )
    on conflict (id) do nothing
  `;
  for (let i = 1; i <= t.courts; i += 1) {
    await sql`
      insert into courts (id, tournament_id, name, number)
      values (${`${t.id}-c${i}`}, ${t.id}, ${`Terrain ${i}`}, ${i})
      on conflict (id) do nothing
    `;
  }
}

async function insertTeam(
  sql: Sql,
  tournamentId: string,
  index: number,
  name: string,
  playerIds: string[],
  status: string,
) {
  const id = `${tournamentId}-tm-${String(index).padStart(2, "0")}`;
  await sql`
    insert into teams (id, tournament_id, name, number, status)
    values (${id}, ${tournamentId}, ${name}, ${index}, ${status})
    on conflict (id) do nothing
  `;
  for (let i = 0; i < playerIds.length; i += 1) {
    await sql`
      insert into team_players (team_id, player_id, position)
      values (${id}, ${playerIds[i]!}, ${i + 1})
      on conflict (team_id, player_id) do nothing
    `;
  }
  return id;
}

async function seedGrandPrix(sql: Sql) {
  const id = "t-gp-2026";
  const done = await sql<{ n: number }>`select count(*)::int as n from matches where tournament_id = ${id}`;
  if ((done[0]?.n ?? 0) > 0) return;
  await insertTournament(sql, {
    id,
    name: "Grand Prix PBP 2026",
    description:
      "Le rendez-vous annuel de Pétanque Bohra Paris. Doublettes, poules puis tableau final. Terrain du square des Batignolles.",
    date: "2026-08-30",
    startTime: "09:00",
    venue: "Square des Batignolles",
    address: "Place Charles Fillion, 75017 Paris",
    courts: 8,
    maxTeams: 16,
    format: "doublette",
    groupSize: 4,
    qualified: 2,
    status: "in_progress",
    rules: "Parties en 13 points. 1er et 2e de chaque poule qualifiés. Départage : victoires, confrontations directes, différence, points marqués.",
  });

  const pairs: [number, number][] = [
    [1, 2], [3, 4], [5, 6], [7, 8],
    [9, 10], [11, 12], [13, 14], [15, 16],
    [17, 18], [19, 20], [21, 22], [23, 24],
    [25, 26], [27, 28], [29, 30], [31, 32],
  ];
  const teamIds: string[] = [];
  for (let i = 0; i < 16; i += 1) {
    const [a, b] = pairs[i]!;
    const tid = await insertTeam(
      sql,
      id,
      i + 1,
      TEAM_NAMES[i]!,
      [`pl-${String(a).padStart(2, "0")}`, `pl-${String(b).padStart(2, "0")}`],
      "validated",
    );
    teamIds.push(tid);
  }

  const rng = mulberry32(20260830);
  const shuffled = shuffle(teamIds, rng);
  const proposal = proposePoolConfigs(16, 4, 3, 5, 2)[0]!;
  const groups = distributeTeams(shuffled, proposal.sizes);
  const letters = poolLetters(groups.length);
  const poolIds: string[] = [];

  for (let i = 0; i < groups.length; i += 1) {
    const letter = letters[i]!;
    const poolId = `${id}-pool-${letter}`;
    poolIds.push(poolId);
    await sql`
      insert into pools (id, tournament_id, name, letter)
      values (${poolId}, ${id}, ${`Poule ${letter}`}, ${letter})
      on conflict (id) do nothing
    `;
    for (let s = 0; s < groups[i]!.length; s += 1) {
      await sql`
        insert into pool_teams (pool_id, team_id, seed)
        values (${poolId}, ${groups[i]![s]!}, ${s + 1})
        on conflict (pool_id, team_id) do nothing
      `;
    }
  }

  const allMatches: {
    id: string;
    poolId: string;
    round: number;
    t1: string;
    t2: string;
    court: number;
  }[] = [];

  for (let p = 0; p < groups.length; p += 1) {
    const pairings = roundRobinPairs(groups[p]!);
    for (const round of pairings) {
      for (const [t1, t2] of round.pairs) {
        const mid = `${id}-m-${allMatches.length + 1}`;
        const court = ((allMatches.length % 8) + 1);
        allMatches.push({ id: mid, poolId: poolIds[p]!, round: round.round, t1, t2, court });
      }
    }
  }

  const scripted: Record<number, { s1: number; s2: number; status: MatchStatus }> = {};
  let idx = 0;
  for (const pool of groups) {
    const pairings = roundRobinPairs(pool);
    for (const round of pairings) {
      for (let k = 0; k < round.pairs.length; k += 1) {
        if (round.round <= 2) {
          const highFirst = (idx + round.round) % 2 === 0;
          scripted[idx] = {
            s1: highFirst ? 13 : 7 + (idx % 5),
            s2: highFirst ? 6 + (idx % 6) : 13,
            status: "validated",
          };
        } else if (idx % 4 === 0) {
          scripted[idx] = { s1: 8, s2: 11, status: "live" };
        } else if (idx % 4 === 1) {
          scripted[idx] = { s1: 5, s2: 9, status: "live" };
        }
        idx += 1;
      }
    }
  }

  for (let i = 0; i < allMatches.length; i += 1) {
    const m = allMatches[i]!;
    const sc = scripted[i];
    const status = sc?.status ?? "upcoming";
    const score1 = sc ? sc.s1 : null;
    const score2 = sc ? sc.s2 : null;
    const winner =
      status === "validated" && score1 != null && score2 != null
        ? score1 > score2
          ? m.t1
          : m.t2
        : null;
    const hour = 9 + m.round - 1;
    await sql`
      insert into matches (
        id, tournament_id, phase, pool_id, round_index,
        team1_id, team2_id, score1, score2, status, court_id,
        scheduled_at, winner_id
      ) values (
        ${m.id}, ${id}, 'pool', ${m.poolId}, ${m.round},
        ${m.t1}, ${m.t2}, ${score1}, ${score2}, ${status},
        ${`${id}-c${m.court}`},
        ${`${String(hour).padStart(2, "0")}:00`},
        ${winner}
      )
      on conflict (id) do nothing
    `;
  }
}

async function seedOpenRentree(sql: Sql) {
  const id = "t-open-2026";
  const done = await sql<{ n: number }>`select count(*)::int as n from teams where tournament_id = ${id}`;
  if ((done[0]?.n ?? 0) > 0) return;
  await insertTournament(sql, {
    id,
    name: "Open Triplette de rentrée",
    description: "Inscriptions ouvertes. Triplettes, 24 équipes maximum. Venez avec votre équipe ou inscrivez-vous en individuel.",
    date: "2026-09-20",
    startTime: "08:30",
    venue: "Jardin d'Eole",
    address: "18 Rue du Département, 75018 Paris",
    courts: 6,
    maxTeams: 24,
    format: "triplette",
    groupSize: 4,
    qualified: 2,
    status: "registrations_open",
    rules: "Triplettes en 13 points. Inscription sur place possible jusqu'à 8h15.",
  });

  const trips: [number, number, number, string, string][] = [
    [1, 2, 21, "Les Batignolles", "validated"],
    [3, 4, 27, "Trio Gagnant", "validated"],
    [5, 6, 16, "Boule du 18", "pending"],
    [7, 8, 20, "Montmartre United", "validated"],
    [13, 15, 19, "PBP Officiel", "pending"],
    [10, 18, 28, "Vincennes Express", "validated"],
  ];
  for (let i = 0; i < trips.length; i += 1) {
    const [a, b, c, name, status] = trips[i]!;
    await insertTeam(
      sql,
      id,
      i + 1,
      name,
      [`pl-${String(a).padStart(2, "0")}`, `pl-${String(b).padStart(2, "0")}`, `pl-${String(c).padStart(2, "0")}`],
      status,
    );
  }
}

async function seedChallengeExpress(sql: Sql) {
  const id = "t-challenge-2026";
  const done = await sql<{ n: number }>`select count(*)::int as n from teams where tournament_id = ${id}`;
  if ((done[0]?.n ?? 0) > 0) return;
  await insertTournament(sql, {
    id,
    name: "Challenge Express",
    description: "Inscriptions clôturées. 12 doublettes validées, prêtes pour le tirage au sort.",
    date: "2026-09-06",
    startTime: "10:00",
    venue: "Square des Batignolles",
    address: "Place Charles Fillion, 75017 Paris",
    courts: 6,
    maxTeams: 12,
    format: "doublette",
    groupSize: 4,
    qualified: 2,
    status: "draw_pending",
    rules: "Format compact : poules de 4 puis demi-finales et finale.",
  });

  for (let i = 0; i < 12; i += 1) {
    const a = i * 2 + 1;
    const b = i * 2 + 2;
    await insertTeam(
      sql,
      id,
      i + 1,
      TEAM_NAMES[i]!,
      [`pl-${String(a).padStart(2, "0")}`, `pl-${String(b).padStart(2, "0")}`],
      "validated",
    );
  }
}

async function seedTropheeAutomne(sql: Sql) {
  const id = "t-automne-2025";
  const done = await sql<{ n: number }>`select count(*)::int as n from matches where tournament_id = ${id} and phase = 'final'`;
  if ((done[0]?.n ?? 0) > 0) return;
  await insertTournament(sql, {
    id,
    name: "Trophée d'Automne 2025",
    description: "Tête-à-tête archivé. Huit tireurs, poules puis finale. Vainqueur : Jean Dupont.",
    date: "2025-10-12",
    startTime: "09:30",
    venue: "Square des Batignolles",
    address: "Place Charles Fillion, 75017 Paris",
    courts: 4,
    maxTeams: 8,
    format: "tete_a_tete",
    groupSize: 4,
    qualified: 2,
    status: "archived",
    rules: "Tête-à-tête en 13 points.",
  });

  const names = ["Dupont", "Ben Ali", "Moreau", "Lefevre", "El Amrani", "Bernard", "Petit", "Laurent"];
  const teamIds: string[] = [];
  for (let i = 0; i < 8; i += 1) {
    const tid = await insertTeam(
      sql,
      id,
      i + 1,
      names[i]!,
      [`pl-${String(i + 1).padStart(2, "0")}`],
      "validated",
    );
    teamIds.push(tid);
  }

  const groups = [teamIds.slice(0, 4), teamIds.slice(4, 8)];
  const letters = ["A", "B"];
  const poolIds: string[] = [];
  for (let i = 0; i < 2; i += 1) {
    const poolId = `${id}-pool-${letters[i]}`;
    poolIds.push(poolId);
    await sql`
      insert into pools (id, tournament_id, name, letter)
      values (${poolId}, ${id}, ${`Poule ${letters[i]}`}, ${letters[i]!})
      on conflict (id) do nothing
    `;
    for (let s = 0; s < groups[i]!.length; s += 1) {
      await sql`
        insert into pool_teams (pool_id, team_id, seed)
        values (${poolId}, ${groups[i]![s]!}, ${s + 1})
        on conflict (pool_id, team_id) do nothing
      `;
    }
  }

  let n = 0;
  const winners: string[] = [];
  for (let p = 0; p < groups.length; p += 1) {
    const pairings = roundRobinPairs(groups[p]!);
    for (const round of pairings) {
      for (const [t1, t2] of round.pairs) {
        n += 1;
        const t1Wins = (n + p) % 3 !== 0;
        const s1 = t1Wins ? 13 : 4 + (n % 7);
        const s2 = t1Wins ? 5 + (n % 6) : 13;
        const winner = t1Wins ? t1 : t2;
        await sql`
          insert into matches (
            id, tournament_id, phase, pool_id, round_index,
            team1_id, team2_id, score1, score2, status, court_id, winner_id
          ) values (
            ${`${id}-m-${n}`}, ${id}, 'pool', ${poolIds[p]!}, ${round.round},
            ${t1}, ${t2}, ${s1}, ${s2}, 'validated', ${`${id}-c${(n % 4) + 1}`}, ${winner}
          )
          on conflict (id) do nothing
        `;
      }
    }
  }

  const qualified = [
    { teamId: teamIds[0]!, poolLetter: "A", rank: 1 },
    { teamId: teamIds[1]!, poolLetter: "A", rank: 2 },
    { teamId: teamIds[4]!, poolLetter: "B", rank: 1 },
    { teamId: teamIds[5]!, poolLetter: "B", rank: 2 },
  ];
  const nodes = buildKnockout(qualified);
  const semis = nodes.filter((x) => x.phase === "semi");
  const final = nodes.find((x) => x.phase === "final");

  for (const node of semis) {
    const t1 = node.team1Id!;
    const t2 = node.team2Id!;
    const winner = t1;
    winners.push(winner);
    await sql`
      insert into matches (
        id, tournament_id, phase, round_index, bracket_slot,
        team1_id, team2_id, score1, score2, status, court_id, winner_id,
        next_match_id, next_match_slot, placeholder1, placeholder2
      ) values (
        ${node.id}, ${id}, ${node.phase as MatchPhase}, ${node.roundIndex}, ${node.slot},
        ${t1}, ${t2}, 13, 8, 'validated', ${`${id}-c1`}, ${winner},
        ${node.nextMatchId}, ${node.nextMatchSlot}, ${node.placeholder1}, ${node.placeholder2}
      )
      on conflict (id) do nothing
    `;
  }
  if (final) {
    const t1 = winners[0] ?? final.team1Id;
    const t2 = winners[1] ?? final.team2Id;
    const champion = t1;
    await sql`
      insert into matches (
        id, tournament_id, phase, round_index, bracket_slot,
        team1_id, team2_id, score1, score2, status, court_id, winner_id,
        placeholder1, placeholder2
      ) values (
        ${final.id}, ${id}, 'final', ${final.roundIndex}, ${final.slot},
        ${t1}, ${t2}, 13, 10, 'validated', ${`${id}-c1`}, ${champion},
        ${final.placeholder1}, ${final.placeholder2}
      )
      on conflict (id) do nothing
    `;
    await sql`update tournaments set winner_team_id = ${champion}, status = 'archived' where id = ${id}`;
  }
}
