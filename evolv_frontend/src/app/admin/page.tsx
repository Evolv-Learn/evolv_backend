'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (!user?.is_superuser && !user?.is_staff) {
      router.replace('/dashboard');
      return;
    }
    router.replace('/dashboard');
  }, [isAuthenticated, user, router]);

  return null;
}
