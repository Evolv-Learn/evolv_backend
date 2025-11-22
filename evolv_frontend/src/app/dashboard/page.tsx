'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import apiClient from '@/lib/api/client';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import InstructorDashboard from '@/components/dashboard/InstructorDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchUserProfile();
  }, [isAuthenticated]);

  const fetchUserProfile = async () => {
    try {
      const response = await apiClient.get('/profile/me/');
      setUserRole(response.data.role);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Default to Student if profile fetch fails
      setUserRole('Student');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-white">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin (staff or superuser)
  const isAdmin = user?.role === 'Admin' || userRole === 'Admin';
  const isInstructor = userRole === 'Instructor';
  const isStudent = userRole === 'Student' || userRole === 'Alumni';

  // Render appropriate dashboard based on role
  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (isInstructor) {
    return <InstructorDashboard />;
  }

  return <StudentDashboard />;
}
