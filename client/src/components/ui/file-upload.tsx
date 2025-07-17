import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Upload, X, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FileUploadProps {
  folderId: number | null;
  onClose: () => void;
  onUploadComplete: () => void;
}

export default function FileUpload({ folderId, onClose, onUploadComplete }: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processOcr, setProcessOcr] = useState(true);
  const [generateSummary, setGenerateSummary] = useState(true);
  const [autoTag, setAutoTag] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/files/upload", formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload successful",
        description: "Your files have been uploaded and are being processed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      onUploadComplete();
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload files",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (files: FileList) => {
    const newFiles = Array.from(files);
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    if (folderId) {
      formData.append('folderId', folderId.toString());
    }
    formData.append('processOcr', processOcr.toString());
    formData.append('generateSummary', generateSummary.toString());
    formData.append('autoTag', autoTag.toString());

    uploadMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-gray-900">Upload Documents</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragOver ? "border-primary bg-blue-50" : "border-gray-300 hover:border-primary"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg text-gray-600 mb-2">Drop files here or click to browse</p>
            <p className="text-sm text-gray-500">Supports PDF, images, scanned documents, and more</p>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
              className="hidden"
              id="file-input"
            />
            <Button 
              type="button" 
              className="mt-4"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              Choose Files
            </Button>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Selected Files ({selectedFiles.length})</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <File className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processing Options */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Processing Options</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="ocr" 
                  checked={processOcr} 
                  onCheckedChange={(checked) => setProcessOcr(checked as boolean)}
                />
                <Label htmlFor="ocr" className="text-sm text-gray-700">
                  Run OCR on scanned documents
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="summary" 
                  checked={generateSummary} 
                  onCheckedChange={(checked) => setGenerateSummary(checked as boolean)}
                />
                <Label htmlFor="summary" className="text-sm text-gray-700">
                  Generate AI summaries
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tags" 
                  checked={autoTag} 
                  onCheckedChange={(checked) => setAutoTag(checked as boolean)}
                />
                <Label htmlFor="tags" className="text-sm text-gray-700">
                  Auto-categorize and tag
                </Label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={selectedFiles.length === 0 || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload & Process"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
