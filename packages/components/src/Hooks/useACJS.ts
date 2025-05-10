import { ServiceIdentifier } from '@collabsoft-net/connect';

import { AP } from '../Contexts/AP';
import { useContext } from './useContext';

export const useACJS = <T extends AP.JiraInstance|AP.ConfluenceInstance|AP.BambooInstance|AP.BitbucketInstance> () => {
    const ACJS = useContext<AP.JiraInstance|AP.ConfluenceInstance|AP.BambooInstance|AP.BitbucketInstance>(AP, ServiceIdentifier.AP);
    return ACJS as T;
}