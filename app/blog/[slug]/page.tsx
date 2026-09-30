import Image from "next/image";
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

const FILM = "/Blog/launch-film-in-code";

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-stone-100 underline decoration-stone-600 underline-offset-4 transition-colors hover:decoration-stone-300"
    >
      {children}
    </a>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <figcaption className="mt-3 text-sm leading-6 text-stone-500">
      {children}
    </figcaption>
  );
}

function Film({
  name,
  caption,
  vertical = false,
}: {
  name: string;
  caption: React.ReactNode;
  vertical?: boolean;
}) {
  return (
    <figure className={vertical ? "mx-auto max-w-[22rem]" : ""}>
      <video
        className="w-full rounded-2xl border border-stone-800 bg-black"
        src={`${FILM}/${name}.mp4`}
        poster={`${FILM}/${name}.jpg`}
        controls
        playsInline
        preload="none"
      />
      <Caption>{caption}</Caption>
    </figure>
  );
}

function Still({
  name,
  alt,
  width,
  height,
  caption,
}: {
  name: string;
  alt: string;
  width: number;
  height: number;
  caption: React.ReactNode;
}) {
  return (
    <figure>
      <Image
        src={`${FILM}/${name}.jpg`}
        alt={alt}
        width={width}
        height={height}
        className="w-full rounded-2xl border border-stone-800"
      />
      <Caption>{caption}</Caption>
    </figure>
  );
}

function DataTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-800">
      <table className="w-full text-left text-[0.95rem] leading-6">
        <thead className="bg-[#111111] text-[0.7rem] uppercase tracking-[0.2em] text-stone-500">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-stone-300">
          {rows.map((r) => (
            <tr key={r[0]} className="border-t border-stone-800">
              {r.map((c, i) => (
                <td key={i} className="px-4 py-3 align-top">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LaunchFilmContent() {
  return (
    <article className="space-y-10">
      <Film
        name="v51"
        caption="The final film (V5.1). 30 seconds, 60 fps, and every frame is rendered from code."
      />

      <Prose>
        {`We needed a launch film for Elvyn Chess, our online chess academy. I made it with Claude Code running Opus 5.5, and every frame of it is code. There is no After Effects project and no timeline editor, and there is no stock footage.`}
      </Prose>

      <Prose>
        {`An engine says "knight g5. best move." A doodle knight asks "okay. but why?" Then the film shows what Elvyn does about that question. The student explains the move, the coach reads the reasoning and replies, puzzles arrive picked for that student, and a live class is one tap away. It ends on "every master was once a beginner."`}
      </Prose>

      <Prose>
        {`It took six versions to get there, plus one draft I threw away. This post shows every one of them, everything else we generated along the way, and what I now think the model is good and bad at.`}
      </Prose>

      <Film
        name="evolution"
        caption="All six versions in 30 seconds, with the loud draft between V5 and V5.1."
      />

      <SectionTitle>How a film made of code works</SectionTitle>

      <Prose>
        {`Each film is a web page with one function, seek(t). Give it a time in seconds and it paints that exact frame. It can't use timers, CSS animations or Math.random, so the same t always gives the same pixels.`}
      </Prose>

      <CodeBlock lang="js">{`window.seek(t)   // paint the exact frame at t seconds

// render: headless Chrome calls seek() 60 times per second of film,
// screenshots each frame, and ffmpeg joins frames and audio into an mp4`}</CodeBlock>

      <div className="space-y-5">
        <ProseSmall>
          <strong>Motion blur.</strong>
          {` The renderer captures four subframes per frame and averages them, like a 180° camera shutter.`}
        </ProseSmall>
        <ProseSmall>
          <strong>One timeline.</strong>
          {` A single JSON file holds the beats, the voice lines and the sound cues. The picture and the audio mix both read it, so a sound can't drift away from its moment.`}
        </ProseSmall>
        <ProseSmall>
          <strong>Sound.</strong>
          {` The effects are synthesised in numpy, the music ducks under the voice, and the mix is normalised to -14 LUFS.`}
        </ProseSmall>
        <ProseSmall>
          <strong>Chess.</strong>
          {` chess.js checks every board position, so the film never shows an illegal one.`}
        </ProseSmall>
      </div>

      <Prose>
        {`When any frame can be rebuilt on demand, the model can look at stills of its own work, and I can diff pixels after a refactor to prove nothing moved. HeyGen's HyperFrames and Remotion are built on the same idea.`}
      </Prose>

      <Callout>
        {`@0xMovez put it as "the prompt is 10% of the video. The other 90% is the harness." My messages to Claude were mostly a line or two. The work went into the render loop, the review tools and the notes that told the model what good looks like.`}
      </Callout>

      <SectionTitle>Every generation of the film</SectionTitle>

      <Prose>
        <strong>V1, V2 and V3. A small experiment.</strong>
      </Prose>

      <Prose>
        {`The same 10-second sting, built three ways by three fresh Opus 5.5 agents with the same kit, story and assets. V1 followed a reference storyboard. V2 got a timing sheet written up front. V3 had to analyse the music and write its own timing.`}
      </Prose>

      <Film name="v1" caption="V1, the reference sting. It rebuilt our real Playground screen." />
      <Film name="v2" caption="V2, the director pass. Every cut lands exactly on the beat." />
      <Film name="v3" caption="V3, auto-scored. The agent found the tempo and wrote its own timing." />

      <div className="space-y-5">
        <ProseSmall>
          {`V2's cuts landed 0 ms off the beat. V1 averaged 142 ms off and V3 13 ms.`}
        </ProseSmall>
        <ProseSmall>
          {`V3 recovered the track's exact tempo (120.000 BPM) using nothing but numpy. V1 was never told about the music at all, and it still put its big moments on beats.`}
        </ProseSmall>
        <ProseSmall>
          {`All three agents together used about 627,000 tokens. I had guessed 15 to 20 million.`}
        </ProseSmall>
      </div>

      <Prose>
        {`Then I watched them. All three read as tasteful product demos, and none of them made me feel anything. We had solved beat sync to the millisecond and it made no difference.`}
      </Prose>

      <Callout>Rhythm is not wow.</Callout>

      <Prose>
        <strong>V4. One square.</strong>
      </Prose>

      <Film name="v4" caption="V4, a 16-second loop with no cuts, built around one amber square." />

      <Prose>
        {`V4 went the other way. It was a 16-second loop with no cuts, at 60 fps with motion blur and a composed score. It was the cleanest thing we made. It also wasn't exciting, and that note is why V5 exists.`}
      </Prose>

      <Prose>
        <strong>V5. A character and a voice.</strong>
      </Prose>

      <Film name="v5" caption="V5, the first 30-second film. A doodle knight, a voice and real music." />

      <Prose>
        {`For V5 I rewrote the brief. I asked for designer typography, better music and a character who speaks and reacts. We got a doodle knight whose lines boil at 12 fps like hand-drawn animation, an AI voice called Zoe, a track called "Gummies", and Bricolage Grotesque as the display face. The script went from 72 words to 46.`}
      </Prose>

      <Prose>
        {`Claude scored each preview from 1 to 10 on eight items and fixed the three worst problems each round. After three rounds every score was 8 or above. Then I told it what bothered me. It was getting the screens right, but the motion design was missing. Things appeared and then sat still.`}
      </Prose>

      <Prose>
        {`The numbers agreed with me. In 48% of V5's frames, less than 1% of the picture was moving. Claude had scored its own motion an 8.`}
      </Prose>

      <Prose>
        <strong>The loud draft.</strong>
      </Prose>

      <Film name="v51-loud" caption="The loud draft. Near-still frames dropped from 56% to 16%, and it looked worse." />

      <Prose>
        {`Claude's fix was to add everything at once. The board settled in 3D, the squares tiled in on a diagonal wave, pieces rained in, letters landed one by one, and the camera kicked on every hit. By the metric it was a huge win. By eye it was too much.`}
      </Prose>

      <Callout>
        {`My note back: "don't overdo animation. Subtle but clear and polished; like blur, but at what intensity, and the transition of blur."`}
      </Callout>

      <Prose>
        <strong>V5.1. The calm system.</strong>
      </Prose>

      <Prose>
        {`This is where it turned. Claude took that note and wrote it down as numbers.`}
      </Prose>

      <DataTable
        head={["Move", "Blur", "Opacity and scale", "Duration"]}
        rows={[
          ["Enter", "8 px to 0", "0 to 1, 0.985 to 1", "480 ms, ease-out expo"],
          ["Exit", "0 to 8 px", "1 to 0, 1 to 0.99", "280 ms, ease-in cubic"],
          ["Scene change", "12 px out, 12 px in", "crossfade", "360 ms out, 520 ms in"],
          ["Focus pull", "background to 2.5 px", "background to 0.72", "420 ms"],
        ]}
      />

      <Prose>
        {`Blur never goes above 12 px, and a blurred thing never holds still. Text enters word by word. There are no spins, drops or shakes. Each beat gets one accent. The knight carries the personality, and the UI stays calm.`}
      </Prose>

      <Still
        name="ui-kit"
        alt="The film's UI kit: a grey engine board, the Playground card, the coach card, puzzle cards and a live-class card"
        width={1800}
        height={1170}
        caption="The UI kit Claude designed for the film. Each card is a real Elvyn feature, drawn cleaner than our dev build."
      />

      <Prose>
        {`V5.1 kept V5's story, words, voice and music. Only the motion and the UI changed. Claude also cut the sound effects from 63 cues to 48, and I listened before approving them.`}
      </Prose>

      <Film
        name="before-after"
        caption="V5 against V5.1. Same script, voice and music, new motion."
      />

      <Film
        name="v51-9x16"
        vertical
        caption="It ships in 16:9, 9:16 and 1:1. Each format is laid out again, never cropped."
      />

      <SectionTitle>Everything else we generated</SectionTitle>

      <Still
        name="concepts"
        alt="Six mascot concepts: a 3D black knight sheet, a knight toy, amber line icons, a pawn character, a question mark character and a doodle knight"
        width={2424}
        height={1074}
        caption="Six mascot concepts, generated as images on Higgsfield. The doodle knight won and was redrawn in code. The line icons became the film's single amber line."
      />

      <Still
        name="type-study"
        alt="Three type pairings: Editorial, Playful and Contrast"
        width={2904}
        height={540}
        caption="Three type pairings. Editorial (Instrument Serif), Playful (Bricolage Grotesque) and Contrast (Cabinet Grotesk with Zodiak). Playful won."
      />

      <div className="space-y-5">
        <ProseSmall>
          <strong>Film cuts.</strong>
          {` Six versions and the loud draft, and the final in three formats.`}
        </ProseSmall>
        <ProseSmall>
          <strong>Mascots.</strong>
          {` Six concepts: a 3D knight called Kip (a sheet and a toy), amber line icons, a pawn, a question mark, and the doodle knight we kept. The knight in the film is an SVG rig with six faces and hand-drawn boil.`}
        </ProseSmall>
        <ProseSmall>
          <strong>Voice.</strong>
          {` Claude measured all 100 Higgsfield preset voices for pitch, range and pace, transcribed the 17 most expressive, and gave me three to hear: Zoe, Cillian and Andre, plus Zoe on a second engine. I picked Zoe. The engine voices are Windows speech, roughened in numpy.`}
        </ProseSmall>
        <ProseSmall>
          <strong>Music.</strong>
          {` 236 tracks scraped from Mixkit, 25 measured for tempo and beat, 8 checked for vocals, and 3 sent to me. I picked "Gummies", which runs at exactly 120 BPM.`}
        </ProseSmall>
        <ProseSmall>
          <strong>Type.</strong>
          {` Three pairings. Bricolage Grotesque won, then got an amber sticker on the thinking word and a squiggle underline.`}
        </ProseSmall>
        <ProseSmall>
          <strong>Words.</strong>
          {` Three drafts of the script, from 72 words down to 46.`}
        </ProseSmall>
        <ProseSmall>
          <strong>Sound.</strong>
          {` Fourteen effects synthesised in numpy, placed as 63 cues in V5 and 48 in V5.1.`}
        </ProseSmall>
        <ProseSmall>
          <strong>Backdrop.</strong>
          {` A painted dawn valley on Higgsfield for V1 to V3.`}
        </ProseSmall>
        <ProseSmall>
          <strong>Cost.</strong>
          {` 23.45 Higgsfield credits for the whole project. V5.1 used none.`}
        </ProseSmall>
      </div>

      <SectionTitle>Measuring motion</SectionTitle>

      <Prose>
        {`I checked every version with the frozen-time script from `}
        <A href="https://github.com/echris6/motion-video-kit">echris6/motion-video-kit</A>
        {`. It adds up the time where almost nothing on screen changes. Its bar is about 1 second per 30 seconds of film, with no single hold over 0.6 s except the final call to action.`}
      </Prose>

      <DataTable
        head={["Version", "Length", "Frozen time", "Scaled to 30 s", "Longest hold"]}
        rows={[
          ["V1", "10 s", "0.0 s*", "0.0 s*", "none*"],
          ["V2", "10 s", "2.7 s", "8.1 s", "2.2 s"],
          ["V3", "10 s", "0.0 s*", "0.0 s*", "none*"],
          ["V4", "16 s", "5.4 s", "10.1 s", "1.1 s"],
          ["V5", "30 s", "8.6 s", "8.6 s", "1.6 s"],
          ["V5.1", "30 s", "1.2 s", "1.2 s", "1.1 s"],
        ]}
      />

      <ProseSmall>
        {`*V1 and V3 sit on a painted background with grain that changes every frame, so the script never sees a still frame. Zero there means the metric can't see those films.`}
      </ProseSmall>

      <Prose>
        {`V5.1 went from 8.6 s of frozen time to 1.2 s. It still fails one line of that bar. The live-class card holds for 1.1 s after "Joined", from 24.7 to 25.7 s. That's the next fix.`}
      </Prose>

      <SectionTitle>What I learned</SectionTitle>

      <Prose>
        <strong>The model&apos;s default taste is a tasteful product demo.</strong>
        {` V1 to V4 were well made and forgettable. When I pushed, it swung to the other extreme. Both times it needed a person to say "no, this."`}
      </Prose>

      <Prose>
        <strong>Adjectives don&apos;t steer it. Numbers do.</strong>
        {` "Subtle" meant nothing until it became "8 px to 0 over 480 ms, never above 12 px, one accent per beat." HeyGen's Code2Video benchmark found the same thing: "motion is the weak axis. Models hit every beat in the brief, but the timing between beats breaks."`}
      </Prose>

      <Prose>
        <strong>Metrics can mislead in both directions.</strong>
        {` The dead-frame number improved when the film got worse, and the frozen-time script scores grain as motion. I use metrics to find holds. I don't use them to decide what's good.`}
      </Prose>

      <Prose>
        <strong>The builder shouldn&apos;t be the judge.</strong>
        {` Claude graded its own V5 at 8 or above on motion. motion-video-kit fixes this with a fresh critic for every review who sees only the render. I didn't have one, and I should have.`}
      </Prose>

      <Prose>
        <strong>It can&apos;t hear.</strong>
        {` Sound sync is correct by construction because one timeline drives picture and audio. Whether the sounds are any good is a question only a person can answer. I listened to every mix.`}
      </Prose>

      <Prose>
        <strong>Code keeps promises that generated video doesn&apos;t.</strong>
        {` One of my own Higgsfield clips, made from a careful prompt that said "no new objects", still grew an extra slab a second in. In code, every chess position is legal and the UI text is exact.`}
      </Prose>

      <Prose>
        <strong>Rendering is the slow part.</strong>
        {` Each 30-second final took 10 to 12 minutes per format on my laptop, mostly because CSS blur is expensive. Claude Code stops background jobs at 30 minutes, so finals ran as detached processes.`}
      </Prose>

      <SectionTitle>What I think of the model</SectionTitle>

      <Prose>
        {`As an engineer, Opus 5.5 was excellent. It built the render pipeline, closed-form springs, a sidechain ducker, loudness normalisation, per-format layouts and pixel-diff checks. It noticed that with motion blur, one step of the knight's 12 fps boil could land inside a frame and show two drawings at once, so it offset the boil clock by a tenth of a step. I wouldn't have thought of that.`}
      </Prose>

      <Prose>
        {`As a director, it needed me. It judges stills and numbers, not motion as you feel it. It can't listen. Its taste swings between safe and loud, and it grades its own work generously.`}
      </Prose>

      <div className="space-y-4">
        <ProseSmall>{`1. I watch the render and give a note in plain words.`}</ProseSmall>
        <ProseSmall>{`2. Claude turns the note into a written spec with numbers.`}</ProseSmall>
        <ProseSmall>{`3. It builds to the spec, then measures and reviews its own frames.`}</ProseSmall>
        <ProseSmall>{`4. I watch again.`}</ProseSmall>
      </div>

      <Callout>
        {`A sloptvnews review of Rory Flynn's Opus-made explainer put it well: "rendering automates end to end, but the judgment loop does not." I got a fast, very literal motion studio. The spec still has to come from someone with taste.`}
      </Callout>

      <SectionTitle>What I&apos;d do next</SectionTitle>

      <div className="space-y-5">
        <ProseSmall>{`Add a separate critic agent that only sees the render.`}</ProseSmall>
        <ProseSmall>{`Fix the 1.1 s hold at 24.7 s.`}</ProseSmall>
        <ProseSmall>{`Try recorded sound effects against the synthesised ones.`}</ProseSmall>
        <ProseSmall>{`Collect the blind ranking of V1 to V3 that's still pending.`}</ProseSmall>
      </div>

      <SectionTitle>The code and the sources</SectionTitle>

      <Prose>
        {`The kit, the film's source, the motion spec and the comparison builder are open: `}
        <A href="https://github.com/milliondreamsblog/MotionDesignOpus5.5">milliondreamsblog/MotionDesignOpus5.5</A>
        {`.`}
      </Prose>

      <div className="space-y-4">
        <ProseSmall>
          <A href="https://github.com/echris6/motion-video-kit">echris6/motion-video-kit</A>
          {`, a Claude Code skill with the Gauntlet review loop and the frozen-time script.`}
        </ProseSmall>
        <ProseSmall>
          <A href="https://x.com/0xMovez/article/2104216919033192746">@0xMovez, How to build motion design studio with Opus 5.5</A>
          {`.`}
        </ProseSmall>
        <ProseSmall>
          <A href="https://www.heygen.com/research/introducing-code2video-benchmark">HeyGen Research, Code2Video benchmark</A>
          {`.`}
        </ProseSmall>
        <ProseSmall>
          <A href="https://arxiv.org/abs/2606.28593">Animation2Code</A>
          {` and `}
          <A href="https://hyperframes.heygen.com/concepts/determinism">HyperFrames on determinism</A>
          {`.`}
        </ProseSmall>
        <ProseSmall>
          <A href="https://sloptvnews.com/opus-5-5-negroni-explainer-html-motion-graphics-iteration/">sloptvnews, review of Rory Flynn&apos;s Opus 5.5 explainer</A>
          {`.`}
        </ProseSmall>
      </div>

      <ProseSmall>
        <em>
          {`Music: "Gummies" from Mixkit. The film is at `}
          <A href="https://www.elvynchess.com">elvynchess.com</A>
          {`, where the first class is free.`}
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
  "launch-film-in-code": {
    title: "It took six versions to make a 30-second film in code.",
    subtitle: "Making Elvyn Chess's launch film with Claude Code and Opus 5.5.",
    author: "Akshat Darshi",
    dateLabel: "SEP 30, 2026",
    description:
      "Every version of our launch film, everything we generated along the way, and what Opus 5.5 is good and bad at as a motion designer.",
    Content: LaunchFilmContent,
  },
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
