'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const cards = [
  {
    title: 'Live, Interactive Sessions',
    body: 'Every module is taught live on Discord. You ask questions, we work through problems together in real time. No pre-recorded videos you watch alone at midnight.',
    accent: 'bg-primary-gold',
  },
  {
    title: 'Built for African Researchers',
    body: 'Most research methods training is built for Western institutions using Western examples. Every programme we offer uses datasets, contexts, and problems drawn from African research environments — agriculture, ecology, social science, and beyond.',
    accent: 'bg-igbo-red',
  },
  {
    title: 'Affordable Without Compromise',
    body: 'Quality training should not be a luxury. We offer regional pricing so cost is never the reason you cannot develop your research skills.',
    accent: 'bg-success',
  },
];

const DURATION = 5000; // ms per card

export default function WhyEvolvRotator() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [fading, setFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    setFading(true);
    setTimeout(() => {
      setActive(index);
      setProgress(0);
      setFading(false);
    }, 300);
  }, []);

  const next = useCallback(() => {
    goTo((active + 1) % cards.length);
  }, [active, goTo]);

  // Progress bar tick
  useEffect(() => {
    if (paused) return;
    setProgress(0);
    progressRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) return 100;
        return p + (100 / (DURATION / 50));
      });
    }, 50);
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [active, paused]);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(next, DURATION);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [next, paused]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Card */}
      <div
        className={`rounded-2xl p-10 md:p-14 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-10 transition-opacity duration-300 min-h-[200px] ${fading ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className={`inline-block w-10 h-1 ${cards[active].accent} rounded-full mb-6`} />
        <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">
          {cards[active].title}
        </h3>
        <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
          {cards[active].body}
        </p>
      </div>

      {/* Progress bar + dots */}
      <div className="mt-6 flex items-center gap-4">
        {/* Dots */}
        <div className="flex gap-2">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => { setPaused(false); goTo(i); }}
              aria-label={`Go to card ${i + 1}`}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === active ? 'bg-primary-gold scale-125' : 'bg-white bg-opacity-30 hover:bg-opacity-60'}`}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="flex-1 h-0.5 bg-white bg-opacity-20 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-gold rounded-full transition-none"
            style={{ width: `${paused ? progress : progress}%`, transition: paused ? 'none' : 'width 50ms linear' }}
          />
        </div>

        {/* Pause indicator */}
        <span className={`text-xs text-white text-opacity-50 transition-opacity duration-200 ${paused ? 'opacity-100' : 'opacity-0'}`}>
          paused
        </span>
      </div>
    </div>
  );
}
