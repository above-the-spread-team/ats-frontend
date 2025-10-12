export interface DiscussionPost {
  id: number;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    badge?: string;
  };
  category: string;
  tags: string[];
  likes: number;
  replies: number;
  views: number;
  createdAt: string;
  lastReply?: {
    author: string;
    time: string;
  };
  isPinned?: boolean;
  isHot?: boolean;
}

export const mockDiscussions: DiscussionPost[] = [
  {
    id: 1,
    title: "Who will win the Premier League this season?",
    content:
      "With Liverpool leading by 14 points, do you think they can maintain their form until the end? What are your predictions?",
    author: {
      name: "FootballFan2024",
      avatar: "https://media.api-sports.io/football/teams/40.png",
      badge: "Expert",
    },
    category: "Premier League",
    tags: ["Liverpool", "Title Race", "Discussion"],
    likes: 234,
    replies: 89,
    views: 1542,
    createdAt: "2024-10-12T08:30:00Z",
    lastReply: {
      author: "RedDevil99",
      time: "5m ago",
    },
    isPinned: true,
    isHot: true,
  },
  {
    id: 2,
    title: "Real Madrid vs Barcelona: El Clásico Analysis",
    content:
      "What a match! Real Madrid's 2-1 victory was well-deserved. Let's discuss the key moments and tactical decisions.",
    author: {
      name: "LaLigaExpert",
      avatar: "https://media.api-sports.io/football/teams/541.png",
    },
    category: "La Liga",
    tags: ["Real Madrid", "Barcelona", "El Clásico"],
    likes: 187,
    replies: 56,
    views: 982,
    createdAt: "2024-10-12T06:15:00Z",
    lastReply: {
      author: "BlaugranaForever",
      time: "12m ago",
    },
    isHot: true,
  },
  {
    id: 3,
    title: "Is Haaland the best striker in the world right now?",
    content:
      "With 28 goals in 24 games, Erling Haaland is breaking records. Is he already the best number 9 in football?",
    author: {
      name: "CitizenBlue",
      avatar: "https://media.api-sports.io/football/teams/50.png",
      badge: "Verified",
    },
    category: "General Discussion",
    tags: ["Haaland", "Manchester City", "Strikers"],
    likes: 342,
    replies: 124,
    views: 2341,
    createdAt: "2024-10-11T22:00:00Z",
    lastReply: {
      author: "TacticalGenius",
      time: "1h ago",
    },
    isHot: true,
  },
  {
    id: 4,
    title: "Arsenal's title challenge: Can they go all the way?",
    content:
      "Arsenal look really strong this season. Do they have what it takes to win their first title since 2004?",
    author: {
      name: "Gooner_4_Life",
      avatar: "https://media.api-sports.io/football/teams/42.png",
    },
    category: "Premier League",
    tags: ["Arsenal", "Title Race", "Arteta"],
    likes: 156,
    replies: 67,
    views: 876,
    createdAt: "2024-10-11T18:45:00Z",
    lastReply: {
      author: "NorthLondonRed",
      time: "2h ago",
    },
  },
  {
    id: 5,
    title: "Inter Milan dominating Serie A - Who can stop them?",
    content:
      "Inter are looking unstoppable in Serie A. Are they the clear favorites for the Scudetto?",
    author: {
      name: "Nerazzurri_Fan",
      avatar: "https://media.api-sports.io/football/teams/487.png",
    },
    category: "Serie A",
    tags: ["Inter Milan", "Serie A", "Tactics"],
    likes: 89,
    replies: 34,
    views: 543,
    createdAt: "2024-10-11T15:20:00Z",
    lastReply: {
      author: "MilanFan1899",
      time: "3h ago",
    },
  },
  {
    id: 6,
    title: "Best young talent to watch in 2024?",
    content:
      "Who are the most exciting young players breaking through this season? Share your picks!",
    author: {
      name: "ScoutingReport",
      avatar: "https://media.api-sports.io/football/teams/529.png",
      badge: "Expert",
    },
    category: "General Discussion",
    tags: ["Young Players", "Talent", "Future Stars"],
    likes: 267,
    replies: 98,
    views: 1876,
    createdAt: "2024-10-11T12:00:00Z",
    lastReply: {
      author: "YouthCoach123",
      time: "4h ago",
    },
  },
  {
    id: 7,
    title: "PSG struggling in Champions League - What's wrong?",
    content:
      "Despite having world-class players, PSG are underperforming in Europe. What needs to change?",
    author: {
      name: "ParisianBlue",
      avatar: "https://media.api-sports.io/football/teams/85.png",
    },
    category: "Champions League",
    tags: ["PSG", "Champions League", "Tactics"],
    likes: 134,
    replies: 72,
    views: 965,
    createdAt: "2024-10-11T09:30:00Z",
    lastReply: {
      author: "UEFAWatcher",
      time: "5h ago",
    },
  },
  {
    id: 8,
    title: "Best transfer of the summer window?",
    content:
      "Looking back at the summer transfers, which signing has impressed you the most?",
    author: {
      name: "TransferGuru",
      avatar: "https://media.api-sports.io/football/teams/33.png",
    },
    category: "Transfer Talk",
    tags: ["Transfers", "Summer Window", "Discussion"],
    likes: 198,
    replies: 87,
    views: 1234,
    createdAt: "2024-10-10T20:15:00Z",
    lastReply: {
      author: "FootballAgent",
      time: "Yesterday",
    },
  },
  {
    id: 9,
    title: "VAR controversy in Premier League - Thoughts?",
    content:
      "Another weekend, another VAR debate. Is it helping or hurting the game?",
    author: {
      name: "RefWatch",
      avatar: "https://media.api-sports.io/football/teams/47.png",
    },
    category: "Premier League",
    tags: ["VAR", "Controversy", "Refereeing"],
    likes: 412,
    replies: 203,
    views: 3421,
    createdAt: "2024-10-10T16:00:00Z",
    lastReply: {
      author: "FairPlayFC",
      time: "Yesterday",
    },
    isHot: true,
  },
  {
    id: 10,
    title: "Napoli's defense of the Serie A title",
    content:
      "Can Napoli repeat last season's success? They're looking strong but face tough competition.",
    author: {
      name: "CalcioFan",
      avatar: "https://media.api-sports.io/football/teams/492.png",
    },
    category: "Serie A",
    tags: ["Napoli", "Serie A", "Champions"],
    likes: 76,
    replies: 29,
    views: 421,
    createdAt: "2024-10-10T11:30:00Z",
    lastReply: {
      author: "ItalianFootball",
      time: "2 days ago",
    },
  },
];
