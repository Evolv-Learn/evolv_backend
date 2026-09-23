/**
 * useCTA — lightweight CTA click tracker.
 * Fires a background POST to the backend on every CTA button click.
 * Fails silently so it never breaks the UI.
 */

import apiClient from '@/lib/api/client';

export type CTAName =
  | 'apply_hero'
  | 'view_programmes'
  | 'apply_final_cta'
  | 'ask_question'
  | 'view_all_programmes'
  | 'register_event'
  | 'contact_us'
  | 'login'
  | 'register'
  | 'apply_course'
  | 'other';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('evolvlearn_sid');
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('evolvlearn_sid', sid);
  }
  return sid;
}

export function trackCTA(ctaName: CTAName, page?: string): void {
  const path = page ?? (typeof window !== 'undefined' ? window.location.pathname : '');
  // Fire and forget — never await, never block UI
  apiClient.post('/cta/track/', {
    cta_name: ctaName,
    page: path,
    session_id: getSessionId(),
  }).catch(() => {
    // Silently ignore — tracking must never break the user journey
  });
}
