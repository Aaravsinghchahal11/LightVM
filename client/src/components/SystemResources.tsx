import { useSystemResources } from "@/hooks/useSystemResources";

export function SystemResources() {
  const { resources, isLoading } = useSystemResources();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">System Resources</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CPU Resource */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">CPU</span>
            <span className="text-sm text-gray-500">
              {isLoading 
                ? "Loading..." 
                : `${resources.cpuCores} cores available`}
            </span>
          </div>
          <div className="resource-meter bg-gray-200">
            <div 
              className="bg-blue-500 h-full" 
              style={{ width: `${isLoading ? 0 : resources.cpuUsagePercent}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {isLoading ? "Loading..." : `${resources.cpuUsagePercent}% in use`}
          </div>
        </div>
        
        {/* RAM Resource */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Memory</span>
            <span className="text-sm text-gray-500">
              {isLoading 
                ? "Loading..." 
                : `${resources.totalMemoryGB} GB available`}
            </span>
          </div>
          <div className="resource-meter bg-gray-200">
            <div 
              className="bg-green-500 h-full" 
              style={{ width: `${isLoading ? 0 : resources.memoryUsagePercent}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {isLoading ? "Loading..." : `${resources.memoryUsagePercent}% in use`}
          </div>
        </div>
        
        {/* GPU Resource (if available) */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">GPU</span>
            <span className="text-sm text-gray-500">
              {isLoading 
                ? "Loading..." 
                : (resources.gpuModel || "Not available")}
            </span>
          </div>
          <div className="resource-meter bg-gray-200">
            <div 
              className="bg-purple-500 h-full" 
              style={{ width: `${isLoading ? 0 : resources.gpuUsagePercent}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {isLoading 
              ? "Loading..." 
              : resources.gpuModel 
                ? `${resources.gpuUsagePercent}% in use` 
                : "No GPU detected"}
          </div>
        </div>
      </div>
    </div>
  );
}
