/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<unknown>(null);

  useEffect(() => {
    console.log("beforeinstallprompt event fired");
    const handler = (event: any) => {
      console.log("beforeinstallprompt event fired");
      event.preventDefault();
      setDeferredPrompt(event);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    }
  };

  return (
    <button
      onClick={installPWA}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Install App
    </button>
  );
}
