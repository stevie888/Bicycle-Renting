import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";

export default function WalletFunction() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="w-full">
        <Card
          className="w-full py-4"
          titleRender={<></>}
          bodyRender={
            <div className="px-4">
              <p className="text-right text-sm font-bold">
                Persoanl prepaid card
              </p>
              <div className="flex flex-col gap-4">
                <p>Total amount:</p>
                <div className="flex justify-between">
                  <p className="text-end text-4xl font-bold flex items-end gap-1">
                    241.49<span className="text-sm">NPR</span>
                  </p>
                  <Button>Recharge</Button>
                </div>
              </div>
            </div>
          }
        />
      </div>
    </section>
  );
}
