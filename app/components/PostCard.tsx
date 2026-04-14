"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Bookmark,
  Link2,
  ExternalLink,
  MoreHorizontal,
  ShieldAlert,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PostCardProps {
  // Avatar
  avatar?: string;
  avatarFallback?: string;
  avatarColor?: string;

  // Content
  title: string;
  tags: string[];
  date: string;
  readTime?: string;

  // Cover image
  coverImage?: string;
  coverImageAlt?: string;

  // Primary CTA
  actionLabel?: string;
  actionUrl: string;

  // Optional secondary link (e.g. GitHub for projects)
  secondaryUrl?: string;
  secondaryLabel?: string;

  // Metrics — omit to hide the metric entirely
  upvotes?: number;
  comments?: number;
}

// ─── Animation ───────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as any },
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({
  src,
  fallback,
  color,
}: {
  src?: string;
  fallback: string;
  color: string;
}) {
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
      style={{ backgroundColor: color }}
    >
      {src ? (
        <Image
          src={src}
          alt={fallback}
          width={36}
          height={36}
          className="object-cover w-full h-full"
        />
      ) : (
        <span className="text-white font-bold text-sm select-none leading-none">
          {fallback}
        </span>
      )}
    </div>
  );
}

function ActionButton({ label, url }: { label: string; url: string }) {
  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-1.5 bg-black dark:bg-white text-white dark:text-black rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide hover:opacity-75 transition-opacity whitespace-nowrap"
    >
      {label}
      <ExternalLink size={10} strokeWidth={2.5} />
    </Link>
  );
}

function TagList({ tags }: { tags: string[] }) {
  const MAX_VISIBLE = 4;
  const visible = tags.slice(0, MAX_VISIBLE);
  const overflow = tags.length - MAX_VISIBLE;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <ShieldAlert size={13} className="text-yellow-500 shrink-0" />
      {visible.map((tag) => (
        <span
          key={tag}
          className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 rounded-full px-2.5 py-[3px] text-[11px] font-mono"
        >
          {tag}
        </span>
      ))}
      {overflow > 0 && (
        <span className="bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-500 rounded-full px-2.5 py-[3px] text-[11px] font-mono">
          +{overflow}
        </span>
      )}
    </div>
  );
}

function MetricButton({
  icon: Icon,
  count,
  label,
}: {
  icon: React.FC<{ size?: number; strokeWidth?: number }>;
  count?: number;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      className="flex items-center gap-1.5 text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors text-[12px]"
    >
      <Icon size={14} strokeWidth={1.8} />
      {count !== undefined && <span>{count}</span>}
    </button>
  );
}

// ─── PostCard ─────────────────────────────────────────────────────────────────

export function PostCard({
  avatar,
  avatarFallback = "?",
  avatarColor = "#7c3aed",
  title,
  tags,
  date,
  readTime,
  coverImage,
  coverImageAlt,
  actionLabel = "Read post",
  actionUrl,
  secondaryUrl,
  secondaryLabel = "Source",
  upvotes,
  comments,
}: PostCardProps) {
  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(actionUrl).catch(() => {});
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className="w-full cursor-pointer"
      onClick={() => window.open(actionUrl, "_blank", "noopener,noreferrer")}
    >
      <div
        className="
        bg-white dark:bg-zinc-900
        border border-gray-200 dark:border-zinc-800
        rounded-2xl overflow-hidden
        transition-all duration-200
        hover:border-gray-300 dark:hover:border-zinc-700
        hover:shadow-md dark:hover:shadow-black/40
      "
      >
        {/* ── Header row ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <Avatar src={avatar} fallback={avatarFallback} color={avatarColor} />
          <div className="flex items-center gap-2">
            <ActionButton label={actionLabel} url={actionUrl} />
            {secondaryUrl && (
              <ActionButton label={secondaryLabel} url={secondaryUrl} />
            )}
            <button
              onClick={(e) => e.stopPropagation()}
              aria-label="More options"
              className="text-gray-400 dark:text-zinc-600 hover:text-gray-600 dark:hover:text-zinc-400 transition-colors"
            >
              <MoreHorizontal size={18} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* ── Title ───────────────────────────────────────────────────────── */}
        <div className="px-4 pb-2">
          <h3
            className="font-bold text-[#0a0a0a] dark:text-white leading-snug"
            style={{ fontSize: "clamp(14px, 2vw, 17px)" }}
          >
            {title}
          </h3>
        </div>

        {/* ── Tags ────────────────────────────────────────────────────────── */}
        <div className="px-4 pb-2">
          <TagList tags={tags} />
        </div>

        {/* ── Meta ────────────────────────────────────────────────────────── */}
        <div className="px-4 pb-3">
          <span className="text-gray-400 dark:text-zinc-500 text-[12px]">
            {date}
            {readTime && (
              <>
                <span className="mx-1.5 opacity-40">·</span>
                {readTime}
              </>
            )}
          </span>
        </div>

        {/* ── Cover image ─────────────────────────────────────────────────── */}
        {coverImage && (
          <div className="relative w-full h-44 bg-gray-100 dark:bg-zinc-800">
            <Image
              src={coverImage}
              alt={coverImageAlt || title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            />
          </div>
        )}

        {/* ── Bottom metrics bar ──────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-100 dark:border-zinc-800/70">
          {/* Left: engagement */}
          <MetricButton icon={ThumbsUp} count={upvotes} label="Upvote" />
          <MetricButton icon={ThumbsDown} label="Downvote" />
          {comments !== undefined && (
            <MetricButton
              icon={MessageCircle}
              count={comments}
              label="Comments"
            />
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right: utility */}
          <button
            onClick={(e) => e.stopPropagation()}
            aria-label="Bookmark"
            className="text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
          >
            <Bookmark size={14} strokeWidth={1.8} />
          </button>
          <button
            onClick={handleCopyLink}
            aria-label="Copy link"
            title="Copy link"
            className="text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
          >
            <Link2 size={14} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
