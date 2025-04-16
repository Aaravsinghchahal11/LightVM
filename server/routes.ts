import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { vmManager } from "./vm";
import os from "os";

// Set up upload directory
const uploadDir = path.join(os.tmpdir(), "lightvm-uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    }
  }),
  fileFilter: (req, file, cb) => {
    // Only accept ISO files
    if (file.originalname.toLowerCase().endsWith('.iso')) {
      cb(null, true);
    } else {
      cb(new Error("Only ISO files are allowed"));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // System resources endpoint
  app.get("/api/system/resources", async (req, res) => {
    try {
      const resources = await vmManager.getSystemResources();
      res.json(resources);
    } catch (error) {
      console.error("Error getting system resources:", error);
      res.status(500).json({ message: "Failed to get system resources" });
    }
  });

  // Get all VMs
  app.get("/api/vms", async (req, res) => {
    try {
      const vms = await storage.getAllVMs();
      
      // Update VM statistics before sending
      for (const vm of vms) {
        if (vm.status === "Running") {
          const stats = await vmManager.getVMStats(vm.id);
          if (stats) {
            // Update VM stats in storage
            await storage.updateVMStats(vm.id, stats);
            Object.assign(vm, stats);
          }
        }
      }
      
      res.json(vms);
    } catch (error) {
      console.error("Error getting VMs:", error);
      res.status(500).json({ message: "Failed to get VMs" });
    }
  });

  // Create a new VM from ISO
  app.post("/api/vms/create", upload.single("isoFile"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No ISO file uploaded" });
      }

      const isoPath = req.file.path;
      const isoName = req.file.originalname;

      // Create VM from ISO
      const vmId = await vmManager.createVM(isoPath, isoName);
      
      res.status(201).json({ id: vmId, message: "VM creation initiated" });
    } catch (error) {
      console.error("Error creating VM:", error);
      res.status(500).json({ message: `Failed to create VM: ${error instanceof Error ? error.message : "Unknown error"}` });
    }
  });

  // Stop a VM
  app.post("/api/vms/:id/stop", async (req, res) => {
    try {
      const vmId = req.params.id;
      await vmManager.stopVM(vmId);
      
      // Update VM status in storage
      await storage.updateVMStatus(vmId, "Stopped");
      
      res.json({ message: "VM stopped successfully" });
    } catch (error) {
      console.error(`Error stopping VM ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to stop VM" });
    }
  });

  // Restart a VM
  app.post("/api/vms/:id/restart", async (req, res) => {
    try {
      const vmId = req.params.id;
      await vmManager.restartVM(vmId);
      
      res.json({ message: "VM restart initiated" });
    } catch (error) {
      console.error(`Error restarting VM ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to restart VM" });
    }
  });

  // Get VM display URL/info
  app.get("/api/vms/:id/display", async (req, res) => {
    try {
      const vmId = req.params.id;
      const displayInfo = await vmManager.getVMDisplay(vmId);
      
      res.json(displayInfo);
    } catch (error) {
      console.error(`Error getting VM display for ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to get VM display" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
