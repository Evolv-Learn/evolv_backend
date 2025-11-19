import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function ImpactsPage() {
  return (
    <main className="min-h-screen bg-warm-white">
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-secondary-blue mb-6 text-center">
            Our Impact
          </h1>
          <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            Transforming lives and communities through tech education across the globe.
          </p>
          
          {/* Impact Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-5xl font-bold text-primary-gold mb-2">500+</div>
              <div className="text-gray-600 font-medium">Students Trained</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-5xl font-bold text-primary-gold mb-2">50+</div>
              <div className="text-gray-600 font-medium">Countries Reached</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-5xl font-bold text-primary-gold mb-2">95%</div>
              <div className="text-gray-600 font-medium">Success Rate</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-5xl font-bold text-primary-gold mb-2">200+</div>
              <div className="text-gray-600 font-medium">Alumni Employed</div>
            </div>
          </div>

          {/* Impact Stories */}
          <div className="space-y-8 mb-12">
            <div className="bg-gradient-to-br from-secondary-blue to-secondary-blue-dark rounded-xl p-8 text-white">
              <h2 className="text-3xl font-heading font-bold mb-4">
                🎓 Educational Impact
              </h2>
              <p className="text-lg leading-relaxed mb-4">
                We've provided free, high-quality tech education to over 500 students from underserved communities. Our comprehensive curriculum covers in-demand skills like Data Science, Cybersecurity, and Cloud Computing.
              </p>
              <ul className="space-y-2 text-gray-100">
                <li>• 100% of students report increased confidence in tech skills</li>
                <li>• Average skill improvement of 300% after program completion</li>
                <li>• 85% of graduates pursue careers in tech</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h2 className="text-3xl font-heading font-bold text-secondary-blue mb-4">
                💼 Economic Impact
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Our alumni have secured positions at leading tech companies worldwide, with an average salary increase of 250% compared to their pre-program earnings.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="bg-warm-white p-4 rounded-lg">
                  <div className="text-2xl font-bold text-primary-gold mb-1">$2M+</div>
                  <div className="text-sm text-gray-600">Total Alumni Earnings</div>
                </div>
                <div className="bg-warm-white p-4 rounded-lg">
                  <div className="text-2xl font-bold text-primary-gold mb-1">250%</div>
                  <div className="text-sm text-gray-600">Avg. Salary Increase</div>
                </div>
                <div className="bg-warm-white p-4 rounded-lg">
                  <div className="text-2xl font-bold text-primary-gold mb-1">100+</div>
                  <div className="text-sm text-gray-600">Partner Companies</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-gold to-primary-gold-dark rounded-xl p-8 text-gray-900">
              <h2 className="text-3xl font-heading font-bold mb-4">
                🌍 Social Impact
              </h2>
              <p className="text-lg leading-relaxed mb-4">
                Beyond individual success, we're creating ripple effects in communities worldwide. Our graduates become mentors, entrepreneurs, and change-makers in their regions.
              </p>
              <ul className="space-y-2">
                <li>• 60% of alumni mentor others in their communities</li>
                <li>• 30+ tech startups founded by our graduates</li>
                <li>• 15 countries with active alumni chapters</li>
                <li>• 1000+ lives indirectly impacted through alumni initiatives</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h2 className="text-3xl font-heading font-bold text-secondary-blue mb-4">
                🚀 Future Goals
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                We're committed to scaling our impact and reaching even more aspiring tech professionals.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="flex items-start gap-3">
                  <span className="text-primary-gold text-2xl">→</span>
                  <div>
                    <div className="font-bold mb-1">Train 5,000 students by 2026</div>
                    <div className="text-sm text-gray-600">10x growth in the next 2 years</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary-gold text-2xl">→</span>
                  <div>
                    <div className="font-bold mb-1">Expand to 100+ countries</div>
                    <div className="text-sm text-gray-600">Truly global reach</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary-gold text-2xl">→</span>
                  <div>
                    <div className="font-bold mb-1">Launch 10 new courses</div>
                    <div className="text-sm text-gray-600">Covering emerging technologies</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary-gold text-2xl">→</span>
                  <div>
                    <div className="font-bold mb-1">Partner with 500+ companies</div>
                    <div className="text-sm text-gray-600">More opportunities for graduates</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/register">
              <Button variant="primary" size="lg">
                Join Our Impact Story
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
