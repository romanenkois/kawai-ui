import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';

import {
  KAWAI_COMP_TOKENS,
  KAWAI_REF_TOKENS,
  KAWAI_SYS_TOKENS,
  KAWAI_THEME_ATTRIBUTE,
  KawaiToken,
} from '../../src/public-api';

interface TokenRow {
  name: KawaiToken;
  /** Computed value under the current theme; empty when the token is not declared. */
  value: string;
  swatch: boolean;
}

interface TokenGroup {
  title: string;
  description: string;
  rows: TokenRow[];
}

const GROUPS: { title: string; description: string; tokens: readonly KawaiToken[] }[] = [
  {
    title: 'ref',
    description:
      'Raw palette, one set per mode. Both sets are always declared, whatever the theme. Override at :root to restyle a mode.',
    tokens: KAWAI_REF_TOKENS,
  },
  {
    title: 'sys',
    description:
      'Semantic tokens components read. Colors follow the theme selected in the toolbar.',
    tokens: KAWAI_SYS_TOKENS,
  },
  {
    title: 'comp',
    description: 'Per-component tokens. Unset by default: each one falls back to a sys token.',
    tokens: KAWAI_COMP_TOKENS,
  },
];

const isColor = (name: string, value: string): boolean =>
  name.startsWith('--kawai-ref-') || name.includes('-color-') || /^(#|rgb|hsl)/.test(value);

/**
 * Lists every kawai-ui token with its live value. Values are re-read when `kawai-theme` changes
 * on <html> or the OS color scheme changes, so swatches always match the selected theme.
 */
@Component({
  selector: 'kawai-sb-token-gallery',
  template: `
    @for (group of groups(); track group.title) {
      <section [attr.aria-labelledby]="'tokens-' + group.title">
        <h2 [id]="'tokens-' + group.title">{{ group.title }}</h2>
        <p>{{ group.description }}</p>
        <table>
          <thead>
            <tr>
              <th scope="col">Token</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            @for (row of group.rows; track row.name) {
              <tr>
                <th scope="row">
                  <code>{{ row.name }}</code>
                </th>
                <td>
                  @if (row.swatch) {
                    <span
                      class="swatch"
                      aria-hidden="true"
                      [style.background]="'var(' + row.name + ')'"
                    ></span>
                  }
                  @if (row.value) {
                    <code>{{ row.value }}</code>
                  } @else {
                    <span class="unset">not set</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </section>
    }
  `,
  styles: `
    :host {
      display: block;
      padding: 1rem;
      font-family: system-ui, sans-serif;
      font-size: 0.875rem;
      color: var(--kawai-sys-color-text);
    }

    h2 {
      margin: 1.5rem 0 0.25rem;
      font-size: 1.125rem;
    }

    section:first-child h2 {
      margin-block-start: 0;
    }

    p {
      margin: 0 0 0.75rem;
      color: var(--kawai-sys-color-text-muted);
    }

    table {
      inline-size: 100%;
      border-collapse: collapse;
    }

    th,
    td {
      padding: 0.25rem 0.5rem;
      border-block-end: 1px solid var(--kawai-sys-color-border);
      text-align: start;
      font-weight: 400;
      vertical-align: middle;
    }

    thead th {
      font-weight: 700;
    }

    .swatch {
      display: inline-block;
      inline-size: 1.25rem;
      block-size: 1.25rem;
      margin-inline-end: 0.5rem;
      border: 1px solid var(--kawai-sys-color-border);
      border-radius: 0.25rem;
      vertical-align: middle;
    }

    .unset {
      color: var(--kawai-sys-color-text-muted);
      font-style: italic;
    }
  `,
})
export class TokenGalleryComponent {
  private readonly document = inject(DOCUMENT);
  protected readonly groups = signal<TokenGroup[]>([]);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const view = this.document.defaultView;
      if (!view) return;
      this.read(view);
      const refresh = (): void => {
        this.read(view);
      };
      const observer = new MutationObserver(refresh);
      observer.observe(this.document.documentElement, { attributeFilter: [KAWAI_THEME_ATTRIBUTE] });
      const scheme = view.matchMedia('(prefers-color-scheme: dark)');
      scheme.addEventListener('change', refresh);
      destroyRef.onDestroy(() => {
        observer.disconnect();
        scheme.removeEventListener('change', refresh);
      });
    });
  }

  private read(view: Window): void {
    const style = view.getComputedStyle(this.document.documentElement);
    this.groups.set(
      GROUPS.map(({ title, description, tokens }) => ({
        title,
        description,
        rows: tokens.map((name) => {
          const value = style.getPropertyValue(name).trim();
          return { name, value, swatch: value !== '' && isColor(name, value) };
        }),
      })),
    );
  }
}
