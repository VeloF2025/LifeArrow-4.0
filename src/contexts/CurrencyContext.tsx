import React, { createContext, useContext, useState, useEffect } from 'react';
import { Currency, CurrencySettings, PriceDisplay } from '../types/currency';

interface CurrencyContextType {
  currencies: Currency[];
  currentCurrency: Currency;
  settings: CurrencySettings;
  isLoading: boolean;
  
  // Currency management
  addCurrency: (currency: Omit<Currency, 'exchangeRate'>, exchangeRate: number) => Promise<void>;
  updateCurrency: (code: string, updates: Partial<Currency>) => Promise<void>;
  deleteCurrency: (code: string) => Promise<void>;
  setDefaultCurrency: (code: string) => Promise<void>;
  
  // Settings
  updateSettings: (settings: Partial<CurrencySettings>) => Promise<void>;
  
  // Formatting and conversion
  formatPrice: (amount: number, currencyCode?: string) => PriceDisplay;
  convertPrice: (amount: number, fromCurrency: string, toCurrency: string) => number;
  
  // Queries
  getCurrencyByCode: (code: string) => Currency | undefined;
  getActiveCurrencies: () => Currency[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Initial currencies with South African Rand as default
const initialCurrencies: Currency[] = [
  {
    code: 'ZAR',
    name: 'South African Rand',
    symbol: 'R',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ' ',
    decimalSeparator: '.',
    exchangeRate: 1.0, // Base currency
    isActive: true,
    isDefault: true,
  },
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    exchangeRate: 0.054, // 1 ZAR = 0.054 USD (approximate)
    isActive: true,
    isDefault: false,
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    exchangeRate: 0.049, // 1 ZAR = 0.049 EUR (approximate)
    isActive: true,
    isDefault: false,
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    exchangeRate: 0.043, // 1 ZAR = 0.043 GBP (approximate)
    isActive: true,
    isDefault: false,
  },
];

const initialSettings: CurrencySettings = {
  defaultCurrency: 'ZAR',
  displaySymbol: true,
  showCurrencyCode: false,
  autoConvert: false,
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currencies, setCurrencies] = useState<Currency[]>(initialCurrencies);
  const [settings, setSettings] = useState<CurrencySettings>(initialSettings);
  const [isLoading, setIsLoading] = useState(false);

  // Get current currency
  const currentCurrency = currencies.find(c => c.code === settings.defaultCurrency) || currencies[0];

  useEffect(() => {
    // Load saved currencies and settings from localStorage
    const savedCurrencies = localStorage.getItem('lifeArrowCurrencies');
    const savedSettings = localStorage.getItem('lifeArrowCurrencySettings');
    
    if (savedCurrencies) {
      try {
        setCurrencies(JSON.parse(savedCurrencies));
      } catch (error) {
        console.error('Failed to load saved currencies:', error);
      }
    }
    
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to load saved settings:', error);
      }
    }
  }, []);

  const saveCurrencies = (newCurrencies: Currency[]) => {
    setCurrencies(newCurrencies);
    localStorage.setItem('lifeArrowCurrencies', JSON.stringify(newCurrencies));
  };

  const saveSettings = (newSettings: CurrencySettings) => {
    setSettings(newSettings);
    localStorage.setItem('lifeArrowCurrencySettings', JSON.stringify(newSettings));
  };

  const addCurrency = async (currencyData: Omit<Currency, 'exchangeRate'>, exchangeRate: number): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newCurrency: Currency = {
      ...currencyData,
      exchangeRate,
      isDefault: false,
    };
    
    const updatedCurrencies = [...currencies, newCurrency];
    saveCurrencies(updatedCurrencies);
    setIsLoading(false);
  };

  const updateCurrency = async (code: string, updates: Partial<Currency>): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedCurrencies = currencies.map(currency =>
      currency.code === code ? { ...currency, ...updates } : currency
    );
    
    saveCurrencies(updatedCurrencies);
    setIsLoading(false);
  };

  const deleteCurrency = async (code: string): Promise<void> => {
    if (code === settings.defaultCurrency) {
      throw new Error('Cannot delete the default currency');
    }
    
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedCurrencies = currencies.filter(currency => currency.code !== code);
    saveCurrencies(updatedCurrencies);
    setIsLoading(false);
  };

  const setDefaultCurrency = async (code: string): Promise<void> => {
    const currency = currencies.find(c => c.code === code);
    if (!currency) {
      throw new Error('Currency not found');
    }
    
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update currencies to set new default
    const updatedCurrencies = currencies.map(c => ({
      ...c,
      isDefault: c.code === code
    }));
    
    saveCurrencies(updatedCurrencies);
    
    // Update settings
    const updatedSettings = { ...settings, defaultCurrency: code };
    saveSettings(updatedSettings);
    
    setIsLoading(false);
  };

  const updateSettings = async (newSettings: Partial<CurrencySettings>): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const updatedSettings = { ...settings, ...newSettings };
    saveSettings(updatedSettings);
    setIsLoading(false);
  };

  const formatNumber = (amount: number, currency: Currency): string => {
    const fixedAmount = amount.toFixed(currency.decimalPlaces);
    const [integerPart, decimalPart] = fixedAmount.split('.');
    
    // Add thousands separators
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandsSeparator);
    
    // Combine with decimal part
    const formattedNumber = decimalPart 
      ? `${formattedInteger}${currency.decimalSeparator}${decimalPart}`
      : formattedInteger;
    
    return formattedNumber;
  };

  const formatPrice = (amount: number, currencyCode?: string): PriceDisplay => {
    const targetCurrency = currencyCode 
      ? currencies.find(c => c.code === currencyCode) || currentCurrency
      : currentCurrency;
    
    let displayAmount = amount;
    let originalAmount: number | undefined;
    let originalCurrency: Currency | undefined;
    
    // Convert if needed and auto-convert is enabled
    if (settings.autoConvert && currencyCode && currencyCode !== settings.defaultCurrency) {
      originalAmount = amount;
      originalCurrency = currencies.find(c => c.code === currencyCode);
      displayAmount = convertPrice(amount, currencyCode, settings.defaultCurrency);
    }
    
    const formattedNumber = formatNumber(displayAmount, targetCurrency);
    
    let formatted = '';
    
    if (settings.displaySymbol) {
      if (targetCurrency.symbolPosition === 'before') {
        formatted = `${targetCurrency.symbol}${formattedNumber}`;
      } else {
        formatted = `${formattedNumber}${targetCurrency.symbol}`;
      }
    } else {
      formatted = formattedNumber;
    }
    
    if (settings.showCurrencyCode) {
      formatted += ` ${targetCurrency.code}`;
    }
    
    return {
      amount: displayAmount,
      currency: targetCurrency,
      formatted,
      originalAmount,
      originalCurrency,
    };
  };

  const convertPrice = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount;
    
    const fromCurr = currencies.find(c => c.code === fromCurrency);
    const toCurr = currencies.find(c => c.code === toCurrency);
    
    if (!fromCurr || !toCurr) {
      throw new Error('Currency not found');
    }
    
    // Convert to base currency (ZAR) first, then to target currency
    const amountInZAR = amount / fromCurr.exchangeRate;
    const convertedAmount = amountInZAR * toCurr.exchangeRate;
    
    return convertedAmount;
  };

  const getCurrencyByCode = (code: string): Currency | undefined => {
    return currencies.find(c => c.code === code);
  };

  const getActiveCurrencies = (): Currency[] => {
    return currencies.filter(c => c.isActive);
  };

  return (
    <CurrencyContext.Provider value={{
      currencies,
      currentCurrency,
      settings,
      isLoading,
      addCurrency,
      updateCurrency,
      deleteCurrency,
      setDefaultCurrency,
      updateSettings,
      formatPrice,
      convertPrice,
      getCurrencyByCode,
      getActiveCurrencies,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};