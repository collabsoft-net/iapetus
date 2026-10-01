
import type { JWTPayload } from 'jose';

export type ForgeRemoteToken = JWTPayload & {
  sessionId?: string;
};
