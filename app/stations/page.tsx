"use client";

// Force dynamic rendering to prevent prerendering issues
export const dynamic = "force-dynamic";

import {
  EyeIcon,
  RouteIcon,
  MapPinIcon,
  BikeIcon,
  ClockIcon,
  StarIcon,
  ArrowRightIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";

export default function StationsPage() {
  const router = useRouter();

  const stations = [
    {
      id: 1,
      name: "Station 1",
      distance: "14 km",
      available: 5,
      occupied: 4,
      location: "Basantapur, Kathmandu",
      rating: 4.8,
    },
    {
      id: 2,
      name: "Station 2",
      distance: "1 km",
      available: 2,
      occupied: 4,
      location: "Patan, Lalitpur",
      rating: 4.5,
    },
    {
      id: 3,
      name: "Station 3",
      distance: "2 km",
      available: 2,
      occupied: 4,
      location: "Durbar Square, Bhaktapur",
      rating: 4.2,
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header Section */}
      <section className="py-12 px-6 bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              All Stations
            </h1>
            <p className="text-lg text-neutral-600 mb-8">
              Find the perfect bike station near you. All stations are equipped
              with quality bicycles and convenient locations.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-primary-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-600 p-2 rounded-lg">
                    <MapPinIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-neutral-600">
                      Total Stations
                    </span>
                    <p className="text-lg font-bold text-primary-700">
                      {stations.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-green-600 p-2 rounded-lg">
                    <BikeIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-neutral-600">
                      Available Bikes
                    </span>
                    <p className="text-lg font-bold text-green-700">
                      {stations.reduce(
                        (sum, station) => sum + station.available,
                        0,
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-600 p-2 rounded-lg">
                    <ClockIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-neutral-600">
                      In Use
                    </span>
                    <p className="text-lg font-bold text-orange-700">
                      {stations.reduce(
                        (sum, station) => sum + station.occupied,
                        0,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stations Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stations.map((station) => (
              <Card
                key={station.name}
                className="bg-white border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all duration-200 rounded-xl overflow-hidden"
                titleRender={
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">
                          {station.name}
                        </h3>
                        <p className="text-neutral-600 text-sm flex items-center gap-2">
                          <MapPinIcon className="w-4 h-4 text-primary-600" />
                          {station.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-primary-50 px-3 py-1 rounded-full">
                        <StarIcon className="w-4 h-4 text-warning-500 fill-current" />
                        <span className="text-sm font-semibold text-neutral-700">
                          {station.rating}
                        </span>
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
                            <span className="text-sm font-medium text-neutral-600">
                              Available
                            </span>
                            <p className="text-lg font-bold text-primary-700">
                              {station.available}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-secondary-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-secondary-600 p-2 rounded-lg">
                            <ClockIcon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-neutral-600">
                              In Use
                            </span>
                            <p className="text-lg font-bold text-secondary-700">
                              {station.occupied}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center justify-between bg-neutral-50 p-4 rounded-lg">
                        <span className="text-sm font-medium text-neutral-600">
                          Distance
                        </span>
                        <span className="text-lg font-bold text-primary-700">
                          {station.distance}
                        </span>
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
                        onPress={() => router.push(`/stations/${station.id}`)}
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
