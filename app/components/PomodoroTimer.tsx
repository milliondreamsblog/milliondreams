"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee, Timer as TimerIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PomodoroTimer() {
    const [workDuration, setWorkDuration] = useState(25);
    const [breakDuration, setBreakDuration] = useState(5);
    const [timeLeft, setTimeLeft] = useState(workDuration * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<"work" | "break">("work");
    const [completed, setCompleted] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        let audio: HTMLAudioElement | null = null;

        if (completed) {
            audio = new Audio("/jingle.mp3");
            audio.loop = true;
            audio.play().catch(e => console.error("Audio play failed:", e));
        }

        return () => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        };
    }, [completed]);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            setCompleted(true);
            if (timerRef.current) clearInterval(timerRef.current);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setCompleted(false);
        setTimeLeft((mode === "work" ? workDuration : breakDuration) * 60);
    };

    const switchMode = (newMode: "work" | "break") => {
        setIsActive(false);
        setCompleted(false);
        setMode(newMode);
        setTimeLeft((newMode === "work" ? workDuration : breakDuration) * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleDurationChange = (type: "work" | "break", value: string) => {
        const num = parseInt(value) || 1;
        if (type === "work") {
            setWorkDuration(num);
            if (mode === "work" && !isActive) setTimeLeft(num * 60);
        } else {
            setBreakDuration(num);
            if (mode === "break" && !isActive) setTimeLeft(num * 60);
        }
    };

    return (
        <div className="relative mb-16 w-full text-left">
            {/* Pulsating Aura when timer finishes */}
            <AnimatePresence>
                {completed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        className="pointer-events-none absolute -inset-4 z-0 rounded-2xl border-2 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                        animate={{
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                )}
            </AnimatePresence>

            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    Pomodoro Timer
                </h2>

                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                >
                    {showSettings ? "Close Settings" : "Adjust Time"}
                </button>
            </div>

            <div className="mb-8 w-full text-left">
                <p className="text-sm italic text-gray-500 dark:text-gray-400">
                    You&apos;ve reached the end! Or have you? Before you vanish into the digital void, I&apos;ve got a quick Pomodoro Timer to help you focus better on your next big thing (or just to remind you to stop doomscrolling).
                </p>
            </div>

            <div className="relative z-10 overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900/50">
                <AnimatePresence mode="wait">
                    {showSettings ? (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col gap-4"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-tight text-gray-400">Focus (min)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="60"
                                        value={workDuration}
                                        onChange={(e) => handleDurationChange("work", e.target.value)}
                                        className="w-full rounded-lg bg-gray-50 px-3 py-2 text-sm font-mono focus:outline-none dark:bg-zinc-800 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-tight text-gray-400">Break (min)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={breakDuration}
                                        onChange={(e) => handleDurationChange("break", e.target.value)}
                                        className="w-full rounded-lg bg-gray-50 px-3 py-2 text-sm font-mono focus:outline-none dark:bg-zinc-800 dark:text-white"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="timer"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col items-center justify-between gap-6 sm:flex-row"
                        >
                            {/* Time Display */}
                            <div className="flex flex-col items-center sm:items-start">
                                <span className="font-mono text-5xl font-light tracking-tight text-black dark:text-white">
                                    {formatTime(timeLeft)}
                                </span>
                                <span className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
                                    {mode === "work" ? "Focus Session" : "Short Break"}
                                </span>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-2">
                                <div className="mr-4 flex rounded-full bg-gray-50 p-1 dark:bg-zinc-800">
                                    <button
                                        onClick={() => switchMode("work")}
                                        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${mode === "work" ? "bg-white text-black shadow-sm dark:bg-zinc-700 dark:text-white" : "text-gray-400 hover:text-gray-600"}`}
                                    >
                                        {workDuration}m
                                    </button>
                                    <button
                                        onClick={() => switchMode("break")}
                                        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${mode === "break" ? "bg-white text-black shadow-sm dark:bg-zinc-700 dark:text-white" : "text-gray-400 hover:text-gray-600"}`}
                                    >
                                        {breakDuration}m
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={toggleTimer}
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-transform hover:scale-105 active:scale-95 dark:bg-white dark:text-black"
                                        aria-label={isActive ? "Pause" : "Start"}
                                    >
                                        {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                                    </button>
                                    <button
                                        onClick={resetTimer}
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-all hover:bg-gray-50 hover:text-black dark:border-zinc-800 dark:text-gray-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                                        aria-label="Reset"
                                    >
                                        <RotateCcw size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {completed && (
                <button
                    onClick={() => setCompleted(false)}
                    className="mt-4 text-[10px] font-bold uppercase tracking-widest text-purple-500 transition-opacity hover:opacity-100"
                >
                    Dismiss Alarm
                </button>
            )}
        </div>
    );
}
