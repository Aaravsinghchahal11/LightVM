import { useQuery, useMutation } from '@tanstack/react-query';
import { VM } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

export function useVMs() {
  const query = useQuery<VM[]>({
    queryKey: ['/api/vms'],
    refetchInterval: 3000, // Refresh VM list every 3 seconds
  });

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('/api/vms/create', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to create VM');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vms'] });
    }
  });

  return {
    vms: query.data || [],
    isLoading: query.isLoading,
    isPending: createMutation.isPending,
    createVM: createMutation.mutate,
    error: query.error || createMutation.error
  };
}
