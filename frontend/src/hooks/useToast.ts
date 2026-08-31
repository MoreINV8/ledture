import { useCallback, useEffect, useRef, useState } from "react";

import type { ToastMessage, ToastType } from "../types";

const TOAST_DURATION_MS = 4000;

export const useToast = () => {
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
  }, []);

  const dismissToast = useCallback(() => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setToastMessage(null);
  }, []);

  const showToast = useCallback((text: string, type: ToastType = "success") => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    setToastMessage({ text, type });
    timeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
      timeoutRef.current = null;
    }, TOAST_DURATION_MS);
  }, []);

  return { toastMessage, showToast, dismissToast };
};
