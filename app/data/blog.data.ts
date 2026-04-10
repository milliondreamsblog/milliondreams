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
    id: "going-home",
    date: "27 JAN",
    category: "ESSAYS",
    categoryColor: "#e85d04",
    title: "Going Home",
    description: `I was everywhere. Solving everything. Preparing, supposedly. But I didn't feel complete. I felt like I was performing "being productive" really well.`,
    image: "/me.png",
    url: "https://substack.com/@akshatdarshi/note/p-185972523?r=1pocd&utm_source=notes-share-action&utm_medium=web",
  },
];
