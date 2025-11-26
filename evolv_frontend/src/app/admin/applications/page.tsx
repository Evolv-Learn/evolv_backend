'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';

interface Enrollment {
  id: number;
  student: {
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
  };
  course: {
    id: number;
    name: string;
    category: string;
  };
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  applied_at: string;
  updated_at: string;
}

export default function AdminApplicationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchEnrollments();
  }, [isAuthenticated]);

  const fetchEnrollments = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/enrollments/');
      setEnrollments(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (enrollmentId: number) => {
    if (!confirm('Are you sure you want to APPROVE this application?')) {
      return;
    }

    setIsProcessing(true);
    setActionMessage('');

    try {
      await apiClient.patch(`/enrollments/${enrollmentId}/`, { status: 'Approved' });
      
      setActionMessage('✅ Application approved successfully!');
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setSelectedEnrollment(null);
        setActionMessage('');
        fetchEnrollments(); // Refresh the list
      }, 2000);
      
    } catch (error) {
      console.error('Failed to approve application:', error);
      setActionMessage('❌ Failed to approve application. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (enrollmentId: number) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    
    if (!confirm('Are you sure you want to REJECT this application?')) {
      return;
    }

    setIsProcessing(true);
    setActionMessage('');

    try {
      await apiClient.patch(`/enrollments/${enrollmentId}/`, { status: 'Rejected' });
      
      setActionMessage('✅ Application rejected.');
      
      console.log(`Rejected enrollment ID: ${enrollmentId}, Reason: ${reason || 'Not provided'}`);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setSelectedEnrollment(null);
        setActionMessage('');
        fetchEnrollments(); // Refresh the list
      }, 2000);
      
    } catch (error) {
      console.error('Failed to reject application:', error);
      setActionMessage('❌ Failed to reject application. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = 
      enrollment.student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.course.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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
            <div className="text-3xl font-bold text-primary-gold mb-2">{enrollments.length}</div>
            <div className="text-gray-600">Total Applications</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-yoruba-green mb-2">
              {enrollments.filter(e => e.status === 'Pending').length}
            </div>
            <div className="text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-success mb-2">
              {enrollments.filter(e => e.status === 'Approved').length}
            </div>
            <div className="text-gray-600">Approved</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-igbo-red mb-2">
              {enrollments.filter(e => e.status === 'Rejected').length}
            </div>
            <div className="text-gray-600">Rejected</div>
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Applications List */}
        <div className="grid gap-6">
          {filteredEnrollments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Applications Found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search criteria' : 'No student applications yet'}
              </p>
            </div>
          ) : (
            filteredEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-heading font-bold text-secondary-blue mb-1">
                          {enrollment.student.first_name} {enrollment.student.last_name}
                        </h3>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                          <span>📧 {enrollment.student.email}</span>
                          <span>📱 {enrollment.student.phone}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          enrollment.status === 'Approved' ? 'bg-success text-white' :
                          enrollment.status === 'Rejected' ? 'bg-igbo-red text-white' :
                          enrollment.status === 'Under Review' ? 'bg-secondary-blue text-white' :
                          'bg-yoruba-green text-white'
                        }`}>
                          {enrollment.status}
                        </span>
                        {enrollment.student.has_laptop && (
                          <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                            💻 Has Laptop
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="bg-warm-white rounded-lg p-3">
                        <strong className="text-gray-700">Applied for:</strong>
                        <div className="text-lg font-semibold text-secondary-blue mt-1">
                          {enrollment.course.name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Category: {enrollment.course.category}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                      <div>
                        <strong className="text-gray-700">Gender:</strong> {enrollment.student.gender}
                      </div>
                      <div>
                        <strong className="text-gray-700">Age:</strong> {new Date().getFullYear() - new Date(enrollment.student.birth_date).getFullYear()} years
                      </div>
                      <div>
                        <strong className="text-gray-700">Country:</strong> {getCountryName(enrollment.student.country_of_birth)}
                      </div>
                      <div>
                        <strong className="text-gray-700">Education:</strong> {enrollment.student.diploma_level}
                      </div>
                      <div>
                        <strong className="text-gray-700">Job Status:</strong> {enrollment.student.job_status}
                      </div>
                      <div>
                        <strong className="text-gray-700">English:</strong> {enrollment.student.english_level}/5
                      </div>
                    </div>

                    <div className="flex gap-2 border-t pt-4 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEnrollment(enrollment)}
                      >
                        View Full Application →
                      </Button>
                      {enrollment.status === 'Pending' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(enrollment.id)}
                            disabled={isProcessing}
                          >
                            ✓ Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(enrollment.id)}
                            disabled={isProcessing}
                            className="text-igbo-red border-igbo-red hover:bg-igbo-red hover:text-white"
                          >
                            ✗ Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Modal */}
        {selectedEnrollment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-secondary-blue">
                    {selectedEnrollment.student.first_name} {selectedEnrollment.student.last_name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Applied for: <span className="font-semibold">{selectedEnrollment.course.name}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEnrollment(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Application Status */}
                <div>
                  <h3 className="text-lg font-bold text-secondary-blue mb-3">Application Status</h3>
                  <div className="bg-warm-white p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600">Current Status</div>
                        <div className={`text-xl font-bold mt-1 ${
                          selectedEnrollment.status === 'Approved' ? 'text-success' :
                          selectedEnrollment.status === 'Rejected' ? 'text-igbo-red' :
                          'text-yoruba-green'
                        }`}>
                          {selectedEnrollment.status}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Applied</div>
                        <div className="text-sm font-semibold mt-1">
                          {new Date(selectedEnrollment.applied_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Info */}
                <div>
                  <h3 className="text-lg font-bold text-secondary-blue mb-3">Personal Information</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm bg-warm-white p-4 rounded-lg">
                    <div><strong>Email:</strong> {selectedEnrollment.student.email}</div>
                    <div><strong>Phone:</strong> {selectedEnrollment.student.phone}</div>
                    <div><strong>Gender:</strong> {selectedEnrollment.student.gender}</div>
                    <div><strong>Date of Birth:</strong> {selectedEnrollment.student.birth_date}</div>
                    <div><strong>Country:</strong> {getCountryName(selectedEnrollment.student.country_of_birth)}</div>
                    <div><strong>Nationality:</strong> {getCountryName(selectedEnrollment.student.nationality)}</div>
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h3 className="text-lg font-bold text-secondary-blue mb-3">Education & Background</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm bg-warm-white p-4 rounded-lg">
                    <div><strong>Education Level:</strong> {selectedEnrollment.student.diploma_level}</div>
                    <div><strong>Job Status:</strong> {selectedEnrollment.student.job_status}</div>
                    <div><strong>English Level:</strong> {selectedEnrollment.student.english_level}/5</div>
                    <div><strong>Has Laptop:</strong> {selectedEnrollment.student.has_laptop ? 'Yes ✓' : 'No ✗'}</div>
                  </div>
                </div>

                {/* Motivation */}
                <div>
                  <h3 className="text-lg font-bold text-secondary-blue mb-3">Motivation & Goals</h3>
                  <div className="space-y-3 text-sm bg-warm-white p-4 rounded-lg">
                    <div>
                      <strong className="block mb-1">Why join EvolvLearn:</strong>
                      <p className="text-gray-700">{selectedEnrollment.student.motivation}</p>
                    </div>
                    <div>
                      <strong className="block mb-1">Future Goals:</strong>
                      <p className="text-gray-700">{selectedEnrollment.student.future_goals}</p>
                    </div>
                    <div>
                      <strong className="block mb-1">Proudest Achievement:</strong>
                      <p className="text-gray-700">{selectedEnrollment.student.proudest_moment}</p>
                    </div>
                    <div>
                      <strong>How they heard about us:</strong> {selectedEnrollment.student.how_heard}
                    </div>
                  </div>
                </div>

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
                  {selectedEnrollment.status === 'Pending' && (
                    <>
                      <Button 
                        type="button"
                        variant="primary" 
                        className="flex-1"
                        onClick={() => handleApprove(selectedEnrollment.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? '⏳ Processing...' : '✓ Approve Application'}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline" 
                        className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                        onClick={() => handleReject(selectedEnrollment.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? '⏳ Processing...' : '✗ Reject Application'}
                      </Button>
                    </>
                  )}
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setSelectedEnrollment(null)}
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
