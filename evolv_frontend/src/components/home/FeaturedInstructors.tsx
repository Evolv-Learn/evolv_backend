'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Instructor {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
  };
  profile_picture: string | null;
  title: string;
  bio: string;
}

export default function FeaturedInstructors() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  useEffect(() => {
    fetchInstructors();
  }, []);

  useEffect(() => {
    if (instructors.length > 0) {
      setTimeout(checkArrows, 100);
      const container = scrollContainerRef.current;
      if (container) {
        container.addEventListener('scroll', checkArrows);
        return () => container.removeEventListener('scroll', checkArrows);
      }
    }
  }, [instructors]);

  const checkArrows = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 350;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/instructors/`);
      const data = await response.json();
      setInstructors(data.results || data);
    } catch (error) {
      console.error('Failed to fetch instructors:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || instructors.length === 0) {
    return null; // Don't show section if no instructors
  }

  // Logic for displaying instructors:
  // 1-4 instructors: Show all, centered
  // 5+ instructors: Show 4 initially, then show all with scroll when expanded
  const shouldShowAll = instructors.length <= 4 || showAll;
  const displayedInstructors = shouldShowAll ? instructors : instructors.slice(0, 4);
  const hasMore = instructors.length > 4;

  return (
    <section className="py-20 bg-warm-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-secondary-blue mb-4">
            Meet Our Expert Instructors
          </h2>
          <p className="text-xl text-gray-600">
            Learn from industry professionals with real-world experience
          </p>
        </div>

        <div className="relative">
          {/* Left Arrow - only show when scrollable and showing all */}
          {showAll && instructors.length > 4 && showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-xl rounded-full p-3 hover:bg-gray-100 transition-all hover:scale-110"
              aria-label="Scroll left"
            >
              <svg className="w-6 h-6 text-secondary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Right Arrow - only show when scrollable and showing all */}
          {showAll && instructors.length > 4 && showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-xl rounded-full p-3 hover:bg-gray-100 transition-all hover:scale-110"
              aria-label="Scroll right"
            >
              <svg className="w-6 h-6 text-secondary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Instructors Container */}
          <div 
            ref={scrollContainerRef}
            className={`flex gap-6 pb-4 px-2 ${
              instructors.length <= 4 || !showAll 
                ? 'justify-center flex-wrap' 
                : 'overflow-x-auto scrollbar-hide scroll-smooth'
            }`}
            style={showAll && instructors.length > 4 ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : {}}
          >
            {displayedInstructors.map((instructor) => (
              <Link 
                key={instructor.id} 
                href={`/instructor/${instructor.user.id}/profile`}
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group cursor-pointer transform hover:-translate-y-2 flex-shrink-0 w-64 h-80 flex flex-col">
                  {/* Profile Picture */}
                  <div className="relative h-48 bg-gradient-to-br from-primary-gold to-secondary-blue overflow-hidden flex-shrink-0">
                    {instructor.profile_picture ? (
                      <img
                        src={instructor.profile_picture}
                        alt={`${instructor.user.first_name} ${instructor.user.last_name}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-6xl">
                        👤
                      </div>
                    )}
                  </div>
                  
                  {/* Instructor Info - Name and Title */}
                  <div className="p-5 text-center flex-1 flex flex-col justify-center">
                    <h3 className="text-lg font-heading font-bold text-secondary-blue mb-2 group-hover:text-primary-gold transition-colors">
                      {instructor.user.first_name} {instructor.user.last_name}
                    </h3>
                    {instructor.title && (
                      <p className="text-sm text-gray-600 font-medium line-clamp-2">
                        {instructor.title}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Show More / Show Less Button - only show if more than 4 instructors */}
        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary-blue text-white rounded-lg hover:bg-opacity-90 transition-all font-medium"
            >
              {showAll ? (
                <>
                  Show Less
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  <span>Show More ({instructors.length - 4} more)</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
