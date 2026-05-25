'use client';

interface Experiment {
  id: string;
  variants: string[];
  weights?: number[];
}

const EXPERIMENTS: Experiment[] = [
  {
    id: 'landing_cta',
    variants: ['ape_in', 'start_earning', 'join_army'],
    weights: [0.5, 0.25, 0.25],
  },
  {
    id: 'onboarding_flow',
    variants: ['short', 'full'],
    weights: [0.5, 0.5],
  },
  {
    id: 'spin_wheel_position',
    variants: ['tab', 'floating'],
    weights: [0.7, 0.3],
  },
];

function getStorageKey(experimentId: string): string {
  return `ab_${experimentId}`;
}

function selectVariant(experiment: Experiment): string {
  const weights = experiment.weights || experiment.variants.map(() => 1 / experiment.variants.length);
  const random = Math.random();
  let cumulative = 0;

  for (let i = 0; i < experiment.variants.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      return experiment.variants[i];
    }
  }

  return experiment.variants[experiment.variants.length - 1];
}

export function getVariant(experimentId: string): string {
  if (typeof window === 'undefined') return '';

  const storageKey = getStorageKey(experimentId);
  const stored = localStorage.getItem(storageKey);
  if (stored) return stored;

  const experiment = EXPERIMENTS.find(e => e.id === experimentId);
  if (!experiment) return '';

  const variant = selectVariant(experiment);
  localStorage.setItem(storageKey, variant);

  // Track assignment
  trackExperiment(experimentId, variant, 'assigned');

  return variant;
}

export function trackExperiment(experimentId: string, variant: string, event: string, metadata?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  const posthog = (window as unknown as Record<string, unknown>).posthog as {
    capture?: (event: string, properties: Record<string, unknown>) => void;
  } | undefined;

  if (posthog?.capture) {
    posthog.capture(`experiment_${event}`, {
      experiment_id: experimentId,
      variant,
      ...metadata,
    });
  }
}

export function useExperiment(experimentId: string): { variant: string; track: (event: string, metadata?: Record<string, unknown>) => void } {
  const variant = typeof window !== 'undefined' ? getVariant(experimentId) : '';

  const track = (event: string, metadata?: Record<string, unknown>) => {
    trackExperiment(experimentId, variant, event, metadata);
  };

  return { variant, track };
}
