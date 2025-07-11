import EditorMediaCollapseIcon from '@atlaskit/icon/glyph/editor/collapse';
import EditorMediaExpandIcon from '@atlaskit/icon/glyph/editor/expand';
import EditorMediaCenterIcon from '@atlaskit/icon/glyph/editor/media-center';
import EditorMediaFullWidthIcon from '@atlaskit/icon/glyph/editor/media-full-width';
import EditorMediaWideIcon from '@atlaskit/icon/glyph/editor/media-wide';
import Skeleton from '@atlaskit/skeleton';
import { colors } from '@atlaskit/theme';
import { token } from '@atlaskit/tokens';
import Tooltip from '@atlaskit/tooltip';
import { Modes } from '@collabsoft-net/enums';
import { isOfType } from '@collabsoft-net/helpers';
import { ConfluenceClientService } from '@collabsoft-net/services';
import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import React, { PropsWithChildren, useState } from 'react';

import { Column, Grid, Header, Row } from '../../Atoms';
import { useContentContext,usePlatformBridge } from '../../Hooks';

interface ConfluencePreviewProps {
  showDisplayToolbar?: boolean;
  defaultPageSize?: PageSize;
}

type PageSize = 'full-width'|'fixed-width'
type MacroSize = 'center'|'wide'|'full-width';

const Wrapper = styled.div`
  display: unset;
  position: relative;
`;

const SidebarLarge = styled(Column)`
  display: none;
  @media (min-width: 801px) {
    display: block;
  }
`;

const SidebarSmall = styled(Column)`
  display: none;
  @media (max-width: 800px) {
    display: block;
  }
`;

const PreviewWidth = styled.div`
  position: absolute;
  display: flex;
  bottom: -16px;
  width: 100%;
  justify-content: center;
  font-size: 0;
`;

const Divider = styled.div`
  height: 16px;
  width: 1px;
  background-color: ${token('color.border', colors.N40)};
`;

const OptionalNavColumn = styled(Column)`
  display: none;
  @media (min-width: 832px) {
    display: block;
  }
`;

export const ConfluencePreview = ({ showDisplayToolbar, defaultPageSize, children }: PropsWithChildren<ConfluencePreviewProps>): JSX.Element => {

  const bridge = usePlatformBridge();
  const [ context, isLoadingContext ] = useContentContext();

  const [ pageSize, setPageSize ] = useState<PageSize>(defaultPageSize || 'fixed-width');
  const [ macroSize, setMacroSize ] = useState<MacroSize>('center');

  const contentId = isOfType<Platform.ConfluenceContentContext>(context, 'content') ? Number(context.content?.id) : -1;

  const { data: pageName } = useQuery({
    queryKey: [ 'Service.getContent()', contentId ],
    queryFn: async () => {
      const service = bridge.client;
      if (isOfType<ConfluenceClientService<Modes>>(service, 'getContent')) {
        const content = await service.getContent(contentId);
        return content.title;
      } else {
        return '';
      }
    },
    enabled: !isLoadingContext && contentId > 0
  });

  return (
    <Wrapper>
      <Grid fluid stretched border={ `1px solid ${token('color.border', colors.N40)}` } borderRadius='4px' background={ token('elevation.surface', colors.N0) }>
        <Row>
          <Grid fluid vertical padding='8px' boxShadow={ `0px 1px 1px 0px ${token('color.border', 'rgba(0, 0, 0, 0.10)')}` }>
            <Column style={{ fontSize: 0 }}>
              <svg width="81" height="16" viewBox="0 0 81 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.25556 11.2197C2.12556 11.4317 1.97956 11.6777 1.85556 11.8737C1.80221 11.9638 1.78636 12.0713 1.81142 12.173C1.83647 12.2748 1.90044 12.3626 1.98956 12.4177L4.58956 14.0177C4.63474 14.0456 4.68503 14.0642 4.73748 14.0724C4.78993 14.0807 4.8435 14.0784 4.89507 14.0658C4.94663 14.0531 4.99516 14.0303 5.03783 13.9987C5.08049 13.9671 5.11644 13.9273 5.14356 13.8817C5.24756 13.7077 5.38156 13.4817 5.52756 13.2397C6.55756 11.5397 7.59356 11.7477 9.46156 12.6397L12.0396 13.8657C12.0879 13.8887 12.1403 13.9017 12.1938 13.9041C12.2473 13.9065 12.3007 13.8981 12.3509 13.8794C12.401 13.8608 12.4469 13.8322 12.4859 13.7955C12.5248 13.7588 12.556 13.7146 12.5776 13.6657L13.8156 10.8657C13.8576 10.7695 13.8602 10.6608 13.8228 10.5627C13.7854 10.4647 13.711 10.3853 13.6156 10.3417C13.0716 10.0857 11.9896 9.57566 11.0156 9.10566C7.51156 7.40366 4.53356 7.51366 2.25556 11.2197Z" fill="url(#paint0_linear_17161_33435)"/>
                <path d="M13.9135 4.86623C14.0435 4.65423 14.1895 4.40823 14.3135 4.21223C14.3669 4.12207 14.3827 4.01458 14.3577 3.91286C14.3326 3.81113 14.2687 3.7233 14.1795 3.66823L11.5795 2.06823C11.534 2.03758 11.4827 2.01661 11.4287 2.00665C11.3747 1.99668 11.3193 1.99793 11.2658 2.01031C11.2124 2.02269 11.162 2.04594 11.1179 2.07862C11.0738 2.11129 11.0369 2.15269 11.0095 2.20023C10.9055 2.37423 10.7715 2.60023 10.6255 2.84223C9.59553 4.54223 8.55953 4.33423 6.69153 3.44223L4.12153 2.22223C4.0732 2.19923 4.02075 2.18616 3.96728 2.1838C3.91381 2.18144 3.86041 2.18983 3.81024 2.20848C3.76008 2.22713 3.71416 2.25566 3.67522 2.29237C3.63628 2.32909 3.6051 2.37325 3.58353 2.42223L2.34553 5.22223C2.30349 5.31835 2.3009 5.42714 2.33831 5.52516C2.37572 5.62318 2.45014 5.70257 2.54553 5.74623C3.08953 6.00223 4.17153 6.51223 5.14553 6.98223C8.65753 8.68223 11.6355 8.56823 13.9135 4.86623Z" fill="url(#paint1_linear_17161_33435)"/>
                <path d="M27.8086 12.1758C25.8115 12.1758 24.5713 10.7598 24.5713 8.48438V8.47461C24.5713 6.18945 25.8066 4.77832 27.8037 4.77832C29.4053 4.77832 30.6211 5.79395 30.7871 7.23438V7.27344H29.5518L29.5469 7.25391C29.3662 6.41895 28.6924 5.86719 27.8037 5.86719C26.6074 5.86719 25.8604 6.86816 25.8604 8.46973V8.47949C25.8604 10.0859 26.6074 11.0869 27.8086 11.0869C28.7021 11.0869 29.3662 10.5889 29.5469 9.8125L29.5518 9.78809H30.7871V9.82227C30.6016 11.2334 29.4346 12.1758 27.8086 12.1758ZM34.3711 12.1074C32.7695 12.1074 31.8027 11.0625 31.8027 9.33398V9.32422C31.8027 7.61035 32.7842 6.56055 34.3711 6.56055C35.9629 6.56055 36.9395 7.60547 36.9395 9.32422V9.33398C36.9395 11.0625 35.9678 12.1074 34.3711 12.1074ZM34.3711 11.1211C35.2158 11.1211 35.6943 10.4619 35.6943 9.33887V9.3291C35.6943 8.20605 35.2109 7.54199 34.3711 7.54199C33.5264 7.54199 33.043 8.20605 33.043 9.3291V9.33887C33.043 10.4619 33.5264 11.1211 34.3711 11.1211ZM38.1602 12V6.66309H39.376V7.47852H39.459C39.7129 6.90723 40.2256 6.56055 40.9971 6.56055C42.1885 6.56055 42.8379 7.27832 42.8379 8.54785V12H41.6221V8.83105C41.6221 8.00098 41.2852 7.58105 40.5479 7.58105C39.8252 7.58105 39.376 8.08887 39.376 8.88965V12H38.1602ZM44.6641 12V7.60547H43.79V6.66309H44.6641V6.13574C44.6641 5.07129 45.2061 4.54883 46.3926 4.54883C46.6514 4.54883 46.8711 4.56348 47.0664 4.59766V5.44727C46.9736 5.43262 46.8223 5.42285 46.6514 5.42285C46.0801 5.42285 45.8604 5.69629 45.8604 6.2041V6.66309H47.0176V7.60547H45.8799V12H44.6641ZM48.2383 12V4.59766H49.4541V12H48.2383ZM52.7598 12.1074C51.5586 12.1074 50.9434 11.3848 50.9434 10.1152V6.66309H52.1592V9.83691C52.1592 10.6621 52.4668 11.082 53.1992 11.082C53.9854 11.082 54.4053 10.5742 54.4053 9.77344V6.66309H55.6211V12H54.4053V11.1895H54.3223C54.0732 11.7607 53.5312 12.1074 52.7598 12.1074ZM59.3906 12.1074C57.8037 12.1074 56.8418 11.043 56.8418 9.34375V9.33887C56.8418 7.65918 57.8135 6.56055 59.332 6.56055C60.8506 6.56055 61.7881 7.625 61.7881 9.23633V9.63672H58.0576C58.0723 10.5938 58.5898 11.1504 59.415 11.1504C60.0742 11.1504 60.4502 10.8184 60.5674 10.5742L60.582 10.54H61.7393L61.7246 10.584C61.5537 11.2725 60.8408 12.1074 59.3906 12.1074ZM59.3467 7.5127C58.668 7.5127 58.1602 7.97168 58.0674 8.82129H60.6016C60.5186 7.94727 60.0254 7.5127 59.3467 7.5127ZM63.0039 12V6.66309H64.2197V7.47852H64.3027C64.5566 6.90723 65.0693 6.56055 65.8408 6.56055C67.0322 6.56055 67.6816 7.27832 67.6816 8.54785V12H66.4658V8.83105C66.4658 8.00098 66.1289 7.58105 65.3916 7.58105C64.6689 7.58105 64.2197 8.08887 64.2197 8.88965V12H63.0039ZM71.4072 12.1074C69.8008 12.1074 68.8535 11.0674 68.8535 9.32422V9.31445C68.8535 7.59082 69.7959 6.56055 71.4023 6.56055C72.7744 6.56055 73.5947 7.32227 73.7314 8.42578V8.44531H72.584L72.5791 8.43066C72.4668 7.91309 72.0713 7.54199 71.4072 7.54199C70.5771 7.54199 70.0889 8.19629 70.0889 9.31445V9.32422C70.0889 10.457 70.582 11.1211 71.4072 11.1211C72.0371 11.1211 72.4229 10.833 72.5742 10.2715L72.584 10.252L73.7314 10.2471L73.7217 10.2861C73.5459 11.3799 72.7598 12.1074 71.4072 12.1074ZM77.1738 12.1074C75.5869 12.1074 74.625 11.043 74.625 9.34375V9.33887C74.625 7.65918 75.5967 6.56055 77.1152 6.56055C78.6338 6.56055 79.5713 7.625 79.5713 9.23633V9.63672H75.8408C75.8555 10.5938 76.373 11.1504 77.1982 11.1504C77.8574 11.1504 78.2334 10.8184 78.3506 10.5742L78.3652 10.54H79.5225L79.5078 10.584C79.3369 11.2725 78.624 12.1074 77.1738 12.1074ZM77.1299 7.5127C76.4512 7.5127 75.9434 7.97168 75.8506 8.82129H78.3848C78.3018 7.94727 77.8086 7.5127 77.1299 7.5127Z" fill="#6B778C"/>
                <defs>
                  <linearGradient id="paint0_linear_17161_33435" x1="13.7456" y1="14.8437" x2="5.87956" y2="10.3237" gradientUnits="userSpaceOnUse">
                    <stop offset="0.18" stopColor="#0052CC"/>
                    <stop offset="1" stopColor="#2684FF"/>
                  </linearGradient>
                  <linearGradient id="paint1_linear_17161_33435" x1="-3315.27" y1="9437.3" x2="-3042.93" y2="9749.84" gradientUnits="userSpaceOnUse">
                    <stop offset="0.18" stopColor="#0052CC"/>
                    <stop offset="1" stopColor="#2684FF"/>
                  </linearGradient>
                </defs>
              </svg>
            </Column>
            <OptionalNavColumn style={{ fontSize: 0 }} marginLeft="24px">
              <svg width="122" height="16" viewBox="0 0 122 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="5" width="32" height="6" rx="3" fill={ token('color.skeleton', colors.N30) } />
                <rect x="40" y="5" width="32" height="6" rx="3" fill={ token('color.skeleton', colors.N30) } />
                <rect x="76" y="5" width="6" height="6" rx="3" fill={ token('color.skeleton', colors.N30) } />
                <rect x="90" y="5" width="32" height="6" rx="3" fill={ token('color.skeleton', colors.N30) } />
              </svg>
            </OptionalNavColumn>
            <Column stretched></Column>
            <Column style={{ fontSize: 0 }}>
              <svg width="148" height="16" viewBox="0 0 148 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" width="63" height="15" rx="1.5" fill={ token('color.skeleton', colors.N30) }/>
                <rect x="72" y="2" width="12" height="12" rx="6" fill={ token('color.skeleton', colors.N30) } />
                <rect x="92" y="2" width="12" height="12" rx="6" fill={ token('color.skeleton', colors.N30) } />
                <rect x="112" y="2" width="12" height="12" rx="6" fill={ token('color.skeleton', colors.N30) } />
                <rect x="132" width="16" height="16" rx="8" fill={ token('color.skeleton', colors.N30) } />
              </svg>
            </Column>
          </Grid>
        </Row>
        <Row stretched>
          <Grid fluid vertical>
            <SidebarSmall background={ token('elevation.surface', colors.N20) } width='20px' boxShadow={ `-1px 1px 0px 0px ${token('color.border', 'rgba(0, 0, 0, 0.10)')} inset` }>
            </SidebarSmall>
            <SidebarLarge background={ token('elevation.surface', colors.N20) } padding='8px 16px 8px 8px' boxShadow={ `-1px 1px 0px 0px ${token('color.border', 'rgba(0, 0, 0, 0.10)')} inset` }>
              <svg width="96" height="79" viewBox="0 0 96 79" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="16" height="16" rx="2" fill={ token('color.skeleton', colors.N30) }/>
                <rect x="24" y="4" width="72" height="8" rx="2" fill={ token('color.skeleton', colors.N30) }/>
                <rect x="4" y="23" width="8" height="8" rx="2" fill={ token('color.skeleton', colors.N30) }/>
                <rect x="20" y="25" width="72" height="4" rx="2" fill={ token('color.skeleton', colors.N30) }/>
                <rect x="4" y="39" width="8" height="8" rx="2" fill={ token('color.skeleton', colors.N30) }/>
                <rect x="20" y="41" width="72" height="4" rx="2" fill={ token('color.skeleton', colors.N30) }/>
                <rect x="4" y="55" width="8" height="8" rx="2" fill={ token('color.skeleton', colors.N30) }/>
                <rect x="20" y="57" width="72" height="4" rx="2" fill={ token('color.skeleton', colors.N30) }/>
                <rect x="4" y="71" width="8" height="8" rx="2" fill={ token('color.skeleton', colors.N30) }/>
                <rect x="20" y="73" width="72" height="4" rx="2" fill={ token('color.skeleton', colors.N30) }/>
              </svg>
            </SidebarLarge>
            <Column stretched>
              <Grid fluid padding="24px">
                <Row stretched>
                  <Grid fluid minWidth='70%' alignItems='center' margin="0 auto">

                    <Row width={ pageSize === 'full-width' ? '100%' : '70%' }>
                      <Grid fluid>
                        <Row minHeight='16px'>
                          { pageName ? (
                            <Header weight='h200'>{ pageName }</Header>
                          ) : (
                            <Skeleton width='100%' height='100%' borderRadius='4px' isShimmering />
                          )}
                        </Row>
                        <Row marginTop='8px' height='8px' borderRadius='2px' background={ token('color.skeleton', colors.N30) } />
                        <Row marginTop='12px' height='8px' borderRadius='2px' background={ token('color.skeleton', colors.N30) } />
                      </Grid>
                    </Row>

                    <Row marginTop='12px' width={ pageSize === 'full-width' ? '100%' : macroSize === 'center' ? '70%' : macroSize === 'wide' ? '80%' : '100%' } maxWidth='100%'>
                      { children }
                    </Row>

                    <Row width={ pageSize === 'full-width' ? '100%' : '70%' }>
                      <Grid fluid width='100%'>
                        <Row marginTop='12px' height='8px' borderRadius='2px' background={ token('color.skeleton', colors.N30) } />
                        <Row marginTop='12px' height='8px' borderRadius='2px' background={ token('color.skeleton', colors.N30) } />
                        <Row marginTop='12px' height='8px' borderRadius='2px' background={ token('color.skeleton', colors.N30) } />
                        <Row marginTop='12px' height='8px' borderRadius='2px' background={ token('color.skeleton', colors.N30) } />
                        <Row marginTop='12px' height='8px' borderRadius='2px' background={ token('color.skeleton', colors.N30) } />
                        <Row marginTop='12px' height='8px' borderRadius='2px' background={ token('color.skeleton', colors.N30) } />
                        <Row marginTop='12px' height='8px' borderRadius='2px' background={ token('color.skeleton', colors.N30) } />
                        <Row marginTop='12px' height='8px' borderRadius='2px' background={ token('color.skeleton', colors.N30) } />
                        <Row marginTop='12px' height='8px' borderRadius='2px' background={ token('color.skeleton', colors.N30) } />
                        <Row marginTop='12px' height='8px' borderRadius='2px' background={ token('color.skeleton', colors.N30) } />
                        <Row marginTop='12px' height='8px' borderRadius='2px' background={ token('color.skeleton', colors.N30) } />
                        <Row marginTop='12px' height='8px' borderRadius='2px' background={ token('color.skeleton', colors.N30) } />
                      </Grid>
                    </Row>
                  </Grid>
                </Row>
              </Grid>
            </Column>
          </Grid>
        </Row>
      </Grid>
      { (showDisplayToolbar !== false) && (
        <PreviewWidth>
          <Grid fluid vertical gap='8px' padding='4px 8px' borderRadius='4px' border={ `${token('border.width', '1px')} solid ${token('color.border', colors.N300A)}`} background={ token('elevation.surface.raised', colors.N0) }>
            <Column onClick={ () => setPageSize('full-width') } background={ pageSize === 'full-width' ? token('color.background.information', colors.B50) : undefined } borderRadius='2px' cursor='pointer'>
              <Tooltip content='Make page full-width'>
                <EditorMediaExpandIcon label='Full width' primaryColor={ pageSize === 'full-width' ? token('color.icon.information', colors.B400) : token('color.icon') } />
              </Tooltip>
            </Column>
            <Column onClick={ () => setPageSize('fixed-width') } background={ pageSize === 'fixed-width' ? token('color.background.information', colors.B50) : undefined } borderRadius='2px' cursor='pointer'>
              <Tooltip content='Make page fixed-width'>
                <EditorMediaCollapseIcon label='Fixed width' primaryColor={ pageSize === 'fixed-width' ? token('color.icon.information', colors.B400) : token('color.icon') } />
              </Tooltip>
            </Column>
            { pageSize === 'fixed-width' && (
              <>
                <Column align='center'><Divider /></Column>
                <Column onClick={ () => setMacroSize('center') } background={ macroSize === 'center' ? token('color.background.information', colors.B50) : undefined } borderRadius='2px' cursor='pointer'>
                  <Tooltip content='Back to center'>
                    <EditorMediaCenterIcon label='Back to center' primaryColor={ macroSize === 'center' ? token('color.icon.information', colors.B400) : token('color.icon') } />
                  </Tooltip>
                </Column>
                <Column onClick={ () => setMacroSize('wide') } background={ macroSize === 'wide' ? token('color.background.information', colors.B50) : undefined } borderRadius='2px' cursor='pointer'>
                  <Tooltip content='Go wide'>
                    <EditorMediaWideIcon label='Go wide' primaryColor={ macroSize === 'wide' ? token('color.icon.information', colors.B400) : token('color.icon') } />
                  </Tooltip>
                </Column>
                <Column onClick={ () => setMacroSize('full-width') } background={ macroSize === 'full-width' ? token('color.background.information', colors.B50) : undefined } borderRadius='2px' cursor='pointer'>
                  <Tooltip content='Go full width'>
                    <EditorMediaFullWidthIcon label='Go full width' primaryColor={ macroSize === 'full-width' ? token('color.icon.information', colors.B400) : token('color.icon') } />
                  </Tooltip>
                </Column>
              </>
            )}
          </Grid>
        </PreviewWidth>
      )}
    </Wrapper>
  );

}