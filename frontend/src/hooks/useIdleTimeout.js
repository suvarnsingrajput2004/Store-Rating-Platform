import { useState, useEffect, useRef, useCallback } from 'react';
import { SESSION_TIMEOUT, WARNING_TIMEOUT } from '../config/session';

/**
 * useIdleTimeout - tracks user inactivity and triggers warning/logout.
 *
 * Architecture:
 * - All mutable state used inside callbacks/timers is stored in refs to avoid
 *   stale closures and dependency-array pollution.
 * - The main useEffect depends ONLY on `isAuthenticated`.
 * - `onLogout` is stored in a ref and kept fresh via a separate sync useEffect.
 * - Timer IDs are stored in refs and properly cleaned up.
 */
const useIdleTimeout = (isAuthenticated, onLogout) => {
  const [showWarning, setShowWarning] = useState(false);

  // ---- Refs ----
  const onLogoutRef = useRef(onLogout);
  const isWarningRef = useRef(false);
  const warningTimerId = useRef(null);
  const logoutTimerId = useRef(null);
  const isActiveRef = useRef(false); // tracks whether the effect is currently active

  // Keep the logout callback ref fresh
  useEffect(() => {
    onLogoutRef.current = onLogout;
  }, [onLogout]);

  // ---- Timer helpers (stable, no deps) ----
  const clearAllTimers = useCallback(() => {
    if (warningTimerId.current !== null) {
      clearTimeout(warningTimerId.current);
      warningTimerId.current = null;
    }
    if (logoutTimerId.current !== null) {
      clearTimeout(logoutTimerId.current);
      logoutTimerId.current = null;
    }
  }, []);

  const startTimers = useCallback(() => {
    // Always clear before starting to prevent duplicates
    clearAllTimers();

    // Close warning if it was open
    isWarningRef.current = false;
    setShowWarning(false);

    // Only start if the effect is currently active
    if (!isActiveRef.current) {
      return;
    }

    const wId = setTimeout(() => {
      console.log('%c[IdleTimeout] ⚠ WARNING timer fired!', 'color: orange; font-weight: bold;');
      isWarningRef.current = true;
      setShowWarning(true);
    }, WARNING_TIMEOUT);

    const lId = setTimeout(() => {
      console.log('%c[IdleTimeout] 🔴 LOGOUT timer fired!', 'color: red; font-weight: bold;');
      isWarningRef.current = false;
      setShowWarning(false);
      warningTimerId.current = null;
      logoutTimerId.current = null;
      onLogoutRef.current('idle_timeout');
    }, SESSION_TIMEOUT);

    warningTimerId.current = wId;
    logoutTimerId.current = lId;

    console.log(
      `%c[IdleTimeout] ✅ Timers started — warning: ${WARNING_TIMEOUT}ms, logout: ${SESSION_TIMEOUT}ms (IDs: ${wId}, ${lId})`,
      'color: lime; font-weight: bold;'
    );
  }, [clearAllTimers]);

  // ---- Exposed handlers ----
  const stayLoggedIn = useCallback(() => {
    console.log('[IdleTimeout] User clicked Stay Logged In');
    startTimers();
  }, [startTimers]);

  const logoutNow = useCallback(() => {
    console.log('[IdleTimeout] User clicked Logout Now');
    clearAllTimers();
    isWarningRef.current = false;
    setShowWarning(false);
    onLogoutRef.current('manual_logout');
  }, [clearAllTimers]);

  // ---- MAIN EFFECT: depends ONLY on isAuthenticated ----
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('%c[IdleTimeout] 🔒 Not authenticated — idle tracker OFF', 'color: gray;');
      isActiveRef.current = false;
      clearAllTimers();
      isWarningRef.current = false;
      setShowWarning(false);
      return undefined;
    }

    // Mark as active BEFORE starting timers
    isActiveRef.current = true;
    console.log('%c[IdleTimeout] 🟢 Authenticated — idle tracker ON', 'color: lime; font-weight: bold; font-size: 14px;');

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      // Only reset if warning is NOT showing (user must click "Stay Logged In")
      if (!isWarningRef.current) {
        startTimers();
      }
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });
    console.log('[IdleTimeout] Event listeners attached:', events.join(', '));

    // Start the first set of timers
    startTimers();

    // Cleanup
    return () => {
      console.log('[IdleTimeout] Cleanup — removing listeners & timers');
      isActiveRef.current = false;
      events.forEach(event => window.removeEventListener(event, handleActivity));
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);
  // startTimers and clearAllTimers are stable (useCallback with []) — safe to omit.

  return { isWarningOpen: showWarning, stayLoggedIn, logoutNow };
};

export default useIdleTimeout;
