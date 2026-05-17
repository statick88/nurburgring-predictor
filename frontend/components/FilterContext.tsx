'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface FilterState {
  categories: string[];
  minConfidence: number;
  onlyPredicted: boolean;
  searchQuery: string;
}

interface FilterContextType {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  updateCategory: (category: string) => void;
  updateConfidence: (value: number) => void;
  togglePredicted: () => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const defaultFilters: FilterState = {
  categories: [],
  minConfidence: 0,
  onlyPredicted: false,
  searchQuery: '',
};

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const updateCategory = useCallback((category: string) => {
    setFilters((prev) => {
      const newCategories = prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories: newCategories };
    });
  }, []);

  const updateConfidence = useCallback((value: number) => {
    setFilters((prev) => ({ ...prev, minConfidence: value }));
  }, []);

  const togglePredicted = useCallback(() => {
    setFilters((prev) => ({ ...prev, onlyPredicted: !prev.onlyPredicted }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <FilterContext.Provider
      value={{
        filters,
        setFilters,
        updateCategory,
        updateConfidence,
        togglePredicted,
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
