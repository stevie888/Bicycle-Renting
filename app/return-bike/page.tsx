'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, MapPin, Bike, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface Station {
  id: string;
  name: string;
  location: string;
  image: string;
}

interface Slot {
  id: string;
  slotNumber: number;
  status: 'active' | 'in-maintenance';
  lastUpdated: string;
  notes?: string;
}

interface Rental {
  id: string;
  userId: string;
  bikeId: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed';
  price: number;
  duration: string;
  hours?: number;
  bikeName: string;
  station: string;
  slotNumber: number;
  payAsYouGo?: boolean;
}

function ReturnBikePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [currentRental, setCurrentRental] = useState<Rental | null>(null);
  const [isReturning, setIsReturning] = useState(false);
  const [rentalDuration, setRentalDuration] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    fetchStations();
    fetchCurrentRental();
  }, [user, loading, router]);

  const fetchStations = () => {
    try {
      const bicycles = JSON.parse(localStorage.getItem('paddlenepal_bicycles') || '[]');
      const uniqueStations = new Map<string, Station>();
      
      bicycles.forEach((bike: any) => {
        const stationKey = `${bike.description}_${bike.location}`;
        if (!uniqueStations.has(stationKey)) {
          uniqueStations.set(stationKey, {
            id: stationKey,
            name: bike.description, // Use description as name
            location: bike.location,
            image: bike.image || '/bicycle-placeholder.jpg'
          });
        }
      });
      
      setStations(Array.from(uniqueStations.values()));
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };

  const fetchCurrentRental = () => {
    try {
      const rentals = JSON.parse(localStorage.getItem('paddlenepal_rentals') || '[]');
      const userActiveRental = rentals.find((rental: Rental) => 
        rental.userId === user?.id && rental.status === 'active'
      );
      
      if (userActiveRental) {
        setCurrentRental(userActiveRental);
        
        // Calculate rental duration
        const startTime = new Date(userActiveRental.startTime);
        const currentTime = new Date();
        const durationMs = currentTime.getTime() - startTime.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        setRentalDuration(durationHours);
        
        // Calculate cost (25 rupees per hour)
        const cost = Math.ceil(durationHours) * 25;
        setTotalCost(cost);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching current rental:', error);
    }
  };

  const handleStationSelect = (station: Station) => {
    setSelectedStation(station);
    setSelectedSlot(null);
    fetchAvailableSlots(station);
  };

  const fetchAvailableSlots = (station: Station) => {
    try {
      const slotsKey = `paddlenepal_slots_${station.id}`;
      let allSlots = JSON.parse(localStorage.getItem(slotsKey) || '[]');
      
      // If no slots exist, create default slots with reserved slots for returns
      if (allSlots.length === 0) {
        allSlots = [];
        for (let i = 1; i <= 10; i++) {
          allSlots.push({
            id: `${station.id}_slot_${i}`,
            slotNumber: i,
            status: i >= 9 ? 'in-maintenance' : 'active', // Slots 9-10 are reserved for returns
            lastUpdated: new Date().toISOString(),
            notes: i >= 9 ? 'Reserved for bike returns' : undefined
          });
        }
        localStorage.setItem(slotsKey, JSON.stringify(allSlots));
      }
      
      // Get slots that are available for returns (in-maintenance status)
      const returnSlots = allSlots.filter((slot: Slot) => slot.status === 'in-maintenance');
      setAvailableSlots(returnSlots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
    }
  };

  const handleSlotSelect = (slot: Slot) => {
    setSelectedSlot(slot);
  };

  // Function to manage return slot availability
  const manageReturnSlotAvailability = (stationId: string) => {
    const slotsKey = `paddlenepal_slots_${stationId}`;
    const allSlots = JSON.parse(localStorage.getItem(slotsKey) || '[]');
    
    // Check if both return slots (9 and 10) are occupied
    const returnSlots = allSlots.filter((slot: Slot) => slot.slotNumber >= 9);
    const occupiedReturnSlots = returnSlots.filter((slot: Slot) => 
      slot.status === 'active' && slot.notes === 'Bike returned'
    );
    
    // If both return slots are occupied, move one bike to an available slot
    if (occupiedReturnSlots.length >= 2) {
      const availableSlot = allSlots.find((slot: Slot) => 
        slot.slotNumber <= 8 && slot.status === 'active' && 
        !slot.notes?.includes('Reserved for bike returns')
      );
      
      if (availableSlot) {
        // Move the first occupied return slot bike to available slot
        const firstOccupiedReturnSlot = occupiedReturnSlots[0];
        const updatedSlots = allSlots.map((slot: Slot) => {
          if (slot.id === firstOccupiedReturnSlot.id) {
            // Free up the return slot
            return {
              ...slot,
              status: 'in-maintenance',
              notes: 'Reserved for bike returns',
              lastUpdated: new Date().toISOString()
            };
          } else if (slot.id === availableSlot.id) {
            // Occupy the available slot
            return {
              ...slot,
              status: 'active',
              notes: 'Bike moved from return slot',
              lastUpdated: new Date().toISOString()
            };
          }
          return slot;
        });
        
        localStorage.setItem(slotsKey, JSON.stringify(updatedSlots));
      }
    }
  };

  const handleReturnBike = async () => {
    if (!selectedStation || !selectedSlot || !currentRental) return;
    
    setIsReturning(true);
    
    try {
      const endTime = new Date().toISOString();
      
      // Update the rental with end time and completed status
      const rentals = JSON.parse(localStorage.getItem('paddlenepal_rentals') || '[]');
      const updatedRentals = rentals.map((rental: Rental) => {
        if (rental.id === currentRental.id) {
          return {
            ...rental,
            endTime: endTime,
            status: 'completed' as const,
            returnStation: selectedStation.name,
            returnSlotNumber: selectedSlot.slotNumber
          };
        }
        return rental;
      });
      
      // Update the slot status to occupied
      const slotsKey = `paddlenepal_slots_${selectedStation.id}`;
      const allSlots = JSON.parse(localStorage.getItem(slotsKey) || '[]');
      const updatedSlots = allSlots.map((slot: Slot) => {
        if (slot.id === selectedSlot.id) {
          return {
            ...slot,
            status: 'active' as const,
            lastUpdated: new Date().toISOString(),
            notes: 'Bike returned'
          };
        }
        return slot;
      });
      
      // Deduct credits from user
      const updatedUser = { ...user, credits: (user?.credits || 0) - totalCost };
      
      // Save updated data
      localStorage.setItem('paddlenepal_rentals', JSON.stringify(updatedRentals));
      localStorage.setItem(slotsKey, JSON.stringify(updatedSlots));
      localStorage.setItem('paddlenepal_current_user', JSON.stringify(updatedUser));
      
      // Update users array
      const allUsers = JSON.parse(localStorage.getItem('paddlenepal_users') || '[]');
      const updatedUsers = allUsers.map((u: any) => 
        u.id === user?.id ? updatedUser : u
      );
      localStorage.setItem('paddlenepal_users', JSON.stringify(updatedUsers));
      
      // Manage return slot availability after return
      manageReturnSlotAvailability(selectedStation.id);
      
      // Redirect to confirmation page
      router.push('/return-confirmation');
    } catch (error) {
      console.error('Error returning bike:', error);
      alert('Error returning bike. Please try again.');
    } finally {
      setIsReturning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentRental) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Active Rental</h1>
          <p className="text-gray-600 mb-6">You don't have an active bike rental to return.</p>
          <Button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-gray-100 sticky top-0 z-20">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                className="p-2 hover:bg-gray-100 rounded-xl"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Return Bike</h1>
                <p className="text-gray-600 text-sm">Select station and slot to return your bike</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Current Rental Info */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Bike className="w-5 h-5 mr-2 text-blue-600" />
            Current Rental
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Bike</p>
              <p className="font-semibold">{currentRental.bikeName}</p>
            </div>
            <div>
              <p className="text-gray-500">Duration</p>
              <p className="font-semibold">{rentalDuration.toFixed(1)} hours</p>
            </div>
            <div>
              <p className="text-gray-500">Cost</p>
              <p className="font-semibold text-red-600">₹{totalCost}</p>
            </div>
            <div>
              <p className="text-gray-500">Credits</p>
              <p className="font-semibold text-green-600">₹{user?.credits || 0}</p>
            </div>
          </div>
        </div>

        {/* Station Selection */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-green-600" />
            Select Return Station
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stations.map((station) => (
              <div
                key={station.id}
                onClick={() => handleStationSelect(station)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedStation?.id === station.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{station.name}</h3>
                    <p className="text-sm text-gray-500">{station.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slot Selection */}
        {selectedStation && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-purple-600" />
              Select Return Slot
            </h2>
            {availableSlots.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <p className="text-gray-600">No return slots available at this station.</p>
                <p className="text-sm text-gray-500 mt-2">Please select another station.</p>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-4">
                {availableSlots.map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => handleSlotSelect(slot)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                      selectedSlot?.id === slot.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-semibold text-sm">{slot.slotNumber}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Slot {slot.slotNumber}</p>
                    <p className="text-xs text-gray-500">Available</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Return Button */}
        {selectedStation && selectedSlot && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Return</h3>
              <p className="text-gray-600 mb-4">
                Return your bike to {selectedStation.name} at slot {selectedSlot.slotNumber}
              </p>
              <Button
                onClick={handleReturnBike}
                disabled={isReturning}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:shadow-none flex items-center justify-center gap-3"
              >
                {isReturning ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Returning Bike...
                  </div>
                ) : (
                  <>
                    <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    Return Bike - ₹{totalCost}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReturnBikePageWrapper() {
  return (
    <ErrorBoundary>
      <ReturnBikePage />
    </ErrorBoundary>
  );
}
