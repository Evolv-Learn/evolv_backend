'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';

interface Course {
  id: number;
  name: string;
  category: string;
  description: string;
  instructor: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  } | null;
  created_at: string;
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [changingInstructorId, setChangingInstructorId] = useState<number | null>(null);

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/courses/');
      setCourses(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await apiClient.get('/admin/profiles/?role=Instructor');
      setInstructors(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch instructors:', error);
    }
  };

  const handleChangeInstructor = async (courseId: number, courseName: string, currentInstructorId: number | null) => {
    const instructorOptions = instructors.map(i => 
      `${i.id}: ${i.first_name} ${i.last_name} (@${i.username})`
    ).join('\n');
    
    const instructorId = prompt(
      `Change instructor for "${courseName}"\n\nAvailable instructors:\n${instructorOptions}\n\nEnter instructor ID (or leave empty to remove instructor):`
    );
    
    if (instructorId === null) return; // Cancelled
    
    setChangingInstructorId(courseId);
    try {
      await apiClient.patch(`/courses/${courseId}/`, {
        instructor: instructorId === '' ? null : Number(instructorId),
      });
      
      alert('Instructor updated successfully!');
      fetchCourses();
    } catch (error) {
      console.error('Failed to change instructor:', error);
      alert('Failed to change instructor. Please try again.');
    } finally {
      setChangingInstructorId(null);
    }
  };

  const handleDelete = async (courseId: number, courseName: string) => {
    if (!confirm(`Are you sure you want to DELETE "${courseName}"? This action cannot be undone!`)) {
      return;
    }

    setDeletingId(courseId);
    try {
      await apiClient.delete(`/courses/${courseId}/`);
      alert(`Course "${courseName}" deleted successfully!`);
      fetchCourses();
    } catch (error) {
      console.error('Failed to delete course:', error);
      alert('Failed to delete course. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2"
          >
            <span>←</span> Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold text-secondary-blue mb-2">
                Course Management 📚
              </h1>
              <p className="text-gray-600">Manage all courses and learning programs</p>
            </div>
            <Button
              variant="primary"
              onClick={() => router.push('/instructor/courses/create')}
            >
              ➕ Create New Course
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-primary-gold mb-2">{courses.length}</div>
            <div className="text-gray-600">Total Courses</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-secondary-blue mb-2">
              {courses.filter(c => c.category === 'Data & AI').length}
            </div>
            <div className="text-gray-600">Data & AI</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-success mb-2">
              {courses.filter(c => c.category === 'Cybersecurity').length}
            </div>
            <div className="text-gray-600">Cybersecurity</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-hausa-indigo mb-2">
              {courses.filter(c => c.category === 'Microsoft Dynamics 365').length}
            </div>
            <div className="text-gray-600">Dynamics 365</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Courses
              </label>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="Data & AI">Data & AI</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Microsoft Dynamics 365">Microsoft Dynamics 365</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid gap-6">
          {filteredCourses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Courses Found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 'Try adjusting your search criteria' : 'No courses have been created yet'}
              </p>
              <Button
                variant="primary"
                onClick={() => router.push('/instructor/courses/create')}
              >
                Create First Course
              </Button>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-heading font-bold text-secondary-blue mb-2">
                          {course.name}
                        </h3>
                        <span className="inline-block bg-primary-gold text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                          {course.category}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-3">{course.description}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <span>👨‍🏫</span>
                        <span>
                          {course.instructor 
                            ? `${course.instructor.first_name} ${course.instructor.last_name}` 
                            : 'No instructor assigned'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>Created {new Date(course.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => router.push(`/instructor/courses/${course.id}/edit-topics`)}
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/instructor/courses/${course.id}/materials`)}
                      >
                        📁 Materials
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChangeInstructor(course.id, course.name, course.instructor?.id || null)}
                        disabled={changingInstructorId === course.id}
                        className="text-secondary-blue border-secondary-blue hover:bg-secondary-blue hover:text-white"
                      >
                        {changingInstructorId === course.id ? '⏳' : '👨‍🏫'} Change Instructor
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/courses/${course.id}`, '_blank')}
                      >
                        👁️ Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(course.id, course.name)}
                        disabled={deletingId === course.id}
                        className="text-igbo-red border-igbo-red hover:bg-igbo-red hover:text-white"
                      >
                        {deletingId === course.id ? '⏳' : '🗑️'} Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
