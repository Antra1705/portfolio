// GoatCounter site code: 'antra' for https://antra.goatcounter.com.
// Empty means analytics are off and no script is loaded.
export const GOATCOUNTER_CODE = 'antra';

declare global {
    interface Window {
        goatcounter?: { count: (vars: { path: string; title?: string; event?: boolean }) => void };
    }
}

// Records a named event (shown under "Events" on the GoatCounter dashboard).
// Safe to call when analytics are off or the script was blocked.
export const trackEvent = (name: string) => {
    window.goatcounter?.count({ path: name, title: name, event: true });
};
