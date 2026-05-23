import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import PropertyDetailModal from '@/components/PropertyDetailModal';

interface PropertyModalContextType {
  openPropertyModal: (property: any) => void;
  closePropertyModal: () => void;
  selectedProperty: any | null;
  isOpen: boolean;
}

const PropertyModalContext = createContext<PropertyModalContextType | undefined>(undefined);

export function PropertyModalProvider({ children }: { children: React.ReactNode }) {
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openPropertyModal = useCallback((property: any) => {
    setSelectedProperty(property);
    setIsOpen(true);
    
    // Prevent body scroll and preserve scroll position
    document.body.style.overflow = 'hidden';
  }, []);

  const closePropertyModal = useCallback(() => {
    setIsOpen(false);
    // Allow animation to finish before clearing state
    setTimeout(() => {
      setSelectedProperty(null);
    }, 400);
    
    // Restore body scroll
    document.body.style.overflow = '';
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <PropertyModalContext.Provider value={{ openPropertyModal, closePropertyModal, selectedProperty, isOpen }}>
      {children}
      <PropertyModalPortal />
    </PropertyModalContext.Provider>
  );
}

function PropertyModalPortal() {
  const { isOpen, closePropertyModal, selectedProperty } = usePropertyModal();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !selectedProperty) return null;

  return ReactDOM.createPortal(
    <PropertyDetailModal 
      isOpen={isOpen} 
      onClose={closePropertyModal} 
      property={selectedProperty} 
    />,
    document.body
  );
}

export function usePropertyModal() {
  const context = useContext(PropertyModalContext);
  if (context === undefined) {
    throw new Error('usePropertyModal must be used within a PropertyModalProvider');
  }
  return context;
}
