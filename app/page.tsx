"use client";
import { MapPinIcon, BikeIcon, ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useLanguage } from "@/components/LanguageContext";
import { useState, useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [hasActiveRental, setHasActiveRental] = useState(false);
  const [overdueMessage, setOverdueMessage] = useState("");

  useEffect(() => {
    if (user && !loading) {
      // Redirect admin users directly to admin dashboard
      if (user.role === 'admin') {
        router.push('/admin');
        return;
      }
      // Check if user has an active rental
      const existingRentals = JSON.parse(localStorage.getItem('pedalnepal_rentals') || '[]');
      const userActiveRental = existingRentals.find((rental: any) => 
        rental.userId === user.id && rental.status === 'active'
      );

      if (userActiveRental) {
        setHasActiveRental(true);
        
        // Check if rental is overdue
        const startTime = new Date(userActiveRental.startTime);
        const currentTime = new Date();
        const rentalDuration = userActiveRental.duration;
        const rentalHours = userActiveRental.hours || 1;
        
        let isOverdue = false;
        let overdueHours = 0;
        
        if (rentalDuration === 'hourly') {
          const endTime = new Date(startTime.getTime() + (rentalHours * 60 * 60 * 1000));
          isOverdue = currentTime > endTime;
          if (isOverdue) {
            overdueHours = Math.floor((currentTime.getTime() - endTime.getTime()) / (60 * 60 * 1000));
            setOverdueMessage(t('home.rentalOverdue').replace('{hours}', overdueHours.toString()));
          } else {
            setOverdueMessage(t('home.hasActiveRental'));
          }
        } else if (rentalDuration === 'daily') {
          const endTime = new Date(startTime.getTime() + (24 * 60 * 60 * 1000));
          isOverdue = currentTime > endTime;
          if (isOverdue) {
            overdueHours = Math.floor((currentTime.getTime() - endTime.getTime()) / (60 * 60 * 1000));
            setOverdueMessage(t('home.dailyRentalOverdue').replace('{hours}', overdueHours.toString()));
          } else {
            setOverdueMessage(t('home.hasActiveDailyRental'));
          }
        } else if (rentalDuration === 'pay-as-you-go') {
          // For pay-as-you-go, consider overdue after 24 hours
          const endTime = new Date(startTime.getTime() + (24 * 60 * 60 * 1000));
          isOverdue = currentTime > endTime;
          if (isOverdue) {
            overdueHours = Math.floor((currentTime.getTime() - endTime.getTime()) / (60 * 60 * 1000));
            setOverdueMessage(t('home.payAsYouGoOverdue').replace('{hours}', overdueHours.toString()));
          } else {
            setOverdueMessage(t('home.hasActivePayAsYouGo'));
          }
        }
      }
    }
  }, [user, loading]);

  const handleRentBike = () => {
    if (hasActiveRental) {
      // Navigate to rental confirmation page to manage active rental
      router.push('/rental-confirmation');
      return;
    }
    router.push('/bicycles');
  };

  // Show loading state while checking user role
  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Don't render homepage content for admin users (they will be redirected)
  if (user && user.role === 'admin') {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('home.redirectingToAdmin')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center space-y-6 md:space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium border border-primary-200">
              <BikeIcon className="w-4 h-4" />
              <span>{t('home.subtitle')}</span>
            </div>
            
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                {t('home.exploreNepal')}
                <br />
                <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                  {t('home.onTwoWheels')}
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {t('home.description')}
                <span className="text-primary-600 font-semibold"> {t('home.adventureAwaits')}</span>
              </p>
            </div>
            
            {/* CTA Button */}
            <div className="flex justify-center items-center">
              <button 
                onClick={handleRentBike}
                className={`relative px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer group flex items-center justify-center gap-3 ${
                  hasActiveRental 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white' 
                    : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white'
                }`}
              >
                <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <BikeIcon className="w-3 h-3 text-white" />
                </div>
                <span>{hasActiveRental ? t('home.manageActiveRental') : t('bike.rentBike')}</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
            
            {/* Active Rental Warning */}
            {hasActiveRental && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 max-w-2xl mx-auto">
                <p className="text-orange-800 text-sm">
                  <strong>{t('home.activeRental')}</strong> {overdueMessage}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
} 