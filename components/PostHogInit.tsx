'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

/**
 * Mesure d'audience PostHog (région EU, projet « Sites de Théo »), servie par
 * le relais `/ingest` de next.config.mjs (les bloqueurs de pub ne la coupent pas).
 *
 * - `persistence: 'memory'` : aucun cookie, rien d'écrit dans le navigateur,
 *   donc pas de bandeau de consentement. Contrepartie : un rechargement
 *   complet de la page repart avec un nouvel identifiant anonyme (la
 *   navigation interne de Next, elle, garde la même session).
 * - `?ref=prenom` dans l'URL (liens envoyés à une personne précise) : la
 *   visite est rattachée à cette personne dans PostHog (`ref:prenom`).
 * - Replays de sessions avec toutes les saisies masquées.
 * - Sans `NEXT_PUBLIC_POSTHOG_KEY` (en local par exemple), rien n'est chargé.
 */
export function PostHogInit() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || posthog.__loaded) return;

    posthog.init(key, {
      api_host: '/ingest',
      ui_host: 'https://eu.posthog.com',
      persistence: 'memory',
      person_profiles: 'identified_only',
      capture_pageview: 'history_change',
      capture_pageleave: true,
      session_recording: { maskAllInputs: true },
    });

    const ref = new URLSearchParams(window.location.search).get('ref')?.trim().toLowerCase();
    if (ref) {
      posthog.identify(`ref:${ref}`, { name: ref, ref });
      posthog.register({ ref });
    }
  }, []);

  return null;
}
