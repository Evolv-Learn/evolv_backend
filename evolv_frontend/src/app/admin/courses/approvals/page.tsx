'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Course {
  id: number;
  name: string;
  category: string;
  description: string;
  instructor: string;
  instructor_id: number;
  approval_status: string;
  rejection_reason?: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  created_at: string;
}

export default function CourseApprovalsPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('Pending');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Handle both paginated and non-paginated responses
        const coursesList = data.results || data;
        
        // Map courses to include approval_status (default to 'Pending' - awaiting admin review)
        const coursesWithStatus = coursesList.map((course: any) => ({
          ...course,
          approval_status: course.approval_status || 'Pending',
          instructor: course.instructor_name || course.instructor || 'Not assigned',
          instructor_id: course.instructor_id || course.instructor,
        }));
        
        setCourses(coursesWithStatus);
      } else {
        console.error('Failed to fetch courses:', response.status);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCourse = async (courseId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}/approve/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        alert('Course approved successfully!');
        fetchCourses();
      } else {
        alert('Failed to approve course');
      }
    } catch (error) {
      console.error('Error approving course:', error);
      alert('Error approving course');
    }
  };

  const handleRejectCourse = async () => {
    if (!selectedCourse || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${selectedCourse.id}/reject/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ rejection_reason: rejectionReason }),
        }
      );

      if (response.ok) {
        alert('Course rejected successfully!');
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedCourse(null);
        fetchCourses();
      } else {
        alert('Failed to reject course');
      }
    } catch (error) {
      console.error('Error rejecting course:', error);
      alert('Error rejecting course');
    }
  };

  const filteredCourses = filter === 'All' 
    ? courses 
    : courses.filter(course => course.approval_status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <span className="text-xl">←</span>
          <span className="font-medium">Back to Dashboard</span>
        </button>
        <h1 className="text-3xl font-bold mb-2">Course Approvals</h1>
        <p className="text-gray-600">Review and approve courses created by instructors</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 border-b">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('All')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              filter === 'All'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Courses ({courses.length})
          </button>
          {['Pending', 'Approved', 'Rejected', 'Draft'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                filter === status
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {status} ({courses.filter(c => c.approval_status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-500 text-lg mb-2">
              {filter === 'All' ? 'No courses found' : `No courses with status: ${filter}`}
            </p>
            <p className="text-sm text-gray-400">
              {filter === 'All' 
                ? 'Create your first course to get started' 
                : 'Try selecting a different filter'}
            </p>
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div key={course.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{course.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(course.approval_status)}`}>
                      {course.approval_status}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 mb-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">📂 Category:</span> {course.category}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">👨‍🏫 Instructor:</span> {course.instructor || 'Not assigned'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">📅 Created:</span> {new Date(course.created_at).toLocaleDateString()}
                    </p>
                    {course.start_date && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">🚀 Starts:</span> {new Date(course.start_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <p className="text-gray-700 mb-3 line-clamp-2">{course.description}</p>
                  
                  {course.software_tools && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">🛠️ Tools:</span> {course.software_tools}
                    </p>
                  )}
                  
                  {course.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                      <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                      <p className="text-sm text-red-700">{course.rejection_reason}</p>
                    </div>
                  )}
                  
                  {course.reviewed_by_name && course.reviewed_at && (
                    <p className="text-xs text-gray-500">
                      Reviewed by {course.reviewed_by_name} on {new Date(course.reviewed_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/courses/${course.id}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => router.push(`/instructor/courses/${course.id}/edit`)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Edit Course
                </button>
                
                {course.approval_status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleApproveCourse(course.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowRejectModal(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      ✗ Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Reject Course</h2>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting "{selectedCourse.name}"
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full border rounded p-3 mb-4 min-h-[120px]"
              placeholder="Explain what needs to be improved..."
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedCourse(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectCourse}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reject Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
