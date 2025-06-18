import React from 'react';
import { Globe } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { clsx } from 'clsx';

interface CurrencySelectorProps {
  onCurrencyChange?: (currencyCode: string) => void;
  className?: string;
  compact?: boolean;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  onCurrencyChange,
  className,
  compact = false
}) => {
  const { getActiveCurrencies, currentCurrency, setDefaultCurrency } = useCurrency();
  
  const activeCurrencies = getActiveCurrencies();

  const handleCurrencyChange = async (currencyCode: string) => {
    try {
      await setDefaultCurrency(currencyCode);
      onCurrencyChange?.(currencyCode);
    } catch (error) {
      console.error('Failed to change currency:', error);
    }
  };

  if (compact) {
    return (
      <select
        value={currentCurrency.code}
        onChange={(e) => handleCurrencyChange(e.target.value)}
        className={clsx(
          'text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-500',
          className
        )}
      >
        {activeCurrencies.map(currency => (
          <option key={currency.code} value={currency.code}>
            {currency.symbol} {currency.code}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className={clsx('flex items-center space-x-2', className)}>
      <Globe className="w-4 h-4 text-gray-500" />
      <select
        value={currentCurrency.code}
        onChange={(e) => handleCurrencyChange(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
      >
        {activeCurrencies.map(currency => (
          <option key={currency.code} value={currency.code}>
            {currency.symbol} {currency.name} ({currency.code})
          </option>
        ))}
      </select>
    </div>
  );
};