"use client";
import { MapPinIcon, BikeIcon, ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useState, useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [hasActiveRental, setHasActiveRental] = useState(false);
  const [overdueMessage, setOverdueMessage] = useState("");

  useEffect(() => {
    if (user && !loading) {
      // Check if user has an active rental
      const existingRentals = JSON.parse(localStorage.getItem('paddlenepal_rentals') || '[]');
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
            setOverdueMessage(`Your rental is ${overdueHours} hour(s) overdue. Please end your current ride first.`);
          } else {
            setOverdueMessage("You have an active rental. Please end your current ride first.");
          }
        } else if (rentalDuration === 'daily') {
          const endTime = new Date(startTime.getTime() + (24 * 60 * 60 * 1000));
          isOverdue = currentTime > endTime;
          if (isOverdue) {
            overdueHours = Math.floor((currentTime.getTime() - endTime.getTime()) / (60 * 60 * 1000));
            setOverdueMessage(`Your daily rental is ${overdueHours} hour(s) overdue. Please end your current ride first.`);
          } else {
            setOverdueMessage("You have an active daily rental. Please end your current ride first.");
          }
        } else if (rentalDuration === 'pay-as-you-go') {
          // For pay-as-you-go, consider overdue after 24 hours
          const endTime = new Date(startTime.getTime() + (24 * 60 * 60 * 1000));
          isOverdue = currentTime > endTime;
          if (isOverdue) {
            overdueHours = Math.floor((currentTime.getTime() - endTime.getTime()) / (60 * 60 * 1000));
            setOverdueMessage(`Your pay-as-you-go rental is ${overdueHours} hour(s) overdue. Please end your current ride first.`);
          } else {
            setOverdueMessage("You have an active pay-as-you-go rental. Please end your current ride first.");
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

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Credits banner removed as requested */}

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-2 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-0.5 bg-primary-50 text-primary-700 px-1.5 py-0.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium mb-0.5 md:mb-3">
            <span>Most Popular Bike Rental in Nepal</span>
          </div>
          
          <h1 className="text-xs md:text-5xl lg:text-6xl font-bold mb-0.5 md:mb-3 text-neutral-900">
            Explore Valley
            <br />
            <span className="text-primary-600">on Two Wheels</span>
          </h1>
          
          <p className="text-xs md:text-xl text-neutral-600 mb-0.5 md:mb-4 max-w-2xl mx-auto leading-tight">
            Discover the breathtaking beauty of Nepal with our premium bicycle rental service. 
            <span className="text-primary-600 font-semibold"> Browse Rent a bike</span> and start your adventure today!
          </p>
          
          <div className="flex justify-center">
            <button 
              onClick={handleRentBike}
              className={`relative px-2 md:px-12 py-0.5 md:py-4 text-xs md:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl border-2 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer group ${
                hasActiveRental 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-400 hover:border-orange-500' 
                  : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white border-primary-500 hover:border-primary-600'
              }`}
            >
              <div className="flex items-center justify-center gap-0.5 md:gap-3">
                <BikeIcon className="w-2 h-2 md:w-5 md:h-5" />
                <span>{hasActiveRental ? 'Manage Active Rental' : 'Rent a Bike'}</span>
                <ArrowRightIcon className="w-2 h-2 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </button>
          </div>
          
          {hasActiveRental && (
            <p className="text-xs text-red-600 mt-2 max-w-md mx-auto">
              {overdueMessage}
              <br />
              <span className="text-orange-600 font-medium">Click the button above to manage your rental</span>
            </p>
          )}
        </div>
      </section>
    </div>
  );
} 