'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LearningMaterialsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/materials');
  }, [router]);

  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center">
      <p className="text-gray-600">Opening your learning materials…</p>
    </div>
  );
}
