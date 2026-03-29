import { useState, useEffect, useCallback } from "react";
import api from "../api";

/**
 * useFetch — generic data fetching hook with loading + error state
 * Usage: const { data, loading, error, refetch } = useFetch("/challenges")
 */
export function useFetch(url, params = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(url, { params });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * useLocalStorage — synced localStorage state
 * Usage: const [theme, setTheme] = useLocalStorage("theme", "dark")
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error("useLocalStorage error:", err);
    }
  };

  return [storedValue, setValue];
}

/**
 * useSubmissionPoller — polls a submission until it's resolved
 * Usage: const { result, polling } = useSubmissionPoller(submissionId)
 */
export function useSubmissionPoller(submissionId) {
  const [result, setResult] = useState(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (!submissionId) return;
    setPolling(true);
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await api.get(`/submissions/${submissionId}`);
        const { status } = res.data;
        if (status !== "pending" && status !== "running") {
          clearInterval(interval);
          setResult(res.data);
          setPolling(false);
        }
      } catch {
        clearInterval(interval);
        setPolling(false);
      }
      if (attempts > 30) {
        clearInterval(interval);
        setPolling(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [submissionId]);

  return { result, polling };
}
