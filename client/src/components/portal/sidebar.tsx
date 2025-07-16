import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Folder, FolderOpen, FileText } from "lucide-react";
import { Folder as FolderType } from "@shared/schema";
import FolderManager from "@/components/ui/folder-manager";

interface SidebarProps {
  folders: FolderType[];
  selectedFolderId: number | null;
  onFolderSelect: (folderId: number | null) => void;
}

export default function Sidebar({ folders, selectedFolderId, onFolderSelect }: SidebarProps) {
  // Group folders by parent for hierarchy
  const folderTree = folders.reduce((acc, folder) => {
    const parentId = folder.parentId || 'root';
    if (!acc[parentId]) {
      acc[parentId] = [];
    }
    acc[parentId].push(folder);
    return acc;
  }, {} as Record<string | number, FolderType[]>);

  const renderFolder = (folder: FolderType, level = 0) => {
    const isSelected = selectedFolderId === folder.id;
    const hasChildren = folderTree[folder.id] && folderTree[folder.id].length > 0;
    const isUnstructured = folder.name.toLowerCase().includes('unstructured');

    return (
      <div key={folder.id}>
        <Button
          variant="ghost"
          className={`w-full justify-start px-2 py-1 h-auto ${
            isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50'
          }`}
          style={{ paddingLeft: `${8 + level * 16}px` }}
          onClick={() => onFolderSelect(folder.id)}
        >
          {hasChildren ? (
            <FolderOpen className="w-4 h-4 mr-2 text-blue-500" />
          ) : (
            <Folder className="w-4 h-4 mr-2 text-blue-500" />
          )}
          <span className="text-sm font-medium text-gray-700 flex-1 text-left">
            {folder.name}
          </span>
          {isUnstructured && (
            <Badge variant="outline" className="ml-auto bg-orange-100 text-orange-800 text-xs">
              3
            </Badge>
          )}
        </Button>
        
        {/* Render children */}
        {hasChildren && folderTree[folder.id].map(child => renderFolder(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-3">File System</h2>
        <FolderManager 
          folders={folders}
          selectedFolderId={selectedFolderId}
          onFolderSelect={onFolderSelect}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-2">
          {/* All Files */}
          <Button
            variant="ghost"
            className={`w-full justify-start px-2 py-1 h-auto ${
              selectedFolderId === null ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50'
            }`}
            onClick={() => onFolderSelect(null)}
          >
            <FileText className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">All Files</span>
          </Button>

          {/* Render root folders */}
          {folderTree.root?.map(folder => renderFolder(folder))}
        </nav>
      </div>
    </div>
  );
}
