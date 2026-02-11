const isBrowser = typeof window !== 'undefined';

export const trackEvent = (eventName, props = {}) => {
    if (!eventName || typeof eventName !== 'string') return;

    const payload = {
        ...props,
        event_name: eventName,
        timestamp: new Date().toISOString()
    };

    try {
        if (isBrowser && typeof window.gtag === 'function') {
            window.gtag('event', eventName, payload);
        }

        if (isBrowser && Array.isArray(window.dataLayer)) {
            window.dataLayer.push({
                event: eventName,
                ...payload
            });
        }

        if (isBrowser) {
            window.dispatchEvent(new CustomEvent('analytics:event', { detail: payload }));
        }

        if (import.meta.env.DEV) {
            // Keep analytics observable in development until a provider is connected.
            console.info('[analytics]', eventName, payload);
        }
    } catch (error) {
        if (import.meta.env.DEV) {
            console.warn('[analytics] track failed', error);
        }
    }
};

