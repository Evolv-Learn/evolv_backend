'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const cards = [
  {
    title: 'Live, Interactive Sessions',
    body: 'Every module is taught live on Discord — ask questions, solve problems in real time. No pre-recorded videos.',
    accent: 'bg-primary-gold',
  },
  {
    title: 'Built for African Researchers',
    body: 'Most research methods training is built for Western institutions using Western examples. Every programme we offer uses datasets, contexts, and problems drawn from African research environments — agriculture, ecology, social science, and beyond.',
    accent: 'bg-igbo-red',
  },
  {
    title: 'Affordable Without Compromise',
    body: 'Quality training should not be a luxury. We offer regional pricing so cost is never a barrier.',
    accent: 'bg-success',
  },
];

const DURATION = 5000; // ms per card

export default function WhyEvolvRotator() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [fading, setFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    setFading(true);
    setTimeout(() => {
      setActive(index);
      setFading(false);
    }, 300);
  }, []);

  const next = useCallback(() => {
    goTo((active + 1) % cards.length);
  }, [active, goTo]);

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
        className={`rounded-2xl p-10 md:p-14 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-10 transition-opacity duration-300 min-h-[300px] md:min-h-[250px] ${fading ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className={`flex-shrink-0 w-10 h-1 ${cards[active].accent} rounded-full`} />
          <h3 className="text-2xl md:text-3xl font-heading font-bold text-white leading-tight">
            {cards[active].title}
          </h3>
        </div>
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
            key={active}
            className="h-full bg-primary-gold rounded-full origin-left motion-safe:animate-[why-progress_5s_linear_forwards]"
            style={{ animationPlayState: paused ? 'paused' : 'running' }}
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
