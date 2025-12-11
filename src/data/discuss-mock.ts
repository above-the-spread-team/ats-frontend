// Mock data for discussion forum
// Users can create posts with title and content
// Other users can like, dislike and comment on posts
// Each post has: like count, comment count, view count
// Users can reply, like and dislike comments
// Each comment has: like count, dislike count, reply count

export interface User {
  id: string;
  name: string;
  avatar: string | null;
  initials: string;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
  replyCount: number;
  replies?: Comment[];
  userLiked?: boolean;
  userDisliked?: boolean;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  comments: Comment[];
  userLiked?: boolean;
  userDisliked?: boolean;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Alex Johnson",
    avatar: null,
    initials: "AJ",
  },
  {
    id: "2",
    name: "Sarah Martinez",
    avatar: null,
    initials: "SM",
  },
  {
    id: "3",
    name: "Mike Chen",
    avatar: null,
    initials: "MC",
  },
  {
    id: "4",
    name: "Emma Wilson",
    avatar: null,
    initials: "EW",
  },
  {
    id: "5",
    name: "David Brown",
    avatar: null,
    initials: "DB",
  },
];

const mockComments: Comment[] = [
  {
    id: "c1",
    author: mockUsers[1],
    content:
      "Great analysis! I completely agree with your points about the team's performance.",
    createdAt: "2024-01-15T10:30:00Z",
    likeCount: 12,
    dislikeCount: 2,
    replyCount: 3,
    userLiked: false,
    userDisliked: false,
    replies: [
      {
        id: "r1",
        author: mockUsers[0],
        content: "Thanks! Glad you found it helpful.",
        createdAt: "2024-01-15T11:00:00Z",
        likeCount: 5,
        dislikeCount: 0,
        replyCount: 0,
        userLiked: true,
        userDisliked: false,
      },
      {
        id: "r2",
        author: mockUsers[2],
        content: "I have a different perspective on this...",
        createdAt: "2024-01-15T11:15:00Z",
        likeCount: 2,
        dislikeCount: 1,
        replyCount: 0,
        userLiked: false,
        userDisliked: false,
      },
      {
        id: "r3",
        author: mockUsers[3],
        content: "Could you elaborate more on point 3?",
        createdAt: "2024-01-15T12:00:00Z",
        likeCount: 1,
        dislikeCount: 0,
        replyCount: 0,
        userLiked: false,
        userDisliked: false,
      },
    ],
  },
  {
    id: "c2",
    author: mockUsers[2],
    content:
      "I think the coach made some questionable decisions in the second half.",
    createdAt: "2024-01-15T14:20:00Z",
    likeCount: 8,
    dislikeCount: 5,
    replyCount: 2,
    userLiked: false,
    userDisliked: true,
    replies: [
      {
        id: "r4",
        author: mockUsers[4],
        content: "I disagree, I think the substitutions were necessary.",
        createdAt: "2024-01-15T15:00:00Z",
        likeCount: 4,
        dislikeCount: 2,
        replyCount: 0,
        userLiked: false,
        userDisliked: false,
      },
      {
        id: "r5",
        author: mockUsers[1],
        content: "Let's see how it plays out in the next match.",
        createdAt: "2024-01-15T16:00:00Z",
        likeCount: 3,
        dislikeCount: 0,
        replyCount: 0,
        userLiked: false,
        userDisliked: false,
      },
    ],
  },
  {
    id: "c3",
    author: mockUsers[3],
    content: "What do you think about the upcoming fixture?",
    createdAt: "2024-01-15T18:00:00Z",
    likeCount: 6,
    dislikeCount: 1,
    replyCount: 1,
    userLiked: true,
    userDisliked: false,
    replies: [
      {
        id: "r6",
        author: mockUsers[0],
        content: "I'm optimistic! The team has been in good form!!",
        createdAt: "2024-01-15T18:30:00Z",
        likeCount: 7,
        dislikeCount: 0,
        replyCount: 0,
        userLiked: false,
        userDisliked: false,
      },
    ],
  },
];

export const mockPosts: Post[] = [
  {
    id: "1",
    title: "Thoughts on Last Night's Match Performance",
    content:
      "I wanted to share my analysis of last night's match. The team showed great resilience in the second half, especially after going down early. The midfield control was impressive, and I think the new formation is working well. What are your thoughts?",
    author: mockUsers[0],
    createdAt: "2024-01-15T09:00:00Z",
    likeCount: 45,
    commentCount: 12,
    viewCount: 234,
    comments: mockComments,
    userLiked: true,
    userDisliked: false,
  },
  {
    id: "2",
    title: "Player of the Season Predictions",
    content:
      "We're halfway through the season and I'm curious who everyone thinks will win Player of the Season. My pick is definitely the striker - his goal-scoring record speaks for itself!",
    author: mockUsers[1],
    createdAt: "2024-01-14T15:30:00Z",
    likeCount: 32,
    commentCount: 8,
    viewCount: 189,
    comments: [
      {
        id: "c4",
        author: mockUsers[2],
        content: "I think the goalkeeper deserves more recognition!",
        createdAt: "2024-01-14T16:00:00Z",
        likeCount: 15,
        dislikeCount: 3,
        replyCount: 2,
        userLiked: false,
        userDisliked: false,
        replies: [
          {
            id: "r7",
            author: mockUsers[1],
            content: "Fair point! He's been outstanding.",
            createdAt: "2024-01-14T16:15:00Z",
            likeCount: 8,
            dislikeCount: 0,
            replyCount: 0,
            userLiked: false,
            userDisliked: false,
          },
          {
            id: "r8",
            author: mockUsers[4],
            content: "Agreed! Best saves this season.",
            createdAt: "2024-01-14T17:00:00Z",
            likeCount: 6,
            dislikeCount: 0,
            replyCount: 0,
            userLiked: false,
            userDisliked: false,
          },
        ],
      },
    ],
    userLiked: false,
    userDisliked: false,
  },
  {
    id: "3",
    title: "Transfer Window Discussion",
    content:
      "The transfer window is closing soon. What positions do you think we need to strengthen? I personally think we need more depth in defense.",
    author: mockUsers[2],
    createdAt: "2024-01-13T11:20:00Z",
    likeCount: 28,
    commentCount: 15,
    viewCount: 156,
    comments: [],
    userLiked: false,
    userDisliked: false,
  },
  {
    id: "4",
    title: "Match Highlights and Analysis",
    content:
      "Did anyone catch the highlights? That last-minute goal was incredible! The build-up play was perfect.",
    author: mockUsers[3],
    createdAt: "2024-01-12T20:45:00Z",
    likeCount: 67,
    commentCount: 23,
    viewCount: 412,
    comments: [],
    userLiked: true,
    userDisliked: false,
  },
];

export const currentUser: User = mockUsers[0];
