import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function BecomePartnerPage() {
  return (
    <main className="min-h-screen bg-warm-white">
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-secondary-blue mb-6">
            Become a Partner
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Partner with EvolvLearn to empower the next generation of tech talent.
          </p>
          
          <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-4">
              Partnership Benefits
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-primary-gold text-xl">✓</span>
                <span>Access to a diverse pool of trained tech talent</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-gold text-xl">✓</span>
                <span>Brand visibility and recognition in the tech education space</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-gold text-xl">✓</span>
                <span>Opportunity to shape curriculum and training programs</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-gold text-xl">✓</span>
                <span>Corporate social responsibility impact</span>
              </li>
            </ul>
          </div>

          <div className="text-center">
            <Link href="/contact">
              <Button variant="primary" size="lg">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
