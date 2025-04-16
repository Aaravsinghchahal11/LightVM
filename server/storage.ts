import { VM, InsertVM, SystemResources, User, InsertUser } from "@shared/schema";
import { nanoid } from "nanoid";

// Define the types for VM statistics
interface VMStats {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // VM related methods
  createVM(vm: InsertVM): Promise<VM>;
  getVM(id: string): Promise<VM | undefined>;
  getAllVMs(): Promise<VM[]>;
  updateVMStatus(id: string, status: string): Promise<void>;
  updateVMStats(id: string, stats: VMStats): Promise<void>;
  deleteVM(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vms: Map<string, VM>;
  currentUserId: number;

  constructor() {
    this.users = new Map();
    this.vms = new Map();
    this.currentUserId = 1;
  }

  // User related methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // VM related methods
  async createVM(insertVM: InsertVM): Promise<VM> {
    const id = `vm-${nanoid(6)}`;
    const vm: VM = { ...insertVM, id };
    this.vms.set(id, vm);
    return vm;
  }

  async getVM(id: string): Promise<VM | undefined> {
    return this.vms.get(id);
  }

  async getAllVMs(): Promise<VM[]> {
    return Array.from(this.vms.values());
  }

  async updateVMStatus(id: string, status: string): Promise<void> {
    const vm = this.vms.get(id);
    if (vm) {
      vm.status = status;
      this.vms.set(id, vm);
    }
  }

  async updateVMStats(id: string, stats: VMStats): Promise<void> {
    const vm = this.vms.get(id);
    if (vm) {
      vm.cpuUsage = stats.cpuUsage;
      vm.memoryUsage = stats.memoryUsage;
      vm.diskUsage = stats.diskUsage;
      this.vms.set(id, vm);
    }
  }

  async deleteVM(id: string): Promise<void> {
    this.vms.delete(id);
  }
}

export const storage = new MemStorage();
