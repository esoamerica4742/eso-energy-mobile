/** Matches server `PENDING_FULFILLMENT_USER_MESSAGE` (eso-pay-api). */
export const PENDING_FULFILLMENT_MESSAGE =
  'Payment Received! The DisCo network is currently undergoing brief maintenance. Your token is safely queued and our system will automatically deliver it via SMS and Push Notification the moment the grid pipes clear.';

export function isPendingFulfillmentStatus(status: string | null | undefined): boolean {
  return status === 'pending_fulfillment';
}
