import { useVMs } from "@/hooks/useVMs";
import { VMCard } from "@/components/VMCard";
import { Loader2, Monitor } from "lucide-react";

export function RunningVMs() {
  const { vms, isLoading, isPending } = useVMs();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Running VMs</h2>

      {/* Loading State */}
      {(isLoading || isPending) && (
        <div className="py-6">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-gray-700">
              {isLoading ? "Loading virtual machines..." : "Booting virtual machine..."}
            </p>
            <div className="w-64 bg-gray-200 rounded-full h-2.5 mt-4">
              <div className="bg-primary h-2.5 rounded-full progress-bar" style={{ width: "45%" }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </div>
        </div>
      )}

      {/* No VMs Running State */}
      {!isLoading && !isPending && vms.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
          <Monitor className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500 mb-1">No virtual machines are currently running</p>
          <p className="text-gray-400 text-sm">Select an ISO file to boot a new VM</p>
        </div>
      )}

      {/* VM List */}
      {!isLoading && !isPending && vms.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {vms.map((vm) => (
            <VMCard key={vm.id} vm={vm} />
          ))}
        </div>
      )}
    </div>
  );
}
