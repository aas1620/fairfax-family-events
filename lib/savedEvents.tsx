'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface SavedEventsContextType {
  savedEventIds: Set<string>;
  toggleSaved: (eventId: string) => void;
  isSaved: (eventId: string) => boolean;
}

const SavedEventsContext = createContext<SavedEventsContextType | undefined>(undefined);

const STORAGE_KEY = 'fairfax-family-events-saved';

export function SavedEventsProvider({ children }: { children: ReactNode }) {
  const [savedEventIds, setSavedEventIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved events from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedEventIds(new Set(parsed));
        }
      }
    } catch (e) {
      console.error('Failed to load saved events:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever savedEventIds changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...savedEventIds]));
      } catch (e) {
        console.error('Failed to save events:', e);
      }
    }
  }, [savedEventIds, isLoaded]);

  const toggleSaved = useCallback((eventId: string) => {
    setSavedEventIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  }, []);

  const isSaved = useCallback((eventId: string) => {
    return savedEventIds.has(eventId);
  }, [savedEventIds]);

  return (
    <SavedEventsContext.Provider value={{ savedEventIds, toggleSaved, isSaved }}>
      {children}
    </SavedEventsContext.Provider>
  );
}

export function useSavedEvents() {
  const context = useContext(SavedEventsContext);
  if (context === undefined) {
    throw new Error('useSavedEvents must be used within a SavedEventsProvider');
  }
  return context;
}
