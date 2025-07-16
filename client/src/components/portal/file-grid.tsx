import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Image, File as FileIcon, MoreVertical } from "lucide-react";
import { File } from "@shared/schema";

interface FileGridProps {
  files: File[];
  isLoading: boolean;
  onFileSelect: (fileId: number) => void;
}

export default function FileGrid({ files, isLoading, onFileSelect }: FileGridProps) {
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="w-6 h-6 text-blue-600" />;
    } else if (mimeType === 'application/pdf') {
      return <FileText className="w-6 h-6 text-red-600" />;
    } else {
      return <FileIcon className="w-6 h-6 text-gray-600" />;
    }
  };

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return 'bg-blue-100';
    } else if (mimeType === 'application/pdf') {
      return 'bg-red-100';
    } else {
      return 'bg-gray-100';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <FileIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
          <p className="text-gray-500">Upload some files to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <Card
            key={file.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onFileSelect(file.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${getFileTypeColor(file.mimeType)} rounded-lg flex items-center justify-center`}>
                    {getFileIcon(file.mimeType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {file.originalName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {file.folder?.name || 'Unstructured'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-auto p-1">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {/* Processing Status */}
                <div className="flex items-center justify-between">
                  <Badge
                    variant={file.processingStatus === 'completed' ? 'default' : 'secondary'}
                    className={`text-xs ${
                      file.processingStatus === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : file.processingStatus === 'processing'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {file.processingStatus}
                  </Badge>
                </div>

                {/* Tags */}
                {file.tags && file.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {file.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {file.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{file.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                {/* Summary */}
                {file.aiSummary && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {file.aiSummary}
                  </p>
                )}
                
                {/* File info */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatFileSize(file.size)}</span>
                  <span>{formatDate(file.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
