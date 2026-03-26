'use client';
import { useState, useCallback, useRef, useEffect } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useSaveStatus() {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const startSave = useCallback(() => {
    clearTimer();
    setStatus('saving');
  }, [clearTimer]);

  const completeSave = useCallback(() => {
    clearTimer();
    setStatus('saved');
    timerRef.current = setTimeout(() => {
      setStatus('idle');
      timerRef.current = undefined;
    }, 2000);
  }, [clearTimer]);

  const failSave = useCallback(() => {
    clearTimer();
    setStatus('error');
    timerRef.current = setTimeout(() => {
      setStatus('idle');
      timerRef.current = undefined;
    }, 5000);
  }, [clearTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== undefined) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { status, startSave, completeSave, failSave };
}
