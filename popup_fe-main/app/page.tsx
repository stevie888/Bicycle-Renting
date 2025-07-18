"use client";
import { EyeIcon, RouteIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";

interface Station {
  id: number;
  name: string;
  location: string;
  distance: string;
  available: number;
  occupied: number;
  total: number;
}

export default function Home() {
  const router = useRouter();
  const [items, setItems] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stations');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setItems(data);
      } else {
        setError('Failed to load stations');
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
      setError('Failed to load stations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="text-center">Loading stations...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="text-center text-red-600">{error}</div>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      {items.map((el) => (
        <Card
          key={el.name}
          bodyRender={
            <>
              {/* <Image
              alt="Card background"
              className="object-cover rounded-xl w-full"
              src="https://heroui.com/images/hero-card-complete.jpeg"
            /> */}
            </>
          }
          fullWidth={true}
          titleRender={
            <div className=" flex justify-between mt-4 w-full">
              <div className="">
                <p className="text-tiny uppercase font-bold">{el.name}</p>
                <div className="gap-4 flex">
                  <small className="text-default-500">
                    Available: {el.available}
                  </small>
                  <small className="text-default-500">
                    In use: {el.occupied}
                  </small>
                </div>
                <h4 className="font-bold text-large">
                  Distance: <span>{el.distance}</span>
                </h4>
              </div>
              <div className="flex gap-4">
                <Button type="button" variant="ghost">
                  <RouteIcon />
                  Get Direction
                </Button>
                <Button onPress={() => router.push(`/?id=${el.id}`)}>
                  View
                  <EyeIcon />
                </Button>
              </div>
            </div>
          }
        />
      ))}
    </section>
  );
}
