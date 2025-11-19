import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function ValuesPage() {
  return (
    <main className="min-h-screen bg-warm-white">
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-secondary-blue mb-6">
            Our Values
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            The principles that guide everything we do at EvolvLearn.
          </p>
          
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-primary-gold rounded-full flex items-center justify-center flex-shrink-0 text-3xl">
                  🌍
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">
                    Accessibility
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    We believe quality tech education should be accessible to everyone, regardless of their background, location, or financial situation. We break down barriers and create opportunities for all.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-igbo-red rounded-full flex items-center justify-center flex-shrink-0 text-3xl">
                  🎯
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">
                    Excellence
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    We are committed to delivering world-class education and training. Our curriculum is constantly updated to reflect industry standards and emerging technologies.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center flex-shrink-0 text-3xl">
                  🤝
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">
                    Community
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    We foster a supportive, inclusive community where learners can connect, collaborate, and grow together. Our global network is our greatest strength.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-hausa-indigo rounded-full flex items-center justify-center flex-shrink-0 text-3xl">
                  💡
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">
                    Innovation
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    We embrace new technologies and teaching methods to provide the most effective learning experience. Innovation drives our curriculum and approach.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-yoruba-green rounded-full flex items-center justify-center flex-shrink-0 text-3xl">
                  🌱
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">
                    Empowerment
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    We empower individuals to take control of their future through education. Our goal is to equip learners with skills that transform lives and communities.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-secondary-blue rounded-full flex items-center justify-center flex-shrink-0 text-3xl">
                  ⚖️
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">
                    Integrity
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    We operate with transparency, honesty, and accountability in all our interactions. Trust is the foundation of our relationships with students and partners.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/about">
              <Button variant="outline" size="lg">
                Learn More About Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
