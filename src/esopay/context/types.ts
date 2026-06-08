/** Eso Pay host contract — parent app session surface (spec §2.2). */



export type EsoPayUserRole = 'owner' | 'admin' | 'viewer';



export type EsoPayHostContextValue = {

  /** Supabase JWT access token — opaque to Eso Pay. Empty when signed out. */

  authToken: string;

  refreshAuthToken: () => Promise<string>;

  ensureAuthSession: () => Promise<string>;

  /**

   * Wallet partition key sent to the BFF (authenticated user id).

   * Named `companyId` for historical query-key compatibility.

   */

  companyId: string;

  userId: string;

  userRole: EsoPayUserRole;

  /** Enode inverter IDs when linked to monitoring (optional). */

  activeInverterIds: string[];

  onSessionExpired: () => void;

  /** True when token and user id are present for authenticated API calls. */

  isReady: boolean;

  /** @deprecated Individual Eso Pay no longer requires a company profile link. */

  companyLinkMissing: boolean;

  /** @deprecated */

  profileLoading: boolean;

};



export type EsoPayHostCredentials = Pick<
  EsoPayHostContextValue,
  'authToken' | 'companyId' | 'refreshAuthToken' | 'onSessionExpired'
> & {
  /** Restores JWT from device storage before a BFF call when the token is empty. */
  ensureAuthSession?: () => Promise<string>;
};

