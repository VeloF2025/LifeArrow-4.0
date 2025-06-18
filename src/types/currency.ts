export interface Currency {
  code: string;
  name: string;
  symbol: string;
  symbolPosition: 'before' | 'after';
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
  exchangeRate: number; // Rate relative to base currency (ZAR)
  isActive: boolean;
  isDefault: boolean;
}

export interface CurrencySettings {
  defaultCurrency: string;
  displaySymbol: boolean;
  showCurrencyCode: boolean;
  autoConvert: boolean;
}

export interface PriceDisplay {
  amount: number;
  currency: Currency;
  formatted: string;
  originalAmount?: number;
  originalCurrency?: Currency;
}