import { AP, useContext } from '@collabsoft-net/components';
import { ServiceIdentifier } from '@collabsoft-net/connect';

export const useACJS = <T extends AP.JiraInstance|AP.ConfluenceInstance|AP.BambooInstance|AP.BitbucketInstance> () => {
    const ACJS = useContext<AP.JiraInstance|AP.ConfluenceInstance|AP.BambooInstance|AP.BitbucketInstance>(AP, ServiceIdentifier.AP);
    return ACJS as T;
}