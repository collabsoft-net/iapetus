
import { isOfType } from '@collabsoft-net/helpers';
import { useContext, useEffect, useState } from 'react';

import { AP as APContext } from '../Contexts';

export const useHostContext = () => {

  const AP = useContext(APContext);

  const [ context, setContext ] = useState<AP.JiraContext|AP.ConfluenceContext>();
  const [ isLoading, setLoading ] = useState<boolean>(true);

  useEffect(() => {
    if (isOfType<AP.JiraInstance>(AP, 'jira') || isOfType<AP.ConfluenceInstance>(AP, 'confluence')) {
      AP.context.getContext().then(setContext).finally(() => setLoading(false));
    }
  }, [ AP ]);

  return [ context, isLoading ];
}
