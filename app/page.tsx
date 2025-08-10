"use client";
import { MapPinIcon, BikeIcon, ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Credits banner removed as requested */}

      {/* Hero Section */}
      <section className="py-2 md:py-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-2 py-0.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium mb-2 md:mb-8">
            <span>Most Popular Bike Rental in Nepal</span>
          </div>
          
          <h1 className="text-xl md:text-5xl lg:text-6xl font-bold mb-2 md:mb-8 text-neutral-900">
            Explore Nepal
            <br />
            <span className="text-primary-600">on Two Wheels</span>
          </h1>
          
          <p className="text-xs md:text-xl text-neutral-600 mb-3 md:mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover the breathtaking beauty of Nepal with our premium bicycle rental service. 
            <span className="text-primary-600 font-semibold"> Browse available bikes</span> and start your adventure today!
          </p>
          
          <div className="flex justify-center">
            <button 
              onClick={() => router.push('/bicycles')}
              className="relative bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-4 md:px-12 py-2 md:py-4 text-xs md:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl border-2 border-primary-500 hover:border-primary-600 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer group"
            >
              <div className="flex items-center justify-center gap-1 md:gap-3">
                <BikeIcon className="w-3 h-3 md:w-5 md:h-5" />
                <span>Rent a Bike</span>
                <ArrowRightIcon className="w-3 h-3 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </button>
          </div>
        </div>
      </section>


    </div>
  );
} 