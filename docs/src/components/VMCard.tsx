import { VM } from "@shared/schema";
import { Pause, RefreshCw, MonitorPlay } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VMCardProps {
  vm: VM;
}

export function VMCard({ vm }: VMCardProps) {
  const { toast } = useToast();

  const stopVM = async () => {
    try {
      await apiRequest('POST', `/api/vms/${vm.id}/stop`, {});
      queryClient.invalidateQueries({ queryKey: ['/api/vms'] });
      toast({
        title: "VM stopped",
        description: `${vm.name} has been stopped successfully.`
      });
    } catch (error) {
      toast({
        title: "Error stopping VM",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const restartVM = async () => {
    try {
      await apiRequest('POST', `/api/vms/${vm.id}/restart`, {});
      queryClient.invalidateQueries({ queryKey: ['/api/vms'] });
      toast({
        title: "VM restarting",
        description: `${vm.name} is restarting...`
      });
    } catch (error) {
      toast({
        title: "Error restarting VM",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const connectVM = async () => {
    try {
      const res = await apiRequest('GET', `/api/vms/${vm.id}/display`, {});
      const data = await res.json();
      
      // Open display URL in a new tab or handle differently based on implementation
      if (data.displayUrl) {
        window.open(data.displayUrl, '_blank');
      } else {
        toast({
          title: "VM Display",
          description: "VM display connection is not available yet."
        });
      }
    } catch (error) {
      toast({
        title: "Error connecting to VM",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-gray-50">
      <div className="px-4 py-3 bg-gray-100 border-b flex justify-between items-center">
        <div className="font-medium text-gray-700">{vm.name}</div>
        <div className="flex space-x-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="h-2 w-2 mr-1 bg-green-500 rounded-full"></span>
            {vm.status}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">ISO:</span> 
            <span>{vm.isoName}</span>
          </div>
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">ID:</span> 
            <span>{vm.id}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">CPU</div>
            <div className="resource-meter bg-gray-200">
              <div 
                className="bg-blue-500 h-full" 
                style={{ width: `${vm.cpuUsage}%` }} 
              />
            </div>
            <div className="mt-1 text-xs text-gray-500">{vm.cpuUsage}%</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Memory</div>
            <div className="resource-meter bg-gray-200">
              <div 
                className="bg-green-500 h-full" 
                style={{ width: `${vm.memoryUsage}%` }} 
              />
            </div>
            <div className="mt-1 text-xs text-gray-500">{vm.memoryUsage}%</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Disk I/O</div>
            <div className="resource-meter bg-gray-200">
              <div 
                className="bg-yellow-500 h-full" 
                style={{ width: `${vm.diskUsage}%` }} 
              />
            </div>
            <div className="mt-1 text-xs text-gray-500">{vm.diskUsage}%</div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={stopVM} 
            className="inline-flex items-center gap-1.5"
          >
            <Pause className="h-4 w-4 text-red-500" />
            Pause
          </Button>
          <Button 
            variant="outline"
            onClick={restartVM} 
            className="inline-flex items-center gap-1.5"
          >
            <RefreshCw className="h-4 w-4 text-yellow-500" />
            Restart
          </Button>
          <Button 
            onClick={connectVM} 
            className="inline-flex items-center gap-1.5 ml-auto"
          >
            <MonitorPlay className="h-4 w-4" />
            Connect
          </Button>
        </div>
      </div>
    </div>
  );
}
