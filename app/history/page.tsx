"use client";

import { ThumbsUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { useAuth } from "@/components/AuthContext";
import { useEffect, useState } from "react";

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/history?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setHistory(data.history || []);
        setError("");
      })
      .catch(() => setError("Failed to load history."))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <div className="p-4">Please log in to view your rental history.</div>;
  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  if (history.length === 0) {
    return <div className="p-4">No rental history found.</div>;
  }

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      {history.map((el) => (
        <Card
          key={`history-card-${el.id}`}
          bodyRender={
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <p className=" flex font-bold  gap-1">
                  Station id:<span>{el.station_id}</span>
                </p>
                <p>{el.rented_at}</p>
              </div>
              <div className="flex justify-between ">
                <p className="flex gap-1">
                  Duration:<span>{el.duration || 'N/A'}</span>
                </p>
                <p>NPR {el.price || 'N/A'}</p>
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
              <p className="font-bold text-2xl">Umbrella {el.umbrella_id}</p>
              <p>{el.status}</p>
            </div>
          }
        />
      ))}
    </section>
  );
}
