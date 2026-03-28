// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell, 
  Input, 
  Button, 
  Pagination,
  Chip,
  User as HeroUser,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
} from '@heroui/react';
import { 
  Search, 
  MoreVertical, 
  Trash2, 
  Eye, 
  UserPlus,
  ShieldCheck,
  Ban,
  CheckCircle,
  User as UserIcon,
  Filter,
  Download,
  Zap,
  Database,
  ShieldAlert,
  Fingerprint
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { EliteCard } from '@/components/ui/elite-card';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const router = useRouter();

  // Modal Controls
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isAccessOpen, onOpen: onAccessOpen, onOpenChange: onAccessOpenChange } = useDisclosure();
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [newAccess, setNewAccess] = useState(new Set(["Standard"]));
  const [actionLoading, setActionLoading] = useState(false);

  // New User State
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    role: "User",
    access_right: "Standard"
  });

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUsers({ page, limit, search });
      setUsers(response.data.data || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleCreateUser = async () => {
    setActionLoading(true);
    try {
      await adminApi.createUser(newUser);
      await fetchUsers();
      onAddOpenChange(false);
      setNewUser({
        username: "",
        email: "",
        password: "",
        full_name: "",
        role: "User",
        access_right: "Standard"
      });
    } catch (error) {
      console.error("Creation error:", error);
      alert("Nexus Core rejected identity provision: " + (error.response?.data?.detail || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const safeText = (val) => {
    if (val === null || val === undefined) return "";
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'boolean') return val ? "TRUE" : "FALSE";
    if (typeof val === 'object') {
       if (val.role && typeof val.role === 'string') return val.role;
       if (val.name && typeof val.name === 'string') return val.name;
       try { return JSON.stringify(val); } catch { return "[Object]"; }
    }
    return String(val);
  };

  const handleUpdateAccess = async () => {
    if (!selectedUser) return;
    const accessValue = Array.from(newAccess)[0] || "Standard";
    setActionLoading(true);
    try {
      await adminApi.updateUser(selectedUser.id, { access_right: accessValue });
      await fetchUsers();
      onAccessOpenChange(false);
    } catch (error) {
      console.error("Access update error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const currentStatus = user.is_active !== false;
      await adminApi.updateUser(user.id, { is_active: !currentStatus });
      await fetchUsers();
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Deep System Wipe: Confirm permanent deletion?")) return;
    try {
      await adminApi.deleteUser(userId);
      await fetchUsers();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const columns = [
    { name: "IDENTIFIED USER", uid: "user" },
    { name: "AUTHORITY", uid: "role" },
    { name: "CLEARANCE", uid: "access" },
    { name: "LIFECYCLE", uid: "status" },
    { name: "OPERATIONS", uid: "actions" },
  ];

  const renderCell = (user, columnKey) => {
    const displayRole = safeText(user.role);
    const displayAccess = safeText(user.access_right || "Standard");
    
    switch (columnKey) {
      case "user":
        return (
          <HeroUser
            avatarProps={{ 
              radius: "lg", 
              src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
              className: "border-2 border-primary/20 shadow-sm w-12 h-12 shrink-0"
            }}
            description={safeText(user.email)}
            name={safeText(user.full_name || user.username)}
            classNames={{
              base: "justify-start min-w-0 max-w-full",
              name: "font-bold tracking-tight text-sm sm:text-base text-default-900 leading-snug mb-1 whitespace-normal break-words [overflow-wrap:anywhere]",
              description: "font-medium text-[10px] text-default-400 whitespace-normal break-all"
            }}
          />
        );
      case "role":
        const isAdmin = displayRole === "Admin";
        return (
          <Chip
            className="uppercase font-bold text-[10px] px-3 h-7 bg-default-100 hover:scale-105 transition-transform cursor-default"
            color={isAdmin ? "secondary" : "primary"}
            size="sm"
            variant="flat"
            startContent={isAdmin ? <ShieldCheck size={14} className="ml-1" /> : <UserIcon size={14} className="ml-1" />}
          >
            {isAdmin ? "Administrator" : "Standard User"}
          </Chip>
        );
      case "access":
        const isSupreme = displayAccess === "Supreme";
        const isElevated = displayAccess === "Elevated";
        return (
          <Chip
            className={`uppercase font-bold text-[10px] px-3 h-7 cursor-default transition-all group-hover:shadow-lg
              ${isSupreme ? 'bg-secondary/20 text-secondary' : isElevated ? 'bg-primary/20 text-primary' : 'bg-default-100 text-default-500'}`}
            size="sm"
            variant="flat"
            startContent={<Zap size={12} className="ml-1" />}
          >
            {displayAccess} Level
          </Chip>
        );
      case "status":
        const isActive = user.is_active !== false;
        return (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isActive ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></div>
            <span className={`uppercase font-bold text-[10px] tracking-widest ${isActive ? 'text-success' : 'text-danger'}`}>
              {isActive ? "Account Active" : "Account Suspended"}
            </span>
          </div>
        );
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-3 pr-4">
            <Tooltip content="View User Profile" closeDelay={0}>
              <Button 
                isIconOnly 
                size="md" 
                variant="flat" 
                className="bg-primary/10 text-primary border-1 border-primary/20 rounded-2xl hover:bg-primary hover:text-white transition-all duration-300 shadow-lg shadow-primary/10"
                onClick={() => router.push(`/users/${user.id}`)}
              >
                <Eye size={18} />
              </Button>
            </Tooltip>
            <Dropdown classNames={{ content: "bg-background/80 backdrop-blur-xl border-1 border-divider shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] rounded-[2rem] p-4 min-w-[220px]" }}>
              <DropdownTrigger>
                <Button isIconOnly size="md" variant="light" className="text-default-400 hover:text-primary transition-colors rounded-2xl">
                  <MoreVertical size={24} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Administrative Actions" variant="flat" className="gap-2">
                <DropdownItem 
                  key="access"
                  startContent={<Fingerprint size={18} className="text-primary" />} 
                  className="rounded-2xl h-14 font-bold uppercase text-[10px] tracking-widest"
                  onPress={() => {
                    setSelectedUser(user);
                    setNewAccess(new Set([displayAccess]));
                    onAccessOpen();
                  }}
                >
                  Modify Access Level
                </DropdownItem>
                <DropdownItem 
                  key="status"
                  startContent={user.is_active !== false ? <Ban size={18} /> : <CheckCircle size={18} />} 
                  color={user.is_active !== false ? "warning" : "success"}
                  className="rounded-2xl h-14 font-bold uppercase text-[10px] tracking-widest"
                  onPress={() => handleToggleStatus(user)}
                >
                  {user.is_active !== false ? "Deactivate Account" : "Activate Account"}
                </DropdownItem>
                <DropdownItem 
                  key="delete"
                  startContent={<Trash2 size={18} />} 
                  color="danger" 
                  className="rounded-2xl h-14 font-bold uppercase text-[10px] tracking-widest bg-danger/10 text-danger hover:bg-danger hover:text-white"
                  onPress={() => handleDelete(user.id)}
                >
                  Delete User Permanently
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return safeText(user[columnKey]);
    }
  };

  return (
    <div className="admin-page space-y-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-2 bg-primary/20 blur-lg rounded-lg animate-pulse"></div>
              <div className="relative p-3 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/40">
                <UserIcon size={24} strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] leading-none mb-1">User Management</span>
              <div className="flex items-center gap-2">
                <CheckCircle size={12} className="text-success" />
                <span className="text-[9px] font-black text-success uppercase tracking-widest">Database Synced</span>
              </div>
            </div>
          </div>
          <h1 className="text-6xl font-black tracking-tighter uppercase text-default-900 italic">
            Account<span className="text-primary not-italic">_Registry</span>
          </h1>
          <p className="text-default-400 font-bold text-xs max-w-lg leading-relaxed uppercase tracking-wider">
            Comprehensive control over platform participants and their authority levels. <br/>
            Managing <span className="text-primary">{total}</span> authenticated users on the network.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-default-100/50 backdrop-blur-xl p-3 rounded-2xl border border-divider/20">
          <Button 
            variant="flat"
            className="font-black uppercase tracking-widest text-[10px] h-14 px-8 bg-background border border-divider shadow-xl hover:translate-y-[-2px] transition-all"
            startContent={<Download size={18} className="text-primary" />}
          >
            Export Directory
          </Button>
          <Button 
            color="primary" 
            variant="shadow"
            className="font-black uppercase tracking-widest px-10 h-14 shadow-2xl shadow-primary/30 rounded-2xl hover:scale-105 transition-all"
            startContent={<UserPlus size={20} strokeWidth={3} />} 
            onPress={onAddOpen}
          >
            Create New Account
          </Button>
        </div>
      </div>

      <EliteCard className="p-0 border-divider/30 overflow-visible">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 p-10 border-b border-divider/10 bg-default-50/20">
          <div className="relative w-full sm:max-w-[500px]">
            <Input
              isClearable
              placeholder="Search by name, email, or role..."
              startContent={<Search size={22} className="text-primary ml-2" />}
              value={search}
              onClear={() => setSearch('')}
              onValueChange={setSearch}
              variant="flat"
              radius="2xl"
              classNames={{
                inputWrapper: "bg-background border-2 border-divider/40 h-16 group-data-[focus=true]:border-primary group-data-[focus=true]:shadow-xl group-data-[focus=true]:shadow-primary/10 transition-all duration-500 pr-4",
                input: "text-md font-bold tracking-tight"
              }}
            />
          </div>
          <div className="flex items-center gap-4">
            <Button variant="flat" radius="xl" className="h-12 px-6 font-black uppercase text-[10px] tracking-widest bg-default-100 hover:bg-default-200">
              <Filter size={16} className="mr-2" /> Filter Options
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto p-4 lg:p-10">
          <Table 
            aria-label="User management registry"
            shadow="none"
            removeWrapper
            bottomContent={
              total > limit ? (
                <div className="flex w-full justify-center py-10">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={Math.ceil(total / limit)}
                    onChange={setPage}
                    radius="full"
                    className="font-black"
                  />
                </div>
              ) : null
            }
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn 
                  key={column.uid}
                  align={column.uid === "actions" ? "end" : "start"}
                  className="bg-transparent uppercase text-[11px] font-black tracking-[0.3em] text-default-400 pb-8 h-auto border-b border-divider/10"
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody 
              items={users} 
              loadingContent={<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>}
              loadingState={loading ? "loading" : "idle"}
              emptyContent={
                <div className="py-40 text-center flex flex-col items-center gap-6">
                  <div className="p-10 bg-default-100 rounded-[3rem] border-2 border-dashed border-divider/20">
                    <UserIcon size={64} className="text-default-200" strokeWidth={1} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-black uppercase italic tracking-tighter text-default-600">No users found</p>
                    <p className="text-[10px] font-bold text-default-400 uppercase tracking-widest">Try adjusting your search or filters</p>
                  </div>
                </div>
              }
            >
              {(item) => (
                <TableRow key={item.id} className="border-b border-divider/5 last:border-0 group hover:bg-primary/[0.03] transition-all duration-500 rounded-3xl">
                  {(columnKey) => (
                    <TableCell className={`py-8 min-w-0 ${columnKey === "user" ? "max-w-[min(360px,55vw)]" : ""}`}>
                      {renderCell(item, columnKey)}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </EliteCard>

      {/* User Creation Modal */}
      <Modal 
        isOpen={isAddOpen} 
        onOpenChange={onAddOpenChange}
        backdrop="blur"
        radius="3xl"
        size="2xl"
        classNames={{
          base: "border-1 border-divider/50 bg-background/80 backdrop-blur-3xl shadow-[0_32px_128px_-12px_rgba(0,0,0,0.8)]",
          header: "border-b border-divider/10 p-10",
          footer: "border-t border-divider/10 p-8"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 text-primary rounded-xl">
                    <UserPlus size={24} strokeWidth={3} />
                  </div>
                  <h2 className="font-black uppercase tracking-tighter text-3xl italic leading-none">
                    New User Account
                  </h2>
                </div>
              </ModalHeader>
              <ModalBody className="py-10 px-12">
                <div className="grid grid-cols-2 gap-8">
                  <Input 
                    label="Full Name" 
                    placeholder="Enter legal name" 
                    variant="flat" 
                    radius="2xl"
                    value={newUser.full_name}
                    onValueChange={(val) => setNewUser({...newUser, full_name: val})}
                    classNames={{ 
                      inputWrapper: "bg-default-100/50 h-16 border-1 border-divider/20",
                      label: "font-black uppercase text-[10px] tracking-widest text-default-400" 
                    }}
                  />
                  <Input 
                    label="Username" 
                    placeholder="Select a unique ID" 
                    variant="flat" 
                    radius="2xl"
                    value={newUser.username}
                    onValueChange={(val) => setNewUser({...newUser, username: val})}
                    classNames={{ 
                      inputWrapper: "bg-default-100/50 h-16 border-1 border-divider/20",
                      label: "font-black uppercase text-[10px] tracking-widest text-default-400" 
                    }}
                  />
                  <Input 
                    label="Primary Email" 
                    placeholder="example@company.com" 
                    variant="flat" 
                    radius="2xl"
                    value={newUser.email}
                    onValueChange={(val) => setNewUser({...newUser, email: val})}
                    classNames={{ 
                      inputWrapper: "bg-default-100/50 h-16 border-1 border-divider/20",
                      label: "font-black uppercase text-[10px] tracking-widest text-default-400" 
                    }}
                  />
                  <Input 
                    label="Password" 
                    type="password" 
                    placeholder="Secure access token" 
                    variant="flat" 
                    radius="2xl"
                    value={newUser.password}
                    onValueChange={(val) => setNewUser({...newUser, password: val})}
                    classNames={{ 
                      inputWrapper: "bg-default-100/50 h-16 border-1 border-divider/20",
                      label: "font-black uppercase text-[10px] tracking-widest text-default-400" 
                    }}
                  />
                  <Select
                    label="System Authority"
                    variant="flat"
                    radius="2xl"
                    selectedKeys={[newUser.role]}
                    onSelectionChange={(keys) => setNewUser({...newUser, role: Array.from(keys)[0]})}
                    classNames={{ 
                      trigger: "bg-default-100/50 h-16 border-1 border-divider/20",
                      label: "font-black uppercase text-[10px] tracking-widest text-default-400" 
                    }}
                  >
                    <SelectItem key="User" startContent={<UserIcon size={18}/>}>Standard User</SelectItem>
                    <SelectItem key="Admin" startContent={<ShieldCheck size={18}/>}>Platform Admin</SelectItem>
                  </Select>
                  <Select
                    label="Access Control Level"
                    variant="flat"
                    radius="2xl"
                    selectedKeys={[newUser.access_right]}
                    onSelectionChange={(keys) => setNewUser({...newUser, access_right: Array.from(keys)[0]})}
                    classNames={{ 
                      trigger: "bg-default-100/50 h-16 border-1 border-divider/20",
                      label: "font-black uppercase text-[10px] tracking-widest text-default-400" 
                    }}
                  >
                    <SelectItem key="Standard" startContent={<Zap size={18}/>}>Standard Access</SelectItem>
                    <SelectItem key="Elevated" startContent={<Fingerprint size={18} className="text-primary"/>}>Elevated Rights</SelectItem>
                    <SelectItem key="Supreme" startContent={<ShieldAlert size={18} className="text-secondary"/>}>Full Control (Supreme)</SelectItem>
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" className="font-bold uppercase tracking-widest text-[10px]" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  className="font-black uppercase tracking-widest px-12 h-14 shadow-2xl shadow-primary/30 transition-all hover:scale-105" 
                  radius="2xl" 
                  onPress={handleCreateUser}
                  isLoading={actionLoading}
                >
                  Create Account
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Access Right Modification Modal */}
      <Modal 
        isOpen={isAccessOpen} 
        onOpenChange={onAccessOpenChange}
        backdrop="blur"
        radius="3xl"
        classNames={{
          base: "border-1 border-divider/50 bg-background/80 backdrop-blur-3xl shadow-2xl",
          header: "border-b border-divider/30 p-8",
          footer: "border-t border-divider/30 p-6"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 uppercase font-black italic tracking-tighter text-2xl">
                Update Access Rights
              </ModalHeader>
              <ModalBody className="py-10 px-8">
                <div className="space-y-8">
                  <div className="p-8 bg-primary/5 rounded-[2.5rem] border-1 border-primary/20 flex items-center gap-6 shadow-inner">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                      <HeroUser 
                        avatarProps={{ 
                          radius: "lg", 
                          src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser?.username}`,
                          size: "lg"
                        }}
                        classNames={{ name: "hidden", description: "hidden" }}
                      />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-1">User Identity</p>
                      <p className="font-black text-2xl tracking-tighter italic uppercase text-default-900">{safeText(selectedUser?.full_name || selectedUser?.username)}</p>
                    </div>
                  </div>
                  
                  <Select
                    label="Assign New Access Level"
                    variant="flat"
                    radius="2xl"
                    selectedKeys={newAccess}
                    onValueChange={(val) => setNewAccess(new Set([val]))}
                    className="w-full"
                    classNames={{
                      trigger: "bg-default-100/50 h-20 border-1 border-divider/20",
                      label: "font-black uppercase tracking-widest text-[10px] text-default-400"
                    }}
                  >
                    <SelectItem key="Standard" startContent={<Zap size={20} className="text-default-400"/>}>Standard Access</SelectItem>
                    <SelectItem key="Elevated" startContent={<Fingerprint size={20} className="text-primary"/>}>Elevated Rights</SelectItem>
                    <SelectItem key="Supreme" startContent={<ShieldAlert size={20} className="text-secondary"/>}>Full Control (Supreme)</SelectItem>
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" className="font-bold uppercase tracking-widest text-xs" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  className="font-black uppercase tracking-widest px-10 h-14 shadow-lg shadow-primary/30"
                  onPress={handleUpdateAccess}
                  isLoading={actionLoading}
                  radius="2xl"
                >
                  Apply Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default UserManagement;
