import React, { useState } from 'react';
import { 
  Globe, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Settings,
  DollarSign,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CurrencyModal } from '../components/currency/CurrencyModal';
import { CurrencyDisplay } from '../components/currency/CurrencyDisplay';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { Currency } from '../types/currency';
import { clsx } from 'clsx';

export const CurrencySettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    currencies, 
    currentCurrency, 
    settings, 
    isLoading,
    addCurrency,
    updateCurrency,
    deleteCurrency,
    setDefaultCurrency,
    updateSettings
  } = useCurrency();
  
  const [showModal, setShowModal] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const handleAddCurrency = () => {
    setEditingCurrency(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEditCurrency = (currency: Currency) => {
    setEditingCurrency(currency);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDeleteCurrency = async (currency: Currency) => {
    if (currency.isDefault) {
      alert('Cannot delete the default currency. Please set another currency as default first.');
      return;
    }
    
    if (confirm(`Are you sure you want to delete ${currency.name}? This action cannot be undone.`)) {
      try {
        await deleteCurrency(currency.code);
        alert('Currency deleted successfully');
      } catch (error) {
        alert('Failed to delete currency');
      }
    }
  };

  const handleSetDefault = async (currency: Currency) => {
    try {
      await setDefaultCurrency(currency.code);
      alert(`${currency.name} is now the default currency`);
    } catch (error) {
      alert('Failed to set default currency');
    }
  };

  const handleToggleStatus = async (currency: Currency) => {
    if (currency.isDefault && currency.isActive) {
      alert('Cannot deactivate the default currency. Please set another currency as default first.');
      return;
    }
    
    try {
      await updateCurrency(currency.code, { isActive: !currency.isActive });
      alert(`Currency ${currency.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      alert('Failed to update currency status');
    }
  };

  const handleSaveCurrency = async (currencyData: Omit<Currency, 'exchangeRate'>, exchangeRate: number) => {
    if (modalMode === 'create') {
      await addCurrency(currencyData, exchangeRate);
      alert('Currency added successfully');
    } else if (editingCurrency) {
      await updateCurrency(editingCurrency.code, { ...currencyData, exchangeRate });
      alert('Currency updated successfully');
    }
  };

  const handleSettingsChange = async (key: keyof typeof settings, value: boolean | string) => {
    try {
      await updateSettings({ [key]: value });
    } catch (error) {
      alert('Failed to update settings');
    }
  };

  // Only show currency settings to practitioners
  if (user?.role !== 'practitioner') {
    return (
      <div className="p-6 text-center">
        <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-600">Only practitioners can manage currency settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Currency Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage currencies, exchange rates, and display preferences
          </p>
        </div>
        <Button onClick={handleAddCurrency}>
          <Plus className="w-4 h-4 mr-2" />
          Add Currency
        </Button>
      </div>

      {/* Current Currency Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-600" />
            Default Currency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Globe className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentCurrency.name} ({currentCurrency.code})
                </h3>
                <p className="text-gray-600">
                  Symbol: {currentCurrency.symbol} • 
                  Position: {currentCurrency.symbolPosition} • 
                  Decimals: {currentCurrency.decimalPlaces}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                <CurrencyDisplay amount={1500.75} size="lg" />
              </div>
              <p className="text-sm text-gray-600">Sample formatting</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2 text-blue-600" />
            Display Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Show Currency Symbol</h4>
                <p className="text-sm text-gray-600">Display currency symbols (R, $, €) with amounts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.displaySymbol}
                  onChange={(e) => handleSettingsChange('displaySymbol', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Show Currency Code</h4>
                <p className="text-sm text-gray-600">Display currency codes (ZAR, USD, EUR) with amounts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showCurrencyCode}
                  onChange={(e) => handleSettingsChange('showCurrencyCode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Auto-Convert Prices</h4>
                <p className="text-sm text-gray-600">Automatically convert prices to default currency</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoConvert}
                  onChange={(e) => handleSettingsChange('autoConvert', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Service price:</span>
                  <CurrencyDisplay amount={150} />
                </div>
                <div className="flex justify-between text-sm">
                  <span>Package deal:</span>
                  <CurrencyDisplay amount={1250.50} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              All Currencies ({currencies.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currencies.map(currency => (
              <div
                key={currency.code}
                className={clsx(
                  'flex items-center justify-between p-4 border rounded-lg transition-colors',
                  currency.isActive ? 'hover:bg-gray-50' : 'bg-gray-50 opacity-75'
                )}
              >
                <div className="flex items-center space-x-4">
                  <div className={clsx(
                    'p-2 rounded-lg',
                    currency.isDefault 
                      ? 'bg-yellow-100 text-yellow-600'
                      : currency.isActive 
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600'
                  )}>
                    {currency.isDefault ? (
                      <Star className="w-5 h-5" />
                    ) : (
                      <Globe className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className={clsx(
                        'font-medium',
                        currency.isActive ? 'text-gray-900' : 'text-gray-500'
                      )}>
                        {currency.name}
                      </h3>
                      {currency.isDefault && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{currency.code}</span>
                      <span>{currency.symbol}</span>
                      <span>1 ZAR = {currency.exchangeRate} {currency.code}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={clsx(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    currency.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  )}>
                    {currency.isActive ? 'Active' : 'Inactive'}
                  </span>

                  <div className="flex items-center space-x-1">
                    {!currency.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(currency)}
                        title="Set as default"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(currency)}
                      title={currency.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {currency.isActive ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCurrency(currency)}
                      title="Edit currency"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    {!currency.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCurrency(currency)}
                        title="Delete currency"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Currency Modal */}
      <CurrencyModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCurrency(null);
        }}
        onSave={handleSaveCurrency}
        currency={editingCurrency}
        mode={modalMode}
      />
    </div>
  );
};