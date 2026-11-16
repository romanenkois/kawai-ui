import { Routes } from '@angular/router';

/** One page per kawai-ui component. Add the nav link in `app.ts` too. */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'accordion' },
  {
    path: 'accordion',
    title: 'Accordion',
    loadComponent: () => import('./pages/accordion-page').then((m) => m.AccordionPage),
  },
  {
    path: 'info-panel',
    title: 'Info panel',
    loadComponent: () => import('./pages/info-panel-page').then((m) => m.InfoPanelPage),
  },
  {
    path: 'number-stepper',
    title: 'Number stepper',
    loadComponent: () => import('./pages/number-stepper-page').then((m) => m.NumberStepperPage),
  },
  {
    path: 'segmented-control',
    title: 'Segmented control',
    loadComponent: () =>
      import('./pages/segmented-control-page').then((m) => m.SegmentedControlPage),
  },
  {
    path: 'tooltip',
    title: 'Tooltip',
    loadComponent: () => import('./pages/tooltip-page').then((m) => m.TooltipPage),
  },
];
