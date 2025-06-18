import React, { useState } from 'react';
import { X, MapPin, Phone, Clock, Star, Navigation } from 'lucide-react';
import { TreatmentCentre } from '../../types/treatmentCentres';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

interface CentreSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCentre: (centre: TreatmentCentre) => void;
  centres: TreatmentCentre[];
  clientLocation?: {
    country: string;
    city?: string;
  };
}

export const CentreSelectionModal: React.FC<CentreSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectCentre,
  centres,
  clientLocation
}) => {
  const [selectedCentre, setSelectedCentre] = useState<TreatmentCentre | null>(null);

  if (!isOpen) return null;

  const getCurrentTime = (centre: TreatmentCentre) => {
    try {
      return new Date().toLocaleTimeString('en-US', {
        timeZone: centre.timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const isCurrentlyOpen = (centre: TreatmentCentre) => {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const schedule = centre.workingHours[dayName];
    
    if (!schedule || !schedule.isOpen) return false;
    
    const currentTime = getCurrentTime(centre);
    return currentTime >= schedule.openTime && currentTime <= schedule.closeTime;
  };

  const handleSelectCentre = () => {
    if (selectedCentre) {
      onSelectCentre(selectedCentre);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center space-x-3">
            <MapPin className="w-6 h-6 text-cyan-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Select Treatment Centre</h2>
              <p className="text-sm text-gray-600">
                {clientLocation 
                  ? `Available centres in ${clientLocation.country}${clientLocation.city ? `, ${clientLocation.city}` : ''}`
                  : 'Choose your preferred treatment centre'
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

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {centres.map((centre) => (
              <Card
                key={centre.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedCentre?.id === centre.id
                    ? 'ring-2 ring-cyan-500 border-cyan-500'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedCentre(centre)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-lg ${
                        centre.isHeadquarters ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {centre.isHeadquarters ? <Star className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{centre.name}</h3>
                          {centre.isHeadquarters && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                              HQ
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{centre.code}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isCurrentlyOpen(centre)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isCurrentlyOpen(centre) ? 'Open Now' : 'Closed'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getCurrentTime(centre)}
                      </span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{centre.address.street}, {centre.address.city}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{centre.phone}</span>
                    </div>
                  </div>

                  {/* Capacity Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{centre.capacity.rooms}</p>
                      <p className="text-xs text-gray-600">Rooms</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{centre.practitioners.length}</p>
                      <p className="text-xs text-gray-600">Practitioners</p>
                    </div>
                  </div>

                  {/* Features */}
                  {centre.features.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Features</p>
                      <div className="flex flex-wrap gap-1">
                        {centre.features.slice(0, 3).map((feature) => (
                          <span
                            key={feature}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs capitalize"
                          >
                            {feature.replace('-', ' ')}
                          </span>
                        ))}
                        {centre.features.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{centre.features.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Selection Indicator */}
                  {selectedCentre?.id === centre.id && (
                    <div className="mt-4 flex items-center justify-center p-2 bg-cyan-50 border border-cyan-200 rounded-lg">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></div>
                      <span className="text-sm text-cyan-800 font-medium">Selected</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {centres.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No centres available</h3>
              <p className="text-gray-600">
                {clientLocation 
                  ? `No treatment centres found in ${clientLocation.country}. Please contact us to arrange an appointment.`
                  : 'No treatment centres are currently available for booking.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 flex-shrink-0">
          <div className="text-sm text-gray-600">
            {selectedCentre && (
              <span>Selected: {selectedCentre.name}</span>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSelectCentre}
              disabled={!selectedCentre}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Confirm Centre
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};