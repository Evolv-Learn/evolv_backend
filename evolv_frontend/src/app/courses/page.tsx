'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { coursesApi } from '@/lib/api/courses';

interface Course {
  id: number;
  name: string;
  category: string;
  description: string;
  software_tools: string;
  instructor: string;
  locations: string[];
  partners: string[];
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await coursesApi.getAll();
      setCourses(data.results || data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['all', 'Data & AI', 'Cybersecurity', 'Microsoft Dynamics 365'];

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Data & AI': return 'bg-primary-gold';
      case 'Cybersecurity': return 'bg-igbo-red';
      case 'Microsoft Dynamics 365': return 'bg-hausa-indigo';
      default: return 'bg-success';
    }
  };

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary-blue to-secondary-blue-dark text-white py-16 pattern-adire">
        <div className="kente-strip absolute top-0 left-0 right-0"></div>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-heading font-bold mb-4">
            Our Courses
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Discover world-class tech courses designed for Nigerian learners
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 rounded-lg border-2 border-gray-300 focus:border-primary-gold focus:outline-none text-lg"
              />
              <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-primary-gold text-gray-900'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category === 'all' ? 'All Courses' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading courses...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-heading font-bold mb-2">No courses found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try a different search term' : 'No courses available in this category'}
            </p>
          </div>
        )}

        {/* Courses Grid */}
        {!isLoading && filteredCourses.length > 0 && (
          <>
            <div className="mb-6 text-center">
              <p className="text-gray-600">
                Showing <span className="font-bold text-secondary-blue">{filteredCourses.length}</span> course{filteredCourses.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
                >
                  {/* Course Image Placeholder */}
                  <div className={`h-48 ${getCategoryColor(course.category)} flex items-center justify-center relative overflow-hidden`}>
                    <div className="text-6xl">
                      {course.category === 'Data & AI' && '📊'}
                      {course.category === 'Cybersecurity' && '🔒'}
                      {course.category === 'Microsoft Dynamics 365' && '💼'}
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-white text-gray-900 rounded-full text-xs font-semibold">
                        {course.category}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-heading font-bold text-secondary-blue mb-2 group-hover:text-primary-gold transition-colors">
                      {course.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {course.description}
                    </p>

                    {/* Instructor */}
                    {course.instructor && (
                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{course.instructor}</span>
                      </div>
                    )}

                    {/* Locations */}
                    {course.locations && course.locations.length > 0 && (
                      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{course.locations.join(', ')}</span>
                      </div>
                    )}

                    {/* Software Tools */}
                    {course.software_tools && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {course.software_tools.split(',').slice(0, 3).map((tool, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {tool.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="kente-strip mb-4"></div>

                    <Link href={`/courses/${course.id}`}>
                      <Button variant="primary" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
