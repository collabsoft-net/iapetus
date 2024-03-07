import { CloudSchedulerClient } from '@google-cloud/scheduler/build/src/v1beta1/index.js';

export const scheduler = new CloudSchedulerClient();

export const getParent = (): string => {
  if (!process.env.FB_PROJECTID) throw new Error('Required environment variable FB_PROJECTID is undefined');
  return scheduler.locationPath(process.env.FB_PROJECTID, 'europe-west1');
}

export const getName = (clientKey: string, id: string): string => {
  return `${getParent()}/jobs/${clientKey}-${id}`;
}

export const hasJob = async (name: string): Promise<boolean> => {
  try {
    const [ existingJob ] = await scheduler.getJob({ name });
    return existingJob !== undefined;
  } catch (error) {
    return false;
  }
}

export const deleteJob = async (name: string): Promise<void> => {
  if (await hasJob(name)) {
    await scheduler.deleteJob({ name });
  }
}

export const unscheduleJob = async (clientKey: string, id: string): Promise<void> => {
  if (!process.env.FB_PROJECTID) throw new Error('Required environment variable FB_PROJECTID is undefined');
  const name = getName(clientKey, id);
  await deleteJob(name);
}

