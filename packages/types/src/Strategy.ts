
import * as express from 'express';
import * as passport from 'passport';

export interface Strategy {
  name: string;
  options: passport.AuthenticateOptions;
  strategy: passport.Strategy;
  next: express.RequestHandler;
}