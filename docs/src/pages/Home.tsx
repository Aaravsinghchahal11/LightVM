import { useState } from "react";
import { Header } from "@/components/Header";
import { SystemResources } from "@/components/SystemResources";
import { ISOSelector } from "@/components/ISOSelector";
import { RunningVMs } from "@/components/RunningVMs";
import { ErrorNotification } from "@/components/ErrorNotification";

export default function Home() {
  const [error, setError] = useState<string | null>(null);

  const dismissError = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SystemResources />
        <ISOSelector />
        <RunningVMs />
      </main>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mt-8 text-center text-sm text-gray-500">
        <p>LightVM - Lightweight Virtual Machine Loader &copy; {new Date().getFullYear()}</p>
      </footer>

      {error && (
        <ErrorNotification 
          message={error} 
          isVisible={!!error} 
          onDismiss={dismissError} 
        />
      )}
    </div>
  );
}
