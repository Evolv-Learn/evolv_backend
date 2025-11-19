import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function SponsorshipPage() {
  return (
    <main className="min-h-screen bg-warm-white">
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-secondary-blue mb-6">
            Sponsorship Opportunities
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Support tech education and make a lasting impact on future generations.
          </p>
          
          <div className="bg-gradient-to-br from-primary-gold to-primary-gold-dark rounded-xl p-8 text-gray-900 mb-8">
            <h2 className="text-2xl font-heading font-bold mb-4">
              Make a Difference
            </h2>
            <p className="text-lg mb-4">
              Your sponsorship helps provide free tech education to talented individuals who lack access to quality training.
            </p>
            <p className="text-lg">
              Together, we can bridge the digital divide and create opportunities for thousands of aspiring tech professionals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-4xl mb-4">🥉</div>
              <h3 className="text-xl font-heading font-bold text-secondary-blue mb-3">
                Bronze Sponsor
              </h3>
              <p className="text-gray-600 mb-4">Support 10 students</p>
              <p className="text-2xl font-bold text-primary-gold">$5,000</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg text-center border-2 border-primary-gold">
              <div className="text-4xl mb-4">🥈</div>
              <h3 className="text-xl font-heading font-bold text-secondary-blue mb-3">
                Silver Sponsor
              </h3>
              <p className="text-gray-600 mb-4">Support 25 students</p>
              <p className="text-2xl font-bold text-primary-gold">$10,000</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-4xl mb-4">🥇</div>
              <h3 className="text-xl font-heading font-bold text-secondary-blue mb-3">
                Gold Sponsor
              </h3>
              <p className="text-gray-600 mb-4">Support 50+ students</p>
              <p className="text-2xl font-bold text-primary-gold">$25,000+</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-4">
              Sponsor Benefits
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-primary-gold text-xl">✓</span>
                <span>Logo placement on website and marketing materials</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-gold text-xl">✓</span>
                <span>Recognition at events and ceremonies</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-gold text-xl">✓</span>
                <span>Social media shoutouts and press releases</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-gold text-xl">✓</span>
                <span>Tax-deductible contribution</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-gold text-xl">✓</span>
                <span>Impact reports showing your contribution's effect</span>
              </li>
            </ul>
          </div>

          <div className="text-center">
            <Link href="/contact">
              <Button variant="primary" size="lg">
                Become a Sponsor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
