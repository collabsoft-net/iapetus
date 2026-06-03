
import type { JWTPayload } from 'jose';

export interface ForgeRemoteToken extends JWTPayload {
  appSystemTokenKey?: string;
}
