import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { type TimerSession } from '../types/api';
import apiClient from '../api/client';
import { useAuth } from './AuthContext';

interface TimerContextType {
  activeTimer: TimerSession | null;
  isLoading: boolean;
  elapsedTime: number;
  startTimer: (data: { clientId?: number; projectId?: number; description?: string }) => Promise<void>;
  stopTimer: (data: { createWorkEntry?: boolean; clientId?: number; projectId?: number; description?: string; isBillable?: boolean }) => Promise<void>;
  updateTimer: (data: { clientId?: number; projectId?: number; description?: string }) => Promise<void>;
  discardTimer: () => Promise<void>;
  refreshTimer: () => Promise<void>;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

interface TimerProviderProps {
  children: ReactNode;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [activeTimer, setActiveTimer] = useState<TimerSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const calculateElapsedTime = useCallback((startTime: string): number => {
    const start = new Date(startTime).getTime();
    const now = Date.now();
    return Math.floor((now - start) / 1000);
  }, []);

  const refreshTimer = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      const response = await apiClient.getActiveTimer();
      setActiveTimer(response.timer);
      if (response.timer) {
        setElapsedTime(calculateElapsedTime(response.timer.start_time));
      } else {
        setElapsedTime(0);
      }
    } catch (error) {
      console.error('Failed to fetch active timer:', error);
      setActiveTimer(null);
      setElapsedTime(0);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, calculateElapsedTime]);

  useEffect(() => {
    refreshTimer();
  }, [refreshTimer]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (activeTimer) {
      interval = setInterval(() => {
        setElapsedTime(calculateElapsedTime(activeTimer.start_time));
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeTimer, calculateElapsedTime]);

  const startTimer = async (data: { clientId?: number; projectId?: number; description?: string }) => {
    try {
      setIsLoading(true);
      const response = await apiClient.startTimer(data);
      setActiveTimer(response.timer);
      setElapsedTime(0);
    } catch (error) {
      console.error('Failed to start timer:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const stopTimer = async (data: { createWorkEntry?: boolean; clientId?: number; projectId?: number; description?: string; isBillable?: boolean }) => {
    try {
      setIsLoading(true);
      await apiClient.stopTimer(data);
      setActiveTimer(null);
      setElapsedTime(0);
    } catch (error) {
      console.error('Failed to stop timer:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTimer = async (data: { clientId?: number; projectId?: number; description?: string }) => {
    try {
      setIsLoading(true);
      await apiClient.updateTimer(data);
      await refreshTimer();
    } catch (error) {
      console.error('Failed to update timer:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const discardTimer = async () => {
    try {
      setIsLoading(true);
      await apiClient.discardTimer();
      setActiveTimer(null);
      setElapsedTime(0);
    } catch (error) {
      console.error('Failed to discard timer:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: TimerContextType = {
    activeTimer,
    isLoading,
    elapsedTime,
    startTimer,
    stopTimer,
    updateTimer,
    discardTimer,
    refreshTimer,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};
