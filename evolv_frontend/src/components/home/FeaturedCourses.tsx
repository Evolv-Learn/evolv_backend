'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  image: string | null;
  color: string;
  is_active: boolean;
  order: number;
  course_count: number;
}

export default function FeaturedCourses() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && showAll) {
      // Small delay to ensure DOM is ready
      setTimeout(checkArrows, 100);
      const container = scrollContainerRef.current;
      if (container) {
        container.addEventListener('scroll', checkArrows);
        return () => container.removeEventListener('scroll', checkArrows);
      }
    }
  }, [categories, showAll]);

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
      const scrollAmount = 400;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/?is_active=true`);
      const data = await response.json();
      setCategories(data.results || data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || categories.length === 0) {
    return null; // Don't show section if no categories
  }

  const displayedCategories = showAll ? categories : categories.slice(0, 4);
  const hasMore = categories.length > 4;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-secondary-blue mb-4">
            Explore Our Training Programs
          </h2>
          <p className="text-xl text-gray-600">
            Choose from our industry-leading programs taught by expert instructors
          </p>
        </div>

        <div className="relative">
          {/* Left Arrow - only show when scrollable */}
          {showAll && showLeftArrow && (
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

          {/* Right Arrow - only show when scrollable */}
          {showAll && showRightArrow && (
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

          {/* Categories Container */}
          <div 
            ref={scrollContainerRef}
            className={`flex gap-6 ${showAll ? 'overflow-x-auto scrollbar-hide scroll-smooth' : 'flex-wrap justify-center'} pb-4 px-2`}
            style={showAll ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : {}}
          >
            {displayedCategories.map((category) => (
              <Link key={category.id} href={`/courses?category=${encodeURIComponent(category.name)}`}>
                <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group cursor-pointer transform hover:-translate-y-2 flex-shrink-0 w-80">
                  {/* Category Image/Icon */}
                  <div className="relative h-48 overflow-hidden">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className={`${category.color || 'bg-gradient-to-br from-primary-gold to-secondary-blue'} h-full flex items-center justify-center group-hover:brightness-110 transition-all`}>
                        <div className="text-center text-white">
                          <div className="text-6xl mb-2">{category.icon || '📚'}</div>
                          <div className="text-xl font-bold">{category.name}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Category Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-heading font-bold text-secondary-blue mb-2 group-hover:text-primary-gold transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-primary-gold font-semibold group-hover:underline text-sm">
                        Explore →
                      </span>
                      {category.course_count > 0 && (
                        <span className="text-xs text-gray-500">
                          {category.course_count} {category.course_count === 1 ? 'course' : 'courses'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Show More / Show Less Button */}
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
                  Show More ({categories.length - 4} more)
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/courses">
            <Button variant="outline" size="lg">
              View All Courses
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
