import { setCompodocJson } from '@storybook/addon-docs/angular';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Preview } from '@storybook/angular';

import docJson from './documentation.json';

setCompodocJson(docJson);

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    // Story canvases are painted by preview.css from the active kawai theme instead.
    backgrounds: { disable: true },
  },
  decorators: [
    // Sets `kawai-theme` on <html>. "none" leaves it empty: the library default (light).
    withThemeByDataAttribute({
      themes: { none: '', light: 'light', dark: 'dark', auto: 'auto' },
      defaultTheme: 'none',
      attributeName: 'kawai-theme',
    }),
  ],
};

export default preview;
