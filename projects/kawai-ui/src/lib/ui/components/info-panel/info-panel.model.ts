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
  /** How a links list that is too wide behaves: wrap onto more lines, or scroll on one. Defaults to wrap. */
  linksOverflow?: 'wrap' | 'scroll';
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
