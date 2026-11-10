import Link from 'next/link';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary-blue text-white pattern-adire">
      <div className="kente-strip"></div>
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-heading font-bold mb-4">EvolvLearn</h3>
            <p className="text-gray-300">
              Research methods training for African scientists. Practical, affordable, and built by someone who understands the journey.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-heading font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/courses" className="text-gray-300 hover:text-primary-gold transition-colors">
                  Programmes
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-300 hover:text-primary-gold transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/payment-policy" className="text-gray-300 hover:text-primary-gold transition-colors">
                  Payment Policy
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-300 hover:text-primary-gold transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-primary-gold transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/alumni" className="text-gray-300 hover:text-primary-gold transition-colors">
                  Alumni
                </Link>
              </li>
              <li>
                <Link href="/admission" className="text-gray-300 hover:text-primary-gold transition-colors">
                  Apply
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-heading font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-primary-gold transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-primary-gold transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-300 hover:text-primary-gold transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-gray-300 hover:text-primary-gold transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-heading font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-300">
              <li>📧 evolvngo@gmail.com</li>
              <li>📍 Marsaskala, Malta</li>
              <li>
                <a
                  href="https://evolvlearn.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-gold transition-colors"
                >
                  Evolvlearn.org
                </a>
              </li>
              <li className="flex gap-4 mt-4">
                <a
                  href="https://www.facebook.com/evolvlearn"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="EvolvLearn on Facebook"
                  className="hover:text-primary-gold transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://x.com/evolvngo"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="EvolvLearn on X"
                  className="hover:text-primary-gold transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.901 2H22l-6.77 7.74L23.2 22h-6.25l-4.9-7.62L5.38 22H2.28l7.24-8.27L1.8 2h6.41l4.43 6.96L18.9 2Zm-1.09 17.86h1.72L7.26 4.03H5.41l12.4 15.83Z"/>
                  </svg>
                </a>
                <a
                  href="https://linkedin.com/company/evolvlearn"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="EvolvLearn on LinkedIn"
                  className="hover:text-primary-gold transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.025-3.037-1.85-3.037-1.851 0-2.134 1.445-2.134 2.939v5.667H9.355V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z"/>
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {currentYear} EvolvLearn. All rights reserved. Built with purpose, from Nigeria to the world 🇳🇬</p>
        </div>
      </div>
    </footer>
  );
};
