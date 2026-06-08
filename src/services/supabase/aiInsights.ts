/**
 * AI Insights service — reads from ai_insights table.
 * This table is populated by a backend ML job (Python / Edge Function).
 * The mobile app consumes results only.
 */
import { supabase } from '@/lib/supabase';
import type { DbAiInsight } from './types';

export interface AiInsight {
  id: string;
  device_id: string;
  type: DbAiInsight['type'];
  score: number;
  message: string;
  recommendation: string | null;
  created_at: string;
  expires_at: string | null;
}

function rowToInsight(r: DbAiInsight): AiInsight {
  return {
    id:             r.id,
    device_id:      r.device_id,
    type:           r.type,
    score:          Number(r.score),
    message:        r.message,
    recommendation: r.recommendation,
    created_at:     r.created_at,
    expires_at:     r.expires_at,
  };
}

export async function fetchAiInsights(
  companyId: string,
  siteDeviceIds?: string[],
  limit = 10,
): Promise<AiInsight[]> {
  let q = supabase
    .from('ai_insights')
    .select('id, device_id, company_id, type, score, message, recommendation, created_at, expires_at')
    .eq('company_id', companyId)
    .order('score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (siteDeviceIds && siteDeviceIds.length > 0) {
    q = q.in('device_id', siteDeviceIds);
  }

  const { data, error } = await q;
  if (error) {
    console.warn('[aiInsights] fetch:', error.message);
    return [];
  }
  return ((data ?? []) as DbAiInsight[]).map(rowToInsight);
}

/** Map insight type to a human label */
export const INSIGHT_LABELS: Record<DbAiInsight['type'], string> = {
  anomaly:            'Anomaly Detected',
  predictive_failure: 'Predictive Failure',
  optimization:       'Optimization',
  efficiency:         'Efficiency Tip',
};

/** Map insight type to severity color category */
export const INSIGHT_SEVERITY: Record<DbAiInsight['type'], 'critical' | 'warning' | 'info'> = {
  anomaly:            'critical',
  predictive_failure: 'warning',
  optimization:       'info',
  efficiency:         'info',
};
