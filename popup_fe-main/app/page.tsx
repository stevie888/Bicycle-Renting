"use client";
import { EyeIcon, RouteIcon } from "lucide-react";
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
    },
    {
      id: 2,
      name: "Station 2",
      distance: "1 km",
      available: 2,
      occupied: 4,
    },
    {
      id: 3,
      name: "Station 3",
      distance: "2 km",
      available: 2,
      occupied: 4,
    },
    {
      id: 4,
      name: "Station 4",
      distance: "1 km",
      available: 5,
      occupied: 4,
    },
  ];

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
