import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { cwd } from 'process';

const baseDir = join(cwd(), 'src/styles');
const styles = [ 'light', 'dark', 'spacing', 'typography', 'typography-refreshed' ];

const saveToFile = (name, content) => {
  writeFileSync(join(cwd(), 'src/styles', `${name}.ts`), `
export default \`${content}\``, 'utf-8');
}

const fetchFallbackStyles = async () => {

  if (!existsSync(baseDir)) {
    mkdirSync(baseDir, { recursive: true });
  }

  for await (const style of styles) {

    fetch(`https://forge.cdn.prod.atlassian-dev.net/atlaskit-tokens_${style}.css`)
      .then(async (response) => {
        if (response.status !== 200) {
          throw new Error();
        }

        const content = await response.text();
        saveToFile(style, content);
      })
      .catch(() => {
        fetch(`https://connect-cdn.atl-paas.net/themes/atlaskit-tokens_${style}.css`)
          .then(async (response) => {
            const content = await response.text();
            saveToFile(style, content);
          })
      })

  }

}

fetchFallbackStyles();