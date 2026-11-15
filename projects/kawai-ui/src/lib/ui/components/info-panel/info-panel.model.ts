/** How a list of links too wide for its field behaves: wrap onto more lines, or scroll on one. */
export type InfoPanelLinksOverflow = 'wrap' | 'scroll';

/** A clickable value; `InfoPanelComponent` emits it through `linkClicked`. */
export interface InfoLink {
  text: string;
  value: string | null;
}

export interface InfoTitleItem {
  type: 'title';
  text: string;
}

export interface InfoTextItem {
  type: 'simple-text';
  text: string;
  /** Secondary text such as notes and placeholders. */
  muted?: boolean;
}

export interface InfoField {
  label: string;
  /** Plain value, or clickable links. With links, `value` is shown when the list is empty. */
  value?: string;
  links?: InfoLink[];
  /**
   * How this field's links list behaves when too wide. Left out, it follows the panel's
   * `linksOverflow` (and its defaults chain).
   */
  linksOverflow?: InfoPanelLinksOverflow;
}

/** Label/value pairs in two columns. */
export interface InfoFieldsItem {
  type: 'fields';
  fields: InfoField[];
}

export interface InfoTableRow {
  /** First cell, rendered as a row header. */
  header: string;
  cells: string[];
}

export interface InfoTableItem {
  type: 'table';
  columns: string[];
  rows: InfoTableRow[];
  /** Summary row, e.g. totals. */
  footer?: InfoTableRow;
}

export interface InfoButtonItem {
  type: 'button';
  link: InfoLink;
}

export type InfoItem =
  InfoTitleItem | InfoTextItem | InfoFieldsItem | InfoTableItem | InfoButtonItem;

/** The info panel's configuration with every value filled in: the shape of its library defaults. */
export interface InfoPanelDefaults {
  linksOverflow: InfoPanelLinksOverflow;
}

/**
 * The `infoPanel` part of `provideKawaiDefaults()`. Anything left out comes from the level
 * above.
 */
export interface InfoPanelDefaultsConfig {
  linksOverflow?: InfoPanelLinksOverflow;
}
