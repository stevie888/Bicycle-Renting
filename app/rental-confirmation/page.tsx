"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useLanguage } from "@/components/LanguageContext";
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
  status: 'active' | 'completed' | 'cancelled';
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
  const { t } = useLanguage();
  const [latestRental, setLatestRental] = useState<Rental | null>(null);

  // All hooks must be called before any conditional returns
  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Clean up any data inconsistencies first
    const cleanupRentals = () => {
      const rentals = JSON.parse(localStorage.getItem('pedalnepal_rentals') || '[]');
      const userRentals = rentals.filter((rental: any) => rental.userId === user.id);
      
      // If user has multiple active rentals, keep only the most recent one
      const activeRentals = userRentals.filter((rental: any) => rental.status === 'active');
      if (activeRentals.length > 1) {
        // Sort by start time and keep only the most recent active rental
        const sortedActiveRentals = activeRentals.sort((a: any, b: any) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        
        // Mark all but the most recent as completed
        const updatedRentals = rentals.map((rental: any) => {
          if (rental.userId === user.id && rental.status === 'active' && rental.id !== sortedActiveRentals[0].id) {
            return { ...rental, status: 'completed', endTime: new Date().toISOString() };
          }
          return rental;
        });
        
        localStorage.setItem('pedalnepal_rentals', JSON.stringify(updatedRentals));
        return updatedRentals;
      }
      
      return rentals;
    };

    const cleanedRentals = cleanupRentals();
    const userRentals = cleanedRentals.filter((rental: any) => rental.userId === user.id);
    
    // Debug logging to help identify the issue
    console.log("All rentals:", cleanedRentals);
    console.log("User rentals:", userRentals);
    console.log("User ID:", user.id);
    
    if (userRentals.length === 0) {
      // No rentals found - redirect to homepage
      alert("No rental found. Please rent a bike first.");
      router.push('/');
      return;
    }

    // Sort by start time to get the latest rental
    const sortedRentals = userRentals.sort((a: any, b: any) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
    
    const latestRental = sortedRentals[0];
    
    // Check if the latest rental is active OR if there are any active rentals
    const hasActiveRental = userRentals.some((rental: any) => rental.status === 'active');
    
    if (!hasActiveRental) {
      // No active rental - but show the latest rental anyway for reference
      console.log("No active rental found, but showing latest rental:", latestRental);
      setLatestRental(latestRental);
      return;
    }

    // If latest rental is not active but there are active rentals, find the active one
    if (latestRental.status !== 'active') {
      const activeRental = userRentals.find((rental: any) => rental.status === 'active');
      if (activeRental) {
        setLatestRental(activeRental);
        return;
      }
    }

    setLatestRental(latestRental);
  }, [user, router, loading]);



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

  const getStatusColor = (status: string, rental: any) => {
    // Check if rental is overdue
    if (status === 'active' && rental) {
      const startTime = new Date(rental.startTime);
      const currentTime = new Date();
      const rentalDuration = rental.duration;
      const rentalHours = rental.hours || 1;
      
      let isOverdue = false;
      
      if (rentalDuration === 'hourly') {
        const endTime = new Date(startTime.getTime() + (rentalHours * 60 * 60 * 1000));
        isOverdue = currentTime > endTime;
      } else if (rentalDuration === 'daily') {
        const endTime = new Date(startTime.getTime() + (24 * 60 * 60 * 1000));
        isOverdue = currentTime > endTime;
      } else if (rentalDuration === 'pay-as-you-go') {
        // For pay-as-you-go, consider overdue after 24 hours
        const endTime = new Date(startTime.getTime() + (24 * 60 * 60 * 1000));
        isOverdue = currentTime > endTime;
      }
      
      if (isOverdue) {
        return 'bg-red-100 text-red-800 border-red-200';
      }
    }
    
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string, rental: any) => {
    // Check if rental is overdue
    if (status === 'active' && rental) {
      const startTime = new Date(rental.startTime);
      const currentTime = new Date();
      const rentalDuration = rental.duration;
      const rentalHours = rental.hours || 1;
      
      let isOverdue = false;
      let overdueHours = 0;
      
      if (rentalDuration === 'hourly') {
        const endTime = new Date(startTime.getTime() + (rentalHours * 60 * 60 * 1000));
        isOverdue = currentTime > endTime;
        if (isOverdue) {
          overdueHours = Math.floor((currentTime.getTime() - endTime.getTime()) / (60 * 60 * 1000));
        }
      } else if (rentalDuration === 'daily') {
        const endTime = new Date(startTime.getTime() + (24 * 60 * 60 * 1000));
        isOverdue = currentTime > endTime;
        if (isOverdue) {
          overdueHours = Math.floor((currentTime.getTime() - endTime.getTime()) / (60 * 60 * 1000));
        }
      } else if (rentalDuration === 'pay-as-you-go') {
        // For pay-as-you-go, consider overdue after 24 hours
        const endTime = new Date(startTime.getTime() + (24 * 60 * 60 * 1000));
        isOverdue = currentTime > endTime;
        if (isOverdue) {
          overdueHours = Math.floor((currentTime.getTime() - endTime.getTime()) / (60 * 60 * 1000));
        }
      }
      
      if (isOverdue) {
        return `Overdue (${overdueHours}h)`;
      }
    }
    
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Loading...</p>
        </div>
      </div>
    );
  }

  if (!latestRental) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Loading rental details...</p>
        </div>
      </div>
    );
  }

  // Show fallback if rental is not active but we want to show it anyway
  if (latestRental.status !== 'active') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Back Button */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          </div>
          
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Rental Status Issue</h2>
              <p className="text-orange-100 text-base sm:text-lg">We found your rental but it's not currently active</p>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-center">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm text-yellow-700">
                      <span className="font-medium">Status:</span> {latestRental.status.charAt(0).toUpperCase() + latestRental.status.slice(1)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <BikeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Slot</span>
                    </div>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">Slot {latestRental.slotNumber}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Station</span>
                    </div>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">{latestRental.station}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Start Time</span>
                    </div>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">
                      {new Date(latestRental.startTime).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {latestRental.endTime && (
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                        <span className="font-medium text-gray-700 text-sm sm:text-base">End Time</span>
                      </div>
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">
                        {new Date(latestRental.endTime).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">रू</span>
                      </div>
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Price</span>
                    </div>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">रू{latestRental.price}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => router.push('/my-rentals')}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 sm:px-6 py-3 sm:py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                >
                  View All My Rentals
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-3 sm:py-3 rounded-lg font-semibold border border-green-300 transition-all duration-200 text-sm sm:text-base"
                >
                  Rent a New Bike
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Message */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 sm:px-6 py-4 sm:py-6 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">{t('rental.rentalConfirmed')}!</h2>
            <p className="text-green-100 text-xs sm:text-sm lg:text-base">{t('rental.rentalSuccess')}</p>
          </div>

          {/* Active Rental Management Notice */}
          {latestRental?.status === 'active' && (
            <div className="bg-orange-50 border-l-4 border-orange-400 p-3 sm:p-4 mx-3 sm:mx-6 mt-3 sm:mt-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm text-orange-700">
                    <span className="font-medium">Active Rental:</span> You can end your ride anytime using the "End My Ride" button.
                    {getStatusText(latestRental.status, latestRental).includes('Overdue') && (
                      <span className="block mt-1 font-semibold text-xs sm:text-sm">⚠️ Your rental is overdue - please end your ride soon!</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Rental Details */}
          <div className="p-4 sm:p-6">
            <div>
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Rental Details</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {/* Left Column - Basic Info */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <BikeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Slot</span>
                    </div>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">Slot {latestRental.slotNumber}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Station</span>
                    </div>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">{latestRental.station}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Duration</span>
                    </div>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">{formatDuration(latestRental.duration, latestRental.hours)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">रू</span>
                      </div>
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Price</span>
                    </div>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">{formatPrice(latestRental.price, latestRental.duration, latestRental.hours)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">📊</span>
                      </div>
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Status</span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium border ${getStatusColor(latestRental.status, latestRental)}`}>
                      {getStatusText(latestRental.status, latestRental)}
                    </span>
                  </div>
                </div>

                {/* Right Column - Time & Slot Info */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-green-900 mb-1 sm:mb-2 text-sm sm:text-base">Start Time</h4>
                    <p className="text-green-700 text-sm sm:text-base">
                      {new Date(latestRental.startTime).toLocaleString()}
                    </p>
                  </div>

                  {latestRental.endTime && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
                      <h4 className="font-semibold text-orange-900 mb-1 sm:mb-2 text-sm sm:text-base">End Time</h4>
                      <p className="text-orange-700 text-sm sm:text-base">
                        {new Date(latestRental.endTime).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => router.push('/my-rentals')}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 border-0 text-sm sm:text-base"
                >
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  View My Rentals
                </button>
                <button
                  onClick={() => router.push('/return-bike')}
                  disabled={(latestRental?.status as string) === 'completed'}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2 border-0 text-sm sm:text-base"
                >
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {(latestRental?.status as string) === 'completed' ? 'Ride Completed' : 'Return Bike'}
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
