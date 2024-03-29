import { AsymmetricAlgorithm, decodeAsymmetric, getKeyId } from 'atlassian-jwt';
import axios from 'axios';
import * as express from 'express';
import { logger } from 'firebase-functions';
import { ExtractJwt, JwtFromRequestFunction } from 'passport-jwt';

export const isSignedByAtlassian = (baseUrl: string, extractor: JwtFromRequestFunction = ExtractJwt.fromAuthHeaderWithScheme('JWT')) =>
  async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
    try {
      // Get JWT token from request
      const token = extractor(req);
      if (!token) throw new Error('Could not verify JWT, unauthorized access not allowed');

      // Retrieve public key ID from JWT header
      const kid = getKeyId(token);
      if (!kid) throw new Error('Could not verify JWT, unauthorized access not allowed');

      // Fetch public key from Atlassian public key repository based on KID
      const { data: publicKey } = await axios.get(`https://connect-install-keys.atlassian.com/${kid}`);
      if (!publicKey|| !(typeof publicKey === 'string')) throw new Error('Could not find verify JWT, matching public key not found');

      // Verify JWT token using public key, expiration date and audience claim
      const { aud, exp }: Atlassian.JWT = decodeAsymmetric(token, publicKey, AsymmetricAlgorithm.RS256) || {};
      if (!exp || (exp * 1000) < new Date().getTime()) throw new Error(`Could not verify JWT, the token has expired (${exp * 1000} < ${new Date().getTime()})`);

      const validAudienceClaim = Array.isArray(aud) ? aud.includes(baseUrl) : aud === baseUrl;
      if (!validAudienceClaim) throw new Error(`Could not verify JWT, base URL ${baseUrl} does not match audience claim ${aud}`);

      // If we haven't run into errors at this point, we're good
      next();
    } catch (error) {
      logger.warn(`Failed to verify Atlassian public key signature`, error);
      res.status(403).send('Unauthorized!');
    }
  };