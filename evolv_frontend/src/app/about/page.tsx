'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { aboutApi } from '@/lib/api/courses';
import Link from 'next/link';

interface AboutData {
  title: string;
  description: string;
  mission: string;
  vision: string;
  image?: string;
}

export default function AboutPage() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const data = await aboutApi.get();
      setAboutData(data);
    } catch (error) {
      console.error('Failed to fetch about data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const coreValues = [
    {
      title: 'Rigour',
      description: 'We train researchers to ask the right questions and use the right methods, not just to produce results, but to produce results that hold up.',
      color: 'border-primary-gold',
      accent: 'text-primary-gold',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
      ),
    },
    {
      title: 'Accessibility',
      description: 'Geography and income should never stop a good researcher from learning. We design our pricing and delivery with African researchers in mind.',
      color: 'border-igbo-red',
      accent: 'text-igbo-red',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      ),
    },
    {
      title: 'Community',
      description: 'Research can be lonely. We build cohorts so that students learn together, support each other, and stay connected long after the course ends.',
      color: 'border-success',
      accent: 'text-success',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      ),
    },
    {
      title: 'Integrity',
      description: 'We say what we mean. Real numbers, honest teaching, and no shortcuts. If we do not know something, we say so.',
      color: 'border-hausa-indigo',
      accent: 'text-hausa-indigo',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
      ),
    },
  ];

  const teamMembers = [
    { 
      name: 'Moshood Owolabi', 
      role: 'Founder & R / Statistics Instructor', 
      image: '/images/team/moshood-working.jpeg',
      bio: 'A Nigerian researcher based in Europe, Moshood started EvolvLearn because he saw how many talented African scientists were held back not by intelligence, but by access to proper research methods training. He teaches every cohort himself and is committed to keeping the quality personal.',
    },
    {
      name: 'Ridwan Alade',
      role: 'QGIS & Spatial Analysis Tutor',
      image: '/images/team/ridwan.jpeg',
      bio: 'Based in Nigeria, Ridwan is a videographer with deep expertise in QGIS and spatial analysis. He brings both technical precision and visual storytelling to every lesson — making maps and spatial thinking accessible and practical for field researchers.',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary-blue to-secondary-blue-dark text-white py-20 pattern-adire relative">
        <div className="kente-strip absolute top-0 left-0 right-0"></div>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-heading font-bold mb-4">
            {aboutData?.title || 'About EvolvLearn'}
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            {aboutData?.description || 'Research methods training built from honest experience'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          {/* Mission */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-primary-gold">
            <h2 className="text-3xl font-heading font-bold text-secondary-blue mb-4">
              Our Mission
            </h2>
            <div className="kente-strip mb-4"></div>
            <p className="text-gray-700 text-lg leading-relaxed">
              {aboutData?.mission || 'To make high-quality, practical research methods training accessible to students and scientists across Africa, starting with the tools most needed for quantitative research and growing from there.'}
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-igbo-red">
            <h2 className="text-3xl font-heading font-bold text-secondary-blue mb-4">
              Our Vision
            </h2>
            <div className="kente-strip mb-4"></div>
            <p className="text-gray-700 text-lg leading-relaxed">
              {aboutData?.vision || 'A future where every researcher in Africa has access to the methodological training they need to produce rigorous, credible, and world-class science, regardless of where they study or how much they earn.'}
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-secondary-blue mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              These principles guide everything we do at EvolvLearn
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((value, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow border-t-4 ${value.color}`}
              >
                <div className={`mb-4 ${value.accent}`}>
                  {value.icon}
                </div>
                <h3 className="text-xl font-heading font-bold text-secondary-blue mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-secondary-blue mb-4">
              The Teaching Team
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Every tutor at EvolvLearn is an active researcher or practitioner who teaches because they care, not because it is their job title
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-heading font-bold text-secondary-blue mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary-gold font-semibold text-sm mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-secondary-blue to-secondary-blue-dark text-white rounded-2xl p-12 mb-20 pattern-adire">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '30+', label: 'Researchers Trained' },
              { number: '2', label: 'Cohorts Completed' },
              { number: '3', label: 'Nigerian States Reached' },
              { number: '11', label: 'Course Modules' },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-5xl font-bold text-primary-gold mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-200">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg shadow-lg p-12">
          <h2 className="text-3xl font-heading font-bold text-secondary-blue mb-4">
            Ready to Join the Next Cohort?
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Applications for the next R for Quantitative Research cohort are open. Spots are limited.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/admission">
              <Button variant="primary" size="lg">
                Apply Now
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" size="lg">
                View Programmes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
