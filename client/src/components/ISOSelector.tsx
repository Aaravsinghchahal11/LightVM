import { useState, useRef } from "react";
import { CloudUpload, FileText, X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface SelectedISO {
  name: string;
  size: string;
  file: File;
}

export function ISOSelector() {
  const [selectedIso, setSelectedIso] = useState<SelectedISO | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Check if it's an ISO file
    if (!file.name.toLowerCase().endsWith('.iso')) {
      toast({
        title: "Invalid file format",
        description: "Please select an ISO file.",
        variant: "destructive"
      });
      return;
    }

    // Format file size
    const size = formatFileSize(file.size);
    
    setSelectedIso({
      name: file.name,
      size: `Size: ${size}`,
      file: file
    });
  };

  const removeIso = () => {
    setSelectedIso(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const bootVM = async () => {
    if (!selectedIso) return;

    // Create form data to upload the ISO
    const formData = new FormData();
    formData.append('isoFile', selectedIso.file);

    try {
      // Start the VM creation process by uploading the ISO
      const response = await fetch('/api/vms/create', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to boot VM');
      }

      // Clear the selected ISO
      setSelectedIso(null);
      
      // Invalidate VM list query to show the new VM
      queryClient.invalidateQueries({ queryKey: ['/api/vms'] });
      
      toast({
        title: "VM creation started",
        description: "Your virtual machine is now booting",
      });
    } catch (error) {
      toast({
        title: "Error booting VM",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Select ISO Image</h2>
      
      {!selectedIso ? (
        <div 
          className={`file-drop-zone rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer ${isDragging ? 'active' : ''}`}
          onClick={handleFileSelect}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileDrop}
        >
          <CloudUpload className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium mb-1">Drag & drop ISO file here</p>
          <p className="text-gray-500 text-sm mb-3">or click to browse files</p>
          <input 
            type="file" 
            id="iso-file-input" 
            ref={fileInputRef}
            className="hidden" 
            accept=".iso"
            onChange={handleFileChange}
          />
          <div className="text-xs text-gray-500">Supported formats: .iso</div>
        </div>
      ) : (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <FileText className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between">
                <h3 className="font-medium text-blue-800">{selectedIso.name}</h3>
                <button 
                  className="text-red-500 hover:text-red-700"
                  onClick={removeIso}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-1 text-sm text-blue-600">{selectedIso.size}</div>
              <div className="mt-3 flex">
                <Button
                  onClick={bootVM}
                  className="inline-flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Boot VM
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
