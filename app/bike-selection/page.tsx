"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { 
  MapPinIcon, 
  BikeIcon, 
  ClockIcon,
  CheckIcon,
  XIcon,
  ArrowLeftIcon
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

export default function BikeSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [station, setStation] = useState<Station | null>(null);
  const [bikeSlots, setBikeSlots] = useState<BikeSlot[]>([]);

  // Get station info from URL params
  const stationId = searchParams.get('station');
  const stationName = searchParams.get('name');
  const stationLocation = searchParams.get('location');
  const stationImage = searchParams.get('image');

  useEffect(() => {
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
  }, [stationId, stationName, stationLocation, stationImage, user, router]);

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

    if ((user?.credits || 0) < slot.price) {
      alert("Insufficient credits! Please add more credits to your wallet.");
      return;
    }

    setShowBookingModal(true);
  };

  const confirmRental = () => {
    if (!selectedSlot || !user) return;
    
    const slot = bikeSlots.find(s => s.id === selectedSlot);
    if (!slot) return;

    // Create rental
    const rental = {
      id: Date.now().toString(),
      bikeId: slot.bikeId,
      userId: user.id,
      startTime: new Date().toISOString(),
      status: 'active',
      price: slot.price,
      bikeName: slot.bikeName,
      station: station?.name || 'Unknown Station',
      slotNumber: slot.slotNumber
    };
    
    // Update user credits
    const updatedUser = { ...user, credits: (user.credits || 0) - slot.price };
    
    // Save to localStorage
    const existingRentals = JSON.parse(localStorage.getItem('paddlenepal_rentals') || '[]');
    localStorage.setItem('paddlenepal_rentals', JSON.stringify([...existingRentals, rental]));
    localStorage.setItem('paddlenepal_current_user', JSON.stringify(updatedUser));
    
    setShowBookingModal(false);
    setSelectedSlot(null);
    
    // Redirect to rental confirmation page
    router.push('/rental-confirmation');
  };

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

  if (!station) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Station not found</p>
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
      <div className="relative h-64 bg-gradient-to-r from-primary-600 to-primary-700">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {bikeSlots.map((slot) => (
            <div
              key={slot.id}
              onClick={() => handleSlotSelect(slot.id)}
              className={`relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-2 cursor-pointer ${
                selectedSlot === slot.id
                  ? 'border-primary-500 ring-2 ring-primary-200'
                  : slot.available
                  ? 'border-gray-200 hover:border-primary-300'
                  : 'border-red-200 opacity-60 cursor-not-allowed'
              }`}
            >
              {/* Slot Number Badge */}
              <div className="absolute top-2 left-2 z-10">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  slot.available
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  Slot {slot.slotNumber}
                </span>
              </div>

              {/* Availability Status */}
              <div className="absolute top-2 right-2 z-10">
                {slot.available ? (
                  <CheckIcon className="w-5 h-5 text-green-600" />
                ) : (
                  <XIcon className="w-5 h-5 text-red-600" />
                )}
              </div>

              {/* Bike Image */}
              <div className="relative h-32 rounded-t-xl overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                <BikeIcon className="w-16 h-16 text-primary-600" />
                {!slot.available && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">Occupied</span>
                  </div>
                )}
              </div>

              <div className="p-3">
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 text-sm">{slot.bikeName}</h3>
                  <div className="mt-2 space-y-1">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
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

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rental Price:</span>
                  <span className="font-semibold">रू250</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Your Credits:</span>
                  <span className="font-semibold">{user?.credits || 0}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Remaining Credits:</span>
                  <span className="font-semibold text-primary-600">
                    {(user?.credits || 0) - 250}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
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