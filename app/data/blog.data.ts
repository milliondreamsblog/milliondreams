export interface BlogPost {
  id: string;
  date: string;
  category: string;
  categoryColor: string;
  title: string;
  description: string;
  image: string;
  url: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "launch-film-in-code",
    date: "SEP 30, 2026",
    category: "MOTION",
    categoryColor: "#d98620",
    title: "It took six versions to make a 30-second film in code.",
    description: `Every version of Elvyn Chess's launch film, made with Claude Code and Opus 5.5, and what the model is good and bad at as a motion designer.`,
    image: "/Blog/launch-film-in-code/v51.jpg",
    url: "/blog/launch-film-in-code",
  },
  {
    id: "ddos-lesson",
    date: "APR 2025",
    category: "ENGINEERING",
    categoryColor: "#e85d04",
    title: "We accidentally DDoS'd our own backend. Here's what we learned.",
    description: `A story about 26,000 page views, a Vercel bill, and the caching lesson nobody teaches you in tutorials.`,
    image: "/Blog/Blogimg2.jpeg",
    url: "/blog/ddos-lesson",
  },
  {
    id: "going-home",
    date: "JAN 27, 2026",
    category: "DIARY",
    categoryColor: "#e85d04",
    title: "Going Home",
    description: `I was everywhere. Solving everything. Preparing, supposedly. But I didn't feel complete. I felt like I was performing "being productive" really well.`,
    image: "/Blog/Blogimg1.jpeg",
    url: "https://substack.com/@akshatdarshi/note/p-185972523?r=1pocd&utm_source=notes-share-action&utm_medium=web",
  },
];
