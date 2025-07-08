"use client";
import { useDisclosure } from "@heroui/modal";
import { FlameIcon, UmbrellaIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
const available = 10,
  occupied = 4,
  total = 16;

export default function PopUpPage() {
  const router = useRouter();
  const { isOpen, onClose } = useDisclosure({
    isOpen: true,
    onClose: () => {
      router.back();
    },
  });

  return (
    <Modal isOpen={isOpen} title="Station 1" onClose={onClose}>
      <div>
      <div className="bg-gray-200 flex justify-center items-center h-[10rem]">
        <FlameIcon color="#9ca3af" size={50} />
      </div>
      <p>NPR: 5/hr</p>
      <div className="flex gap-4 flex-wrap">
        {[...new Array(total).fill(null)].map((el, i) => (
          <Button
              key={`popup_icon_${i}`}
            color={i < available - 1 ? "primary" : "warning"}
            isIconOnly={true}
            variant="light"
          >
            <UmbrellaIcon />
          </Button>
        ))}
      </div>
      <Button color="primary" variant="solid">
        Book now
      </Button>
      </div>
    </Modal>
  );
}
