import { Styles } from './styles';
import { Themes } from './themes';

export const loadFallbackStyles = async (theme: Themes) => {
  const style = Styles[theme];
  const styleElement = document.createElement('style');
  styleElement.appendChild(document.createTextNode(style));
  document.head.appendChild(styleElement);
}
