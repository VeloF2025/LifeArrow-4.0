import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Globe } from 'lucide-react';
import { Currency } from '../../types/currency';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (currencyData: Omit<Currency, 'exchangeRate'>, exchangeRate: number) => Promise<void>;
  currency?: Currency | null;
  mode: 'create' | 'edit';
}

interface CurrencyFormData {
  code: string;
  name: string;
  symbol: string;
  symbolPosition: 'before' | 'after';
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
  exchangeRate: number;
  isActive: boolean;
}

const initialFormData: CurrencyFormData = {
  code: '',
  name: '',
  symbol: '',
  symbolPosition: 'before',
  decimalPlaces: 2,
  thousandsSeparator: ',',
  decimalSeparator: '.',
  exchangeRate: 1,
  isActive: true,
};

export const CurrencyModal: React.FC<CurrencyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currency,
  mode
}) => {
  const [formData, setFormData] = useState<CurrencyFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<CurrencyFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currency && mode === 'edit') {
      setFormData({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        symbolPosition: currency.symbolPosition,
        decimalPlaces: currency.decimalPlaces,
        thousandsSeparator: currency.thousandsSeparator,
        decimalSeparator: currency.decimalSeparator,
        exchangeRate: currency.exchangeRate,
        isActive: currency.isActive,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [currency, mode, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof CurrencyFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CurrencyFormData> = {};

    if (!formData.code.trim()) newErrors.code = 'Currency code is required';
    if (formData.code.length !== 3) newErrors.code = 'Currency code must be 3 characters';
    if (!formData.name.trim()) newErrors.name = 'Currency name is required';
    if (!formData.symbol.trim()) newErrors.symbol = 'Currency symbol is required';
    if (formData.decimalPlaces < 0 || formData.decimalPlaces > 4) {
      newErrors.decimalPlaces = 'Decimal places must be between 0 and 4';
    }
    if (formData.exchangeRate <= 0) newErrors.exchangeRate = 'Exchange rate must be greater than 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const { exchangeRate, ...currencyData } = formData;
      await onSave(currencyData, exchangeRate);
      onClose();
    } catch (error) {
      console.error('Failed to save currency:', error);
      alert('Failed to save currency. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Globe className="w-6 h-6 text-cyan-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {mode === 'create' ? 'Add New Currency' : 'Edit Currency'}
              </h2>
              <p className="text-sm text-gray-600">
                {mode === 'create' 
                  ? 'Add a new currency to your system'
                  : 'Update currency details and exchange rate'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Currency Code"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                placeholder="USD"
                maxLength={3}
                required
                error={errors.code}
                disabled={mode === 'edit'}
              />

              <Input
                label="Currency Symbol"
                value={formData.symbol}
                onChange={(e) => handleInputChange('symbol', e.target.value)}
                placeholder="$"
                required
                error={errors.symbol}
              />
            </div>

            <Input
              label="Currency Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="US Dollar"
              required
              error={errors.name}
            />
          </div>

          {/* Formatting Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Formatting Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symbol Position
                </label>
                <select
                  value={formData.symbolPosition}
                  onChange={(e) => handleInputChange('symbolPosition', e.target.value as 'before' | 'after')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="before">Before amount ({formData.symbol}100)</option>
                  <option value="after">After amount (100{formData.symbol})</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Decimal Places
                </label>
                <input
                  type="number"
                  value={formData.decimalPlaces}
                  onChange={(e) => handleInputChange('decimalPlaces', parseInt(e.target.value) || 0)}
                  min="0"
                  max="4"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                {errors.decimalPlaces && <p className="text-red-500 text-sm mt-1">{errors.decimalPlaces}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Thousands Separator"
                value={formData.thousandsSeparator}
                onChange={(e) => handleInputChange('thousandsSeparator', e.target.value)}
                placeholder=","
                maxLength={1}
              />

              <Input
                label="Decimal Separator"
                value={formData.decimalSeparator}
                onChange={(e) => handleInputChange('decimalSeparator', e.target.value)}
                placeholder="."
                maxLength={1}
              />
            </div>
          </div>

          {/* Exchange Rate */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Exchange Rate</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exchange Rate (relative to ZAR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.exchangeRate}
                onChange={(e) => handleInputChange('exchangeRate', parseFloat(e.target.value) || 0)}
                placeholder="1.0"
                step="0.000001"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {errors.exchangeRate && <p className="text-red-500 text-sm mt-1">{errors.exchangeRate}</p>}
              <p className="text-sm text-gray-600 mt-1">
                1 ZAR = {formData.exchangeRate} {formData.code || 'XXX'}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Exchange Rate Examples</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• USD: ~0.054 (1 ZAR = 0.054 USD)</p>
                <p>• EUR: ~0.049 (1 ZAR = 0.049 EUR)</p>
                <p>• GBP: ~0.043 (1 ZAR = 0.043 GBP)</p>
                <p className="text-xs text-blue-600 mt-2">
                  Note: Exchange rates fluctuate. Update regularly for accuracy.
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Status</h3>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Currency is active and available for use
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Formatting Preview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Small amount:</span>
                  <span className="font-mono">
                    {formData.symbolPosition === 'before' 
                      ? `${formData.symbol}12${formData.decimalSeparator}50`
                      : `12${formData.decimalSeparator}50${formData.symbol}`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Large amount:</span>
                  <span className="font-mono">
                    {formData.symbolPosition === 'before' 
                      ? `${formData.symbol}1${formData.thousandsSeparator}234${formData.decimalSeparator}56`
                      : `1${formData.thousandsSeparator}234${formData.decimalSeparator}56${formData.symbol}`
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                {mode === 'create' ? (
                  <Plus className="w-4 h-4 mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {mode === 'create' ? 'Add Currency' : 'Save Changes'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};