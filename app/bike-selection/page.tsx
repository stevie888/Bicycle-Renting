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
  MinusIcon
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
}

interface Station {
  id: string;
  name: string;
  location: string;
  image: string;
  coordinates: { lat: number; lng: number };
}

type RentalDuration = 'hourly' | 'daily';

function BikeSelectionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [station, setStation] = useState<Station | null>(null);
  const [bikeSlots, setBikeSlots] = useState<BikeSlot[]>([]);
  const [rentalDuration, setRentalDuration] = useState<RentalDuration>('daily');
  const [hourlyRentalHours, setHourlyRentalHours] = useState(1);

  // Get station info from URL params
  const stationId = searchParams.get('station');
  const stationName = searchParams.get('name');
  const stationLocation = searchParams.get('location');
  const stationImage = searchParams.get('image');

  // All hooks must be called before any conditional returns
  useEffect(() => {
    // Wait for authentication to load before checking user
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

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

    // Generate 10 bike slots for the station
    const slots: BikeSlot[] = Array.from({ length: 10 }, (_, index) => ({
      id: `${stationId}-slot-${index + 1}`,
      slotNumber: index + 1,
      bikeId: `${stationId}-bike-${index + 1}`,
      bikeName: `Bike ${index + 1}`,
      available: Math.random() > 0.3, // 70% chance of being available
      image: stationImage || "/Basantapur,Kathmandu.jpeg",
      price: 250,
      pricePerHour: 25
    }));

    setBikeSlots(slots);
  }, [stationId, stationName, stationLocation, stationImage, user, router, loading]);

  const handleSlotSelect = (slotId: string) => {
    const slot = bikeSlots.find(s => s.id === slotId);
    if (slot && slot.available) {
      setSelectedSlot(slotId);
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

  const confirmRental = () => {
    if (!selectedSlot || !user) return;
    
    const slot = bikeSlots.find(s => s.id === selectedSlot);
    if (!slot) return;

    const rentalPrice = getCurrentRentalPrice();
    const userCredits = user?.credits || 0;

    // Check minimum credits for hourly rental (25 credits minimum)
    if (rentalDuration === 'hourly' && userCredits < 25) {
      alert("Insufficient credits! You need at least रू25 credits for hourly rental. Please add more credits to your wallet.");
      return;
    }

    // Check if user has enough credits for the rental
    if (userCredits < rentalPrice) {
      alert(`Insufficient credits! You need रू${rentalPrice} credits for this rental. You have रू${userCredits} credits. Please add more credits to your wallet.`);
      return;
    }

    // Create rental
    const rental = {
      id: Date.now().toString(),
      bikeId: slot.bikeId,
      userId: user.id,
      startTime: new Date().toISOString(),
      status: 'active',
      price: rentalPrice,
      duration: rentalDuration,
      hours: rentalDuration === 'hourly' ? hourlyRentalHours : undefined,
      bikeName: slot.bikeName,
      station: station?.name || 'Unknown Station',
      slotNumber: slot.slotNumber
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
    } else {
      return slot.pricePerHour * hourlyRentalHours;
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
                className="p-2 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-600 transition-all duration-200 border border-primary-200 hover:border-primary-300"
              >
                <ArrowLeftIcon className="w-5 h-5" />
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
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-1.5">
          {bikeSlots.map((slot) => (
            <div
              key={slot.id}
              onClick={() => handleSlotSelect(slot.id)}
              className={`relative bg-white rounded-lg shadow-sm border transition-all duration-200 cursor-pointer ${
                selectedSlot === slot.id
                  ? 'border-primary-400 ring-1 ring-primary-200'
                  : slot.available
                  ? 'border-gray-200 hover:border-primary-300'
                  : 'border-red-200 opacity-60 cursor-not-allowed'
              }`}
            >
              {/* Slot Number Badge */}
              <div className="absolute top-1 left-1 z-10">
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                  slot.available
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {slot.slotNumber}
                </span>
              </div>

              {/* Availability Status */}
              <div className="absolute top-1 right-1 z-10">
                {slot.available ? (
                  <CheckIcon className="w-3 h-3 text-green-600" />
                ) : (
                  <XIcon className="w-3 h-3 text-red-600" />
                )}
              </div>

              {/* Bike Image */}
              <div className="relative h-16 rounded-t-lg overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                <BikeIcon className="w-6 h-6 text-primary-600" />
                {!slot.available && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold text-xs">Occupied</span>
                  </div>
                )}
              </div>

              <div className="p-1.5">
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 text-xs">{slot.bikeName}</h3>
                                     <div className="mt-1 space-y-0.5">
                     <div className="flex justify-between text-xs">
                       <span className="text-gray-500">Daily:</span>
                       <span className="font-semibold text-primary-600">रू{slot.price}</span>
                     </div>
                     <div className="flex justify-between text-xs">
                       <span className="text-gray-500">Hourly:</span>
                       <span className="font-semibold text-primary-600">रू{slot.pricePerHour}</span>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rent Button */}
        {selectedSlot && (
          <div className="mt-8 text-center">
            <button
              onClick={handleRentBike}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Rent Selected Bike
            </button>
          </div>
        )}
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
                <h5 className="font-semibold text-gray-900 mb-3">Select Rental Duration</h5>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleDurationChange('hourly')}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      rentalDuration === 'hourly'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ClockIcon className="w-4 h-4" />
                      <span className="font-medium">Hourly</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">रू25/hour</div>
                  </button>
                  <button
                    onClick={() => handleDurationChange('daily')}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      rentalDuration === 'daily'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <BikeIcon className="w-4 h-4" />
                      <span className="font-medium">Daily</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">रू250/day</div>
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
                <div className="flex justify-between">
                  <span className="text-gray-600">Rental Price:</span>
                  <span className="font-semibold">रू{getCurrentRentalPrice()}</span>
                </div>
                {rentalDuration === 'hourly' && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Rate:</span>
                    <span>रू25 × {hourlyRentalHours} hour{hourlyRentalHours !== 1 ? 's' : ''}</span>
                  </div>
                )}
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
                    {rentalDuration === 'hourly' && (user?.credits || 0) < 25 && (
                      <div className="mt-2 text-xs text-red-600">
                        Minimum रू25 credits required for hourly rentals.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Safety notes and disclaimer before confirmation */}
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
                  <h6 className="font-semibold text-red-900 mb-1">Disclaimer</h6>
                  <ul className="list-disc pl-5 text-red-900 text-xs space-y-1">
                    <li>Pedal Nepal is not responsible for accidents, injuries, or damages from bicycle use.</li>
                    <li>Riders assume all risks and are responsible for fines/legal consequences of unsafe or unlawful riding.</li>
                    <li>The company does not guarantee availability, performance, or uninterrupted service.</li>
                  </ul>
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
                  className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Confirm Rental
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