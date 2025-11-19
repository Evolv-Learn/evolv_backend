import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function TrainStaffPage() {
  return (
    <main className="min-h-screen bg-warm-white">
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-secondary-blue mb-6">
            Train Your Staff
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Upskill and reskill your team with our customized corporate training programs.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-heading font-bold text-secondary-blue mb-3">
                Custom Curriculum
              </h3>
              <p className="text-gray-600">
                Tailored training programs designed to meet your organization's specific needs.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">👨‍🏫</div>
              <h3 className="text-xl font-heading font-bold text-secondary-blue mb-3">
                Expert Instructors
              </h3>
              <p className="text-gray-600">
                Learn from industry professionals with real-world experience.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-heading font-bold text-secondary-blue mb-3">
                Flexible Schedule
              </h3>
              <p className="text-gray-600">
                Training sessions that fit your team's availability and workflow.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-heading font-bold text-secondary-blue mb-3">
                Progress Tracking
              </h3>
              <p className="text-gray-600">
                Monitor your team's learning progress with detailed analytics.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/contact">
              <Button variant="primary" size="lg">
                Request a Quote
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
