import { useContext, useEffect, useState } from 'react';

import { APContext } from '../../Contexts/APContext';

interface APderProps {
  children: (args: {
    instance?: AP.Instance;
    errors?: Error;
    loading: boolean;
  }) => JSX.Element;
}

export const APProvider = ({ children }: APderProps): JSX.Element => {

  const AP = useContext(APContext);

  const [ instance, setInstance ] = useState<AP.Instance>();
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ errors, setErrors ] = useState<Error>();

  useEffect(() => {
    AP.then(setInstance).catch(setErrors).finally(() => setLoading(false));
  }, [ AP ]);

  return children({ instance, loading, errors });
}