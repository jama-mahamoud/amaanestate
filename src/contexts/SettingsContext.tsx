import React, { createContext, useContext, useState, useEffect } from 'react';

// Translations
const translations = {
  en: {
    "Home": "Home",
    "Properties": "Properties",
    "Vehicles": "Vehicles",
    "Jobs": "Jobs",
    "Academy": "Academy",
    "Professionals": "Professionals",
    "About": "About",
    "Contact": "Contact",
    "Browse Properties": "Browse Properties",
    "Menu": "Menu",
    "Language": "Language",
    "Currency": "Currency",
    "Switch to Dark": "Switch to Dark",
    "Switch to Light": "Switch to Light",
    "My Dashboard": "My Dashboard",
    "Account": "Account",
    "Login": "Login",
    "Sign In": "Sign In",
    "Join Us": "Join Us",
    // MegaMenu content
    "Residential": "Residential",
    "Houses": "Houses",
    "Apartments": "Apartments",
    "Villas": "Villas",
    "Commercial": "Commercial",
    "Land": "Land",
    "Offices": "Offices",
    "Warehouses": "Warehouses",
    "Rental": "Rental",
    "Rentals": "Rentals",
    "Furnished": "Furnished",
    "Cars": "Cars",
    "SUVs": "SUVs",
    "Trucks": "Trucks",
    "Motorcycles": "Motorcycles",
    "Heavy Machinery": "Heavy Machinery",
    "Legal Experts": "Legal Experts",
    "Valuators": "Valuators",
    "Consultants": "Consultants",
    "Brokers": "Brokers",
    "WhatsApp Support": "WhatsApp Support",
    "EN": "EN",
    "SOM": "SOM",
    "USD": "USD",
    "ETB": "ETB"
  },
  so: {
    "Home": "Bogga Hore",
    "Properties": "Guryaha",
    "Vehicles": "Gaadiidka",
    "Jobs": "Shaqooyinka",
    "Academy": "Akadeemiyada",
    "Professionals": "Xirfadlayaasha",
    "About": "Ku Saabsan",
    "Contact": "Xiriir",
    "Browse Properties": "Baadh Guryaha",
    "Menu": "Tusaha",
    "Language": "Luqadda",
    "Currency": "Lacagta",
    "Switch to Dark": "Mawduuca Madoow",
    "Switch to Light": "Mawduuca Iftiinka",
    "My Dashboard": "Pankeeyga",
    "Account": "Koontada",
    "Login": "Gal",
    "Sign In": "Gal",
    "Join Us": "Nagu Soo Biir",
    "Residential": "Hooys Degaan",
    "Houses": "Guryaha",
    "Apartments": "Abaartamaano",
    "Villas": "Fillooyin",
    "Commercial": "Ganacsi",
    "Land": "Dhul",
    "Offices": "Xafiisyo",
    "Warehouses": "Bakaaro",
    "Rental": "Kiro",
    "Rentals": "Kirooyin",
    "Furnished": "Alaabeysan",
    "Cars": "Gawaarida",
    "SUVs": "Gawaarida Waaweyn",
    "Trucks": "Gawaarida Xamuulka",
    "Motorcycles": "Mootooyin",
    "Heavy Machinery": "Cagaf-Cagaf",
    "Legal Experts": "Khubaro Sharci",
    "Valuators": "Qiimayaal",
    "Consultants": "Lataliyayaal",
    "Brokers": "Dillaaliin",
    "WhatsApp Support": "Taageerada WhatsApp",
    "EN": "Ingiriis (EN)",
    "SOM": "Soomaali (SOM)",
    "USD": "Doolar (USD)",
    "ETB": "Birr (ETB)"
  }
};

type Language = 'en' | 'so';
type Currency = 'ETB' | 'USD';

interface SettingsContextType {
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  t: (key: string) => string;
  formatPriceConverted: (price: number | string, baseCurrency?: string) => string;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

const EXCHANGE_RATE_ETB_TO_USD = 1 / 135; // 1 ETB = ~0.0074 USD (Example)
const EXCHANGE_RATE_USD_TO_ETB = 135; // 1 USD = 135 ETB

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('amaan_language') as Language) || 'en';
  });
  
  const [currency, setCurrency] = useState<Currency>(() => {
    return (localStorage.getItem('amaan_currency') as Currency) || 'ETB';
  });

  useEffect(() => {
    localStorage.setItem('amaan_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('amaan_currency', currency);
  }, [currency]);

  const t = (key: string) => {
    return (translations[language] as Record<string, string>)[key] || key;
  };

  const formatPriceConverted = (price: number | string, baseCurrency: string = 'ETB') => {
    if (typeof price !== 'number') return String(price);

    let priceInETB = price;
    if (baseCurrency === 'USD') {
      priceInETB = price * EXCHANGE_RATE_USD_TO_ETB;
    }

    let displayPrice = priceInETB;
    if (currency === 'USD') {
      displayPrice = priceInETB * EXCHANGE_RATE_ETB_TO_USD;
      return `$${displayPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    
    return `${displayPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })} ETB`;
  };

  return (
    <SettingsContext.Provider value={{ language, currency, setLanguage, setCurrency, t, formatPriceConverted }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
