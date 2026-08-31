'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const programmes = [
  {
    title: 'R for Quantitative Research',
    category: 'Quantitative Methods',
    categoryColor: 'text-primary-gold',
    borderColor: 'border-primary-gold',
    badge: 'Now Open',
    badgeColor: 'bg-success text-white shadow-md',
    image: '/images/programmes/r-quantitative.png',
    imageClass: 'object-cover object-left-top',
    imageBg: 'bg-gray-900',
    frameStyle: 'terminal',
    desc: 'Learn to analyse experimental and field data using R — statistics, data visualisation, and experimental designs for agricultural and biological sciences.',
    href: '/courses',
  },
  {
    title: 'Qualitative Research Methods',
    category: 'Qualitative Methods',
    categoryColor: 'text-igbo-red',
    borderColor: 'border-igbo-red',
    badge: 'Coming Soon',
    badgeColor: 'bg-white text-gray-600 border border-gray-300 shadow-md',
    image: '/images/programmes/r-qualitative.png',
    imageClass: 'object-cover object-top',
    imageBg: 'bg-orange-50',
    frameStyle: 'browser',
    desc: 'Structured approaches to interviews, focus groups, and thematic analysis — for social scientists and mixed-methods researchers.',
    href: null,
  },
  {
    title: 'QGIS & Spatial Analysis',
    category: 'Spatial Analysis',
    categoryColor: 'text-hausa-indigo',
    borderColor: 'border-hausa-indigo',
    badge: 'Coming Soon',
    badgeColor: 'bg-white text-gray-600 border border-gray-300 shadow-md',
    image: '/images/programmes/qgis.png',
    imageClass: 'object-cover object-center',
    imageBg: 'bg-slate-600',
    frameStyle: 'browser',
    desc: 'Geospatial data analysis for land use, crop mapping, ecology, and environmental research using free open-source tools.',
    href: null,
  },
];

function ScreenFrame({ style }: { style: 'terminal' | 'browser' }) {
  if (style === 'terminal') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 border-b border-gray-700">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <span className="ml-2 text-gray-400 text-xs font-mono">R Console</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 border-b border-gray-200">
      <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
      <span className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
      <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
    </div>
  );
}

export default function ProgrammesCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector('[data-card]') as HTMLElement;
    const cardWidth = card ? card.offsetWidth + 24 : 360;
    scrollRef.current.scrollBy({ left: direction === 'right' ? cardWidth : -cardWidth, behavior: 'smooth' });
  };

  return (
    <div className="relative group/carousel">
      {/* Left arrow — only visible when overflowing */}
      <button
        onClick={() => scroll('left')}
        aria-label="Previous"
        className="hidden md:flex absolute -left-6 top-1/2 -translate-y-8 z-10 w-11 h-11 rounded-full bg-white border border-gray-200 shadow-lg items-center justify-center text-secondary-blue hover:bg-secondary-blue hover:text-white transition-all opacity-0 group-hover/carousel:opacity-100"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Cards */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide"
      >
        {programmes.map((prog, i) => (
          <div
            key={i}
            data-card
            className={`group flex-1 min-w-[260px] bg-white rounded-2xl overflow-hidden border-t-4 ${prog.borderColor} shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer`}
          >
            {/* Screen frame + screenshot */}
            <div className={`${prog.imageBg} flex-shrink-0`}>
              <ScreenFrame style={prog.frameStyle as 'terminal' | 'browser'} />
              <div className="relative h-44 w-full overflow-hidden">
                <Image src={prog.image} alt={prog.title} fill sizes="(max-width: 768px) 100vw, 33vw" className={prog.imageClass} />
                <span className={`absolute top-2 right-2 text-xs font-bold px-2.5 py-1 rounded-full ${prog.badgeColor}`}>
                  {prog.badge}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
              <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${prog.categoryColor}`}>
                {prog.category}
              </p>
              <h3 className="text-lg font-heading font-bold text-secondary-blue mb-3 leading-snug">
                {prog.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed flex-1 md:opacity-0 md:translate-y-2 md:max-h-0 md:overflow-hidden group-hover:opacity-100 group-hover:translate-y-0 group-hover:max-h-24 transition-all duration-500 ease-out">
                {prog.desc}
              </p>
              {prog.href && (
                <Link href={prog.href} className="mt-4 text-primary-gold font-semibold text-sm hover:underline inline-flex items-center gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  See full curriculum
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll('right')}
        aria-label="Next"
        className="hidden md:flex absolute -right-6 top-1/2 -translate-y-8 z-10 w-11 h-11 rounded-full bg-white border border-gray-200 shadow-lg items-center justify-center text-secondary-blue hover:bg-secondary-blue hover:text-white transition-all opacity-0 group-hover/carousel:opacity-100"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
