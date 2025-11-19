import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function CompanyEventsPage() {
  return (
    <main className="min-h-screen bg-warm-white">
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-secondary-blue mb-6">
            Corporate Events
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Host or participate in tech events, workshops, and networking sessions.
          </p>
          
          <div className="space-y-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-2xl font-heading font-bold text-secondary-blue mb-3">
                🎤 Tech Talks & Workshops
              </h3>
              <p className="text-gray-600 mb-4">
                Share your expertise with our students through guest lectures and hands-on workshops.
              </p>
              <Link href="/contact" className="text-primary-gold font-semibold hover:underline">
                Propose a Workshop →
              </Link>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-2xl font-heading font-bold text-secondary-blue mb-3">
                🤝 Networking Events
              </h3>
              <p className="text-gray-600 mb-4">
                Connect with talented students and alumni at our exclusive networking events.
              </p>
              <Link href="/contact" className="text-primary-gold font-semibold hover:underline">
                Join Next Event →
              </Link>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-2xl font-heading font-bold text-secondary-blue mb-3">
                🏆 Hackathons & Competitions
              </h3>
              <p className="text-gray-600 mb-4">
                Sponsor or host hackathons to discover top talent and innovative solutions.
              </p>
              <Link href="/contact" className="text-primary-gold font-semibold hover:underline">
                Sponsor a Hackathon →
              </Link>
            </div>
          </div>

          <div className="text-center">
            <Link href="/contact">
              <Button variant="primary" size="lg">
                Plan an Event
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
