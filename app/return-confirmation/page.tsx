'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useLanguage } from '@/components/LanguageContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { CheckCircle, MapPin, Clock, CreditCard, ArrowRight } from 'lucide-react';

function ReturnConfirmationPage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [rentalDetails, setRentalDetails] = useState<any>(null);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Get the latest completed rental for this user
    const rentals = JSON.parse(localStorage.getItem('pedalnepal_rentals') || '[]');
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
    
    return formattedDuration;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4 sm:mb-6"></div>
          <p className="text-gray-600 text-base sm:text-lg font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="px-3 sm:px-4 py-3 sm:py-6">
        <div className="max-w-md mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-6">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">{t('return.returnConfirmed')}!</h1>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 lg:mb-8">{t('return.returnSuccess')}</p>

            {rentalDetails && (
              <div className="space-y-2 sm:space-y-3 lg:space-y-4 mb-4 sm:mb-6 lg:mb-8">
                {/* Return Location */}
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-center space-x-2 mb-1 sm:mb-2">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">{t('return.returnLocation')}</span>
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base">{rentalDetails.returnStation || t('common.unknown')}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{t('bike.slot')} {rentalDetails.returnSlotNumber || 'N/A'}</p>
                </div>

                {/* Ride Duration */}
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-center space-x-2 mb-1 sm:mb-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">{t('rental.duration')}</span>
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base">
                    {calculateDuration(rentalDetails.startTime, rentalDetails.endTime)}
                  </p>
                </div>

                {/* Total Cost */}
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-center space-x-2 mb-1 sm:mb-2">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">{t('rental.cost')}</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">₹{rentalDetails.price || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{t('return.deductedFromCredits')}</p>
                </div>

                {/* Remaining Credits */}
                <div className="bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-200">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('return.remainingCredits')}</p>
                  <p className="text-lg sm:text-xl font-bold text-green-600">₹{user?.credits || 0}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
             <div className="space-y-2 sm:space-y-3 lg:space-y-4">
               <button
                 onClick={() => router.push('/bicycles')}
                 className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 border-0 cursor-pointer text-sm sm:text-base"
               >
                 <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                   <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                   </svg>
                 </div>
                 {t('return.rentAnother')}
                 <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
               </button>
               
               <button
                 onClick={() => router.push('/')}
                 className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 border-0 cursor-pointer text-sm sm:text-base"
               >
                 <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                   <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                   </svg>
                 </div>
                 {t('return.goHome')}
               </button>
             </div>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mt-3 sm:mt-4 lg:mt-6">
            <h3 className="font-semibold text-blue-900 mb-1 sm:mb-2 text-sm sm:text-base">{t('return.thankYouMessage')}</h3>
            <p className="text-xs sm:text-sm text-blue-700">
              {t('return.additionalInfo')}
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
