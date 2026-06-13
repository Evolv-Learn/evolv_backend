'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import apiClient from '@/lib/api/client';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import InstructorDashboard from '@/components/dashboard/InstructorDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

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
      // Check if user is superuser or staff first
      if (user?.is_superuser || user?.is_staff) {
        setUserRole('Admin');
        setIsLoading(false);
        return;
      }

      const response = await apiClient.get('/profile/');

      // Check if the profile response includes is_superuser/is_staff
      if (response.data.is_superuser || response.data.is_staff) {
        setUserRole('Admin');
      } else {
        setUserRole(response.data.role);
      }
    } catch (error) {
      // Check again if user is admin even if profile fetch fails
      if (user?.is_superuser || user?.is_staff) {
        setUserRole('Admin');
      } else {
        setUserRole('Student');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin (staff or superuser)
  const isAdmin = user?.role === 'Admin' || userRole === 'Admin';
  const isInstructor = userRole === 'Instructor';

  // Render appropriate dashboard based on role
  if (isAdmin) {
    return <ErrorBoundary><AdminDashboard /></ErrorBoundary>;
  }

  if (isInstructor) {
    return <ErrorBoundary><InstructorDashboard /></ErrorBoundary>;
  }

  return <ErrorBoundary><StudentDashboard /></ErrorBoundary>;
}
