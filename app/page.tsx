"use client";
import { MapPinIcon, BikeIcon, ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <span>Most Popular Bike Rental in Nepal</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-8 text-neutral-900">
            Explore Nepal
            <br />
            <span className="text-primary-600">on Two Wheels</span>
          </h1>
          
          <p className="text-xl text-neutral-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover the breathtaking beauty of Nepal with our premium bicycle rental service. 
            <span className="text-primary-600 font-semibold"> Find stations near you</span> and start your adventure today!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={() => router.push('/bicycles')}
              className="relative bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-10 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl border-2 border-primary-500 hover:border-primary-600 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer group"
            >
              <div className="flex items-center justify-center gap-3">
                <BikeIcon className="w-5 h-5" />
                <span>Rent a Bike</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </button>
            
            <button 
              onClick={() => router.push('/stations')}
              className="relative bg-white text-neutral-700 hover:text-primary-700 px-10 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl border-2 border-neutral-300 hover:border-primary-400 hover:bg-primary-50 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer group"
            >
              <div className="flex items-center justify-center gap-3">
                <MapPinIcon className="w-5 h-5" />
                <span>View All Stations</span>
              </div>
            </button>
          </div>
        </div>
      </section>


    </div>
  );
} 