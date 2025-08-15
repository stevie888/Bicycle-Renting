'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { CheckCircle, MapPin, Clock, CreditCard, ArrowRight } from 'lucide-react';

function ReturnConfirmationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [rentalDetails, setRentalDetails] = useState<any>(null);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Get the latest completed rental for this user
    const rentals = JSON.parse(localStorage.getItem('paddlenepal_rentals') || '[]');
    const userRentals = rentals.filter((rental: any) => rental.userId === user.id);
    const latestCompletedRental = userRentals
      .filter((rental: any) => rental.status === 'completed')
      .sort((a: any, b: any) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())[0];

    if (latestCompletedRental) {
      setRentalDetails(latestCompletedRental);
    }
  }, [user, loading, router]);

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const hours = durationMs / (1000 * 60 * 60);
    return hours;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Bike Returned Successfully!</h1>
            <p className="text-gray-600 mb-8">Your bike has been returned and your ride is complete.</p>

            {rentalDetails && (
              <div className="space-y-4 mb-8">
                {/* Return Location */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">Return Location</span>
                  </div>
                  <p className="text-gray-700">{rentalDetails.returnStation || 'Unknown Station'}</p>
                  <p className="text-sm text-gray-500">Slot {rentalDetails.returnSlotNumber || 'N/A'}</p>
                </div>

                {/* Ride Duration */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-gray-900">Ride Duration</span>
                  </div>
                  <p className="text-gray-700">
                    {calculateDuration(rentalDetails.startTime, rentalDetails.endTime).toFixed(1)} hours
                  </p>
                </div>

                {/* Total Cost */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-900">Total Cost</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">₹{rentalDetails.price || 0}</p>
                  <p className="text-sm text-gray-500">Deducted from your credits</p>
                </div>

                {/* Remaining Credits */}
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Remaining Credits</p>
                  <p className="text-xl font-bold text-green-600">₹{user?.credits || 0}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={() => router.push('/bicycles')}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
              >
                <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                Rent Another Bike
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
              >
                <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                Go to Home
              </Button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-50 rounded-xl p-4 mt-6">
            <h3 className="font-semibold text-blue-900 mb-2">Thank you for using PaddleNepal!</h3>
            <p className="text-sm text-blue-700">
              Your bike has been safely returned. You can now rent another bike from any station or check your ride history in your profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReturnConfirmationPageWrapper() {
  return (
    <ErrorBoundary>
      <ReturnConfirmationPage />
    </ErrorBoundary>
  );
}
