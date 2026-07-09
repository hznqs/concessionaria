type AnalyticsEvent =
  | { type: 'page_view'; path: string }
  | { type: 'view_vehicle'; vehicleId: string; title: string; price: number }
  | { type: 'filter_change'; filters: Record<string, unknown> }
  | { type: 'financing_simulate'; price: number; months: number; downPayment: number }
  | { type: 'lead_submit'; vehicleId: string; source: string }
  | { type: 'gallery_open'; vehicleId: string }
  | { type: 'whatsapp_click'; vehicleId: string }
  | { type: 'favorite_toggle'; vehicleId: string; active: boolean }
  | { type: 'search'; query: string };

class Analytics {
  private queue: AnalyticsEvent[] = [];
  private enabled = false;

  init() {
    this.enabled = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_ANALYTICS_ID;
  }

  track(event: AnalyticsEvent) {
    if (!this.enabled) {
      this.queue.push(event);
      return;
    }

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.type, event as any);
    }
    if (typeof window !== 'undefined' && (window as any).plausible) {
      (window as any).plausible(event.type, { props: event as any });
    }

    if (process.env.NODE_ENV === 'development') {
      console.debug('[analytics]', event);
    }
  }
}

export const analytics = new Analytics();