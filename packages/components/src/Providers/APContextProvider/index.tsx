import { useContext, useEffect, useState } from 'react';

import { APProvider } from '../../Contexts/APProvider';

interface APContextProviderProps {
  children: (args: {
    context?: AP.JiraContext|AP.ConfluenceContext;
    errors?: Error;
    loading: boolean;
  }) => JSX.Element;
}

export const APContextProvider = ({ children }: APContextProviderProps): JSX.Element => {

  const AP = useContext(APProvider);

  const [ context, setContext ] = useState<AP.JiraContext|AP.ConfluenceContext>();
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ errors, setErrors ] = useState<Error>();

  useEffect(() => {
    AP.then(async AP => {
      AP.context.getContext(setContext);
    }).catch(setErrors).finally(() => setLoading(false));
  }, [ AP ]);

  return children({ context, loading, errors });
}