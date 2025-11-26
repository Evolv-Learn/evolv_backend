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
      console.log('=== Dashboard: Fetching user profile ===');
      console.log('Current user from store:', user);
      console.log('is_superuser:', user?.is_superuser);
      console.log('is_staff:', user?.is_staff);
      
      // Check if user is superuser or staff first
      if (user?.is_superuser || user?.is_staff) {
        console.log('✅ User is superuser/staff, setting role to Admin');
        setUserRole('Admin');
        setIsLoading(false);
        return;
      }

      console.log('Fetching profile from API...');
      const response = await apiClient.get('/profile/');
      console.log('Profile API response:', response.data);
      
      // Check if the profile response includes is_superuser/is_staff
      if (response.data.is_superuser || response.data.is_staff) {
        console.log('✅ Profile indicates superuser/staff, setting role to Admin');
        setUserRole('Admin');
      } else {
        console.log('User role from profile:', response.data.role);
        setUserRole(response.data.role);
      }
    } catch (error) {
      console.error('❌ Failed to fetch user profile:', error);
      // Check again if user is admin even if profile fetch fails
      if (user?.is_superuser || user?.is_staff) {
        console.log('✅ Setting role to Admin (fallback)');
        setUserRole('Admin');
      } else {
        console.log('⚠️ Defaulting to Student role');
        // Default to Student if profile fetch fails
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

  console.log('Dashboard routing - userRole:', userRole);
  console.log('isAdmin:', isAdmin, 'isInstructor:', isInstructor, 'isStudent:', isStudent);

  // Render appropriate dashboard based on role
  if (isAdmin) {
    console.log('Rendering AdminDashboard');
    return <AdminDashboard />;
  }

  if (isInstructor) {
    console.log('Rendering InstructorDashboard');
    return <InstructorDashboard />;
  }

  console.log('Rendering StudentDashboard');
  return <StudentDashboard />;
}
