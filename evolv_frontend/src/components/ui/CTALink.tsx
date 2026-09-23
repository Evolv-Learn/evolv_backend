'use client';

import Link from 'next/link';
import { trackCTA, CTAName } from '@/lib/useCTA';

interface CTALinkProps {
  href: string;
  ctaName: CTAName;
  children: React.ReactNode;
  className?: string;
}

/**
 * Drop-in replacement for <Link> on CTA buttons.
 * Fires a background tracking event on click, then navigates normally.
 */
export default function CTALink({ href, ctaName, children, className }: CTALinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackCTA(ctaName)}
    >
      {children}
    </Link>
  );
}
