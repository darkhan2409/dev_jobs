import { ANALYTICS_EVENTS } from '../constants/analyticsEvents';

const isBrowser = typeof window !== 'undefined';
const USER_TYPE_KEY = 'gj_user_type_guess';
const ANALYTICS_MAX_PAYLOAD_SIZE = 32_000;

const resolveAnalyticsEndpoint = () => {
    const rawApiUrl = import.meta.env.VITE_API_URL;
    if (!rawApiUrl) return '/api/analytics/events';

    const trimmed = rawApiUrl.trim().replace(/\/+$/, '');
    if (!trimmed || trimmed === '/') return '/api/analytics/events';

    if (/^https?:\/\//i.test(trimmed)) {
        try {
            const parsed = new URL(trimmed);
            if (!parsed.pathname || parsed.pathname === '/') {
                return `${trimmed}/api/analytics/events`;
            }
        } catch {
            return '/api/analytics/events';
        }
    }

    return `${trimmed}/analytics/events`;
};

const ANALYTICS_ENDPOINT = resolveAnalyticsEndpoint();

const readStoredUserType = () => {
    if (!isBrowser) return 'unknown';

    try {
        const value = localStorage.getItem(USER_TYPE_KEY);
        return value || 'unknown';
    } catch {
        return 'unknown';
    }
};

const storeUserType = (userType) => {
    if (!isBrowser || !userType || userType === 'unknown') return;

    try {
        localStorage.setItem(USER_TYPE_KEY, userType);
    } catch {
        // Ignore storage failures (private mode, blocked cookies, etc).
    }
};

const inferUserTypeFromEvent = (eventName, props) => {
    const route = props.route || (isBrowser ? window.location.pathname : '');
    const source = props.source || '';

    if (
        source.toLowerCase().includes('newbie') ||
        route.startsWith('/career') ||
        route.startsWith('/guide') ||
        eventName === ANALYTICS_EVENTS.START_MODE_NEWBIE_CLICK ||
        eventName === ANALYTICS_EVENTS.CAREER_TEST_START ||
        eventName === ANALYTICS_EVENTS.CAREER_TEST_COMPLETE ||
        eventName === ANALYTICS_EVENTS.GUIDE_STAGE_OPEN
    ) {
        return 'newbie';
    }

    if (
        route.startsWith('/jobs') ||
        route.startsWith('/companies') ||
        eventName === ANALYTICS_EVENTS.START_MODE_JOBS_CLICK ||
        eventName === ANALYTICS_EVENTS.JOBS_FILTER_APPLY ||
        eventName === ANALYTICS_EVENTS.VACANCY_OPEN ||
        eventName === ANALYTICS_EVENTS.APPLY_CLICK
    ) {
        return 'returning';
    }

    return 'unknown';
};

const sendToBackend = (eventPayload) => {
    if (!isBrowser) return;

    const {
        event_name,
        source,
        route,
        user_type_guess,
        session_id = null,
        timestamp,
        payload: nestedPayload,
        ...extra
    } = eventPayload;

    const normalizedPayload = {
        ...(nestedPayload && typeof nestedPayload === 'object' ? nestedPayload : {}),
        ...extra,
    };

    const body = JSON.stringify({
        events: [
            {
                event_name,
                source,
                route,
                user_type_guess,
                session_id,
                timestamp,
                payload: normalizedPayload,
            },
        ],
    });
    if (!body || body.length > ANALYTICS_MAX_PAYLOAD_SIZE) return;

    try {
        if (typeof navigator.sendBeacon === 'function') {
            const blob = new Blob([body], { type: 'application/json' });
            const accepted = navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
            if (accepted) return;
        }
    } catch {
        // Fallback to fetch below.
    }

    fetch(ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
    }).catch(() => {
        // Silent fail: analytics should never break UX.
    });
};

export const trackEvent = (eventName, props = {}) => {
    if (!eventName || typeof eventName !== 'string') return;

    const route = props.route || (isBrowser ? window.location.pathname : 'unknown');
    const inferredUserType = inferUserTypeFromEvent(eventName, { ...props, route });
    const storedUserType = readStoredUserType();
    const userType = props.user_type_guess || (storedUserType !== 'unknown' ? storedUserType : inferredUserType);

    if (inferredUserType !== 'unknown') {
        storeUserType(inferredUserType);
    } else if (userType !== 'unknown') {
        storeUserType(userType);
    }

    const payload = {
        source: props.source || 'unknown',
        route,
        user_type_guess: userType || inferredUserType || 'unknown',
        ...props,
        event_name: eventName,
        timestamp: new Date().toISOString()
    };

    try {
        sendToBackend(payload);

        if (import.meta.env.DEV) {
            console.info('[analytics]', eventName, payload);
        }
    } catch (error) {
        if (import.meta.env.DEV) {
            console.warn('[analytics] track failed', error);
        }
    }
};
