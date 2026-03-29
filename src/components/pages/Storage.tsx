// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import {
  Button,
  Input,
  Chip,
  Divider,
  Progress,
  Tooltip,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Select,
  SelectItem,
  Breadcrumbs,
  BreadcrumbItem,
  Badge,
  Avatar,
  Card,
  CardBody,
  Switch,
  Textarea,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import {
  Database,
  HardDrive,
  Upload,
  Download,
  Trash2,
  FolderPlus,
  File,
  Image,
  FileText,
  Video,
  Music,
  Archive,
  MoreVertical,
  Search,
  Filter,
  Grid,
  List,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Share2,
  Copy,
  Move,
  Star,
  StarOff,
  Clock,
  Users,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Info,
  Settings,
  Zap,
  Cloud,
  Server,
  Activity,
  PieChart,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Home,
  Star as StarFill,
  Trash,
  Edit,
  DownloadCloud,
  UploadCloud,
  Shield,
  Globe,
  Link,
  Calendar,
  User,
  Hash,
  FileCode,
  FileJson,
  FileArchive,
  FileSpreadsheet,
  Inbox,
} from 'lucide-react';

// Types
interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mime_type?: string;
  size?: number;
  created_at: string;
  updated_at: string;
  owner_id: string;
  owner_name?: string;
  is_starred?: boolean;
  is_shared?: boolean;
  shared_with?: string[];
  path: string;
  parent_id?: string;
  extension?: string;
}

interface StorageStats {
  total_space: number;
  used_space: number;
  file_count: number;
  folder_count: number;
  starred_count: number;
  shared_count: number;
}

// Helper functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

const getFileIcon = (fileName: string, isFolder: boolean) => {
  if (isFolder) return <Folder size={18} className="text-blue-500" />;
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return <Image size={18} className="text-purple-500" />;
    case 'pdf':
      return <FileText size={18} className="text-red-500" />;
    case 'doc':
    case 'docx':
      return <FileText size={18} className="text-blue-600" />;
    case 'mp4':
    case 'mov':
    case 'avi':
      return <Video size={18} className="text-green-500" />;
    case 'mp3':
    case 'wav':
      return <Music size={18} className="text-pink-500" />;
    case 'zip':
    case 'rar':
    case '7z':
      return <Archive size={18} className="text-amber-500" />;
    case 'json':
      return <FileJson size={18} className="text-yellow-500" />;
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
      return <FileCode size={18} className="text-teal-500" />;
    default:
      return <File size={18} className="text-gray-500" />;
  }
};

// Components
const Storage = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [pathStack, setPathStack] = useState<string[]>(['/']);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Modal states
  const [createFolderModal, setCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [selectedShareFile, setSelectedShareFile] = useState<FileItem | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState<FileItem | null>(null);
  const [renameModal, setRenameModal] = useState(false);
  const [renameItem, setRenameItem] = useState<FileItem | null>(null);
  const [newName, setNewName] = useState('');
  const [moveModal, setMoveModal] = useState(false);
  const [moveItem, setMoveItem] = useState<FileItem | null>(null);
  const [destinationPath, setDestinationPath] = useState('/');

  useEffect(() => {
    fetchStorageData();
  }, [currentPath]);

  const fetchStorageData = async () => {
    setLoading(true);
    try {
      // Fetch files and folders in current path
      const filesRes = await adminApi.getStorageFiles(currentPath);
      setFiles(filesRes.data || []);
      
      // Fetch storage stats
      const statsRes = await adminApi.getStorageStats();
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch storage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    setPathStack([...pathStack, path]);
    setSelectedFiles([]);
  };

  const handleBack = () => {
    if (pathStack.length > 1) {
      const newStack = [...pathStack];
      newStack.pop();
      setPathStack(newStack);
      setCurrentPath(newStack[newStack.length - 1]);
      setSelectedFiles([]);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      await adminApi.createFolder(currentPath, newFolderName);
      setCreateFolderModal(false);
      setNewFolderName('');
      fetchStorageData();
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;
    
    setUploading(true);
    try {
      for (const file of uploadFiles) {
        await adminApi.uploadFile(currentPath, file);
      }
      setUploadModal(false);
      setUploadFiles([]);
      fetchStorageData();
    } catch (error) {
      console.error('Failed to upload files:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    
    try {
      await adminApi.deleteStorageItem(deleteItem.id);
      setDeleteModal(false);
      setDeleteItem(null);
      fetchStorageData();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleRename = async () => {
    if (!renameItem || !newName.trim()) return;
    
    try {
      await adminApi.renameStorageItem(renameItem.id, newName);
      setRenameModal(false);
      setRenameItem(null);
      setNewName('');
      fetchStorageData();
    } catch (error) {
      console.error('Failed to rename item:', error);
    }
  };

  const handleShare = async () => {
    if (!selectedShareFile || !shareEmail.trim()) return;
    
    try {
      await adminApi.shareStorageItem(selectedShareFile.id, shareEmail);
      setShareModal(false);
      setSelectedShareFile(null);
      setShareEmail('');
      fetchStorageData();
    } catch (error) {
      console.error('Failed to share item:', error);
    }
  };

  const handleToggleStar = async (file: FileItem) => {
    try {
      await adminApi.toggleStarStorageItem(file.id, !file.is_starred);
      fetchStorageData();
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      const response = await adminApi.downloadFile(file.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  const getFilteredFiles = () => {
    let filtered = [...files];
    
    if (searchQuery) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'date') {
        return sortOrder === 'asc'
          ? new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
          : new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else if (sortBy === 'size') {
        const aSize = a.type === 'folder' ? 0 : (a.size || 0);
        const bSize = b.type === 'folder' ? 0 : (b.size || 0);
        return sortOrder === 'asc' ? aSize - bSize : bSize - aSize;
      }
      return 0;
    });
    
    return filtered;
  };

  const usagePercentage = stats ? (stats.used_space / stats.total_space) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Database size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Storage Management</span>
                <Chip size="sm" variant="flat" color="success" className="text-[10px] font-semibold">
                  v1.0
                </Chip>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5">
                  <Activity size={12} className="text-green-600" />
                  <span className="text-xs text-gray-600">Active Storage</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HardDrive size={12} className="text-gray-500" />
                  <span className="text-xs text-gray-600">
                    {stats ? formatFileSize(stats.used_space) : '0 B'} / {stats ? formatFileSize(stats.total_space) : '0 B'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">File Storage</h1>
          <p className="text-gray-600">Manage your files, folders, and storage space.</p>
        </div>

        {/* Storage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Storage Used</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats ? formatFileSize(stats.used_space) : '0 B'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    of {stats ? formatFileSize(stats.total_space) : '0 B'}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <HardDrive size={24} className="text-blue-600" />
                </div>
              </div>
              <Progress 
                value={usagePercentage} 
                color="primary" 
                size="sm" 
                className="mt-3"
              />
            </CardBody>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Total Files</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.file_count || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Across all folders</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <File size={24} className="text-green-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Starred Items</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.starred_count || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Important files</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <StarFill size={24} className="text-yellow-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Shared Items</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.shared_count || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">With other users</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Users size={24} className="text-purple-600" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="p-4 flex flex-wrap items-center justify-between gap-4">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2">
              <Tooltip content="Back">
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onPress={handleBack}
                  isDisabled={pathStack.length <= 1}
                  className="bg-gray-100"
                >
                  <ChevronRight size={16} className="rotate-180" />
                </Button>
              </Tooltip>
              
              <Breadcrumbs size="sm" separator={<ChevronRight size={12} />}>
                <BreadcrumbItem onPress={() => handleNavigate('/')}>
                  <Home size={14} />
                </BreadcrumbItem>
                {currentPath.split('/').filter(p => p).map((part, index, arr) => {
                  const path = '/' + arr.slice(0, index + 1).join('/');
                  return (
                    <BreadcrumbItem key={path} onPress={() => handleNavigate(path)}>
                      {part}
                    </BreadcrumbItem>
                  );
                })}
              </Breadcrumbs>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center gap-3">
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={<Search size={14} className="text-gray-400" />}
                classNames={{
                  inputWrapper: "h-10 w-64 bg-gray-50 border border-gray-200 rounded-lg",
                  input: "text-sm",
                }}
              />
              
              <div className="flex items-center gap-1">
                <Tooltip content="Grid View">
                  <Button
                    isIconOnly
                    size="sm"
                    variant={viewMode === 'grid' ? 'solid' : 'light'}
                    color={viewMode === 'grid' ? 'primary' : 'default'}
                    onPress={() => setViewMode('grid')}
                  >
                    <Grid size={16} />
                  </Button>
                </Tooltip>
                <Tooltip content="List View">
                  <Button
                    isIconOnly
                    size="sm"
                    variant={viewMode === 'list' ? 'solid' : 'light'}
                    color={viewMode === 'list' ? 'primary' : 'default'}
                    onPress={() => setViewMode('list')}
                  >
                    <List size={16} />
                  </Button>
                </Tooltip>
              </div>

              <Divider orientation="vertical" className="h-6" />

              <Tooltip content="Refresh">
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onPress={fetchStorageData}
                  className="bg-gray-100"
                >
                  <RefreshCw size={14} />
                </Button>
              </Tooltip>

              <Tooltip content="New Folder">
                <Button
                  size="sm"
                  variant="flat"
                  startContent={<FolderPlus size={14} />}
                  onPress={() => setCreateFolderModal(true)}
                  className="bg-gray-100"
                >
                  New Folder
                </Button>
              </Tooltip>

              <Tooltip content="Upload">
                <Button
                  size="sm"
                  color="primary"
                  startContent={<UploadCloud size={14} />}
                  onPress={() => setUploadModal(true)}
                  className="bg-blue-600 text-white"
                >
                  Upload
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="px-4 pb-4 flex items-center gap-4 border-t border-gray-100 pt-4">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Sort by:</span>
            <div className="flex items-center gap-2">
              {(['name', 'date', 'size'] as const).map((option) => (
                <Button
                  key={option}
                  size="sm"
                  variant={sortBy === option ? 'solid' : 'light'}
                  color={sortBy === option ? 'primary' : 'default'}
                  onPress={() => {
                    if (sortBy === option) {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy(option);
                      setSortOrder('desc');
                    }
                  }}
                  className="capitalize"
                >
                  {option}
                  {sortBy === option && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* File Grid/List View */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" color="primary" />
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {getFilteredFiles().map((file) => (
                  <Card 
                    key={file.id}
                    className={`bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                      selectedFiles.includes(file.id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onPress={() => {
                      if (file.type === 'folder') {
                        handleNavigate(file.path);
                      }
                    }}
                  >
                    <CardBody className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.name, file.type === 'folder')}
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                            {file.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tooltip content={file.is_starred ? 'Remove from starred' : 'Add to starred'}>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={(e) => {
                                e.stopPropagation();
                                handleToggleStar(file);
                              }}
                            >
                              {file.is_starred ? (
                                <StarFill size={14} className="text-yellow-500" />
                              ) : (
                                <Star size={14} className="text-gray-400" />
                              )}
                            </Button>
                          </Tooltip>
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light">
                                <MoreVertical size={14} />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                              <DropdownItem onPress={() => handleDownload(file)}>
                                <Download size={12} className="inline mr-2" /> Download
                              </DropdownItem>
                              <DropdownItem onPress={() => {
                                setRenameItem(file);
                                setNewName(file.name);
                                setRenameModal(true);
                              }}>
                                <Edit size={12} className="inline mr-2" /> Rename
                              </DropdownItem>
                              <DropdownItem onPress={() => {
                                setMoveItem(file);
                                setMoveModal(true);
                              }}>
                                <Move size={12} className="inline mr-2" /> Move
                              </DropdownItem>
                              <DropdownItem onPress={() => {
                                setSelectedShareFile(file);
                                setShareModal(true);
                              }}>
                                <Share2 size={12} className="inline mr-2" /> Share
                              </DropdownItem>
                              <DropdownItem className="text-red-600" onPress={() => {
                                setDeleteItem(file);
                                setDeleteModal(true);
                              }}>
                                <Trash2 size={12} className="inline mr-2" /> Delete
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </div>
                      
                      {file.type === 'file' && file.size && (
                        <p className="text-xs text-gray-500 mb-2">{formatFileSize(file.size)}</p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{formatDate(file.updated_at)}</span>
                        {file.is_shared && <Users size={12} />}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <Table 
                  aria-label="Files table"
                  classNames={{
                    wrapper: "p-0",
                    th: "bg-gray-50 text-gray-600 text-xs font-semibold",
                    td: "text-sm",
                  }}
                >
                  <TableHeader>
                    <TableColumn>Name</TableColumn>
                    <TableColumn>Type</TableColumn>
                    <TableColumn>Size</TableColumn>
                    <TableColumn>Modified</TableColumn>
                    <TableColumn>Actions</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {getFilteredFiles().map((file) => (
                      <TableRow key={file.id} className="cursor-pointer hover:bg-gray-50">
                        <TableCell onPress={() => file.type === 'folder' && handleNavigate(file.path)}>
                          <div className="flex items-center gap-2">
                            {getFileIcon(file.name, file.type === 'folder')}
                            <span className="font-medium text-gray-900">{file.name}</span>
                            {file.is_starred && <StarFill size={12} className="text-yellow-500" />}
                            {file.is_shared && <Users size={12} className="text-purple-500" />}
                          </div>
                        </TableCell>
                        <TableCell onPress={() => file.type === 'folder' && handleNavigate(file.path)}>
                          <Chip size="sm" variant="flat" className="capitalize text-xs">
                            {file.type === 'folder' ? 'Folder' : (file.extension?.toUpperCase() || 'File')}
                          </Chip>
                        </TableCell>
                        <TableCell onPress={() => file.type === 'folder' && handleNavigate(file.path)}>
                          {file.type === 'file' && file.size ? formatFileSize(file.size) : '—'}
                        </TableCell>
                        <TableCell onPress={() => file.type === 'folder' && handleNavigate(file.path)}>
                          {formatDate(file.updated_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {file.type === 'file' && (
                              <Tooltip content="Download">
                                <Button isIconOnly size="sm" variant="light" onPress={() => handleDownload(file)}>
                                  <Download size={14} />
                                </Button>
                              </Tooltip>
                            )}
                            <Tooltip content={file.is_starred ? 'Remove from starred' : 'Add to starred'}>
                              <Button isIconOnly size="sm" variant="light" onPress={() => handleToggleStar(file)}>
                                {file.is_starred ? <StarFill size={14} className="text-yellow-500" /> : <Star size={14} />}
                              </Button>
                            </Tooltip>
                            <Tooltip content="More options">
                              <Dropdown>
                                <DropdownTrigger>
                                  <Button isIconOnly size="sm" variant="light">
                                    <MoreVertical size={14} />
                                  </Button>
                                </DropdownTrigger>
                                <DropdownMenu>
                                  <DropdownItem onPress={() => {
                                    setRenameItem(file);
                                    setNewName(file.name);
                                    setRenameModal(true);
                                  }}>
                                    Rename
                                  </DropdownItem>
                                  <DropdownItem onPress={() => {
                                    setMoveItem(file);
                                    setMoveModal(true);
                                  }}>
                                    Move
                                  </DropdownItem>
                                  <DropdownItem onPress={() => {
                                    setSelectedShareFile(file);
                                    setShareModal(true);
                                  }}>
                                    Share
                                  </DropdownItem>
                                  <DropdownItem className="text-red-600" onPress={() => {
                                    setDeleteItem(file);
                                    setDeleteModal(true);
                                  }}>
                                    Delete
                                  </DropdownItem>
                                </DropdownMenu>
                              </Dropdown>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {getFilteredFiles().length === 0 && (
              <div className="text-center py-20">
                <Folder size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No files or folders found</p>
                <Button
                  variant="flat"
                  startContent={<Upload size={14} />}
                  onPress={() => setUploadModal(true)}
                  className="mt-4"
                >
                  Upload Files
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Folder Modal */}
      <Modal isOpen={createFolderModal} onClose={() => setCreateFolderModal(false)}>
        <ModalContent>
          <ModalHeader>Create New Folder</ModalHeader>
          <ModalBody>
            <Input
              label="Folder Name"
              placeholder="Enter folder name"
              value={newFolderName}
              onValueChange={setNewFolderName}
              autoFocus
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setCreateFolderModal(false)}>Cancel</Button>
            <Button color="primary" onPress={handleCreateFolder}>Create</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Upload Modal */}
      <Modal isOpen={uploadModal} onClose={() => setUploadModal(false)} size="lg">
        <ModalContent>
          <ModalHeader>Upload Files</ModalHeader>
          <ModalBody>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload size={32} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Drag and drop files here or click to select</p>
              <input
                type="file"
                multiple
                onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button as="span" variant="flat" className="cursor-pointer">
                  Select Files
                </Button>
              </label>
            </div>
            {uploadFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold mb-2">{uploadFiles.length} file(s) selected</p>
                {uploadFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between text-sm py-1">
                    <span>{file.name}</span>
                    <span className="text-gray-500">{formatFileSize(file.size)}</span>
                  </div>
                ))}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setUploadModal(false)}>Cancel</Button>
            <Button color="primary" onPress={handleUpload} isLoading={uploading}>
              Upload
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Share Modal */}
      <Modal isOpen={shareModal} onClose={() => setShareModal(false)}>
        <ModalContent>
          <ModalHeader>Share {selectedShareFile?.name}</ModalHeader>
          <ModalBody>
            <Input
              label="Email Address"
              placeholder="user@example.com"
              value={shareEmail}
              onValueChange={setShareEmail}
              startContent={<Users size={14} />}
            />
            <p className="text-xs text-gray-500 mt-2">
              The user will receive read access to this file/folder
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShareModal(false)}>Cancel</Button>
            <Button color="primary" onPress={handleShare}>Share</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)}>
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle size={24} />
              <p className="font-semibold">This action cannot be undone</p>
            </div>
            <p>Are you sure you want to delete "{deleteItem?.name}"?</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setDeleteModal(false)}>Cancel</Button>
            <Button color="danger" onPress={handleDelete}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Rename Modal */}
      <Modal isOpen={renameModal} onClose={() => setRenameModal(false)}>
        <ModalContent>
          <ModalHeader>Rename {renameItem?.type === 'folder' ? 'Folder' : 'File'}</ModalHeader>
          <ModalBody>
            <Input
              label="New Name"
              value={newName}
              onValueChange={setNewName}
              autoFocus
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setRenameModal(false)}>Cancel</Button>
            <Button color="primary" onPress={handleRename}>Rename</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Storage;
