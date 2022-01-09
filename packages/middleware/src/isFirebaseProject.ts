
import * as express from 'express';

export const isFirebaseProject = (projectId: string|Array<string>): (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void> => {
  const allowedIds = Array.isArray(projectId) ? projectId : [ projectId ];
  const firebaseProjectId = getFirebaseProject();

  return async (_req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
    if (firebaseProjectId && allowedIds.includes(firebaseProjectId)) {
      next();
    } else {
      res.status(403).send('Unauthorized!');
    }
  }
}

const getFirebaseProject = (): string|null|undefined => {
  if (process.env.FB_PROJECTID) {
    return process.env.FB_PROJECTID;
  } else if (process.env.FIREBASE_CONFIG) {
    const { projectId } = JSON.parse(process.env.FIREBASE_CONFIG);
    return projectId;
  } else {
    return null;
  }
}
