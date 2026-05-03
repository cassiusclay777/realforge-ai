'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export type MediaProcessingStatus = 'IDLE' | 'QUEUED' | 'PROCESSING' | 'DONE' | 'FAILED' | 'PARTIAL';

export interface MediaProcessingState {
  listingId: string;
  overallStatus: MediaProcessingStatus;
  progress: number;
  totalMedia: number;
  statusCounts: {
    QUEUED: number;
    PROCESSING: number;
    DONE: number;
    FAILED: number;
    UNKNOWN: number;
  };
  media: Array<{
    id: string;
    url: string;
    category: string;
    status: string;
    processedAt: string | null;
    aiDescription: string | null;
    aiCaption: string | null;
    isFeatured: boolean;
    sortOrder: number;
  }>;
  lastUpdated: string | null;
  timestamp: string;
}

export interface UseListingMediaProcessingOptions {
  pollingInterval?: number; // ms, default 3000
  enabled?: boolean; // whether to start polling automatically
  onStatusChange?: (status: MediaProcessingStatus) => void;
  onProgressChange?: (progress: number) => void;
}

export function useListingMediaProcessing(
  listingId: string | null,
  options: UseListingMediaProcessingOptions = {}
) {
  const {
    pollingInterval = 3000,
    enabled = true,
    onStatusChange,
    onProgressChange,
  } = options;

  const [state, setState] = useState<MediaProcessingState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Refs to avoid stale closures in callbacks and track backoff state
  const stateRef = useRef<MediaProcessingState | null>(null);
  const onStatusChangeRef = useRef(onStatusChange);
  const onProgressChangeRef = useRef(onProgressChange);
  const consecutiveErrorsRef = useRef(0);
  const isPollingRef = useRef(false);

  useEffect(() => { onStatusChangeRef.current = onStatusChange; }, [onStatusChange]);
  useEffect(() => { onProgressChangeRef.current = onProgressChange; }, [onProgressChange]);
  useEffect(() => { isPollingRef.current = isPolling; }, [isPolling]);

  const fetchMediaStatus = useCallback(async () => {
    if (!listingId) {
      setState(null);
      stateRef.current = null;
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/listings/${listingId}/media-status`);

      if (!response.ok) {
        throw new Error(`Failed to fetch media status: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch media status');
      }

      const newState = result.data;
      const prevState = stateRef.current;

      setState(newState);
      stateRef.current = newState;
      consecutiveErrorsRef.current = 0;

      // Call callbacks only when values actually changed
      if (prevState?.overallStatus !== newState.overallStatus) {
        onStatusChangeRef.current?.(newState.overallStatus);
      }
      if (prevState?.progress !== newState.progress) {
        onProgressChangeRef.current?.(newState.progress);
      }

      // Auto-stop polling if processing is done or failed
      if (newState.overallStatus === 'DONE' || newState.overallStatus === 'FAILED') {
        setIsPolling(false);
      }

    } catch (err) {
      consecutiveErrorsRef.current++;
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching media status:', err);
    } finally {
      setIsLoading(false);
    }
  }, [listingId]); // listingId is the only real dependency

  // Start/stop polling based on enabled flag and processing state
  useEffect(() => {
    if (!listingId || !enabled) {
      setIsPolling(false);
      return;
    }

    // Start polling if processing is active
    const shouldPoll = state?.overallStatus === 'QUEUED' || 
                      state?.overallStatus === 'PROCESSING' || 
                      state?.overallStatus === 'PARTIAL';

    if (shouldPoll && !isPolling) {
      setIsPolling(true);
    } else if (!shouldPoll && isPolling) {
      setIsPolling(false);
    }
  }, [listingId, enabled, state?.overallStatus, isPolling]);

  // Initial fetch when enabled changes to true
  useEffect(() => {
    if (listingId && enabled && !state) {
      fetchMediaStatus();
    }
  }, [listingId, enabled, state, fetchMediaStatus]);

  // Polling effect with exponential backoff on repeated errors
  useEffect(() => {
    if (!isPolling) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      await fetchMediaStatus();
      if (cancelled || !isPollingRef.current) return;
      const errors = consecutiveErrorsRef.current;
      const interval = errors >= 20 ? 30_000 : errors >= 10 ? 10_000 : pollingInterval;
      timeoutId = setTimeout(poll, interval);
    };

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [isPolling, pollingInterval, fetchMediaStatus]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchMediaStatus();
  }, [fetchMediaStatus]);

  // Start processing function
  const startProcessing = useCallback(async () => {
    if (!listingId) {
      throw new Error('Listing ID is required');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/listings/${listingId}/process-media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to start processing: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to start processing');
      }

      // Start polling immediately
      setIsPolling(true);
      
      // Refresh status
      await fetchMediaStatus();

      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [listingId, fetchMediaStatus]);

  // Check if processing can be started
  const canStartProcessing = !state?.overallStatus || 
                            state.overallStatus === 'IDLE' || 
                            state.overallStatus === 'FAILED';

  // Check if processing is active
  const isProcessingActive = state?.overallStatus === 'QUEUED' || 
                            state?.overallStatus === 'PROCESSING' || 
                            state?.overallStatus === 'PARTIAL';

  // Check if processing is complete
  const isProcessingComplete = state?.overallStatus === 'DONE';

  // Check if processing failed
  const isProcessingFailed = state?.overallStatus === 'FAILED';

  return {
    // State
    state,
    isLoading,
    error,
    isPolling,
    
    // Actions
    refresh,
    startProcessing,
    
    // Derived state
    canStartProcessing,
    isProcessingActive,
    isProcessingComplete,
    isProcessingFailed,
    
    // Status helpers
    status: state?.overallStatus || 'IDLE',
    progress: state?.progress || 0,
    totalMedia: state?.totalMedia || 0,
    processedMedia: state?.statusCounts?.DONE || 0,
    
    // Media data
    media: state?.media || [],
    
    // Timestamps
    lastUpdated: state?.lastUpdated ? new Date(state.lastUpdated) : null,
    timestamp: state?.timestamp ? new Date(state.timestamp) : null,
  };
}

// Hook for starting media processing (simplified version)
export function useProcessListingMedia() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const startProcessing = useCallback(async (listingId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/listings/${listingId}/process-media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to start processing: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to start processing');
      }

      setData(result.data);
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    startProcessing,
    isLoading,
    error,
    data,
  };
}