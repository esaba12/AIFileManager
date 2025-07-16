import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Upload, User, Mic } from "lucide-react";
import VoiceButton from "@/components/ui/voice-button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/portal/sidebar";
import FileGrid from "@/components/portal/file-grid";
import AIPanel from "@/components/portal/ai-panel";
import FileUpload from "@/components/ui/file-upload";
import FilePreview from "@/components/ui/file-preview";
import { useEffect } from "react";

export default function Portal() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: folders = [], isLoading: foldersLoading } = useQuery({
    queryKey: ["/api/folders"],
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return false;
      }
      return failureCount < 3;
    },
  });

  const { data: files = [], isLoading: filesLoading } = useQuery({
    queryKey: ["/api/files", selectedFolderId],
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return false;
      }
      return failureCount < 3;
    },
  });

  const handleFileSelect = (fileId: number) => {
    setSelectedFileId(fileId);
    setShowFilePreview(true);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading || foldersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">AI Filing Platform</h1>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <VoiceButton
                onTranscript={(text) => setSearchQuery(text)}
                size="sm"
                variant="outline"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5" />
              )}
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar
          folders={folders}
          selectedFolderId={selectedFolderId}
          onFolderSelect={setSelectedFolderId}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Content Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedFolderId 
                    ? folders.find(f => f.id === selectedFolderId)?.name 
                    : "All Files"
                  }
                </h2>
                <p className="text-sm text-gray-500">
                  {files.length} files • Last updated recently
                </p>
              </div>
            </div>
          </div>

          {/* File Grid */}
          <FileGrid
            files={files}
            isLoading={filesLoading}
            onFileSelect={handleFileSelect}
          />
        </div>

        {/* AI Panel */}
        <AIPanel onUpload={() => setShowUploadModal(true)} />
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <FileUpload
          folderId={selectedFolderId}
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={() => {
            setShowUploadModal(false);
            // Refresh files - this would typically be handled by query invalidation
          }}
        />
      )}

      {/* File Preview Modal */}
      {showFilePreview && selectedFileId && (
        <FilePreview
          fileId={selectedFileId}
          onClose={() => setShowFilePreview(false)}
        />
      )}
    </div>
  );
}
