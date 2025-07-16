import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Download, FolderOpen, Edit } from "lucide-react";

interface FilePreviewProps {
  fileId: number;
  onClose: () => void;
}

export default function FilePreview({ fileId, onClose }: FilePreviewProps) {
  const { data: file, isLoading } = useQuery({
    queryKey: ["/api/files", fileId],
    enabled: !!fileId,
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!file) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-4xl w-full h-3/4 flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {file.originalName}
              </CardTitle>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(1)} MB • {file.mimeType}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex overflow-hidden">
          {/* Preview Area */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="bg-gray-100 rounded-lg p-8 h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-4">File preview not available</p>
                <p className="text-sm text-gray-400">
                  Original file: {file.originalName}
                </p>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="w-80 border-l border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Processing Status */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Status</h5>
                <Badge 
                  variant={file.processingStatus === 'completed' ? 'default' : 'secondary'}
                  className={file.processingStatus === 'completed' ? 'bg-green-100 text-green-800' : ''}
                >
                  {file.processingStatus}
                </Badge>
              </div>

              {/* AI Summary */}
              {file.aiSummary && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">AI Summary</h5>
                  <p className="text-sm text-gray-600">{file.aiSummary}</p>
                </div>
              )}
              
              {/* Key Details */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Details</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">File type:</span>
                    <span className="text-gray-900">{file.mimeType.split('/')[1].toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="text-gray-900">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uploaded:</span>
                    <span className="text-gray-900">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Tags */}
              {file.tags && file.tags.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Tags</h5>
                  <div className="flex flex-wrap gap-1">
                    {file.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* OCR Text Preview */}
              {file.ocrText && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Extracted Text</h5>
                  <div className="bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                    <p className="text-xs text-gray-600">{file.ocrText.substring(0, 200)}...</p>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Actions</h5>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Move to Folder
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Tags
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
