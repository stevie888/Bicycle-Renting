"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { 
  CheckCircleIcon, 
  BikeIcon, 
  MapPinIcon,
  ClockIcon,
  ArrowLeftIcon
} from "lucide-react";
import Image from "next/image";

interface Rental {
  id: string;
  bikeId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  status: string;
  price: number;
  duration: 'hourly' | 'daily' | 'pay-as-you-go';
  hours?: number;
  bikeName: string;
  station: string;
  slotNumber: number;
  payAsYouGo?: boolean;
}

function RentalConfirmationPageContent() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [latestRental, setLatestRental] = useState<Rental | null>(null);
  const [isEndingRide, setIsEndingRide] = useState(false);

  // All hooks must be called before any conditional returns
  useEffect(() => {
    // Wait for authentication to load before checking user
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Get the latest rental for the current user
    const rentals = JSON.parse(localStorage.getItem('paddlenepal_rentals') || '[]');
    const userRentals = rentals.filter((rental: any) => rental.userId === user.id);
    
    if (userRentals.length > 0) {
      // Get the most recent rental
      const latest = userRentals[userRentals.length - 1];
      setLatestRental(latest);
    }
  }, [user, router, loading]);

  const handleEndRide = async () => {
    if (!latestRental || !user) return;
    
    setIsEndingRide(true);
    
    try {
      const endTime = new Date().toISOString();
      const startTime = new Date(latestRental.startTime);
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
        if (rental.id === latestRental.id) {
          return {
            ...rental,
            endTime: endTime,
            status: 'completed'
          };
        }
        return rental;
      });
      
      // Update the bike status to available
      const bicycles = JSON.parse(localStorage.getItem('paddlenepal_bicycles') || '[]');
      const updatedBicycles = bicycles.map((bicycle: any) => {
        if (bicycle.name === latestRental.bikeName) {
          return {
            ...bicycle,
            status: 'available'
          };
        }
        return bicycle;
      });
      
      // Save updated data
      localStorage.setItem('paddlenepal_rentals', JSON.stringify(updatedRentals));
      localStorage.setItem('paddlenepal_bicycles', JSON.stringify(updatedBicycles));
      
      // Update local state
      setLatestRental({
        ...latestRental,
        endTime: endTime,
        status: 'completed'
      });
      
      // Calculate final price for pay-as-you-go rentals
      let finalPrice = latestRental.price;
      if (latestRental.payAsYouGo) {
        // Calculate price based on actual usage time (minimum 1 hour)
        const actualHours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));
        finalPrice = actualHours * 25; // रू25 per hour
        
        // Update the rental with the calculated price
        const updatedRentalsWithPrice = updatedRentals.map((rental: any) => {
          if (rental.id === latestRental.id) {
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
      }
      
      // Show completion message
      alert(`🎉 Ride Completed Successfully!

📅 Rental Period:
   Start: ${startTimeFormatted}
   End: ${endTimeFormatted}
   Duration: ${durationHours}h ${durationMinutes}m

💰 Total Cost: रू${finalPrice}${latestRental.payAsYouGo ? ' (charged based on actual usage)' : ''}

Thank you for using Pedal Nepal! 🚴‍♂️`);
      
    } catch (error) {
      console.error('Error ending ride:', error);
      alert('Error ending ride. Please try again.');
    } finally {
      setIsEndingRide(false);
    }
  };

  const formatDuration = (duration: 'hourly' | 'daily' | 'pay-as-you-go', hours?: number) => {
    if (duration === 'hourly') {
      return hours && hours > 1 ? `${hours} Hours` : '1 Hour';
    } else if (duration === 'pay-as-you-go') {
      return 'Pay as you go';
    }
    return 'Daily';
  };

  const formatPrice = (price: number, duration: 'hourly' | 'daily' | 'pay-as-you-go', hours?: number) => {
    if (duration === 'hourly') {
      return hours && hours > 1 ? `रू${price} (रू25 × ${hours} hours)` : `रू${price}/hour`;
    } else if (duration === 'pay-as-you-go') {
      return 'रू25/hour (charged when ride ends)';
    }
    return `रू${price}/day`;
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

  if (!latestRental) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rental details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Message */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-3 px-4 py-2 bg-white hover:bg-primary-50 text-primary-600 hover:text-primary-700 font-medium rounded-lg border border-gray-200 hover:border-primary-300 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-x-1"
          >
            <ArrowLeftIcon className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>Back</span>
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Rental Confirmed!</h2>
            <p className="text-green-100 text-lg">Your bike has been successfully rented</p>
          </div>

          {/* Rental Details */}
          <div className="p-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Rental Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BikeIcon className="w-5 h-5 text-primary-600" />
                      <span className="font-medium text-gray-700">Bike</span>
                    </div>
                    <span className="font-semibold text-gray-900">{latestRental.bikeName}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPinIcon className="w-5 h-5 text-primary-600" />
                      <span className="font-medium text-gray-700">Station</span>
                    </div>
                    <span className="font-semibold text-gray-900">{latestRental.station}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ClockIcon className="w-5 h-5 text-primary-600" />
                      <span className="font-medium text-gray-700">Duration</span>
                    </div>
                    <span className="font-semibold text-gray-900">{formatDuration(latestRental.duration, latestRental.hours)}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">रू</span>
                      </div>
                      <span className="font-medium text-gray-700">Price</span>
                    </div>
                    <span className="font-semibold text-gray-900">{formatPrice(latestRental.price, latestRental.duration, latestRental.hours)}</span>
                  </div>
                </div>

                {/* Right Column - Time & Slot Info */}
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Start Time</h4>
                    <p className="text-green-700">
                      {new Date(latestRental.startTime).toLocaleString()}
                    </p>
                  </div>

                  {latestRental.endTime && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-900 mb-2">End Time</h4>
                      <p className="text-orange-700">
                        {new Date(latestRental.endTime).toLocaleString()}
                      </p>
                    </div>
                  )}

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-2">Slot Number</h4>
                    <p className="text-purple-700">Slot {latestRental.slotNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/my-rentals')}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  View My Rentals
                </button>
                <button
                  onClick={handleEndRide}
                  disabled={isEndingRide || latestRental?.status === 'completed'}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold border border-red-300 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isEndingRide ? 'Ending Ride...' : latestRental?.status === 'completed' ? 'Ride Completed' : 'End My Ride'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RentalConfirmationPage() {
  return (
    <ErrorBoundary>
      <RentalConfirmationPageContent />
    </ErrorBoundary>
  );
}
