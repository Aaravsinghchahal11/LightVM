import { Computer } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Computer className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-semibold text-gray-800">LightVM</h1>
        </div>
        <div className="text-sm text-gray-500">Lightweight Virtual Machine Loader</div>
      </div>
    </header>
  );
}
