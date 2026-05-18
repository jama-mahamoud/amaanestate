import React, { createContext, useContext, useState } from 'react';
import { ListingCategory } from '../types';

interface DashboardContextType {
  isListingModalOpen: boolean;
  listingCategory: ListingCategory;
  openListingModal: (category?: ListingCategory) => void;
  closeListingModal: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [listingCategory, setListingCategory] = useState<ListingCategory>('property');

  const openListingModal = (category: ListingCategory = 'property') => {
    setListingCategory(category);
    setIsListingModalOpen(true);
  };

  const closeListingModal = () => {
    setIsListingModalOpen(false);
  };

  return (
    <DashboardContext.Provider 
      value={{ 
        isListingModalOpen, 
        listingCategory, 
        openListingModal, 
        closeListingModal 
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
