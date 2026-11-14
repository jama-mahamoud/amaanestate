import { Profile } from '../types';

export const INTERNAL_TRAFFIC_STORAGE_KEY = 'amaan_internal_traffic';
export const INTERNAL_TRAFFIC_OVERRIDE_KEY = 'amaan_internal_traffic_override';
export const INTERNAL_TRAFFIC_EVENT = 'amaan:internal-traffic-change';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    __amaanTraffic?: {
      isInternal: () => boolean;
      isPublicTestMode: () => boolean;
      enable: () => boolean;
      clear: () => void;
      status: () => {
        internalMarkerActive: boolean;
        publicTestOverride: boolean;
        isAdminRoute: boolean;
        effectiveTrafficType: 'internal' | 'public';
      };
    };
  }
}

function canUseBrowserStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function isAdminOrEditorRole(profile?: Profile | null): boolean {
  const roleName = profile?.role?.name;
  return roleName === 'admin' || roleName === 'editor';
}

export function isInternalTrafficMarked(): boolean {
  if (!canUseBrowserStorage()) return false;
  try {
    return window.localStorage.getItem(INTERNAL_TRAFFIC_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function isPublicVisitorTestMode(): boolean {
  if (!canUseBrowserStorage()) return false;
  try {
    return window.localStorage.getItem(INTERNAL_TRAFFIC_OVERRIDE_KEY) === 'public';
  } catch {
    return false;
  }
}

export function isAdminPathname(pathname?: string): boolean {
  if (typeof window === 'undefined' && !pathname) return false;
  const path = pathname ?? window.location.pathname;
  return path === '/admin' || path.startsWith('/admin/');
}

export function pushTrafficTypeToDataLayer(isInternal: boolean): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  if (isInternal) {
    window.dataLayer.push({ traffic_type: 'internal' });
  } else {
    // Setting undefined removes traffic_type from GTM's active data model
    // so subsequent SPA route views do not inherit "internal".
    window.dataLayer.push({ traffic_type: undefined });
  }
}

function notifyTrafficListeners(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(INTERNAL_TRAFFIC_EVENT));
}

export function enableInternalTrafficMarker(options?: { force?: boolean }): boolean {
  if (!canUseBrowserStorage()) return false;

  if (!options?.force && isPublicVisitorTestMode()) {
    return false;
  }

  try {
    window.localStorage.setItem(INTERNAL_TRAFFIC_STORAGE_KEY, '1');
    window.localStorage.removeItem(INTERNAL_TRAFFIC_OVERRIDE_KEY);
  } catch {
    return false;
  }

  pushTrafficTypeToDataLayer(true);
  notifyTrafficListeners();
  return true;
}

export function clearInternalTrafficMarker(): void {
  if (!canUseBrowserStorage()) return;

  try {
    window.localStorage.removeItem(INTERNAL_TRAFFIC_STORAGE_KEY);
    window.localStorage.setItem(INTERNAL_TRAFFIC_OVERRIDE_KEY, 'public');
  } catch {
    // Ignore storage restriction errors
  }

  pushTrafficTypeToDataLayer(false);
  notifyTrafficListeners();
}

export function syncInternalTrafficWithProfile(
  profile?: Profile | null,
  options?: { force?: boolean }
): boolean {
  if (!isAdminOrEditorRole(profile)) {
    return false;
  }
  return enableInternalTrafficMarker(options);
}

export function getInternalTrafficStatus() {
  const internalMarkerActive = isInternalTrafficMarked();
  const publicTestOverride = isPublicVisitorTestMode();
  const isAdminRoute = isAdminPathname();
  return {
    internalMarkerActive,
    publicTestOverride,
    isAdminRoute,
    effectiveTrafficType: (internalMarkerActive || isAdminRoute ? 'internal' : 'public') as
      | 'internal'
      | 'public',
  };
}

export function installInternalTrafficGlobalHelper(): void {
  if (typeof window === 'undefined') return;
  window.__amaanTraffic = {
    isInternal: isInternalTrafficMarked,
    isPublicTestMode: isPublicVisitorTestMode,
    enable: () => enableInternalTrafficMarker({ force: true }),
    clear: clearInternalTrafficMarker,
    status: getInternalTrafficStatus,
  };
}
