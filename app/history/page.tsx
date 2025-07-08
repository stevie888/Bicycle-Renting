import { ThumbsUpIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";

export default function HistoryPage() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      {[
        {
          name: "Station 1",
          id: "123333",
          date: "14:25 2024/12/15",
          time: "2h",
          price: "154",
          status: "Paid",
        },
        {
          name: "Station 2",
          id: "123331",
          date: "14:25 2024/12/15",
          time: "2h",
          price: "154",
          status: "Pending",
        },
        {
          name: "Station 3",
          id: "123332",
          date: "14:25 2024/12/15",
          time: "2h",
          price: "154",
          status: "Paid",
        },
      ].map((el) => (
        <Card
          key={`history-card-${el.id}`}
          bodyRender={
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <p className=" flex font-bold  gap-1">
                  Station id:<span>{el.id}</span>
                </p>
                <p>{el.date}</p>
              </div>
              <div className="flex justify-between ">
                <p className="flex gap-1">
                  Duration:<span>{el.time}</span>
                </p>
                <p>NPR {el.price}</p>
              </div>
              <div className="flex justify-between">
                <div>
                  <ThumbsUpIcon color="green" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm">Send invoice</Button>
                  <Button size="sm">Details</Button>
                  <Button size="sm">Feedback</Button>
                </div>
              </div>
            </div>
          }
          className="w-full"
          titleRender={
            <div className=" flex justify-between w-full items-center">
              <p className="font-bold text-2xl">{el.name}</p>
              <p>{el.status}</p>
            </div>
          }
        />
      ))}
    </section>
  );
}
