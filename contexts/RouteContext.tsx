import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SavedRoute } from '@/types';

interface RouteContextType {
  loadedRoute: SavedRoute | null;
  setLoadedRoute: (route: SavedRoute | null) => void;
  isRouteLoaded: boolean;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export function RouteProvider({ children }: { children: ReactNode }) {
  const [loadedRoute, setLoadedRoute] = useState<SavedRoute | null>(null);

  const contextValue: RouteContextType = {
    loadedRoute,
    setLoadedRoute,
    isRouteLoaded: loadedRoute !== null,
  };

  return (
    <RouteContext.Provider value={contextValue}>
      {children}
    </RouteContext.Provider>
  );
}

export function useRoute() {
  const context = useContext(RouteContext);
  if (context === undefined) {
    throw new Error('useRoute must be used within a RouteProvider');
  }
  return context;
} 