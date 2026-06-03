// server/initialData.js

const initialTeams = [
  {
    id: "team-1",
    name: "Knight Riders",
    logo: "♞",
    owner: "Garry Kasparov",
    budget: 1000,
    points: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    boardPoints: 0
  },
  {
    id: "team-2",
    name: "Pawn Stormers",
    logo: "♟",
    owner: "Judit Polgar",
    budget: 1000,
    points: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    boardPoints: 0
  },
  {
    id: "team-3",
    name: "King's Defenders",
    logo: "♚",
    owner: "Viswanathan Anand",
    budget: 1000,
    points: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    boardPoints: 0
  },
  {
    id: "team-4",
    name: "Sicilian Saboteurs",
    logo: "♝",
    owner: "Bobby Fischer",
    budget: 1000,
    points: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    boardPoints: 0
  }
];

const initialPlayers = [
  // Team 1: Knight Riders starting players
  {
    id: "player-1",
    name: "Magnus Carlsen",
    country: "NOR",
    teamId: "team-1",
    elo: 2882,
    mvps: 4,
    wins: 15,
    losses: 1,
    draws: 4,
    matchesPlayed: 20,
    winPercent: 75,
    auctionValue: 450,
    status: "SOLD",
    photo: "https://api.dicebear.com/7.x/bottts/svg?seed=Magnus"
  },
  {
    id: "player-2",
    name: "Hikaru Nakamura",
    country: "USA",
    teamId: "team-1",
    elo: 2787,
    mvps: 2,
    wins: 12,
    losses: 3,
    draws: 5,
    matchesPlayed: 20,
    winPercent: 60,
    auctionValue: 380,
    status: "SOLD",
    photo: "https://api.dicebear.com/7.x/bottts/svg?seed=Hikaru"
  },
  // Team 2: Pawn Stormers starting players
  {
    id: "player-3",
    name: "Praggnanandhaa R",
    country: "IND",
    teamId: "team-2",
    elo: 2747,
    mvps: 3,
    wins: 11,
    losses: 2,
    draws: 7,
    matchesPlayed: 20,
    winPercent: 55,
    auctionValue: 320,
    status: "SOLD",
    photo: "https://api.dicebear.com/7.x/bottts/svg?seed=Pragg"
  },
  {
    id: "player-4",
    name: "Gukesh D",
    country: "IND",
    teamId: "team-2",
    elo: 2763,
    mvps: 3,
    wins: 13,
    losses: 3,
    draws: 4,
    matchesPlayed: 20,
    winPercent: 65,
    auctionValue: 350,
    status: "SOLD",
    photo: "https://api.dicebear.com/7.x/bottts/svg?seed=Gukesh"
  },
  // Team 3: King's Defenders starting players
  {
    id: "player-5",
    name: "Ding Liren",
    country: "CHN",
    teamId: "team-3",
    elo: 2780,
    mvps: 1,
    wins: 9,
    losses: 4,
    draws: 7,
    matchesPlayed: 20,
    winPercent: 45,
    auctionValue: 310,
    status: "SOLD",
    photo: "https://api.dicebear.com/7.x/bottts/svg?seed=Ding"
  },
  {
    id: "player-6",
    name: "Ian Nepomniachtchi",
    country: "RUS",
    teamId: "team-3",
    elo: 2779,
    mvps: 2,
    wins: 10,
    losses: 3,
    draws: 7,
    matchesPlayed: 20,
    winPercent: 50,
    auctionValue: 300,
    status: "SOLD",
    photo: "https://api.dicebear.com/7.x/bottts/svg?seed=Ian"
  },
  // Team 4: Sicilian Saboteurs starting players
  {
    id: "player-7",
    name: "Fabiano Caruana",
    country: "USA",
    teamId: "team-4",
    elo: 2804,
    mvps: 3,
    wins: 14,
    losses: 2,
    draws: 4,
    matchesPlayed: 20,
    winPercent: 70,
    auctionValue: 400,
    status: "SOLD",
    photo: "https://api.dicebear.com/7.x/bottts/svg?seed=Fabiano"
  },
  {
    id: "player-8",
    name: "Alireza Firouzja",
    country: "FRA",
    teamId: "team-4",
    elo: 2760,
    mvps: 2,
    wins: 10,
    losses: 5,
    draws: 5,
    matchesPlayed: 20,
    winPercent: 50,
    auctionValue: 320,
    status: "SOLD",
    photo: "https://api.dicebear.com/7.x/bottts/svg?seed=Alireza"
  },

  // Unsold players available in the Auction Pool
  {
    id: "player-9",
    name: "Anish Giri",
    country: "NED",
    teamId: null,
    elo: 2762,
    mvps: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    matchesPlayed: 0,
    winPercent: 0,
    auctionValue: 0,
    status: "UNSOLD",
    photo: "https://api.dicebear.com/7.x/bottts/svg?seed=Anish"
  },
  {
    id: "player-10",
    name: "Vidit Gujrathi",
    country: "IND",
    teamId: null,
    elo: 2727,
    mvps: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    matchesPlayed: 0,
    winPercent: 0,
    auctionValue: 0,
    status: "UNSOLD",
    photo: "https://api.dicebear.com/7.x/bottts/svg?seed=Vidit"
  },
  {
    id: "player-11",
    name: "Nodirbek Abdusattorov",
    country: "UZB",
    teamId: null,
    elo: 2744,
    mvps: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    matchesPlayed: 0,
    winPercent: 0,
    auctionValue: 0,
    status: "UNSOLD",
    photo: "https://api.dicebear.com/7.x/bottts/svg?seed=Nodirbek"
  },
  {
    id: "player-12",
    name: "Richard Rapport",
    country: "ROU",
    teamId: null,
    elo: 2715,
    mvps: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    matchesPlayed: 0,
    winPercent: 0,
    auctionValue: 0,
    status: "UNSOLD",
    photo: "https://api.dicebear.com/7.x/bottts/svg?seed=Richard"
  },
  {
    id: "player-13",
    name: "Alexei Shirov",
    country: "ESP",
    teamId: null,
    elo: 2650,
    mvps: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    matchesPlayed: 0,
    winPercent: 0,
    auctionValue: 0,
    status: "UNSOLD",
    photo: "https://api.dicebear.com/7.x/bottts/svg?seed=Alexei"
  },
  {
    id: "player-14",
    name: "Alexandra Botez",
    country: "CAN",
    teamId: null,
    elo: 2025,
    mvps: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    matchesPlayed: 0,
    winPercent: 0,
    auctionValue: 0,
    status: "UNSOLD",
    photo: "https://api.dicebear.com/7.x/bottts/svg?seed=Alexandra"
  },
  {
    id: "player-15",
    name: "Andrea Botez",
    country: "CAN",
    teamId: null,
    elo: 1775,
    mvps: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    matchesPlayed: 0,
    winPercent: 0,
    auctionValue: 0,
    status: "UNSOLD",
    photo: "https://api.dicebear.com/7.x/bottts/svg?seed=Andrea"
  },
  {
    id: "player-16",
    name: "Hans Niemann",
    country: "USA",
    teamId: null,
    elo: 2690,
    mvps: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    matchesPlayed: 0,
    winPercent: 0,
    auctionValue: 0,
    status: "UNSOLD",
    photo: "https://api.dicebear.com/7.x/bottts/svg?seed=Hans"
  },
  {
    id: "player-17",
    name: "Levon Aronian",
    country: "USA",
    teamId: null,
    elo: 2730,
    mvps: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    matchesPlayed: 0,
    winPercent: 0,
    auctionValue: 0,
    status: "UNSOLD",
    photo: "https://api.dicebear.com/7.x/bottts/svg?seed=Levon"
  },
  {
    id: "player-18",
    name: "Vincent Keymer",
    country: "GER",
    teamId: null,
    elo: 2726,
    mvps: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    matchesPlayed: 0,
    winPercent: 0,
    auctionValue: 0,
    status: "UNSOLD",
    photo: "https://api.dicebear.com/7.x/bottts/svg?seed=Vincent"
  },
  {
    id: "player-19",
    name: "GothamChess (Levy)",
    country: "USA",
    teamId: null,
    elo: 2320,
    mvps: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    matchesPlayed: 0,
    winPercent: 0,
    auctionValue: 0,
    status: "UNSOLD",
    photo: "https://api.dicebear.com/7.x/bottts/svg?seed=Levy"
  },
  {
    id: "player-20",
    name: "Anna Rudolf",
    country: "HUN",
    teamId: null,
    elo: 2285,
    mvps: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    matchesPlayed: 0,
    winPercent: 0,
    auctionValue: 0,
    status: "UNSOLD",
    photo: "https://api.dicebear.com/7.x/bottts/svg?seed=Anna"
  }
];

const initialUsers = [
  {
    id: "user-admin",
    username: "admin",
    // bcrypt hash for 'admin123'
    passwordHash: "$2a$10$tMhlyD4KkYdND4wYvVbvees/0C070tF5t7s34lT9iL1fB2c/ZJ9y2", 
    role: "admin"
  },
  {
    id: "user-viewer",
    username: "viewer",
    // bcrypt hash for 'viewer123'
    passwordHash: "$2a$10$wIq36R3vG293M20QhY2BgeN2wD9z52XzD7Xm9t90mQk/XJ1fB9y1a",
    role: "viewer"
  }
];

const initialTournaments = [
  {
    id: "tour-1",
    name: "Chess Freaks Grand League 2026",
    format: "Round Robin",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    teams: ["team-1", "team-2", "team-3", "team-4"],
    status: "ACTIVE"
  }
];

const initialMatches = [];

module.exports = {
  initialTeams,
  initialPlayers,
  initialUsers,
  initialTournaments,
  initialMatches
};
