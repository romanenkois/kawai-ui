import type { InfoPanelDefaults } from './info-panel.model';

/**
 * Library defaults for every info panel configuration input: the bottom of the chain
 * field value (for `linksOverflow`) → input → `provideKawaiDefaults()` levels (nearest first)
 * → these.
 */
export const KAWAI_INFO_PANEL_DEFAULTS: Readonly<InfoPanelDefaults> = {
  linksOverflow: 'wrap',
  titleLevel: 3,
};
