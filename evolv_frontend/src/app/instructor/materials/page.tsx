'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';

export default function LearningMaterialsPage() { 
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [allMaterials, setAllMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'courses' | 'files'>('courses');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // First, get all schedules for this instructor
      const schedulesRes = await apiClient.get('/schedules/');
      const allSchedules = schedulesRes.data.results || schedulesRes.data || [];
      
      // Filter schedules for current instructor
      const mySchedules = allSchedules.filter(
        (schedule: any) => schedule.instructor === user?.id || schedule.instructor?.id === user?.id
      );
      
      // Get unique course IDs from schedules
      const courseIds = [...new Set(mySchedules.map((schedule: any) => schedule.course))];
      
      // Fetch all courses
      const coursesRes = await apiClient.get('/courses/');
      const allCourses = coursesRes.data.results || coursesRes.data || [];
      
      // Filter courses that are in the instructor's schedules
      const myCourses = allCourses.filter((course: any) => courseIds.includes(course.id));
      
      setCourses(myCourses);
      
      // Fetch all materials for these courses
      const materialsPromises = courseIds.map(id => 
        apiClient.get(`/courses/${id}/materials/`).catch(() => ({ data: [] }))
      );
      const materialsResults = await Promise.all(materialsPromises);
      const allMats = materialsResults.flatMap((res, idx) => {
        const materials = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        return materials.map((mat: any) => ({
          ...mat,
          course_name: myCourses.find((c: any) => c.id === courseIds[idx])?.name || 'Unknown'
        }));
      });
      setAllMaterials(allMats);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasMaterials = (course: any) => {
    return course.github_repository || course.discord_community || course.video_content || course.additional_materials;
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'document': return '📄';
      case 'spreadsheet': return '📊';
      case 'archive': return '📦';
      default: return '📎';
    }
  };

  const filteredMaterials = allMaterials.filter(material =>
    material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.course_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteMaterial = async (materialId: number) => {
    if (!confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      await apiClient.delete(`/course-materials/${materialId}/`);
      setSuccess('Material deleted successfully!');
      setError('');
      // Refresh data
      fetchCourses();
    } catch (err: any) {
      setError('Failed to delete material');
      setSuccess('');
    }
  };

  const toggleFolder = (courseId: number) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedFolders(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold text-secondary-blue mb-2">
              Learning Materials
            </h1>
            <p className="text-gray-600">
              Manage GitHub repositories, Discord links, videos, and files for courses in your teaching schedules
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">
              ← Back to My Account
            </Button>
          </Link>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'courses' ? 'primary' : 'outline'}
              onClick={() => setViewMode('courses')}
              className="flex-1"
            >
              📚 By Course
            </Button>
            <Button
              variant={viewMode === 'files' ? 'primary' : 'outline'}
              onClick={() => setViewMode('files')}
              className="flex-1"
            >
              📁 All Files ({allMaterials.length})
            </Button>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Courses in Your Schedules</h2>
            <p className="text-gray-600 mb-6">
              Create a teaching schedule first to manage learning materials for courses
            </p>
            <Link href="/instructor/schedules/create">
              <Button variant="primary">
                Create Schedule
              </Button>
            </Link>
          </div>
        ) : viewMode === 'courses' ? (
          <>
            {/* Search */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                label="Search Courses"
              />
            </div>

            {/* Statistics */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-secondary-blue to-secondary-blue-dark rounded-xl p-6 text-white text-center">
                <div className="text-4xl font-bold mb-2">{courses.length}</div>
                <div className="text-sm font-bold">Total Courses</div>
              </div>
              <div className="bg-gradient-to-br from-primary-gold to-primary-gold-dark rounded-xl p-6 text-gray-900 text-center">
                <div className="text-4xl font-bold mb-2">
                  {courses.filter(c => c.github_repository).length}
                </div>
                <div className="text-sm font-bold">With GitHub</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white text-center">
                <div className="text-4xl font-bold mb-2">
                  {courses.filter(c => c.video_content).length}
                </div>
                <div className="text-sm font-bold">With Videos</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl p-6 text-white text-center">
                <div className="text-4xl font-bold mb-2">
                  {courses.filter(c => !hasMaterials(c)).length}
                </div>
                <div className="text-sm font-bold">No Materials</div>
              </div>
            </div>

            {/* Courses List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-6">
                Your Courses
              </h2>

              {filteredCourses.length > 0 ? (
                <div className="space-y-4">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      className="border-l-4 border-primary-gold rounded-lg p-6 bg-warm-white hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-secondary-blue">
                              {course.name}
                            </h3>
                            <span className="bg-secondary-blue text-white px-3 py-1 rounded-full text-xs font-bold">
                              {course.category}
                            </span>
                          </div>

                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {course.description}
                          </p>

                          {/* Materials Status */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <div className={`flex items-center gap-2 text-sm ${course.github_repository ? 'text-green-600' : 'text-gray-400'}`}>
                              <span>{course.github_repository ? '✓' : '○'}</span>
                              <span>GitHub</span>
                            </div>
                            <div className={`flex items-center gap-2 text-sm ${course.discord_community ? 'text-green-600' : 'text-gray-400'}`}>
                              <span>{course.discord_community ? '✓' : '○'}</span>
                              <span>Discord</span>
                            </div>
                            <div className={`flex items-center gap-2 text-sm ${course.video_content ? 'text-green-600' : 'text-gray-400'}`}>
                              <span>{course.video_content ? '✓' : '○'}</span>
                              <span>Video</span>
                            </div>
                            <div className={`flex items-center gap-2 text-sm ${course.additional_materials ? 'text-green-600' : 'text-gray-400'}`}>
                              <span>{course.additional_materials ? '✓' : '○'}</span>
                              <span>Files</span>
                            </div>
                          </div>

                          {!hasMaterials(course) && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-sm text-orange-700">
                              ⚠️ No learning materials added yet
                            </div>
                          )}
                        </div>

                        <div className="ml-4">
                          <Link href={`/instructor/courses/${course.id}/materials`}>
                            <Button variant="primary" size="sm">
                              Manage Materials
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold mb-2">No Matching Courses</h3>
                  <p>Try a different search term</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* All Files View */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <Input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                label="Search Files"
              />
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-6">
                All Uploaded Files ({filteredMaterials.length})
              </h2>

              {filteredMaterials.length > 0 ? (
                <div className="space-y-6">
                  {/* Group materials by course */}
                  {courses.map((course) => {
                    const courseMaterials = filteredMaterials.filter(m => m.course === course.id);
                    if (courseMaterials.length === 0) return null;
                    const isExpanded = expandedFolders.has(course.id);

                    return (
                      <div key={course.id} className="border-2 border-gray-200 rounded-xl overflow-hidden bg-warm-white">
                        <div 
                          className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleFolder(course.id)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                              ▶️
                            </span>
                            <span className="text-2xl">📁</span>
                            <div>
                              <h3 className="text-xl font-bold text-secondary-blue">
                                {course.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {courseMaterials.length} file{courseMaterials.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <Link 
                            href={`/instructor/courses/${course.id}/materials`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="outline" size="sm">
                              Manage Course
                            </Button>
                          </Link>
                        </div>

                        {isExpanded && (
                          <div className="space-y-3 px-6 pb-6 ml-8 border-t border-gray-200 pt-4">
                          {courseMaterials.map((material) => (
                            <div
                              key={material.id}
                              className="border-l-4 border-primary-gold rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">{getMaterialIcon(material.material_type)}</span>
                                    <div>
                                      <h4 className="font-bold text-secondary-blue">
                                        {material.title}
                                      </h4>
                                      <p className="text-xs text-gray-500">
                                        Uploaded {new Date(material.uploaded_at).toLocaleDateString()} by {material.uploaded_by_name}
                                      </p>
                                    </div>
                                  </div>

                                  {material.description && (
                                    <p className="text-sm text-gray-600 mb-2 ml-11">
                                      {material.description}
                                    </p>
                                  )}

                                  <div className="flex items-center gap-4 ml-11">
                                    <span className="text-xs text-gray-600">
                                      {material.file_size_mb} MB
                                    </span>
                                    <span className="text-xs text-gray-600 capitalize">
                                      {material.material_type}
                                    </span>
                                    <a
                                      href={material.file}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-secondary-blue hover:underline text-xs font-semibold"
                                    >
                                      📥 Download
                                    </a>
                                  </div>
                                </div>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteMaterial(material.id)}
                                  className="text-red-600 border-red-600 hover:bg-red-50 ml-4"
                                >
                                  🗑️
                                </Button>
                              </div>
                            </div>
                          ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold mb-2">
                    {searchTerm ? 'No Matching Files' : 'No Files Uploaded Yet'}
                  </h3>
                  <p>{searchTerm ? 'Try a different search term' : 'Upload files to your courses to see them here'}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
