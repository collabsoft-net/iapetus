
import { useContext, useEffect, useState } from 'react';

import { AP as APContext } from '../Contexts';

export const useHostContext = () => {

  const AP = useContext(APContext);

  const [ context, setContext ] = useState<AP.JiraContext|AP.ConfluenceContext>();
  const [ isLoading, setLoading ] = useState<boolean>(true);

  useEffect(() => {
    if (AP) {
      AP.context.getContext<AP.JiraContext|AP.ConfluenceContext>().then(setContext).finally(() => setLoading(false));
    }
  }, [ AP ]);

  return [ context, isLoading ];
}
