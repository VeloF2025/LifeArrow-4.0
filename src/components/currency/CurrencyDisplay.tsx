import React from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { clsx } from 'clsx';

interface CurrencyDisplayProps {
  amount: number;
  currencyCode?: string;
  className?: string;
  showOriginal?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  currencyCode,
  className,
  showOriginal = false,
  size = 'md'
}) => {
  const { formatPrice } = useCurrency();
  
  const priceDisplay = formatPrice(amount, currencyCode);
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold'
  };

  return (
    <div className={clsx('inline-flex flex-col', className)}>
      <span className={clsx('font-medium', sizeClasses[size])}>
        {priceDisplay.formatted}
      </span>
      {showOriginal && priceDisplay.originalAmount && priceDisplay.originalCurrency && (
        <span className="text-xs text-gray-500">
          Originally: {priceDisplay.originalCurrency.symbol}{priceDisplay.originalAmount.toFixed(priceDisplay.originalCurrency.decimalPlaces)} {priceDisplay.originalCurrency.code}
        </span>
      )}
    </div>
  );
};