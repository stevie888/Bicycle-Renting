"use client";
import { EyeIcon, RouteIcon, MapPinIcon, BikeIcon, ClockIcon, StarIcon, ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";

export default function Home() {
  const router = useRouter();
  const items = [
    {
      id: 1,
      name: "Station 1",
      distance: "14 km",
      available: 5,
      occupied: 4,
      location: "Basantapur,Kathmandu",
      rating: 4.8,
    },
    {
      id: 2,
      name: "Station 2",
      distance: "1 km",
      available: 2,
      occupied: 4,
      location: "Patan,Lalitpur",
      rating: 4.5,
    },
    {
      id: 3,
      name: "Station 3",
      distance: "2 km",
      available: 2,
      occupied: 4,
      location: "Durbar square,Bhaktapur",
      rating: 4.2,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <StarIcon className="w-4 h-4" />
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

      {/* Stations Section */}
      <section className="py-16 px-6 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Nearby Stations</h2>
            <p className="text-neutral-600">Find the closest bike stations to your location</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((el) => (
              <Card
                key={el.name}
                className="bg-white border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all duration-200 rounded-xl overflow-hidden"
                titleRender={
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">
                          {el.name}
                        </h3>
                        <p className="text-neutral-600 text-sm flex items-center gap-2">
                          <MapPinIcon className="w-4 h-4 text-primary-600" />
                          {el.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-primary-50 px-3 py-1 rounded-full">
                        <StarIcon className="w-4 h-4 text-warning-500 fill-current" />
                        <span className="text-sm font-semibold text-neutral-700">{el.rating}</span>
                      </div>
                    </div>
                  </div>
                }
                bodyRender={
                  <div className="p-6 pt-0">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-primary-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary-600 p-2 rounded-lg">
                            <BikeIcon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-neutral-600">Available</span>
                            <p className="text-lg font-bold text-primary-700">{el.available}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-secondary-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-secondary-600 p-2 rounded-lg">
                            <ClockIcon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-neutral-600">In Use</span>
                            <p className="text-lg font-bold text-secondary-700">{el.occupied}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center justify-between bg-neutral-50 p-4 rounded-lg">
                        <span className="text-sm font-medium text-neutral-600">Distance</span>
                        <span className="text-lg font-bold text-primary-700">{el.distance}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        type="button" 
                        variant="ghost"
                        className="flex-1 text-neutral-700 hover:text-primary-700 hover:bg-primary-50 transition-all duration-200 font-medium"
                      >
                        <RouteIcon className="w-4 h-4 mr-2" />
                        Directions
                      </Button>
                      <Button 
                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white shadow-medium hover:shadow-lg transition-all duration-200 font-medium"
                        onPress={() => router.push(`/?id=${el.id}`)}
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                }
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 