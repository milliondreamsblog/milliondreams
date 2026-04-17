import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

function Prose({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[1.95rem] leading-[1.68] tracking-[-0.01em] text-stone-200 ${className}`}
      style={{ fontFamily: "var(--font-reading-serif)" }}
    >
      {children}
    </p>
  );
}

function ProseSmall({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[1.3rem] leading-[1.9] tracking-[-0.01em] text-stone-300"
      style={{ fontFamily: "var(--font-reading-serif)" }}
    >
      {children}
    </p>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-16 text-[1.7rem] font-semibold tracking-[-0.03em] text-stone-50">
      {children}
    </h2>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="border-l border-stone-700 pl-6 text-stone-300">
      <ProseSmall>{children}</ProseSmall>
    </blockquote>
  );
}

function CodeBlock({ lang, children }: { lang: string; children: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-800 bg-[#111111]">
      <div className="border-b border-stone-800 px-4 py-3 text-[0.7rem] uppercase tracking-[0.28em] text-stone-500">
        {lang}
      </div>
      <pre className="overflow-x-auto px-5 py-5 text-sm leading-7 text-stone-200">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function GoingHomeContent() {
  return (
    <article className="space-y-10">
      <Prose>January, 2025.</Prose>

      <Prose>
        I moved for an internship with full ownership for the first time. I
        travelled to Ranchi.
      </Prose>

      <Prose>I did everything I love.</Prose>

      <Prose>
        And yet, something is still off. Not wrong. Just... off.
      </Prose>

      <Prose>
        Like when you are wearing slightly uncomfortable clothes all day and
        you do not realize it until you get home and finally take them off.
      </Prose>

      <Prose>
        Past two months I feel like I did everything that was not me.
        Memorising as many algorithms as possible so I could parrot them in
        front of interviewers.
      </Prose>

      <Prose>
        I kept calling it preparation because that sounded noble. But a lot of
        it was performance. Rehearsing the shape of competence instead of
        sitting with the things that actually make me feel alive.
      </Prose>

      <Prose>
        Building. Writing. Walking without urgency. Reading something slowly
        enough that it leaves a mark. Following curiosity without asking
        whether it will look impressive on a resume.
      </Prose>

      <Prose>
        Somewhere in the middle of all that optimization, I stopped sounding
        like myself in my own head.
      </Prose>

      <Prose>
        Going home made that obvious. Not home as a city. Home as a feeling.
        The place where effort stops being theater and starts feeling honest.
      </Prose>

      <Prose>
        I think that is what I have been missing. Not rest. Recognition.
        Recognition of the version of me that creates because he cannot help it,
        not because somebody might reward it later.
      </Prose>

      <Prose>
        Maybe growing up is learning that ambition can quietly distort you if
        you never ask who it is serving.
      </Prose>

      <Prose>
        I do not want to become excellent at a life that does not feel like
        mine.
      </Prose>
    </article>
  );
}

function DDoSContent() {
  return (
    <article className="space-y-10">
      <Prose>
        I want to start with a confession.
      </Prose>

      <Prose>
        When Vercel sent us that email, my first instinct was to blame the
        traffic. <em>We just got too popular too fast.</em> That felt good to
        believe. It felt like a success problem.
      </Prose>

      <Prose>It was not.</Prose>

      <Prose>
        The traffic did not break us. We broke ourselves. And it took staring
        at our own codebase for a long, uncomfortable hour to admit that.
      </Prose>

      <ProseSmall>This is the post I wish existed before we shipped.</ProseSmall>

      <SectionTitle>A little context</SectionTitle>

      <Prose>
        Our college runs a robotics fest every year. This time, our team
        decided to build the platform ourselves. No templates. No WordPress. No
        shortcuts.
      </Prose>

      <Prose>We wanted it to feel like a robot battlefield.</Prose>

      <Prose>
        Three.js particle backgrounds that shift when you scroll. Glitch text
        animations that fire letter-by-letter on load. A full admin dashboard.
        Payment flow. Team management. Email notifications.
      </Prose>

      <Prose>We shipped it. It looked incredible. People shared it.</Prose>

      <Prose>Then 26,000 page views happened in a few days.</Prose>

      <Prose>And then the bill came.</Prose>

      <SectionTitle>The part where I have to be honest with myself</SectionTitle>

      <Prose>Here is what our codebase looked like at the time.</Prose>

      <CodeBlock lang="ts">{`"use client";

import { useState, useEffect } from "react";

useEffect(() => {
  const res = await fetch("/api/auth/me");
  // set user state...
}, []);`}</CodeBlock>

      <Prose>Every. Single. Page.</Prose>

      <Prose>
        I did not think much of it when I wrote it. The tutorials I learned
        from wrote it this way. It worked in development. It worked when ten
        people tested it.
      </Prose>

      <Prose>
        What I did not understand, what nobody had explained to me clearly, is
        what happens when you multiply that pattern by 26,000 people across 5
        pages each.
      </Prose>

      <Prose>
        Every visit to serverless function spins up to database connection opens
        to query runs to response returns to function dies.
      </Prose>

      <Prose>
        Over and over. Thousands of times per hour. For data that had not
        changed since we deployed.
      </Prose>

      <Callout>
        We were paying compute to answer the same question repeatedly. Like
        hiring someone to Google &quot;what is 2+2&quot; every time a customer
        walked into your store.
      </Callout>

      <SectionTitle>The concept that explained everything: fan-out</SectionTitle>

      <Prose>
        I only learned the name for this later, when I started reading about
        distributed systems.
      </Prose>

      <Prose>
        Fan-out is what happens when one user action, a single page load,
        triggers a cascade of downstream calls. At small scale it is invisible.
        At real scale, it compounds.
      </Prose>

      <Prose>
        We had fan-out happening at three layers at once, and we had no idea.
      </Prose>

      <Prose>
        <strong>Layer 1 - No static boundary.</strong>
      </Prose>

      <Prose>
        Our events page. Our schedule page. Our sponsors page. None of this
        data changed between deployments. But we never told Next.js that. So
        every visitor got a fresh serverless render, a fresh DB call, a fresh
        everything.
      </Prose>

      <Prose>
        Next.js App Router is genuinely good at serving static content from the
        CDN edge. We just never used it. We left the entire feature on the
        table.
      </Prose>

      <Prose>
        <strong>Layer 2 - Auth on every page load.</strong>
      </Prose>

      <Prose>
        The <code>/api/auth/me</code> endpoint was being called client-side, on
        component mount, on every page. There was no session layer. There was
        no cache. Just a raw database hit pretending to be an auth check.
      </Prose>

      <Prose>
        The fix was not to cache that endpoint. The fix was to stop calling it
        that way entirely.
      </Prose>

      <Prose>
        <strong>Layer 3 - No request deduplication.</strong>
      </Prose>

      <Prose>
        If two components on the same page needed the same data, they each
        fetched it separately. We had never heard of request deduplication. We
        were just writing fetch calls wherever we needed data and hoping for
        the best.
      </Prose>

      <Prose>Three fan-out layers. Multiplied together. At 26,000 visits.</Prose>

      <Callout>
        That is not a scaling problem. That is an architecture problem that
        traffic finally made visible.
      </Callout>

      <SectionTitle>How we actually fixed it</SectionTitle>

      <Prose>
        I want to be specific here because I spent a long time finding vague
        advice about &quot;just add caching&quot; that did not tell me{" "}
        <em>where</em> or <em>how</em>.
      </Prose>

      <Prose>
        <strong>Fix 1 - Make public pages static.</strong>
      </Prose>

      <CodeBlock lang="ts">{`// app/events/page.tsx

export default async function EventsPage() {
  const events = await getEvents();
  return <EventList events={events} />;
}

export const revalidate = 3600;`}</CodeBlock>

      <Prose>
        Remove <code>&quot;use client&quot;</code>. Add{" "}
        <code>revalidate</code>. Next.js now builds this page once per hour and
        serves it from the edge to every visitor. 26,000 visits costs 1 DB call
        per hour instead of 26,000.
      </Prose>

      <Prose>This was the highest leverage change. It took about twenty minutes.</Prose>

      <Prose>
        <strong>Fix 2 - Stop fetching auth client-side.</strong>
      </Prose>

      <CodeBlock lang="ts">{`// Before - fires on every mount, client-side
const res = await fetch("/api/auth/me");

// After - read once, server-side, before anything renders
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";

const session = await getSession(cookies());`}</CodeBlock>

      <Prose>
        Session lives in a signed cookie. Verified at the edge in microseconds.
        No network round-trip. No serverless function. No DB call.
      </Prose>

      <Prose>
        The <code>/api/auth/me</code> endpoint still exists, but it is no
        longer the default way we read auth state.
      </Prose>

      <Prose>
        <strong>Fix 3 - Cache DB queries that do not change.</strong>
      </Prose>

      <CodeBlock lang="ts">{`import { unstable_cache } from "next/cache";

const getEvents = unstable_cache(
  async () => db.select().from(events),
  ["events"],
  { revalidate: 3600 }
);`}</CodeBlock>

      <Prose>
        Same data. One query. Shared across every request until invalidated.
        Worth noting that <code>unstable_cache</code> is still marked
        experimental. Next.js 15 is moving toward a <code>use cache</code>{" "}
        directive as the long-term API. But for now, this works.
      </Prose>

      <SectionTitle>What I actually took away from this</SectionTitle>

      <Prose>
        Not &quot;use ISR&quot; or &quot;cache your DB queries.&quot; I mean yes,
        those are the tactical lessons. But the real thing I learned is harder
        to put in a code snippet.
      </Prose>

      <Callout>
        <strong>
          You can ship something that looks finished and still have fundamental
          architectural gaps.
        </strong>
      </Callout>

      <Prose>
        Our site looked stunning. Visitors were impressed. We were proud. And
        underneath all of it, we had a system that was quietly burning compute
        on questions it already knew the answers to.
      </Prose>

      <Prose>
        The tutorials that taught me Next.js never mentioned static boundaries.
        They never talked about where the server/client line should actually
        live. They showed me how to build things that worked. They did not show
        me how to think about what happens when lots of people use them at the
        same time.
      </Prose>

      <Prose>
        That is not a criticism of tutorials. That is just the gap between
        learning a framework and understanding the system underneath it.
      </Prose>

      <Prose>
        I am still learning that. This project pushed me forward faster than
        anything else has.
      </Prose>

      <SectionTitle>If you are building something similar</SectionTitle>

      <Prose>
        Before you ship to real traffic, ask yourself three questions.
      </Prose>

      <div className="space-y-6">
        <Prose>
          Does this page need to be dynamic, or am I just defaulting to{" "}
          <code>&quot;use client&quot;</code> out of habit?
        </Prose>
        <Prose>
          Where is my auth state being read, and is that the right layer for it?
        </Prose>
        <Prose>
          If 10,000 people loaded this page simultaneously, how many DB calls
          would that fire?
        </Prose>
      </div>

      <Prose>
        You do not need to be a distributed systems engineer to ask those
        questions. You just need to ask them before Vercel does.
      </Prose>

      <ProseSmall>
        <em>
          We shipped Robo Rumble 3.0 for 200+ registrations with zero downtime.
          The architecture mistakes were mine. The late nights fixing them were
          the whole team&apos;s. Grateful for every one of them.
        </em>
      </ProseSmall>

      <ProseSmall>
        <em>
          If this helped you, or if you have made the same mistake, I would
          genuinely love to hear about it. Reply or leave a note below.
        </em>
      </ProseSmall>

      <SectionTitle>Next issue</SectionTitle>

      <Prose>
        How we built a 3D particle background in React Three Fiber without
        destroying our Lighthouse score, and what &quot;performance budget&quot;
        actually means in practice.
      </Prose>

      <ProseSmall>
        <em>
          Subscribe if you want to read more of these. I write about what I am
          building and what breaks along the way.
        </em>
      </ProseSmall>
    </article>
  );
}

type PostEntry = {
  title: string;
  subtitle: string;
  author: string;
  dateLabel: string;
  description?: string;
  Content: () => React.JSX.Element;
};

const POSTS: Record<string, PostEntry> = {
  "ddos-lesson": {
    title: "We accidentally DDoS'd our own backend.",
    subtitle: "The caching lesson nobody teaches you in tutorials.",
    author: "Akshat Darshi",
    dateLabel: "APR 2025",
    description:
      "A quieter rewrite of the original note about fan-out, caching, and learning system boundaries the hard way.",
    Content: DDoSContent,
  },
  "going-home": {
    title: "Going Home",
    subtitle: "Don't try Bukowski",
    author: "Akshat Darshi",
    dateLabel: "JAN 27, 2026",
    description:
      "A note about drifting into performance, then noticing what still feels true.",
    Content: GoingHomeContent,
  },
};

export async function generateStaticParams() {
  return Object.keys(POSTS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) return {};

  return {
    title: post.title,
    description: post.description ?? post.subtitle,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = POSTS[slug];

  if (!post) notFound();

  const { title, subtitle, author, dateLabel, Content } = post;

  return (
    <div className="min-h-screen bg-[#181818] text-stone-100">
      <main className="mx-auto w-full max-w-[58rem] px-6 pb-32 pt-8 sm:px-10 sm:pt-10">
        <Link
          href="/blog"
          className="mb-12 inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-stone-500 transition-colors hover:text-stone-200"
        >
          <ArrowLeft size={14} />
          Back to blog
        </Link>

        <header className="border-b border-stone-800 pb-10">
          <div className="mx-auto max-w-[46rem]">
            <h1 className="text-5xl font-bold tracking-[-0.05em] text-stone-50 sm:text-[4.25rem]">
              {title}
            </h1>
            <p className="mt-4 text-[1.45rem] font-medium text-stone-500">
              {subtitle}
            </p>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[conic-gradient(from_210deg,#f59e0b,#60a5fa,#c4b5fd,#f59e0b)] p-[2px]">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-[#9ca3af] text-xs font-semibold text-[#1b1b1b]">
                  AD
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-stone-100">
                  {author}
                </p>
                <p className="mt-1 text-sm uppercase tracking-[0.08em] text-stone-500">
                  {dateLabel}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[46rem] pt-14">
          <Content />
        </div>
      </main>
    </div>
  );
}
