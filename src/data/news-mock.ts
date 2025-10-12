export interface NewsArticle {
  id: number;
  title: string;
  description: string;
  content: string;
  image: string;
  source: string;
  author: string;
  publishedAt: string;
  category: string;
  url: string;
}

export const mockNews: NewsArticle[] = [
  {
    id: 1,
    title:
      "Liverpool Dominates Premier League with Record-Breaking Performance",
    description:
      "The Reds continue their impressive form with a commanding 3-1 victory over Manchester United at Old Trafford.",
    content:
      "Liverpool's relentless attacking play proved too much for Manchester United as they secured a crucial away win. Mohamed Salah scored twice, with Luis Díaz adding a third to seal the victory.",
    image: "https://media.api-sports.io/football/teams/40.png",
    source: "ESPN",
    author: "John Smith",
    publishedAt: "2024-10-12T14:30:00Z",
    category: "Premier League",
    url: "#",
  },
  {
    id: 2,
    title: "Real Madrid Secures Victory in El Clásico Thriller",
    description:
      "Los Blancos edge past Barcelona 2-1 in a thrilling encounter at the Santiago Bernabéu.",
    content:
      "Real Madrid claimed bragging rights in El Clásico with goals from Vinícius Júnior and Jude Bellingham. The match showcased world-class football from both sides.",
    image: "https://media.api-sports.io/football/teams/541.png",
    source: "Marca",
    author: "Carlos Rodriguez",
    publishedAt: "2024-10-12T12:15:00Z",
    category: "La Liga",
    url: "#",
  },
  {
    id: 3,
    title: "Manchester City Extends Winning Streak to Eight Games",
    description:
      "Pep Guardiola's side shows no signs of slowing down as they demolish Arsenal 4-0 at the Etihad.",
    content:
      "Manchester City put on a masterclass performance with Erling Haaland scoring a hat-trick. The victory keeps them firmly in the title race.",
    image: "https://media.api-sports.io/football/teams/50.png",
    source: "Sky Sports",
    author: "Michael Johnson",
    publishedAt: "2024-10-12T10:00:00Z",
    category: "Premier League",
    url: "#",
  },
  {
    id: 4,
    title: "Inter Milan Wins Derby della Madonnina Against AC Milan",
    description:
      "The Nerazzurri celebrate a crucial 2-1 victory in the Milan derby at the San Siro.",
    content:
      "Inter Milan dominated the city derby with goals from Lautaro Martínez and Marcus Thuram. The win strengthens their position at the top of Serie A.",
    image: "https://media.api-sports.io/football/teams/487.png",
    source: "Gazzetta dello Sport",
    author: "Marco Rossi",
    publishedAt: "2024-10-11T20:45:00Z",
    category: "Serie A",
    url: "#",
  },
  {
    id: 5,
    title: "PSG's Mbappé Scores Stunning Hat-trick in Champions League",
    description:
      "The French forward puts on a show as PSG thrash Bayern Munich 4-1 in the Champions League quarter-final.",
    content:
      "Kylian Mbappé was unstoppable as he scored three magnificent goals to lead PSG to a commanding victory. The performance has sent shockwaves through European football.",
    image: "https://media.api-sports.io/football/teams/85.png",
    source: "L'Équipe",
    author: "Pierre Dubois",
    publishedAt: "2024-10-11T19:30:00Z",
    category: "Champions League",
    url: "#",
  },
  {
    id: 6,
    title: "Arsenal's Young Star Saka Signs New Long-Term Contract",
    description:
      "The England international commits his future to the Gunners with a new five-year deal.",
    content:
      "Bukayo Saka has signed a new contract keeping him at Arsenal until 2029. The 22-year-old has been instrumental in Arsenal's recent success and title challenge.",
    image: "https://media.api-sports.io/football/teams/42.png",
    source: "The Athletic",
    author: "David Ornstein",
    publishedAt: "2024-10-11T16:00:00Z",
    category: "Transfer News",
    url: "#",
  },
  {
    id: 7,
    title: "Juventus Appoints New Manager After Disappointing Start",
    description:
      "The Italian giants make a change in the dugout following a string of poor results.",
    content:
      "Juventus has appointed former player Andrea Pirlo as their new head coach. The club hopes his return will spark a revival in their fortunes this season.",
    image: "https://media.api-sports.io/football/teams/496.png",
    source: "Tuttosport",
    author: "Luca Ferrari",
    publishedAt: "2024-10-11T14:20:00Z",
    category: "Serie A",
    url: "#",
  },
  {
    id: 8,
    title: "Tottenham's Son Heung-min Reaches 200 Career Goals",
    description:
      "The South Korean forward celebrates a milestone achievement with a brace against Newcastle.",
    content:
      "Son Heung-min reached 200 career goals in spectacular fashion, scoring twice in Tottenham's 3-1 victory. His consistency continues to make him one of the Premier League's best.",
    image: "https://media.api-sports.io/football/teams/47.png",
    source: "BBC Sport",
    author: "Simon Stone",
    publishedAt: "2024-10-11T11:45:00Z",
    category: "Premier League",
    url: "#",
  },
  {
    id: 9,
    title: "Barcelona's Financial Recovery Allows for January Signings",
    description:
      "The Catalan club announces they will be active in the winter transfer window.",
    content:
      "Barcelona's president confirmed that the club has made significant progress with their financial restructuring, allowing them to compete for top targets in January.",
    image: "https://media.api-sports.io/football/teams/529.png",
    source: "Sport",
    author: "Javier Miguel",
    publishedAt: "2024-10-11T09:00:00Z",
    category: "Transfer News",
    url: "#",
  },
  {
    id: 10,
    title: "Chelsea's Young Squad Shows Promise in Europa League Win",
    description:
      "The Blues' youth movement pays off with a convincing 3-0 victory away from home.",
    content:
      "Chelsea's young talents shone in their Europa League match, with Cole Palmer scoring twice. Manager Mauricio Pochettino praised the team's development and maturity.",
    image: "https://media.api-sports.io/football/teams/49.png",
    source: "Evening Standard",
    author: "Dan Kilpatrick",
    publishedAt: "2024-10-10T22:30:00Z",
    category: "Europa League",
    url: "#",
  },
  {
    id: 11,
    title:
      "Atletico Madrid's Griezmann Announces Retirement from International Football",
    description:
      "The French star calls time on his international career after a decorated spell with Les Bleus.",
    content:
      "Antoine Griezmann has announced his retirement from international football after helping France win the World Cup in 2018. He will now focus solely on his club career with Atlético Madrid.",
    image: "https://media.api-sports.io/football/teams/530.png",
    source: "RMC Sport",
    author: "Julien Maynard",
    publishedAt: "2024-10-10T18:15:00Z",
    category: "International",
    url: "#",
  },
  {
    id: 12,
    title: "Napoli Extends Winning Streak to Ten Games in Serie A",
    description:
      "The defending champions continue their dominant form with another convincing victory.",
    content:
      "Napoli's perfect start to the season continues as they defeated Roma 2-0. Victor Osimhen and Khvicha Kvaratskhelia were on target once again for the Partenopei.",
    image: "https://media.api-sports.io/football/teams/492.png",
    source: "Corriere dello Sport",
    author: "Antonio Giordano",
    publishedAt: "2024-10-10T15:00:00Z",
    category: "Serie A",
    url: "#",
  },
];
