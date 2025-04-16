import { spawn, exec } from "child_process";
import { promisify } from "util";
import os from "os";
import fs from "fs";
import path from "path";
import { storage } from "./storage";
import { SystemResources } from "@shared/schema";
import { nanoid } from "nanoid";

const execPromise = promisify(exec);

// Simple VM Manager service for a lightweight VM implementation
class VMManager {
  private activeVMs: Map<string, any>;
  private vmDisplayUrls: Map<string, string>;
  
  constructor() {
    this.activeVMs = new Map();
    this.vmDisplayUrls = new Map();
  }
  
  // Get system resources
  async getSystemResources(): Promise<SystemResources> {
    const cpuCores = os.cpus().length;
    
    // Get CPU usage (this is a simplified approach)
    const cpuUsage = await this.getCPUUsage();
    
    // Get memory information
    const totalMemoryGB = os.totalmem() / (1024 * 1024 * 1024);
    const freeMemoryGB = os.freemem() / (1024 * 1024 * 1024);
    const memoryUsagePercent = ((totalMemoryGB - freeMemoryGB) / totalMemoryGB) * 100;
    
    // Get GPU information if available (very simplified)
    let gpuModel: string | null = null;
    let gpuUsagePercent = 0;
    
    try {
      const { stdout } = await execPromise('lspci | grep -i vga');
      if (stdout) {
        // Extract GPU model from lspci output (very basic approach)
        const match = stdout.match(/VGA compatible controller: (.*)/);
        if (match && match[1]) {
          gpuModel = match[1].trim();
          gpuUsagePercent = 5; // Placeholder value
        }
      }
    } catch (error) {
      console.log("No GPU detected or lspci not available");
      // If we can't get GPU info, that's okay
    }
    
    return {
      cpuCores,
      cpuUsagePercent: Math.round(cpuUsage * 10) / 10,
      totalMemoryGB: Math.round(totalMemoryGB * 10) / 10,
      freeMemoryGB: Math.round(freeMemoryGB * 10) / 10,
      memoryUsagePercent: Math.round(memoryUsagePercent * 10) / 10,
      gpuModel,
      gpuUsagePercent
    };
  }
  
  // Create a new VM from ISO
  async createVM(isoPath: string, isoName: string): Promise<string> {
    const vmId = `vm-${nanoid(6)}`;
    const vmName = path.basename(isoName, '.iso');
    
    try {
      // Save VM in database first
      await storage.createVM({
        name: vmName,
        status: "Starting",
        isoName,
        isoPath,
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        config: {}
      });
      
      // This is a simplified implementation
      // In a real application, we would use a more robust VM library
      console.log(`Creating VM ${vmId} from ISO ${isoPath}`);
      
      // Simulate VM creation process
      setTimeout(async () => {
        // Update VM status to running after "creation"
        await storage.updateVMStatus(vmId, "Running");
        
        // Set up simulated resource usage for the VM
        this.setupSimulatedResources(vmId);
        
        // Store a display URL for the VM
        this.vmDisplayUrls.set(vmId, `http://localhost:5000/vm-display/${vmId}`);
      }, 5000);
      
      return vmId;
    } catch (error) {
      console.error(`Error creating VM: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw error;
    }
  }
  
  // Stop a VM
  async stopVM(vmId: string): Promise<void> {
    const vm = await storage.getVM(vmId);
    if (!vm) {
      throw new Error(`VM with ID ${vmId} not found`);
    }
    
    // In a real implementation, we would send commands to the VM
    console.log(`Stopping VM ${vmId}`);
    
    // Clear any simulated resource intervals
    const interval = this.activeVMs.get(vmId);
    if (interval) {
      clearInterval(interval);
      this.activeVMs.delete(vmId);
    }
    
    // Update VM status
    await storage.updateVMStatus(vmId, "Stopped");
  }
  
  // Restart a VM
  async restartVM(vmId: string): Promise<void> {
    const vm = await storage.getVM(vmId);
    if (!vm) {
      throw new Error(`VM with ID ${vmId} not found`);
    }
    
    console.log(`Restarting VM ${vmId}`);
    
    // Update status to restarting
    await storage.updateVMStatus(vmId, "Restarting");
    
    // Clear any existing intervals
    const interval = this.activeVMs.get(vmId);
    if (interval) {
      clearInterval(interval);
    }
    
    // Simulate restart time
    setTimeout(async () => {
      await storage.updateVMStatus(vmId, "Running");
      this.setupSimulatedResources(vmId);
    }, 3000);
  }
  
  // Get VM display information
  async getVMDisplay(vmId: string): Promise<{ displayUrl: string | null }> {
    const vm = await storage.getVM(vmId);
    if (!vm) {
      throw new Error(`VM with ID ${vmId} not found`);
    }
    
    // In a real implementation, this would provide connection details
    // for VNC, SPICE, or other remote display protocol
    const displayUrl = this.vmDisplayUrls.get(vmId) || null;
    
    return { displayUrl };
  }
  
  // Get VM resource usage statistics
  async getVMStats(vmId: string): Promise<{ cpuUsage: number; memoryUsage: number; diskUsage: number } | null> {
    const vm = await storage.getVM(vmId);
    if (!vm || vm.status !== "Running") {
      return null;
    }
    
    // In a real implementation, this would query the VM for actual usage
    // For now, we'll return the stored values which are simulated
    return {
      cpuUsage: vm.cpuUsage,
      memoryUsage: vm.memoryUsage,
      diskUsage: vm.diskUsage
    };
  }
  
  // Helper methods
  private async getCPUUsage(): Promise<number> {
    try {
      // This is a simplified approach to get CPU usage on Linux
      // In a real app, we would use a more robust method
      const { stdout } = await execPromise("top -bn1 | grep 'Cpu(s)'");
      const match = stdout.match(/(\d+\.\d+).*?id/);
      if (match && match[1]) {
        // Parse the idle percentage and convert to usage percentage
        const idlePercent = parseFloat(match[1]);
        return 100 - idlePercent;
      }
      
      // Fallback to a reasonable default
      return 15;
    } catch (error) {
      console.log("Error getting CPU usage:", error);
      return 15; // Default fallback value
    }
  }
  
  private setupSimulatedResources(vmId: string): void {
    // Set up an interval to simulate changing resource usage
    const interval = setInterval(async () => {
      try {
        const vm = await storage.getVM(vmId);
        if (!vm || vm.status !== "Running") {
          clearInterval(interval);
          this.activeVMs.delete(vmId);
          return;
        }
        
        // Simulate resource usage changes with some random variation
        const cpuUsage = Math.min(100, Math.max(5, vm.cpuUsage + (Math.random() * 10 - 5)));
        const memoryUsage = Math.min(100, Math.max(5, vm.memoryUsage + (Math.random() * 6 - 3)));
        const diskUsage = Math.min(100, Math.max(1, vm.diskUsage + (Math.random() * 2 - 1)));
        
        await storage.updateVMStats(vmId, {
          cpuUsage: Math.round(cpuUsage),
          memoryUsage: Math.round(memoryUsage),
          diskUsage: Math.round(diskUsage)
        });
      } catch (error) {
        console.error(`Error updating VM stats for ${vmId}:`, error);
      }
    }, 3000);
    
    this.activeVMs.set(vmId, interval);
  }
}

export const vmManager = new VMManager();
