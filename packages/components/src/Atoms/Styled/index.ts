
import { Property } from 'csstype';
import { ThemedCssFunction, ThemedStyledFunction } from 'styled-components';

export const withProps = <U>() =>
    <P, T, O>( // eslint-disable-line
        fn: ThemedStyledFunction<P, T, O>|ThemedCssFunction<P>
    ) => fn as unknown as ThemedStyledFunction<P & U, T, O & U>;

export interface SizeProps {
    padding?: Property.Padding;
    margin?: Property.Margin;
    marginLeft?: Property.MarginLeft;
    marginRight?: Property.MarginRight;
    marginBottom?: Property.MarginBottom;
    marginTop?: Property.MarginTop;
    height?: Property.Height;
    width?: Property.Width;
    minWidth?: Property.MinWidth;
    maxWidth?: Property.MinHeight;
    minHeight?: Property.MinHeight;
    maxHeight?: Property.MaxHeight;
}

export const getSizeProps = (props: SizeProps) => `
${props.width ? `width: ${props.width};` : ''}
${props.height ? `height: ${props.height};` : ''}
${props.margin ? `margin: ${props.margin};` : ''}
${props.marginLeft ? `margin-left: ${props.marginLeft};` : ''}
${props.marginRight ? `margin-right: ${props.marginRight};` : ''}
${props.marginBottom ? `margin-bottom: ${props.marginBottom};` : ''}
${props.marginTop ? `margin-top: ${props.marginTop};` : ''}
${props.padding ? `padding: ${props.padding};` : ''}
${props.minWidth ? `min-width: ${props.minWidth};` : ''}
${props.maxWidth ? `max-width: ${props.maxWidth};` : ''}
${props.minHeight ? `min-height: ${props.minHeight};` : ''}
${props.maxHeight ? `max-height: ${props.maxHeight};` : ''}
`.trim();

export interface BorderProps {
    borderRadius?: Property.BorderRadius;
    border?: Property.Border;
    borderTop?: Property.BorderTop;
    borderRight?: Property.BorderRight;
    borderBottom?: Property.BorderBottom;
    borderLeft?: Property.BorderLeft;
    boxShadow?: Property.BoxShadow;
}

export const getBorderProps = (props: BorderProps) => `
${props.borderRadius ? `border-radius: ${props.borderRadius};` : ''}
${props.border ? `border: ${props.border};` : ''}
${props.borderTop ? `border-top: ${props.borderTop};` : ''}
${props.borderRight ? `border-right: ${props.borderRight};` : ''}
${props.borderBottom ? `border-bottom: ${props.borderBottom};` : ''}
${props.borderLeft ? `border-left: ${props.borderLeft};` : ''}
${props.boxShadow ? `box-shadow: ${props.boxShadow};` : ''}
`.trim();

export interface FlexProps {
    gap?: Property.Gap;
    justifyContent?: Property.JustifyContent;
    alignItems?: Property.AlignItems;
    align?: Property.AlignSelf;
    wraps?: boolean; // 'wrap' upsets React.DOM
}

export const getFlexProps = (props: FlexProps, inline?: boolean) => `
${inline && Object.keys(props).length > 0 ? `display: inline-flex` : ''}
${props.gap ? `gap: ${props.gap};` : ''}
${props.justifyContent ? `justify-content: ${props.justifyContent};` : ''}
${props.alignItems ? `align-items: ${props.alignItems};` : ''}
${props.align ? `align-self: ${props.align};` : ''}
${props.wraps ? `flex-wrap: wrap;` : ''}
`.trim();
