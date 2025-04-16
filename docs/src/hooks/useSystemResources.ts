import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SystemResources } from '@shared/schema';

export function useSystemResources() {
  const query = useQuery<SystemResources>({
    queryKey: ['/api/system/resources'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  return {
    resources: query.data || {
      cpuCores: 0,
      cpuUsagePercent: 0,
      totalMemoryGB: 0,
      freeMemoryGB: 0,
      memoryUsagePercent: 0,
      gpuModel: "",
      gpuUsagePercent: 0
    },
    isLoading: query.isLoading,
    error: query.error
  };
}
