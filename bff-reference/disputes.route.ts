/**
 * Reference handlers for eso-pay-api dispute tickets.
 *
 * GET  /disputes?limit=20
 * POST /disputes  { dispute_type, payment_reference?, details }
 * GET  /disputes/:id
 *
 * Mobile: src/esopay/api/client.ts → disputes.*
 */

export type EsoPayDisputeType = 'payment' | 'wallet' | 'other';
export type EsoPayDisputeStatus = 'open' | 'investigating' | 'resolved' | 'closed';

export type EsoPayDisputeTicket = {
  id: string;
  ticket_ref: string;
  dispute_type: EsoPayDisputeType;
  payment_reference: string | null;
  details: string;
  status: EsoPayDisputeStatus;
  created_at: string;
  updated_at: string;
};
