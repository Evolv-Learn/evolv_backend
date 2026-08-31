'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function AlumniPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-secondary-blue to-secondary-blue-dark text-white py-16 pattern-adire relative">
        <div className="kente-strip absolute top-0 left-0 right-0"></div>
        <div className="container mx-auto px-4 text-center">
          <p className="text-primary-gold font-semibold uppercase tracking-wider text-sm mb-3">EvolvLearn Network</p>
          <h1 className="text-5xl font-heading font-bold mb-4">Alumni</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Researchers who completed an EvolvLearn programme and are now doing better science
          </p>
        </div>
      </div>

      {/* Coming Soon body */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto text-center">

          {/* Icon */}
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-primary-gold flex items-center justify-center mx-auto mb-8">
            <svg className="w-9 h-9 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          <h2 className="text-3xl font-heading font-bold text-secondary-blue mb-4">
            Alumni profiles coming soon
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            We are building a directory of researchers who have completed EvolvLearn programmes — their work, institutions, and what they did differently after training.
          </p>
          <p className="text-gray-500 text-base leading-relaxed mb-10">
            If you are an EvolvLearn graduate and want to be featured, reach out to us directly.
          </p>

          <div className="kente-strip mb-10 max-w-xs mx-auto"></div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/courses">
              <Button variant="primary" size="lg">View Our Programmes</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">Get in Touch</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
