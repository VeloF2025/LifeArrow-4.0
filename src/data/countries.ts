import { Country } from '../types/treatmentCentres';

export const countries: Country[] = [
  // South Africa
  {
    code: 'ZA',
    name: 'South Africa',
    currency: {
      code: 'ZAR',
      name: 'South African Rand',
      symbol: 'R',
      symbolPosition: 'before',
      decimalPlaces: 2,
      thousandsSeparator: ' ',
      decimalSeparator: '.',
    },
    timezone: 'Africa/Johannesburg',
    phonePrefix: '+27',
  },
  
  // United States
  {
    code: 'US',
    name: 'United States',
    currency: {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      symbolPosition: 'before',
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.',
    },
    timezone: 'America/New_York',
    phonePrefix: '+1',
  },
  
  // United Kingdom
  {
    code: 'GB',
    name: 'United Kingdom',
    currency: {
      code: 'GBP',
      name: 'British Pound',
      symbol: '£',
      symbolPosition: 'before',
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.',
    },
    timezone: 'Europe/London',
    phonePrefix: '+44',
  },
  
  // Canada
  {
    code: 'CA',
    name: 'Canada',
    currency: {
      code: 'CAD',
      name: 'Canadian Dollar',
      symbol: 'C$',
      symbolPosition: 'before',
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.',
    },
    timezone: 'America/Toronto',
    phonePrefix: '+1',
  },
  
  // Australia
  {
    code: 'AU',
    name: 'Australia',
    currency: {
      code: 'AUD',
      name: 'Australian Dollar',
      symbol: 'A$',
      symbolPosition: 'before',
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.',
    },
    timezone: 'Australia/Sydney',
    phonePrefix: '+61',
  },
  
  // Germany
  {
    code: 'DE',
    name: 'Germany',
    currency: {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      symbolPosition: 'before',
      decimalPlaces: 2,
      thousandsSeparator: ' ',
      decimalSeparator: ',',
    },
    timezone: 'Europe/Berlin',
    phonePrefix: '+49',
  },
  
  // France
  {
    code: 'FR',
    name: 'France',
    currency: {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      symbolPosition: 'before',
      decimalPlaces: 2,
      thousandsSeparator: ' ',
      decimalSeparator: ',',
    },
    timezone: 'Europe/Paris',
    phonePrefix: '+33',
  },
  
  // Japan
  {
    code: 'JP',
    name: 'Japan',
    currency: {
      code: 'JPY',
      name: 'Japanese Yen',
      symbol: '¥',
      symbolPosition: 'before',
      decimalPlaces: 0,
      thousandsSeparator: ',',
      decimalSeparator: '.',
    },
    timezone: 'Asia/Tokyo',
    phonePrefix: '+81',
  },
  
  // Singapore
  {
    code: 'SG',
    name: 'Singapore',
    currency: {
      code: 'SGD',
      name: 'Singapore Dollar',
      symbol: 'S$',
      symbolPosition: 'before',
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.',
    },
    timezone: 'Asia/Singapore',
    phonePrefix: '+65',
  },
  
  // United Arab Emirates
  {
    code: 'AE',
    name: 'United Arab Emirates',
    currency: {
      code: 'AED',
      name: 'UAE Dirham',
      symbol: 'د.إ',
      symbolPosition: 'before',
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.',
    },
    timezone: 'Asia/Dubai',
    phonePrefix: '+971',
  },
];

export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(country => country.code === code);
};

export const getCountriesByCurrency = (currencyCode: string): Country[] => {
  return countries.filter(country => country.currency.code === currencyCode);
};

export const getAllCurrencies = () => {
  const currencyMap = new Map();
  countries.forEach(country => {
    if (!currencyMap.has(country.currency.code)) {
      currencyMap.set(country.currency.code, country.currency);
    }
  });
  return Array.from(currencyMap.values());
};