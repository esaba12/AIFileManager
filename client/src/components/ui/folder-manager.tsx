import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderPlus, Edit, Trash2, Move } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Folder } from "@shared/schema";

interface FolderManagerProps {
  folders: Folder[];
  selectedFolderId: number | null;
  onFolderSelect: (folderId: number | null) => void;
}

export default function FolderManager({ folders, selectedFolderId, onFolderSelect }: FolderManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderParent, setNewFolderParent] = useState<string>("root");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createFolderMutation = useMutation({
    mutationFn: async (data: { name: string; parentId: number | null }) => {
      const response = await apiRequest("POST", "/api/folders", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      setShowCreateDialog(false);
      setNewFolderName("");
      setNewFolderParent("root");
      toast({
        title: "Success",
        description: "Folder created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create folder",
        variant: "destructive",
      });
    },
  });

  const updateFolderMutation = useMutation({
    mutationFn: async (data: { id: number; name: string; parentId: number | null }) => {
      const response = await apiRequest("PUT", `/api/folders/${data.id}`, {
        name: data.name,
        parentId: data.parentId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      setShowEditDialog(false);
      setEditingFolder(null);
      toast({
        title: "Success",
        description: "Folder updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update folder",
        variant: "destructive",
      });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/folders/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      setShowDeleteDialog(false);
      setEditingFolder(null);
      if (selectedFolderId === editingFolder?.id) {
        onFolderSelect(null);
      }
      toast({
        title: "Success",
        description: "Folder deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete folder",
        variant: "destructive",
      });
    },
  });

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    
    createFolderMutation.mutate({
      name: newFolderName.trim(),
      parentId: newFolderParent && newFolderParent !== "root" ? parseInt(newFolderParent) : null,
    });
  };

  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setNewFolderParent(folder.parentId?.toString() || "root");
    setShowEditDialog(true);
  };

  const handleUpdateFolder = () => {
    if (!editingFolder || !newFolderName.trim()) return;
    
    updateFolderMutation.mutate({
      id: editingFolder.id,
      name: newFolderName.trim(),
      parentId: newFolderParent && newFolderParent !== "root" ? parseInt(newFolderParent) : null,
    });
  };

  const handleDeleteFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setShowDeleteDialog(true);
  };

  const confirmDeleteFolder = () => {
    if (!editingFolder) return;
    deleteFolderMutation.mutate(editingFolder.id);
  };

  // Get folders that can be parents (exclude current folder and its descendants)
  const getAvailableParents = (excludeId?: number) => {
    return folders.filter(folder => {
      if (excludeId && folder.id === excludeId) return false;
      // Add logic to exclude descendants if needed
      return true;
    });
  };

  return (
    <div className="space-y-2">
      {/* Create Folder Button */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
              />
            </div>
            <div>
              <Label htmlFor="parent-folder">Parent Folder (Optional)</Label>
              <Select value={newFolderParent} onValueChange={setNewFolderParent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">No parent (root level)</SelectItem>
                  {getAvailableParents().map((folder) => (
                    <SelectItem key={folder.id} value={folder.id.toString()}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim() || createFolderMutation.isPending}
              >
                {createFolderMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-folder-name">Folder Name</Label>
              <Input
                id="edit-folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
              />
            </div>
            <div>
              <Label htmlFor="edit-parent-folder">Parent Folder</Label>
              <Select value={newFolderParent} onValueChange={setNewFolderParent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">No parent (root level)</SelectItem>
                  {getAvailableParents(editingFolder?.id).map((folder) => (
                    <SelectItem key={folder.id} value={folder.id.toString()}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateFolder}
                disabled={!newFolderName.trim() || updateFolderMutation.isPending}
              >
                {updateFolderMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete the folder "{editingFolder?.name}"? 
              This action cannot be undone. The folder must be empty to be deleted.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteFolder}
                disabled={deleteFolderMutation.isPending}
              >
                {deleteFolderMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Folder Actions for Selected Folder */}
      {selectedFolderId && (
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const folder = folders.find(f => f.id === selectedFolderId);
              if (folder) handleEditFolder(folder);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const folder = folders.find(f => f.id === selectedFolderId);
              if (folder) handleDeleteFolder(folder);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}