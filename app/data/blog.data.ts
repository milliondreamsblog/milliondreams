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
