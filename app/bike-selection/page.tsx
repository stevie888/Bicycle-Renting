"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { 
  MapPinIcon, 
  BikeIcon, 
  ClockIcon,
  CheckIcon,
  XIcon,
  ArrowLeftIcon,
  PlusIcon,
  MinusIcon,
  WrenchIcon,
  AlertTriangleIcon
} from "lucide-react";
import Image from "next/image";

interface BikeSlot {
  id: string;
  slotNumber: number;
  bikeId: string;
  bikeName: string;
  available: boolean;
  image: string;
  price: number;
  pricePerHour: number;
  status?: 'active' | 'in-maintenance' | 'reserved';
  notes?: string;
}

interface Station {
  id: string;
  name: string;
  location: string;
  image: string;
  coordinates: { lat: number; lng: number };
}

type RentalDuration = 'hourly' | 'daily' | 'pay-as-you-go';

function BikeSelectionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [station, setStation] = useState<Station | null>(null);
  const [bikeSlots, setBikeSlots] = useState<BikeSlot[]>([]);
  const [rentalDuration, setRentalDuration] = useState<RentalDuration>('pay-as-you-go');
  const [hourlyRentalHours, setHourlyRentalHours] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Get station info from URL params
  const stationId = searchParams.get('station');
  const stationName = searchParams.get('name');
  const stationLocation = searchParams.get('location');
  const stationImage = searchParams.get('image');

  // Function to get slot data from localStorage
  const getSlotData = (stationName: string, location: string) => {
    try {
      // Map location to match admin panel format
      let mappedLocation = location;
      if (location.includes('Basantapur')) {
        mappedLocation = 'Kathmandu';
      } else if (location.includes('Patan')) {
        mappedLocation = 'Lalitpur';
      } else if (location.includes('Bhaktapur')) {
        mappedLocation = 'Bhaktapur';
      }
      
      const stationKey = `${stationName}_${mappedLocation}`;
      const slotsKey = `paddlenepal_slots_${stationKey}`;
      const slots = JSON.parse(localStorage.getItem(slotsKey) || '[]');
      
      return slots;
    } catch (error) {
      console.error('Error getting slot data:', error);
      return [];
    }
  };

  // Function to update bike slots with real data
  const updateBikeSlotsWithRealData = () => {
    if (!stationName || !stationLocation) return;

    const realSlots = getSlotData(stationName, stationLocation);
    
    // If no real slots exist, create default ones
    if (realSlots.length === 0) {
      const defaultSlots: BikeSlot[] = Array.from({ length: 10 }, (_, index) => ({
        id: `${stationId}-slot-${index + 1}`,
        slotNumber: index + 1,
        bikeId: `${stationId}-bike-${index + 1}`,
        bikeName: `Bike ${index + 1}`,
        available: index < 8, // Only first 8 slots are available for rental
        image: stationImage || "/Basantapur,Kathmandu.jpeg",
        price: 250,
        pricePerHour: 25,
        status: index < 8 ? 'active' : 'reserved',
        notes: index >= 8 ? 'Reserved for bike returns' : ''
      }));
      setBikeSlots(defaultSlots);
      return;
    }

    // Convert real slot data to bike slots
    const updatedSlots: BikeSlot[] = realSlots.map((slot: any) => {
      // Ensure reserved slots (9-10) are never available for rental
      const isReservedSlot = slot.slotNumber >= 9;
      const isAvailable = !isReservedSlot && slot.status === 'active' && slot.status !== 'occupied';
      
      return {
        id: slot.id || `${stationId}-slot-${slot.slotNumber}`,
        slotNumber: slot.slotNumber,
        bikeId: `${stationId}-bike-${slot.slotNumber}`,
        bikeName: `Bike ${slot.slotNumber}`,
        available: isAvailable,
        image: stationImage || "/Basantapur,Kathmandu.jpeg",
        price: 250,
        pricePerHour: 25,
        status: isReservedSlot ? 'reserved' : slot.status,
        notes: isReservedSlot ? 'Reserved for bike returns' : slot.notes
      };
    });

    setBikeSlots(updatedSlots);
  };

  // All hooks must be called before any conditional returns
  useEffect(() => {
    // Wait for authentication to load before checking user
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user has an active rental BEFORE setting up the page
    const existingRentals = JSON.parse(localStorage.getItem('paddlenepal_rentals') || '[]');
    const userActiveRental = existingRentals.find((rental: any) => 
      rental.userId === user.id && rental.status === 'active'
    );

    if (userActiveRental) {
      // Check if rental is overdue
      const startTime = new Date(userActiveRental.startTime);
      const currentTime = new Date();
      const rentalDuration = userActiveRental.duration;
      const rentalHours = userActiveRental.hours || 1;
      
      let isOverdue = false;
      let overdueMessage = '';
      
      if (rentalDuration === 'hourly') {
        const endTime = new Date(startTime.getTime() + (rentalHours * 60 * 60 * 1000));
        isOverdue = currentTime > endTime;
        if (isOverdue) {
          const overdueHours = Math.floor((currentTime.getTime() - endTime.getTime()) / (60 * 60 * 1000));
          overdueMessage = `Your rental is ${overdueHours} hour(s) overdue. Please end your current ride first.`;
        } else {
          overdueMessage = `You have an active rental. Please end your current ride first.`;
        }
      } else if (rentalDuration === 'daily') {
        const endTime = new Date(startTime.getTime() + (24 * 60 * 60 * 1000));
        isOverdue = currentTime > endTime;
        if (isOverdue) {
          const overdueHours = Math.floor((currentTime.getTime() - endTime.getTime()) / (60 * 60 * 1000));
          overdueMessage = `Your daily rental is ${overdueHours} hour(s) overdue. Please end your current ride first.`;
        } else {
          overdueMessage = `You have an active daily rental. Please end your current ride first.`;
        }
      } else if (rentalDuration === 'pay-as-you-go') {
        // For pay-as-you-go, consider overdue after 24 hours
        const endTime = new Date(startTime.getTime() + (24 * 60 * 60 * 1000));
        isOverdue = currentTime > endTime;
        if (isOverdue) {
          const overdueHours = Math.floor((currentTime.getTime() - endTime.getTime()) / (60 * 60 * 1000));
          overdueMessage = `Your pay-as-you-go rental is ${overdueHours} hour(s) overdue. Please end your current ride first.`;
        } else {
          overdueMessage = `You have an active pay-as-you-go rental. Please end your current ride first.`;
        }
      }

      // Show alert and redirect immediately
      alert(overdueMessage);
      router.push('/rental-confirmation');
      return; // Exit early - don't set up the page
    }

    // Only set up the page if user has NO active rental
    // Set station info
    if (stationId && stationName && stationLocation && stationImage) {
      setStation({
        id: stationId,
        name: stationName,
        location: stationLocation,
        image: stationImage,
        coordinates: { lat: 27.7172, lng: 85.3240 } // Default coordinates
      });
    }

    // Update bike slots with real data
    updateBikeSlotsWithRealData();

    // Listen for slot status changes from admin panel
    const handleSlotStatusChanged = () => {
      updateBikeSlotsWithRealData();
    };

    // Listen for focus events to refresh data when returning from admin panel
    const handleFocus = () => {
      updateBikeSlotsWithRealData();
    };

    window.addEventListener('slotStatusChanged', handleSlotStatusChanged);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('slotStatusChanged', handleSlotStatusChanged);
      window.removeEventListener('focus', handleFocus);
    };
  }, [stationId, stationName, stationLocation, stationImage, user, router, loading]);

  const handleSlotSelect = (slotId: string) => {
    const slot = bikeSlots.find(s => s.id === slotId);
    if (slot && slot.available) {
      setSelectedSlot(slotId);
      // Automatically show the booking modal when a slot is selected
      setShowBookingModal(true);
    }
  };

  const handleRentBike = () => {
    if (!selectedSlot) return;
    
    const slot = bikeSlots.find(s => s.id === selectedSlot);
    if (!slot) return;

    // Allow users to proceed to booking modal regardless of credits
    // Credit check will happen at final confirmation
    setShowBookingModal(true);
  };

  const getSlotStatusInfo = (slot: BikeSlot) => {
    if (slot.notes?.includes('Reserved for bike returns')) {
      return {
        status: 'reserved',
        text: 'Reserved for Returns',
        icon: WrenchIcon,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-200',
        badgeColor: 'bg-purple-100 text-purple-700 border-purple-200'
      };
    } else if (slot.status === 'in-maintenance') {
      return {
        status: 'maintenance',
        text: 'Under Maintenance',
        icon: WrenchIcon,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-200',
        badgeColor: 'bg-orange-100 text-orange-700 border-orange-200'
      };
    } else if (!slot.available) {
      return {
        status: 'unavailable',
        text: 'Occupied',
        icon: XIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-200',
        badgeColor: 'bg-red-100 text-red-700 border-red-200'
      };
    } else {
      return {
        status: 'available',
        text: 'Available',
        icon: CheckIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200',
        badgeColor: 'bg-green-100 text-green-700 border-green-200'
      };
    }
  };

  // Function to manage smart slot allocation
  const manageSmartSlotAllocation = (selectedSlot: BikeSlot) => {
    const slotsKey = `paddlenepal_slots_${stationId}`;
    let allSlots = JSON.parse(localStorage.getItem(slotsKey) || '[]');
    
    // Ensure reserved slots (9-10) are always available for returns
    allSlots = allSlots.map((slot: any) => {
      if (slot.slotNumber >= 9) {
        return {
          ...slot,
          status: 'reserved',
          notes: 'Reserved for bike returns',
          lastUpdated: new Date().toISOString()
        };
      }
      return slot;
    });
    
    // If the selected slot is a return slot (9 or 10), find an available slot in 1-8
    if (selectedSlot.slotNumber >= 9) {
      // Find an available slot in 1-8 to rent from instead
      const availableSlot = allSlots.find((slot: any) => 
        slot.slotNumber <= 8 && slot.status === 'active' && 
        !slot.notes?.includes('Reserved for bike returns')
      );
      
      if (availableSlot) {
        // Mark the available slot as occupied
        const updatedSlots = allSlots.map((slot: any) => {
          if (slot.id === availableSlot.id) {
            return {
              ...slot,
              status: 'occupied',
              notes: 'Bike rented',
              lastUpdated: new Date().toISOString()
            };
          }
          return slot;
        });
        
        localStorage.setItem(slotsKey, JSON.stringify(updatedSlots));
        
        // Return the available slot instead of the return slot
        return {
          ...availableSlot,
          status: 'occupied',
          notes: 'Bike rented'
        };
      } else {
        // No available slots in 1-8, cannot rent
        alert('No available slots for rental. Please try another station.');
        return null;
      }
    }
    
    // If renting from a regular slot (1-8), mark it as occupied
    const updatedSlots = allSlots.map((slot: any) => {
      if (slot.id === selectedSlot.id) {
        return {
          ...slot,
          status: 'occupied',
          notes: 'Bike rented',
          lastUpdated: new Date().toISOString()
        };
      }
      return slot;
    });
    
    localStorage.setItem(slotsKey, JSON.stringify(updatedSlots));
    return selectedSlot;
  };

  const confirmRental = () => {
    if (!selectedSlot || !user) return;
    
    // Check if user has agreed to terms
    if (!agreedToTerms) {
      alert("Please read and agree to the Safety Notes and Terms & Condition before confirming your rental.");
      return;
    }

    // FINAL SAFETY CHECK: Ensure user doesn't have an active rental
    const currentRentals = JSON.parse(localStorage.getItem('paddlenepal_rentals') || '[]');
    const userActiveRental = currentRentals.find((rental: any) => 
      rental.userId === user.id && rental.status === 'active'
    );

    if (userActiveRental) {
      alert("You already have an active rental. Please end your current ride first.");
      router.push('/rental-confirmation');
      return;
    }
    
    const slot = bikeSlots.find(s => s.id === selectedSlot);
    if (!slot) return;

    // Apply smart slot allocation
    const finalSlot = manageSmartSlotAllocation(slot);
    
    // If no slot is available, exit early
    if (!finalSlot) {
      return;
    }

    const rentalPrice = getCurrentRentalPrice();
    const userCredits = user?.credits || 0;

    // For pay-as-you-go, no upfront payment required
    if (rentalDuration === 'pay-as-you-go') {
      // Create rental without charging upfront
      const rental = {
        id: Date.now().toString(),
        bikeId: finalSlot.bikeId,
        userId: user.id,
        startTime: new Date().toISOString(),
        status: 'active',
        price: 0, // Will be calculated when ride ends
        duration: rentalDuration,
        hours: undefined,
        bikeName: finalSlot.bikeName,
        station: station?.name || 'Unknown Station',
        slotNumber: finalSlot.slotNumber,
        payAsYouGo: true
      };
      
      // Save to localStorage without charging credits
      const existingRentals = JSON.parse(localStorage.getItem('paddlenepal_rentals') || '[]');
      localStorage.setItem('paddlenepal_rentals', JSON.stringify([...existingRentals, rental]));
      
      setShowBookingModal(false);
      setSelectedSlot(null);
      
      // Redirect to rental confirmation page
      router.push('/rental-confirmation');
      return;
    }

    // Check minimum credits for hourly rental (25 credits minimum)
    if (rentalDuration === 'hourly' && userCredits < 25) {
      alert("Insufficient credits! You need at least रू25 credits for hourly rental. Please add more credits to your wallet.");
      return;
    }

    // Check if user has enough credits for the rental (for hourly and daily)
    if (userCredits < rentalPrice) {
      alert(`Insufficient credits! You need रू${rentalPrice} credits for this rental. You have रू${userCredits} credits. Please add more credits to your wallet.`);
      return;
    }

    // Create rental for hourly/daily
    const rental = {
      id: Date.now().toString(),
      bikeId: finalSlot.bikeId,
      userId: user.id,
      startTime: new Date().toISOString(),
      status: 'active',
      price: rentalPrice,
      duration: rentalDuration,
      hours: rentalDuration === 'hourly' ? hourlyRentalHours : undefined,
      bikeName: finalSlot.bikeName,
      station: station?.name || 'Unknown Station',
      slotNumber: finalSlot.slotNumber,
      payAsYouGo: false
    };
    
    // Update user credits
    const updatedUser = { ...user, credits: (user.credits || 0) - rentalPrice };
    
    // Save to localStorage
    const existingRentals = JSON.parse(localStorage.getItem('paddlenepal_rentals') || '[]');
    localStorage.setItem('paddlenepal_rentals', JSON.stringify([...existingRentals, rental]));
    localStorage.setItem('paddlenepal_current_user', JSON.stringify(updatedUser));
    
    // Also update the main users array for admin dashboard
    const allUsers = JSON.parse(localStorage.getItem('paddlenepal_users') || '[]');
    const updatedUsers = allUsers.map((u: any) => 
      u.id === user.id ? { ...u, credits: updatedUser.credits } : u
    );
    localStorage.setItem('paddlenepal_users', JSON.stringify(updatedUsers));
    
    setShowBookingModal(false);
    setSelectedSlot(null);
    
    // Redirect to rental confirmation page
    router.push('/rental-confirmation');
  };

  // Get current rental price based on selected duration and hours
  const getCurrentRentalPrice = () => {
    if (!selectedSlot) return 0;
    const slot = bikeSlots.find(s => s.id === selectedSlot);
    if (!slot) return 0;
    
    if (rentalDuration === 'daily') {
      return slot.price;
    } else if (rentalDuration === 'hourly') {
      return slot.pricePerHour * hourlyRentalHours;
    } else {
      // Pay as you go - no upfront cost
      return 0;
    }
  };

  const handleHourChange = (newHours: number) => {
    if (newHours >= 1 && newHours <= 24) {
      setHourlyRentalHours(newHours);
    }
  };

  const handleDurationChange = (duration: RentalDuration) => {
    setRentalDuration(duration);
    if (duration === 'daily') {
      setHourlyRentalHours(1); // Reset to 1 hour when switching to daily
    }
  };

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state if no user after loading
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access this page.</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Check if required URL parameters are present
  if (!stationId || !stationName || !stationLocation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Invalid station information. Please go back and try again.</p>
          <button 
            onClick={() => router.push('/bicycles')}
            className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go Back to Stations
          </button>
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Station not found</p>
          <button 
            onClick={() => router.push('/bicycles')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go Back to Stations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{station.name}</h1>
                <p className="text-gray-600">{station.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Your Credits:</span>
              <span className="font-semibold text-primary-600">{user?.credits || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Station Image */}
      <div className="relative h-40 bg-gradient-to-r from-primary-600 to-primary-700">
        <Image
          src={station.image}
          alt={station.name}
          fill
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <BikeIcon className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold">Select Your Bike</h2>
            <p className="text-lg opacity-90">Choose from available slots</p>
          </div>
        </div>
      </div>

      {/* Bike Slots Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-5 md:grid-cols-5 lg:grid-cols-8 gap-1.5">
          {bikeSlots.map((slot) => {
            const statusInfo = getSlotStatusInfo(slot);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div
                key={slot.id}
                onClick={() => handleSlotSelect(slot.id)}
                className={`relative bg-white rounded-lg shadow-sm border transition-all duration-200 ${
                  selectedSlot === slot.id
                    ? 'border-primary-400 ring-1 ring-primary-200'
                    : slot.available
                    ? 'border-gray-200 hover:border-primary-300 cursor-pointer'
                    : statusInfo.borderColor + ' opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Slot Number Badge */}
                <div className="absolute top-1 left-1 z-10">
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.badgeColor}`}>
                    {slot.slotNumber}
                  </span>
                </div>

                {/* Availability Status */}
                <div className="absolute top-1 right-1 z-10">
                  <StatusIcon className={`w-3 h-3 ${statusInfo.color}`} />
                </div>

                {/* Bike Image */}
                <div className="relative h-16 rounded-t-lg overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                  <BikeIcon className="w-6 h-6 text-primary-600" />
                  {!slot.available && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-center">
                        <StatusIcon className="w-4 h-4 text-white mx-auto mb-1" />
                        <span className="text-white font-semibold text-xs">{statusInfo.text}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-1.5">
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 text-xs">{slot.bikeName}</h3>
                    {/* Show maintenance notes if available */}
                    {slot.status === 'in-maintenance' && slot.notes && (
                      <div className="mt-1 text-xs text-orange-600 truncate" title={slot.notes}>
                        {slot.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>


      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 p-4 overflow-y-auto flex items-start justify-center">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl max-h-[85vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Rental</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <Image
                    src={station.image}
                    alt={station.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{station.name}</h4>
                  <p className="text-sm text-gray-600">{station.location}</p>
                </div>
              </div>

              {/* Rental Duration Selection */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-3">Select Rental Option</h5>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleDurationChange('pay-as-you-go')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      rentalDuration === 'pay-as-you-go'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <ClockIcon className="w-4 h-4" />
                      <span className="font-semibold text-sm">Flexi Ride</span>
                    </div>
                    <div className="text-xs text-gray-600">Pay only for time used</div>
                    <div className="text-xs font-medium text-primary-600 mt-1">रू25/hour</div>
                  </button>
                  <button
                    onClick={() => handleDurationChange('hourly')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      rentalDuration === 'hourly'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <ClockIcon className="w-4 h-4" />
                      <span className="font-semibold text-sm">Fixed Ride</span>
                    </div>
                    <div className="text-xs text-gray-600">Pre-paid hourly rental</div>
                    <div className="text-xs font-medium text-primary-600 mt-1">रू25/hour</div>
                  </button>
                </div>
              </div>

              {/* Hour Selection for Hourly Rental */}
              {rentalDuration === 'hourly' && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-3">Select Number of Hours</h5>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => handleHourChange(hourlyRentalHours - 1)}
                      disabled={hourlyRentalHours <= 1}
                      className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 flex items-center justify-center font-bold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">{hourlyRentalHours}</div>
                      <div className="text-sm text-gray-600">hour{hourlyRentalHours !== 1 ? 's' : ''}</div>
                    </div>
                    <button
                      onClick={() => handleHourChange(hourlyRentalHours + 1)}
                      disabled={hourlyRentalHours >= 24}
                      className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 flex items-center justify-center font-bold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-xs text-gray-500">
                      Quick select: 
                      <button onClick={() => handleHourChange(2)} className="ml-1 text-primary-600 hover:underline font-medium">2h</button> | 
                      <button onClick={() => handleHourChange(4)} className="ml-1 text-primary-600 hover:underline font-medium">4h</button> | 
                      <button onClick={() => handleHourChange(8)} className="ml-1 text-primary-600 hover:underline font-medium">8h</button> | 
                      <button onClick={() => handleHourChange(12)} className="ml-1 text-primary-600 hover:underline font-medium">12h</button>
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {rentalDuration === 'pay-as-you-go' ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Upfront Cost:</span>
                      <span className="font-semibold text-green-600">रू0</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Rate:</span>
                      <span>रू25/hour (charged when ride ends)</span>
                    </div>
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-700">
                          No upfront payment required! Pay only for the time you use.
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rental Price:</span>
                      <span className="font-semibold">रू{getCurrentRentalPrice()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Rate:</span>
                      <span>रू25 × {hourlyRentalHours} hour{hourlyRentalHours !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Your Credits:</span>
                      <span className={`font-semibold ${(user?.credits || 0) < getCurrentRentalPrice() ? 'text-red-600' : 'text-green-600'}`}>
                        रू{user?.credits || 0}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Remaining Credits:</span>
                      <span className={`font-semibold ${(user?.credits || 0) - getCurrentRentalPrice() < 0 ? 'text-red-600' : 'text-primary-600'}`}>
                        रू{(user?.credits || 0) - getCurrentRentalPrice()}
                      </span>
                    </div>
                    
                    {/* Credit Warning */}
                    {(user?.credits || 0) < getCurrentRentalPrice() && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm font-medium text-red-700">
                            Insufficient credits! You need रू{getCurrentRentalPrice()} for this rental.
                          </span>
                        </div>
                        {(user?.credits || 0) < 25 && (
                          <div className="mt-2 text-xs text-red-600">
                            Minimum रू25 credits required for hourly rentals.
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Safety notes and Terms & Condition before confirmation */}
              <div className="space-y-3 my-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <h6 className="font-semibold text-yellow-900 mb-1">Safety Notes</h6>
                  <ul className="list-disc pl-5 text-yellow-900 text-xs space-y-1">
                    <li>Always wear a helmet and follow local traffic rules.</li>
                    <li>Check brakes, tires before riding.</li>
                    <li>Ride only in safe, permitted areas; obey all signage.</li> 
                  </ul>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <h6 className="font-semibold text-red-900 mb-1">Terms & Condition</h6>
                  <ul className="list-disc pl-5 text-red-900 text-xs space-y-1">
                    <li>Pedal Nepal is not responsible for accidents, injuries, or damages from bicycle use.</li>
                    <li>Riders assume all risks and are responsible for fines/legal consequences of unsafe or unlawful riding.</li>
                    <li>The company does not guarantee availability, performance, or uninterrupted service.</li>
                  </ul>
                </div>
                
                {/* Terms Agreement Checkbox */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="agree-terms"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                    />
                    <label htmlFor="agree-terms" className="text-sm text-blue-900 cursor-pointer">
                      <span className="font-medium">I have read and agreed to all the safety notes and terms presented</span>
                      <br />
                      <span className="text-xs text-blue-700">
                        By checking this box, you acknowledge that you understand the safety requirements and accept all terms and conditions of the rental service.
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 sticky bottom-0 bg-white pt-3">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRental}
                  disabled={!agreedToTerms}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    agreedToTerms
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {agreedToTerms ? 'Confirm Rental' : 'Please Agree to Terms'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BikeSelectionPage() {
  return (
    <ErrorBoundary>
      <BikeSelectionPageContent />
    </ErrorBoundary>
  );
}