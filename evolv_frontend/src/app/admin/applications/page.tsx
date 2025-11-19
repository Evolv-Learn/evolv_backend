'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  birth_date: string;
  country_of_birth: string;
  nationality: string;
  diploma_level: string;
  job_status: string;
  english_level: number;
  motivation: string;
  future_goals: string;
  proudest_moment: string;
  how_heard: string;
  has_laptop: boolean;
  courses: any[];
  schedules: any[];
  user: any;
}

export default function AdminApplicationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchStudents();
  }, [isAuthenticated]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/students/');
      setStudents(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (studentId: number) => {
    if (!confirm('Are you sure you want to APPROVE this application?')) {
      return;
    }

    setIsProcessing(true);
    setActionMessage('');

    try {
      // For now, we'll just show a success message
      // In production, you'd call an API endpoint like:
      // await apiClient.post(`/students/${studentId}/approve/`);
      
      setActionMessage('✅ Application approved successfully!');
      
      // Send email notification (to be implemented in backend)
      console.log(`Approved student ID: ${studentId}`);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setSelectedStudent(null);
        setActionMessage('');
        fetchStudents(); // Refresh the list
      }, 2000);
      
    } catch (error) {
      console.error('Failed to approve application:', error);
      setActionMessage('❌ Failed to approve application. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (studentId: number) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    
    if (!confirm('Are you sure you want to REJECT this application?')) {
      return;
    }

    setIsProcessing(true);
    setActionMessage('');

    try {
      // For now, we'll just show a success message
      // In production, you'd call an API endpoint like:
      // await apiClient.post(`/students/${studentId}/reject/`, { reason });
      
      setActionMessage('✅ Application rejected.');
      
      console.log(`Rejected student ID: ${studentId}, Reason: ${reason || 'Not provided'}`);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setSelectedStudent(null);
        setActionMessage('');
        fetchStudents(); // Refresh the list
      }, 2000);
      
    } catch (error) {
      console.error('Failed to reject application:', error);
      setActionMessage('❌ Failed to reject application. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getCountryName = (code: string) => {
    const countries: { [key: string]: string } = {
      'NG': 'Nigeria', 'GH': 'Ghana', 'KE': 'Kenya', 'ZA': 'South Africa',
      'EG': 'Egypt', 'ET': 'Ethiopia', 'TZ': 'Tanzania', 'UG': 'Uganda',
      'GB': 'United Kingdom', 'US': 'United States', 'CA': 'Canada',
      'DE': 'Germany', 'FR': 'France', 'IN': 'India', 'CN': 'China',
      'BR': 'Brazil', 'AU': 'Australia'
    };
    return countries[code] || code;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-white">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-secondary-blue mb-2">
            Student Applications
          </h1>
          <p className="text-gray-600">
            Review and manage student admission applications
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-primary-gold mb-2">{students.length}</div>
            <div className="text-gray-600">Total Applications</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-success mb-2">
              {students.filter(s => s.courses.length > 0).length}
            </div>
            <div className="text-gray-600">With Course Selection</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-secondary-blue mb-2">
              {students.filter(s => s.has_laptop).length}
            </div>
            <div className="text-gray-600">Have Laptop</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-igbo-red mb-2">
              {students.filter(s => s.english_level >= 4).length}
            </div>
            <div className="text-gray-600">High English Level</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
            >
              <option value="all">All Applications</option>
              <option value="laptop">Has Laptop</option>
              <option value="no-laptop">No Laptop</option>
              <option value="high-english">High English (4-5)</option>
            </select>
          </div>
        </div>

        {/* Applications List */}
        <div className="grid gap-6">
          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Applications Found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search criteria' : 'No student applications yet'}
              </p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div key={student.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-heading font-bold text-secondary-blue mb-1">
                          {student.first_name} {student.last_name}
                        </h3>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                          <span>📧 {student.email}</span>
                          <span>📱 {student.phone}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {student.has_laptop && (
                          <span className="bg-success text-white px-3 py-1 rounded-full text-xs font-semibold">
                            💻 Has Laptop
                          </span>
                        )}
                        <span className="bg-primary-gold text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
                          English: {student.english_level}/5
                        </span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                      <div>
                        <strong className="text-gray-700">Gender:</strong> {student.gender}
                      </div>
                      <div>
                        <strong className="text-gray-700">Age:</strong> {new Date().getFullYear() - new Date(student.birth_date).getFullYear()} years
                      </div>
                      <div>
                        <strong className="text-gray-700">Country:</strong> {getCountryName(student.country_of_birth)}
                      </div>
                      <div>
                        <strong className="text-gray-700">Education:</strong> {student.diploma_level}
                      </div>
                      <div>
                        <strong className="text-gray-700">Job Status:</strong> {student.job_status}
                      </div>
                      <div>
                        <strong className="text-gray-700">How Heard:</strong> {student.how_heard}
                      </div>
                    </div>

                    {student.courses && student.courses.length > 0 && (
                      <div className="mb-4">
                        <strong className="text-gray-700 text-sm">Selected Courses:</strong>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {student.courses.map((course: string, idx: number) => (
                            <span key={idx} className="bg-secondary-blue text-white px-3 py-1 rounded-full text-xs">
                              {course}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-4 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedStudent(student)}
                      >
                        View Full Application →
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <h2 className="text-2xl font-heading font-bold text-secondary-blue">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </h2>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Personal Info */}
                <div>
                  <h3 className="text-lg font-bold text-secondary-blue mb-3">Personal Information</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm bg-warm-white p-4 rounded-lg">
                    <div><strong>Email:</strong> {selectedStudent.email}</div>
                    <div><strong>Phone:</strong> {selectedStudent.phone}</div>
                    <div><strong>Gender:</strong> {selectedStudent.gender}</div>
                    <div><strong>Date of Birth:</strong> {selectedStudent.birth_date}</div>
                    <div><strong>Country:</strong> {getCountryName(selectedStudent.country_of_birth)}</div>
                    <div><strong>Nationality:</strong> {getCountryName(selectedStudent.nationality)}</div>
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h3 className="text-lg font-bold text-secondary-blue mb-3">Education & Background</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm bg-warm-white p-4 rounded-lg">
                    <div><strong>Education Level:</strong> {selectedStudent.diploma_level}</div>
                    <div><strong>Job Status:</strong> {selectedStudent.job_status}</div>
                    <div><strong>English Level:</strong> {selectedStudent.english_level}/5</div>
                    <div><strong>Has Laptop:</strong> {selectedStudent.has_laptop ? 'Yes ✓' : 'No ✗'}</div>
                  </div>
                </div>

                {/* Motivation */}
                <div>
                  <h3 className="text-lg font-bold text-secondary-blue mb-3">Motivation & Goals</h3>
                  <div className="space-y-3 text-sm bg-warm-white p-4 rounded-lg">
                    <div>
                      <strong className="block mb-1">Why join EvolvLearn:</strong>
                      <p className="text-gray-700">{selectedStudent.motivation}</p>
                    </div>
                    <div>
                      <strong className="block mb-1">Future Goals:</strong>
                      <p className="text-gray-700">{selectedStudent.future_goals}</p>
                    </div>
                    <div>
                      <strong className="block mb-1">Proudest Achievement:</strong>
                      <p className="text-gray-700">{selectedStudent.proudest_moment}</p>
                    </div>
                    <div>
                      <strong>How they heard about us:</strong> {selectedStudent.how_heard}
                    </div>
                  </div>
                </div>

                {/* Courses */}
                {selectedStudent.courses && selectedStudent.courses.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-secondary-blue mb-3">Selected Courses</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.courses.map((course: string, idx: number) => (
                        <span key={idx} className="bg-primary-gold text-gray-900 px-4 py-2 rounded-lg font-medium">
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Message */}
                {actionMessage && (
                  <div className={`p-4 rounded-lg text-center font-semibold ${
                    actionMessage.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {actionMessage}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t">
                  <Button 
                    type="button"
                    variant="primary" 
                    className="flex-1"
                    onClick={() => handleApprove(selectedStudent.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? '⏳ Processing...' : '✓ Approve Application'}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                    onClick={() => handleReject(selectedStudent.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? '⏳ Processing...' : '✗ Reject Application'}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setSelectedStudent(null)}
                    disabled={isProcessing}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
