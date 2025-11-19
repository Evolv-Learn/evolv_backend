'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';

export default function MaterialsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const isApproved = false; // This will come from API later

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="kente-strip mb-6"></div>
          
          <h1 className="text-3xl font-heading font-bold text-secondary-blue mb-6">
            Learning Materials
          </h1>

          {!isApproved ? (
            // Locked State
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-heading font-bold mb-4">
                Access Pending
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Complete your application and get approved to access our exclusive learning materials including GitHub repositories, Discord community, and video tutorials.
              </p>
              <Button variant="primary" onClick={() => router.push('/dashboard/apply')}>
                Complete Application
              </Button>
            </div>
          ) : (
            // Approved State
            <div className="space-y-6">
              {/* GitHub */}
              <div className="border-l-4 border-primary-gold bg-gray-50 p-6 rounded-r-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-heading font-bold mb-2">GitHub Repository</h3>
                    <p className="text-gray-600 mb-4">
                      Access course code, projects, and resources
                    </p>
                    <a href="https://github.com/your-org/learning-materials" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline">
                        Open GitHub →
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* Discord */}
              <div className="border-l-4 border-igbo-red bg-gray-50 p-6 rounded-r-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💬</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-heading font-bold mb-2">Discord Community</h3>
                    <p className="text-gray-600 mb-4">
                      Join our community and get support from instructors and peers
                    </p>
                    <a href="https://discord.gg/your-invite" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline">
                        Join Discord →
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* Video Materials */}
              <div className="border-l-4 border-success bg-gray-50 p-6 rounded-r-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🎥</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-heading font-bold mb-2">Video Tutorials</h3>
                    <p className="text-gray-600 mb-4">
                      Watch comprehensive video lectures and tutorials
                    </p>
                    <a href="https://youtube.com/playlist/your-playlist" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline">
                        Watch Videos →
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
