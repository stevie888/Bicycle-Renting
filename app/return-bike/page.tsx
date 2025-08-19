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
  status: 'active' | 'in-maintenance' | 'reserved';
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
  const [isEndingRide, setIsEndingRide] = useState(false);
  const [rentalDuration, setRentalDuration] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [formattedDuration, setFormattedDuration] = useState('');
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
          const durationMinutes = Math.floor(durationMs / (1000 * 60));
          const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
          const remainingMinutes = durationMinutes % 60;
          
          // Format duration for display
          let formattedDuration = '';
          if (durationHours > 0) {
            formattedDuration = `${durationHours} hour${durationHours !== 1 ? 's' : ''}`;
            if (remainingMinutes > 0) {
              formattedDuration += ` ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
            }
          } else {
            formattedDuration = `${durationMinutes} minute${durationMinutes !== 1 ? 's' : ''}`;
          }
          
          // Ensure minimum 1 hour duration for display
          const displayDuration = Math.max(1, durationMs / (1000 * 60 * 60));
          setRentalDuration(displayDuration);
          setDurationMinutes(durationMinutes);
          setFormattedDuration(formattedDuration);
         
         // Calculate cost (25 rupees per hour) - minimum 1 hour
         const cost = Math.max(25, Math.ceil(durationMs / (1000 * 60 * 60)) * 25);
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
            status: i >= 9 ? 'reserved' : 'active', // Slots 9-10 are reserved for returns
            lastUpdated: new Date().toISOString(),
            notes: i >= 9 ? 'Reserved for bike returns' : undefined
          });
        }
        localStorage.setItem(slotsKey, JSON.stringify(allSlots));
      }
      
      // Ensure reserved slots (9-10) are properly set for returns
      const updatedSlots = allSlots.map((slot: Slot) => {
                 if (slot.slotNumber >= 9) {
           // Force slots 9-10 to be reserved for returns
           return {
             ...slot,
             status: 'reserved' as const,
             notes: 'Reserved for bike returns',
             lastUpdated: new Date().toISOString()
           };
         }
        return slot;
      });
      
      // Save the updated slots
      localStorage.setItem(slotsKey, JSON.stringify(updatedSlots));
      
                    // Get slots that are available for returns
       // This includes:
       // 1. Reserved slots (9-10) for returns
       // 2. User's original rental slot (where they rented from)
       const returnSlots = updatedSlots.filter((slot: Slot) => {
         // Always include reserved slots (9-10) for returns
         if (slot.status === 'reserved') {
           return true;
         }
         
         // Include the user's original rental slot (where they rented from)
         if (currentRental && slot.slotNumber === currentRental.slotNumber) {
           return true;
         }
         
         return false;
       });
      
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
               status: 'reserved',
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



  const handleEndRide = async () => {
    if (!currentRental || !user) return;
    
    setIsEndingRide(true);
    
    try {
      const endTime = new Date().toISOString();
      const startTime = new Date(currentRental.startTime);
      const endTimeDate = new Date(endTime);
      
      // Calculate rental duration
      const durationMs = endTimeDate.getTime() - startTime.getTime();
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      
      // Format times for display
      const startTimeFormatted = startTime.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      const endTimeFormatted = endTimeDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      // Update the rental with end time and completed status
      const rentals = JSON.parse(localStorage.getItem('paddlenepal_rentals') || '[]');
      const updatedRentals = rentals.map((rental: any) => {
        if (rental.id === currentRental.id) {
          return {
            ...rental,
            endTime: endTime,
            status: 'completed',
            returnStation: selectedStation?.name,
            returnSlotNumber: selectedSlot?.slotNumber
          };
        }
        return rental;
      });
      
      // Update the bike status to available
      const bicycles = JSON.parse(localStorage.getItem('paddlenepal_bicycles') || '[]');
      const updatedBicycles = bicycles.map((bicycle: any) => {
        if (bicycle.name === currentRental.bikeName) {
          return {
            ...bicycle,
            status: 'available'
          };
        }
        return bicycle;
      });
      
      // Update slot status if station and slot are selected
      if (selectedStation && selectedSlot) {
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
        
        localStorage.setItem(slotsKey, JSON.stringify(updatedSlots));
        
        // Manage return slot availability after return
        manageReturnSlotAvailability(selectedStation.id);
      }
      
      // Save updated data
      localStorage.setItem('paddlenepal_rentals', JSON.stringify(updatedRentals));
      localStorage.setItem('paddlenepal_bicycles', JSON.stringify(updatedBicycles));
      
      // Update local state
      setCurrentRental({
        ...currentRental,
        endTime: endTime,
        status: 'completed'
      });
      
      // Calculate final price - use the same calculation as displayed cost
      let finalPrice = Math.max(25, Math.ceil(durationMs / (1000 * 60 * 60)) * 25);
        
        // Update the rental with the calculated price
        const updatedRentalsWithPrice = updatedRentals.map((rental: any) => {
          if (rental.id === currentRental.id) {
            return {
              ...rental,
              price: finalPrice
            };
          }
          return rental;
        });
        localStorage.setItem('paddlenepal_rentals', JSON.stringify(updatedRentalsWithPrice));
        
        // Deduct credits from user account
        const updatedUser = { ...user, credits: (user.credits || 0) - finalPrice };
        localStorage.setItem('paddlenepal_current_user', JSON.stringify(updatedUser));
        
        // Also update the main users array for admin dashboard
        const allUsers = JSON.parse(localStorage.getItem('paddlenepal_users') || '[]');
        const updatedUsers = allUsers.map((u: any) => 
          u.id === user.id ? { ...u, credits: updatedUser.credits } : u
        );
        localStorage.setItem('paddlenepal_users', JSON.stringify(updatedUsers));
      
      // Show completion message
      alert(`🎉 Ride Completed Successfully!

📅 Rental Period:
   Start: ${startTimeFormatted}
   End: ${endTimeFormatted}
   Duration: ${durationHours}h ${durationMinutes}m

💰 Total Cost: रू${finalPrice}

${selectedStation && selectedSlot ? `📍 Returned to: ${selectedStation.name} at slot ${selectedSlot.slotNumber}` : ''}

Thank you for using Pedal Nepal! 🚴‍♂️`);
      
      // Redirect to return confirmation page if slot was selected, otherwise to my rentals
      if (selectedStation && selectedSlot) {
        router.push('/return-confirmation');
      } else {
        router.push('/my-rentals');
      }
      
    } catch (error) {
      console.error('Error ending ride:', error);
      alert('Error ending ride. Please try again.');
    } finally {
      setIsEndingRide(false);
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
                             <button
                 onClick={() => router.back()}
                 className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
               >
                 <ArrowLeft className="w-5 h-5 text-white" />
               </button>
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
              <p className="text-gray-500">Slot</p>
              <p className="font-semibold">Slot {currentRental.slotNumber}</p>
            </div>
                                     <div>
              <p className="text-gray-500">Duration</p>
              <p className="font-semibold">{formattedDuration}</p>
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
             <p className="text-sm text-gray-600 mb-4">
               You can return your bike to your original rental slot (Slot {currentRental?.slotNumber}) or the reserved return slots (9-10). This ensures efficient slot management.
             </p>
            {availableSlots.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <p className="text-gray-600">No return slots available at this station.</p>
                <p className="text-sm text-gray-500 mt-2">Please select another station.</p>
              </div>
            ) : (
                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                 {availableSlots.map((slot) => (
                   <div
                     key={slot.id}
                     onClick={() => handleSlotSelect(slot)}
                     className={`aspect-square p-4 rounded-xl border-2 cursor-pointer transition-all text-center flex flex-col items-center justify-center ${
                       selectedSlot?.id === slot.id
                         ? 'border-purple-500 bg-purple-50'
                         : 'border-gray-200 hover:border-gray-300'
                     }`}
                   >
                     <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-2">
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
                                                           <button
                  onClick={handleEndRide}
                  disabled={isEndingRide || (currentRental?.status as string) === 'completed'}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-3 border-0"
                >
                 {isEndingRide ? (
                   <div className="flex items-center">
                     <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                     Ending Ride...
                   </div>
                 ) : (
                   <>
                     <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                       <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                       </svg>
                     </div>
                     End My Ride - ₹{totalCost}
                   </>
                 )}
               </button>
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
