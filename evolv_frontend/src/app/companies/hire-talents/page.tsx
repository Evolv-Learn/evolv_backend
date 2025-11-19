import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function HireTalentsPage() {
  return (
    <main className="min-h-screen bg-warm-white">
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-secondary-blue mb-6">
            Hire Our Talents
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with skilled, job-ready tech professionals from our alumni network.
          </p>
          
          <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-6">
              Why Hire From EvolvLearn?
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-gold rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Pre-vetted Candidates</h3>
                  <p className="text-gray-600">
                    All our graduates have completed rigorous training and assessments.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-gold rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💼</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Industry-Ready Skills</h3>
                  <p className="text-gray-600">
                    Trained in the latest technologies and best practices.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-gold rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🌍</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Diverse Talent Pool</h3>
                  <p className="text-gray-600">
                    Access candidates from over 50 countries worldwide.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-gold rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🤝</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Ongoing Support</h3>
                  <p className="text-gray-600">
                    We provide support during the hiring and onboarding process.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/contact">
              <Button variant="primary" size="lg">
                Post a Job Opening
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
