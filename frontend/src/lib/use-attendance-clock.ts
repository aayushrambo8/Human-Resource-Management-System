'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AttendanceRecord } from '@/lib/types';

const STORAGE_KEY_CHECKED_IN = 'hrms_clock_checked_in';
const STORAGE_KEY_SECONDS = 'hrms_clock_seconds';
const STORAGE_KEY_TIMESTAMP = 'hrms_clock_timestamp';
const STORAGE_KEY_PUNCHES = 'hrms_clock_local_punches';
const STORAGE_KEY_ON_BREAK = 'hrms_clock_on_break';

export function useAttendanceClock() {
  const [isCheckedIn, setIsCheckedInState] = useState<boolean>(true);
  const [isOnBreak, setIsOnBreakState] = useState<boolean>(false);
  const [activeSeconds, setActiveSeconds] = useState<number>(25420); // default ~7h 03m
  const [breakSeconds, setBreakSeconds] = useState<number>(0);
  const [localPunches, setLocalPunches] = useState<AttendanceRecord[]>([]);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedCheckedIn = localStorage.getItem(STORAGE_KEY_CHECKED_IN);
      const storedSeconds = localStorage.getItem(STORAGE_KEY_SECONDS);
      const storedTimestamp = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
      const storedPunches = localStorage.getItem(STORAGE_KEY_PUNCHES);
      const storedOnBreak = localStorage.getItem(STORAGE_KEY_ON_BREAK);

      if (storedCheckedIn !== null) {
        setIsCheckedInState(storedCheckedIn === 'true');
      }

      if (storedOnBreak !== null) {
        setIsOnBreakState(storedOnBreak === 'true');
      }

      if (storedPunches) {
        try {
          const parsed = JSON.parse(storedPunches);
          if (Array.isArray(parsed)) {
            setLocalPunches(parsed);
          }
        } catch {
          // ignore corrupted json
        }
      }

      let baseSeconds = storedSeconds ? parseInt(storedSeconds, 10) : 25420;
      if (isNaN(baseSeconds)) baseSeconds = 25420;

      // If user was checked in and not on break, calculate elapsed seconds since last timestamp
      if (storedCheckedIn === 'true' && storedTimestamp && storedOnBreak !== 'true') {
        const lastTime = parseInt(storedTimestamp, 10);
        if (!isNaN(lastTime)) {
          const elapsed = Math.floor((Date.now() - lastTime) / 1000);
          if (elapsed > 0 && elapsed < 86400) {
            baseSeconds += elapsed;
          }
        }
      }

      setActiveSeconds(baseSeconds);
    } catch {
      // localStorage disabled or private browsing
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Tick the stopwatch every second if checked in
  useEffect(() => {
    if (!isHydrated) return;

    let interval: NodeJS.Timeout | null = null;
    if (isCheckedIn && !isOnBreak) {
      interval = setInterval(() => {
        setActiveSeconds((prev) => {
          const next = prev + 1;
          try {
            localStorage.setItem(STORAGE_KEY_SECONDS, String(next));
            localStorage.setItem(STORAGE_KEY_TIMESTAMP, String(Date.now()));
          } catch {
            // ignore
          }
          return next;
        });
      }, 1000);
    } else if (isCheckedIn && isOnBreak) {
      interval = setInterval(() => {
        setBreakSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCheckedIn, isOnBreak, isHydrated]);

  // Persist check-in status
  const setIsCheckedIn = useCallback((checked: boolean) => {
    setIsCheckedInState(checked);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_CHECKED_IN, String(checked));
        localStorage.setItem(STORAGE_KEY_TIMESTAMP, String(Date.now()));
        if (!checked) {
          setIsOnBreakState(false);
          localStorage.setItem(STORAGE_KEY_ON_BREAK, 'false');
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const toggleBreak = useCallback(() => {
    setIsOnBreakState((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_ON_BREAK, String(next));
          localStorage.setItem(STORAGE_KEY_TIMESTAMP, String(Date.now()));
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, []);

  const addPunch = useCallback((punch: { direction: 'IN' | 'OUT'; deviceCode: string; time: string; employeeName?: string; employeeCode?: string }) => {
    const record: AttendanceRecord = {
      id: `punch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      employeeId: 'emp-curr',
      employeeCode: punch.employeeCode || 'EMP-01',
      employeeName: punch.employeeName || 'Current User',
      deviceCode: punch.deviceCode || 'WEB-TERMINAL',
      punchTime: punch.time,
      direction: punch.direction,
    };

    setLocalPunches((prev) => {
      const updated = [record, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_PUNCHES, JSON.stringify(updated.slice(0, 50)));
        } catch {
          // ignore
        }
      }
      return updated;
    });

    setIsCheckedIn(punch.direction === 'IN');
  }, [setIsCheckedIn]);

  return {
    isCheckedIn,
    setIsCheckedIn,
    isOnBreak,
    toggleBreak,
    activeSeconds,
    breakSeconds,
    localPunches,
    addPunch,
    isHydrated,
  };
}

