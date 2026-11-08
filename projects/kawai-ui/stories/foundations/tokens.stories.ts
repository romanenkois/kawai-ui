import type { Meta, StoryObj } from '@storybook/angular';

import { TokenGalleryComponent } from './token-gallery.component';

const meta: Meta<TokenGalleryComponent> = {
  title: 'Foundations/Tokens',
  component: TokenGalleryComponent,
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
};
export default meta;

/** Every token with its live value. Switch the theme in the toolbar to see the sys colors follow. */
export const AllTokens: StoryObj<TokenGalleryComponent> = {};
