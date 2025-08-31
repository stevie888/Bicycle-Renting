"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useLanguage } from "@/components/LanguageContext";
import { 
  MapPinIcon, 
  BikeIcon, 
  ClockIcon, 
  StarIcon,
  CreditCardIcon,
  ShieldIcon,
  ZapIcon,
  UsersIcon,
  CalendarIcon,
  WrenchIcon,
  AlertTriangleIcon
} from "lucide-react";
import Image from "next/image";

interface Bike {
  id: string;
  name: string;
  station: string;
  price: number;
  pricePerHour: number;
  location: string;
  distance: string;
  available: boolean;
  image: string;
  coordinates: { lat: number; lng: number };
  maintenanceSlots?: number;
  totalSlots?: number;
  availableSlots?: number;
}

export default function BicyclesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loadingBikes, setLoadingBikes] = useState(true);

  // Mock bike data with actual image URLs
  const mockBikes: Bike[] = [
    {
      id: "1",
      name: "Bike 1",
      station: "Station 1",
      price: 250,
      pricePerHour: 25,
      location: "Basantapur Station",
      distance: "0.2 km",
      available: true,
      image: "/Basantapur,Kathmandu.jpeg",
      coordinates: { lat: 27.7172, lng: 85.3240 }
    },
    {
      id: "2",
      name: "Bike 2",
      station: "Station 2",
      price: 250,
      pricePerHour: 25,
      location: "Patan Station",
      distance: "0.5 km",
      available: true,
      image: "/Patan Dubar Sqaure.jpeg",
      coordinates: { lat: 27.7044, lng: 85.3073 }
    },
    {
      id: "3",
      name: "Bike 3",
      station: "Station 3",
      price: 250,
      pricePerHour: 25,
      location: "Bhaktapur Durbar Square Station",
      distance: "1.2 km",
      available: true,
      image: "/Bhaktapur Durbar Square.jpeg",
      coordinates: { lat: 27.7149, lng: 85.2906 }
    }
  ];

  // Function to get slot statistics for a station
  const getSlotStatistics = (stationName: string, location: string) => {
    try {
      const stationKey = `${stationName}_${location}`;
      const slotsKey = `pedalnepal_slots_${stationKey}`;
      const slots = JSON.parse(localStorage.getItem(slotsKey) || '[]');
      
      // If no slots exist, return default values (10 available slots)
      if (slots.length === 0) {
        return {
          totalSlots: 10,
          activeSlots: 8,
          reservedSlots: 2,
          maintenanceSlots: 0,
          availableSlots: 8
        };
      }
      
      const totalSlots = slots.length;
      
      // Count slots that are available for rental:
      // 1. Regular active slots (1-8) that have bikes
      // 2. Any slot (including 9-10) that has a bike returned to it
      const activeSlots = slots.filter((slot: any) => {
        // Regular slots (1-8) that are active and have bikes
        if (slot.slotNumber <= 8 && slot.status === 'active' && !slot.notes?.includes('Available for bike returns')) {
          return true;
        }
        // Any slot that has a bike returned to it (available for rental)
        if (slot.status === 'active' && slot.notes === 'Bike returned') {
          return true;
        }
        return false;
      }).length;
      
      // Reserved slots (empty slots available for returns)
      const reservedSlots = slots.filter((slot: any) => 
        slot.status === 'reserved' || 
        (slot.status === 'active' && slot.notes?.includes('Available for bike returns'))
      ).length;
      
      // Maintenance slots
      const maintenanceSlots = slots.filter((slot: any) => 
        slot.status === 'in-maintenance'
      ).length;
      
      return {
        totalSlots,
        activeSlots,
        reservedSlots,
        maintenanceSlots,
        availableSlots: activeSlots
      };
    } catch (error) {
      console.error('Error getting slot statistics:', error);
      return {
        totalSlots: 10,
        activeSlots: 8,
        reservedSlots: 2,
        maintenanceSlots: 0,
        availableSlots: 8
      };
    }
  };

  // Function to update bikes with real slot data
  const updateBikesWithSlotData = () => {
    const updatedBikes = mockBikes.map(bike => {
      // Map station names to match the admin panel format
      let stationName = bike.station;
      let location = bike.location;
      
      // Extract location from the full location string
      if (bike.location.includes('Basantapur')) {
        location = 'Kathmandu';
      } else if (bike.location.includes('Patan')) {
        location = 'Lalitpur';
      } else if (bike.location.includes('Bhaktapur')) {
        location = 'Bhaktapur';
      }
      
      const slotStats = getSlotStatistics(stationName, location);
      
      // Determine if station is available based on slot status
      const isAvailable = slotStats.availableSlots > 0;
      
      return {
        ...bike,
        available: isAvailable,
        maintenanceSlots: slotStats.maintenanceSlots,
        totalSlots: slotStats.totalSlots,
        availableSlots: slotStats.availableSlots
      };
    });
    
    setBikes(updatedBikes);
    setLoadingBikes(false);
  };

  useEffect(() => {
    updateBikesWithSlotData();
    
    // Listen for slot status changes from admin panel
    const handleSlotStatusChanged = () => {
      updateBikesWithSlotData();
    };

    // Listen for focus events to refresh data when returning from admin panel
    const handleFocus = () => {
      updateBikesWithSlotData();
    };

    window.addEventListener('slotStatusChanged', handleSlotStatusChanged);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('slotStatusChanged', handleSlotStatusChanged);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleRentBike = (bike: Bike) => {
    if (!user) {
      // Show popup message for unlogged users
      const shouldRedirect = confirm("Please sign in to rent a bike. Would you like to go to the login page?");
      if (shouldRedirect) {
        router.push('/login');
      }
      return;
    }
    
    // Redirect to bike selection page with station details (no credit check here)
    const params = new URLSearchParams({
      station: bike.id,
      name: bike.station,
      location: bike.location,
      image: bike.image
    });
    
    router.push(`/bike-selection?${params.toString()}`);
  };

  const getStationColor = (station: string) => {
    switch (station) {
      case 'Station 1':
        return "bg-blue-100 text-blue-700 border-blue-200";
      case 'Station 2':
        return "bg-green-100 text-green-700 border-green-200";
      case 'Station 3':
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getAvailabilityStatus = (bike: Bike) => {
    if (!bike.available) {
      if (bike.maintenanceSlots && bike.maintenanceSlots > 0) {
        return {
          status: 'maintenance',
          text: t('bike.maintenance'),
          icon: WrenchIcon,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      } else {
        return {
          status: 'unavailable',
          text: t('bike.occupied'),
          icon: AlertTriangleIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      }
    }
    return {
      status: 'available',
      text: t('bike.available'),
      icon: BikeIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    };
  };

  if (loadingBikes) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">{t('common.loading')}</p>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('bike.availableBikes')}</h1>
              <p className="text-gray-600">{t('bike.findPerfectRide')}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{t('bike.yourCredits')}:</span>
              <span className="font-semibold text-primary-600">{user?.credits || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bikes Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bikes.map((bike) => {
            const availabilityStatus = getAvailabilityStatus(bike);
            const StatusIcon = availabilityStatus.icon;
            
            return (
              <div
                key={bike.id}
                className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-2 ${
                  bike.available 
                    ? 'border-gray-200 hover:border-primary-300' 
                    : availabilityStatus.borderColor
                }`}
              >
                {/* Bike Image */}
                <div className="relative h-48 rounded-t-xl overflow-hidden">
                  <Image
                    src={bike.image}
                    alt={bike.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {!bike.available && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-center">
                        <StatusIcon className="w-8 h-8 text-white mx-auto mb-2" />
                        <span className="text-white font-semibold text-lg">{availabilityStatus.text}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Station Badge and Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStationColor(bike.station)}`}>
                      {bike.station}
                    </span>
                    <div className="flex items-center gap-1">
                      <BikeIcon className="w-4 h-4 text-primary-600" />
                      <span className="text-sm font-medium">{bike.name}</span>
                    </div>
                  </div>

                  {/* Availability Status */}
                  <div className={`flex items-center gap-2 mb-3 p-2 rounded-lg ${availabilityStatus.bgColor}`}>
                    <StatusIcon className={`w-4 h-4 ${availabilityStatus.color}`} />
                    <span className={`text-sm font-medium ${availabilityStatus.color}`}>
                      {availabilityStatus.text}
                    </span>
                  </div>

                  {/* Slot Information */}
                  {bike.totalSlots && (
                    <div className="flex items-center justify-between mb-3 text-xs text-gray-600">
                      <span>{t('bike.availableSlots')}: {bike.availableSlots}/{bike.totalSlots}</span>
                      {bike.maintenanceSlots && bike.maintenanceSlots > 0 && (
                        <span className="text-orange-600">
                          {bike.maintenanceSlots} {t('bike.maintenance')}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Location and Distance */}
                  <div className="flex items-center gap-2 mb-4">
                    <MapPinIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{bike.location}</span>
                    <span className="text-xs text-primary-600 font-medium">• {bike.distance.replace('km', t('bike.km'))}</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-primary-600">रू{bike.price}</span>
                      <span className="text-sm text-gray-500 ml-1">{t('bike.perDay')}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">रू{bike.pricePerHour}{t('bike.perHour')}</span>
                    </div>
                  </div>

                  {/* Rent Button */}
                  <button
                    onClick={() => handleRentBike(bike)}
                    disabled={!bike.available}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                      bike.available
                        ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {bike.available ? t('bike.rentNow') : availabilityStatus.text}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}