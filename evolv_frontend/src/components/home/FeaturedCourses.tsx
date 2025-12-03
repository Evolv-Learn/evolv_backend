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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      // Small delay to ensure DOM is ready
      setTimeout(checkArrows, 100);
      const container = scrollContainerRef.current;
      if (container) {
        container.addEventListener('scroll', checkArrows);
        return () => container.removeEventListener('scroll', checkArrows);
      }
    }
  }, [categories]);

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

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Loading courses...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-secondary-blue mb-4">
            Our Courses
          </h2>
          <p className="text-xl text-gray-600">
            Choose from our industry-leading programs
          </p>
        </div>
        <div className="relative">
          {/* Left Arrow */}
          {showLeftArrow && (
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

          {/* Right Arrow */}
          {showRightArrow && (
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

          {/* Horizontal Scroll Container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => (
            <Link key={category.id} href={`/courses?category=${encodeURIComponent(category.name)}`}>
              <div className="bg-white rounded-xl overflow-hidden hover:shadow-2xl transition-all group cursor-pointer transform hover:-translate-y-2 flex-shrink-0 w-80">
                {/* Category Image/Icon - Large Banner */}
                {category.image ? (
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Overlay gradient for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    {/* Icon overlay on image */}
                    {category.icon && (
                      <div className="absolute bottom-4 right-4 text-5xl drop-shadow-lg">
                        {category.icon}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`${category.color || 'bg-gray-200'} h-48 flex items-center justify-center relative group-hover:brightness-110 transition-all`}>
                    <div className="text-7xl group-hover:scale-110 transition-transform">
                      {category.icon || '📁'}
                    </div>
                  </div>
                )}
                
                {/* Category Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-heading font-bold text-secondary-blue mb-3 group-hover:text-primary-gold transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {category.description || 'Explore our courses'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-gold font-semibold group-hover:underline">
                      Learn more →
                    </span>
                    {category.course_count > 0 && (
                      <span className="text-sm text-gray-500">
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
        <div className="text-center">
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
