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
    id: "agentic-ai-systems",
    date: "12 JAN",
    category: "AI SYSTEMS",
    categoryColor: "#e85d04",
    title: "Building Agentic AI That Actually Works",
    description:
      "Moving beyond chatbots — what it really takes to build autonomous systems that execute, not just suggest.",
    image: "/me.png",
    url: "https://substack.com/@akshatdarshi/note/p-185972523?r=1pocd&utm_source=notes-share-action&utm_medium=web",
  },
  {
    id: "five-products-five-lessons",
    date: "08 DEC",
    category: "PRODUCT",
    categoryColor: "#2b9eb3",
    title: "Five Products & Five Hard Lessons in Shipping",
    description:
      "From a metadata cleaner nobody used to tools inside YC-backed companies — an honest look at what changed.",
    image: "/casual.png",
    url: "https://substack.com/@akshatdarshi",
  },
  {
    id: "backend-at-scale",
    date: "02 NOV",
    category: "ENGINEERING",
    categoryColor: "#7c3aed",
    title: "The Hidden Cost of Owning Infrastructure",
    description:
      "Payroll PDFs, approval queues, real-time ops — what running backend systems at scale actually feels like.",
    image: "/me2.png",
    url: "https://substack.com/@akshatdarshi",
  },
];
