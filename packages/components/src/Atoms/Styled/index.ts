
import { ThemedCssFunction, ThemedStyledFunction } from 'styled-components';

export const withProps = <U>() =>
    <P, T, O>( // eslint-disable-line
        fn: ThemedStyledFunction<P, T, O>|ThemedCssFunction<P>
    ) => fn as ThemedStyledFunction<P & U, T, O & U>;
