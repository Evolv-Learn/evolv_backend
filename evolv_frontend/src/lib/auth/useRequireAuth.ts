'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useRequireAuth(redirectTo = '/login') {
  const router = useRouter();
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      router.replace(redirectTo);
      return;
    }

    const timeout = setTimeout(() => setIsAuthReady(true), 0);
    return () => clearTimeout(timeout);
  }, [redirectTo, router]);

  return isAuthReady;
}
