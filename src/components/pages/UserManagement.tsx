"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
  Avatar,
  Checkbox,
  cn,
} from '@heroui/react';
import { toast } from "sonner";
import type { Selection, SortDescriptor } from '@heroui/react';
import { Icon } from "@iconify/react";
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
  ShieldAlert,
  Fingerprint,
  UserCheck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { EliteCard } from '@/components/ui/elite-card';

/* ─────────────────────── helpers ─────────────────────── */
const safeText = (val: unknown): string =>
  val === null || val === undefined ? '' : String(val);

const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

/* ─────────────────────── types ─────────────────────── */
interface UserRecord {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  role: string;
  access_right?: string;
  is_active?: boolean;
}

interface NewUserForm {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role: string;
  access_right: string;
}

const DEFAULT_NEW_USER: NewUserForm = {
  username: '',
  email: '',
  password: '',
  full_name: '',
  role: 'User',
  access_right: 'Standard',
};

/* ─────────────────────── sub-components ─────────────────────── */

/** Inline user cell: avatar + name + email */
function UserCell({ user }: { user: UserRecord }) {
  return (
    <div className="flex items-center gap-4">
      <Avatar
        src={avatarUrl(user.username)}
        radius="lg"
        size="md"
        className="shrink-0 border-2 border-primary/20 shadow-lg"
      />
      <div className="min-w-0">
        <p className="font-black text-sm tracking-tight text-foreground truncate">
          {safeText(user.full_name || user.username)}
        </p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground truncate">
          {safeText(user.email)}
        </p>
      </div>
    </div>
  );
}

/** Subject card used inside the Access modal */
function SubjectCard({ user }: { user: UserRecord }) {
  return (
    <div className="flex items-center gap-5 p-6 rounded-2xl bg-primary/5 border border-primary/20">
      <Avatar
        src={avatarUrl(user.username)}
        radius="lg"
        size="lg"
        className="shrink-0 border-2 border-primary/30 shadow-xl"
      />
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary mb-1">
          Subject_Identity
        </p>
        <p className="font-black text-2xl tracking-tighter italic text-foreground">
          {safeText(user.full_name || user.username)}
        </p>
        <p className="text-xs font-bold text-muted-foreground mt-0.5">
          {safeText(user.email)}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────── chips ─────────────────────── */
function RoleChip({ role }: { role: string }) {
  const isAdmin = role === 'Admin';
  return (
    <Chip
      size="sm"
      variant="flat"
      color={isAdmin ? 'secondary' : 'default'}
      startContent={
        isAdmin ? <ShieldCheck size={12} /> : <UserIcon size={12} />
      }
      className="uppercase font-black text-[10px] tracking-widest px-3"
    >
      {isAdmin ? 'Administrator' : 'Standard_IA'}
    </Chip>
  );
}

function AccessChip({ access }: { access: string }) {
  const styles =
    access === 'Supreme'
      ? 'bg-secondary/10 text-secondary border border-secondary/20'
      : access === 'Elevated'
      ? 'bg-primary/10 text-primary border border-primary/20'
      : 'bg-muted/50 text-muted-foreground';
  return (
    <Chip
      size="sm"
      variant="flat"
      startContent={<Zap size={12} />}
      className={`uppercase font-black text-[10px] tracking-widest px-3 ${styles}`}
    >
      {access}
    </Chip>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full animate-pulse ${active ? 'bg-success' : 'bg-danger'}`} />
      <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-success' : 'text-danger'}`}>
        {active ? 'Online' : 'Dark'}
      </span>
    </div>
  );
}

function SortableColumnHeader({
  children,
  sortDirection,
}: {
  children: React.ReactNode;
  sortDirection?: "ascending" | "descending";
}) {
  return (
    <span className="flex items-center justify-between">
      {children}
      {!!sortDirection && (
        <Icon
          icon="gravity-ui:chevron-up"
          className={cn(
            "size-3 transform transition-transform duration-100 ease-out",
            sortDirection === "descending" ? "rotate-180" : "",
          )}
        />
      )}
    </span>
  );
}

/* ─────────────────────── main component ─────────────────────── */
const UserManagement = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isAccessOpen, onOpen: onAccessOpen, onOpenChange: onAccessOpenChange } = useDisclosure();

  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [newAccess, setNewAccess] = useState<Set<string>>(new Set(['Standard']));
  const [actionLoading, setActionLoading] = useState(false);
  const [newUser, setNewUser] = useState<NewUserForm>(DEFAULT_NEW_USER);

  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'user',
    direction: 'ascending',
  });

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  /* ── API calls ── */
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
    const createUserPromise = adminApi.createUser(newUser).then(async (res) => {
      await fetchUsers();
      onAddOpenChange(false);
      setNewUser(DEFAULT_NEW_USER);
      return res;
    });

    toast.promise(createUserPromise, {
      loading: "Provisioning dynamic identity node...",
      success: "Identity authorized and indexed.",
      error: "Authorization failed. Check parameters.",
    });
  };

  const handleUpdateAccess = async () => {
    if (!selectedUser) return;
    const accessValue = Array.from(newAccess)[0] || 'Standard';
    
    const updatePromise = adminApi.updateUser(selectedUser.id, { access_right: accessValue }).then(async (res) => {
      await fetchUsers();
      onAccessOpenChange(false);
      return res;
    });

    toast.promise(updatePromise, {
      loading: "Reconfiguring clearance hierarchy...",
      success: "Clearance updated successfully.",
      error: "Hierarchy reconfig error.",
    });
  };

  const handleToggleStatus = async (user: UserRecord) => {
    const togglePromise = adminApi.updateUser(user.id, { is_active: !user.is_active }).then(async (res) => {
      await fetchUsers();
      return res;
    });

    toast.promise(togglePromise, {
      loading: "Adjusting lifecycle visibility...",
      success: `Identity status: ${!user.is_active ? 'Online' : 'Dark'}.`,
      error: "Lifecycle adjust error.",
    });
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Confirm permanent identity deletion?')) return;
    
    const deletePromise = adminApi.deleteUser(userId).then(async (res) => {
      await fetchUsers();
      return res;
    });

    toast.promise(deletePromise, {
      loading: "Purging segment identity node...",
      success: "Segment purged from registry.",
      error: "Purge process failed.",
    });
  };

  /* ── table columns ── */
  const columns = [
    { name: 'IDENTIFIED USER', uid: 'user', sortable: true },
    { name: 'AUTHORITY', uid: 'role', sortable: true },
    { name: 'CLEARANCE', uid: 'access', sortable: true },
    { name: 'LIFECYCLE', uid: 'status', sortable: true },
    { name: 'OPERATIONS', uid: 'actions' },
  ];

  const renderCell = (user: UserRecord, columnKey: string) => {
    const displayRole = safeText(user.role);
    const displayAccess = safeText(user.access_right || 'Standard');
    const isActive = user.is_active !== false;

    switch (columnKey) {
      case 'user':
        return <UserCell user={user} />;

      case 'role':
        return <RoleChip role={displayRole} />;

      case 'access':
        return <AccessChip access={displayAccess} />;

      case 'status':
        return <StatusBadge active={isActive} />;

      case 'actions':
        return (
          <div className="flex justify-end items-center gap-3">
            <Tooltip content="View Profile" closeDelay={0}>
              <Button
                isIconOnly
                variant="flat"
                size="sm"
                className="bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
                onPress={() => router.push(`/users/${user.id}`)}
              >
                <Eye size={16} />
              </Button>
            </Tooltip>

            <Dropdown className="glass-card rounded-2xl border-border/50">
              <DropdownTrigger>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground rounded-xl transition-colors"
                >
                  <MoreVertical size={18} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User Actions" className="p-2 gap-1">
                <DropdownItem
                  key="access"
                  startContent={<Fingerprint size={16} className="text-primary" />}
                  className="rounded-lg h-10 font-bold text-xs"
                  onPress={() => {
                    setSelectedUser(user);
                    setNewAccess(new Set([displayAccess]));
                    onAccessOpen();
                  }}
                >
                  Modify Clearance
                </DropdownItem>
                <DropdownItem
                  key="status"
                  startContent={
                    isActive ? <Ban size={16} /> : <CheckCircle size={16} />
                  }
                  color={isActive ? 'warning' : 'success'}
                  className="rounded-lg h-10 font-bold text-xs"
                  onPress={() => handleToggleStatus(user)}
                >
                  {isActive ? 'Suspend Identity' : 'Restore Identity'}
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  startContent={<Trash2 size={16} />}
                  color="danger"
                  className="rounded-lg h-10 font-bold text-xs text-danger"
                  onPress={() => handleDelete(user.id)}
                >
                  Purge Identity
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );

      default:
        return safeText((user as any)[columnKey]);
    }
  };

  /* ── render ── */
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* ── Page Header ── */}
      <div className="relative p-10 rounded-[2.5rem] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-blue-500/4 to-transparent" />
        <div className="absolute -left-16 -top-16 w-72 h-72 bg-primary/8 rounded-full blur-[80px] animate-pulse" />

        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          {/* Title block */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <UserCheck size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                IA_Governance_Registry
              </span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-foreground italic leading-none">
              Identity<span className="text-gradient not-italic">.Vault</span>
            </h1>
            <p className="text-muted-foreground font-medium text-base max-w-md">
              Deterministic management of platform entities and administrative authority hierarchy.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 bg-background/60 backdrop-blur-xl p-2.5 rounded-2xl border border-border/50 shadow-xl">
            <Button
              variant="flat"
              size="md"
              className="font-black uppercase tracking-widest text-[10px] px-6 bg-muted/50 border border-border rounded-xl hover:bg-muted transition-all"
              startContent={<Download size={16} className="text-primary" />}
            >
              Export
            </Button>
            <Button
              color="primary"
              size="md"
              className="font-black uppercase tracking-widest text-[10px] px-8 shadow-xl shadow-primary/25 rounded-xl hover:scale-[1.03] transition-all"
              startContent={<UserPlus size={16} strokeWidth={2.5} />}
              onPress={onAddOpen}
            >
              Provision Identity
            </Button>
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <EliteCard variant="glass" className="!p-0 border-border/40 overflow-visible">
        {/* Search bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 p-8 border-b border-border/20">
          <Input
            isClearable
            placeholder="Search by name, email, or handle…"
            startContent={<Search size={18} className="text-primary ml-2" />}
            value={search}
            onClear={() => setSearch('')}
            onValueChange={setSearch}
            variant="bordered"
            classNames={{
              inputWrapper:
                'h-14 px-4 border-2 border-border/50 hover:border-primary/50 focus-within:!border-primary rounded-xl bg-background transition-all duration-300 focus-within:shadow-lg focus-within:shadow-primary/10',
              input: 'text-sm font-semibold',
              base: 'max-w-[520px] w-full',
            }}
          />
          <Button
            variant="flat"
            className="h-14 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest bg-muted/50 border border-border shrink-0 group"
          >
            <Filter
              size={16}
              className="mr-2 group-hover:rotate-180 transition-transform duration-500"
            />
            Advanced Filter
          </Button>
        </div>

        {/* Table Content */}
        <div className="p-4 lg:p-8">
          <Table
            aria-label="Identity Governance Matrix"
            className="min-w-[1000px]"
            selectedKeys={selectedKeys}
            selectionMode="multiple"
            sortDescriptor={sortDescriptor}
            onSelectionChange={setSelectedKeys}
            onSortChange={setSortDescriptor}
            removeWrapper
            shadow="none"
          >
            <TableHeader>
              <TableColumn className="pr-0" width={10}>
                <Checkbox aria-label="Select all" slot="selection" />
              </TableColumn>
              <TableColumn allowsSorting id="user">
                IDENTIFIED USER
              </TableColumn>
              <TableColumn allowsSorting id="role">
                AUTHORITY
              </TableColumn>
              <TableColumn allowsSorting id="access">
                CLEARANCE
              </TableColumn>
              <TableColumn allowsSorting id="status">
                LIFECYCLE
              </TableColumn>
              <TableColumn className="text-end">OPERATIONS</TableColumn>
            </TableHeader>

            <TableBody loadingState={loading ? 'loading' : 'idle'}>
              {users.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="pr-0">
                    <Checkbox aria-label={`Select ${item.username}`} slot="selection" variant="secondary" />
                  </TableCell>
                  <TableCell>
                    <UserCell user={item} />
                  </TableCell>
                  <TableCell>
                    <RoleChip role={item.role} />
                  </TableCell>
                  <TableCell>
                    <AccessChip access={item.access_right || 'Standard'} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge active={item.is_active !== false} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end items-center gap-1">
                      <Button 
                        isIconOnly 
                        size="sm" 
                        variant="light" 
                        className="text-primary"
                        onPress={() => router.push(`/users/${item.id}`)}
                      >
                        <Icon className="size-4" icon="gravity-ui:eye" />
                      </Button>
                      <Button 
                        isIconOnly 
                        size="sm" 
                        variant="light"
                        onPress={() => {
                          setSelectedUser(item);
                          setNewAccess(new Set([item.access_right || 'Standard']));
                          onAccessOpen();
                        }}
                      >
                        <Icon className="size-4" icon="gravity-ui:pencil" />
                      </Button>
                      <Button 
                        isIconOnly 
                        size="sm" 
                        variant="light" 
                        color="danger"
                        onPress={() => handleDelete(item.id)}
                      >
                        <Icon className="size-4" icon="gravity-ui:trash-bin" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Table Footer / Pagination */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
             <div className="flex items-center gap-6">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/20 px-4 py-2 rounded-lg">
                  {total} Total Identities Provisioned
                </span>
                {selectedKeys !== "all" && selectedKeys.size > 0 && (
                  <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-lg">
                      {selectedKeys.size} Node Selection Active
                    </span>
                    <Button size="sm" color="danger" variant="flat" className="font-black text-[9px] uppercase tracking-widest h-9 px-6 rounded-xl">
                       Batch Purge
                    </Button>
                  </div>
                )}
             </div>

             {total > limit && (
               <Pagination
                 isCompact
                 showControls
                 color="primary"
                 page={page}
                 total={Math.ceil(total / limit)}
                 onChange={setPage}
                 radius="xl"
                 className="font-black"
                 classNames={{ 
                   cursor: 'bg-primary shadow-xl shadow-primary/25',
                   prev: 'bg-background hover:bg-muted',
                   next: 'bg-background hover:bg-muted',
                 }}
               />
             )}
          </div>
        </div>
      </EliteCard>

      {/* ── Provision Identity Modal ── */}
      <Modal
        isOpen={isAddOpen}
        onOpenChange={onAddOpenChange}
        backdrop="blur"
        size="2xl"
        classNames={{
          base: 'glass-card border-border/50 rounded-3xl',
          header: 'px-8 pt-8 pb-0',
          body: 'px-8 py-6',
          footer: 'px-8 pb-8 pt-4',
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary rounded-xl text-white shadow-lg shadow-primary/30">
                    <UserPlus size={22} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">
                      Provision Identity
                    </h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-0.5">
                      Nexus Hub IAM Protocol
                    </p>
                  </div>
                </div>
              </ModalHeader>

              <ModalBody>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { label: 'Full Name', field: 'full_name', placeholder: 'Legal identification' },
                    { label: 'Username', field: 'username', placeholder: 'Matrix handle' },
                    { label: 'Email Address', field: 'email', placeholder: 'Internal node address' },
                    { label: 'Password', field: 'password', placeholder: 'Entropy-driven key', type: 'password' },
                  ].map(({ label, field, placeholder, type }) => (
                    <Input
                      key={field}
                      label={label}
                      placeholder={placeholder}
                      type={type || 'text'}
                      variant="bordered"
                      value={(newUser as Record<string, string>)[field]}
                      onValueChange={(val) => setNewUser({ ...newUser, [field]: val })}
                      classNames={{
                        inputWrapper: 'h-14 border-2 rounded-xl bg-muted/20',
                        label: 'font-bold text-[10px] uppercase tracking-widest text-muted-foreground',
                      }}
                    />
                  ))}

                  <Select
                    label="Authority Role"
                    variant="bordered"
                    selectedKeys={[newUser.role]}
                    onSelectionChange={(keys) =>
                      setNewUser({ ...newUser, role: Array.from(keys)[0] as string })
                    }
                    classNames={{
                      trigger: 'h-14 border-2 rounded-xl bg-muted/20',
                      label: 'font-bold text-[10px] uppercase tracking-widest text-muted-foreground',
                    }}
                  >
                    <SelectItem key="User" startContent={<UserIcon size={16} />}>
                      Standard Participant
                    </SelectItem>
                    <SelectItem key="Admin" startContent={<ShieldCheck size={16} />}>
                      Matrix Administrator
                    </SelectItem>
                  </Select>

                  <Select
                    label="Clearance Level"
                    variant="bordered"
                    selectedKeys={[newUser.access_right]}
                    onSelectionChange={(keys) =>
                      setNewUser({ ...newUser, access_right: Array.from(keys)[0] as string })
                    }
                    classNames={{
                      trigger: 'h-14 border-2 rounded-xl bg-muted/20',
                      label: 'font-bold text-[10px] uppercase tracking-widest text-muted-foreground',
                    }}
                  >
                    <SelectItem key="Standard" startContent={<Zap size={16} />}>
                      Standard_Uplink
                    </SelectItem>
                    <SelectItem
                      key="Elevated"
                      startContent={<Fingerprint size={16} className="text-primary" />}
                    >
                      Elevated_Sync
                    </SelectItem>
                    <SelectItem
                      key="Supreme"
                      startContent={<ShieldAlert size={16} className="text-secondary" />}
                    >
                      Supreme_Authority
                    </SelectItem>
                  </Select>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="light"
                  color="danger"
                  className="font-black uppercase text-[10px] tracking-widest"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  className="font-black uppercase tracking-widest text-[10px] px-10 h-12 shadow-xl shadow-primary/25 rounded-xl hover:scale-105 transition-all"
                  onPress={handleCreateUser}
                  isLoading={actionLoading}
                >
                  Finalize Provision
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ── Clearance Modification Modal ── */}
      <Modal
        isOpen={isAccessOpen}
        onOpenChange={onAccessOpenChange}
        backdrop="blur"
        size="md"
        classNames={{
          base: 'glass-card border-border/50 rounded-3xl',
          header: 'px-8 pt-8 pb-0',
          body: 'px-8 py-6',
          footer: 'px-8 pb-8 pt-4',
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-secondary/10 rounded-xl text-secondary border border-secondary/20">
                    <Fingerprint size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">
                      Clearance Mod
                    </h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-0.5">
                      Reassign access level
                    </p>
                  </div>
                </div>
              </ModalHeader>

              <ModalBody>
                <div className="space-y-6">
                  {selectedUser && <SubjectCard user={selectedUser} />}

                  <Select
                    label="Assign Clearance Level"
                    variant="bordered"
                    selectedKeys={newAccess}
                    onSelectionChange={(keys) =>
                      setNewAccess(new Set([Array.from(keys)[0] as string]))
                    }
                    classNames={{
                      trigger: 'h-14 border-2 rounded-xl bg-muted/20',
                      label: 'font-bold text-[10px] uppercase tracking-widest text-muted-foreground',
                    }}
                  >
                    <SelectItem key="Standard" startContent={<Zap size={16} />}>
                      Standard_Uplink
                    </SelectItem>
                    <SelectItem
                      key="Elevated"
                      startContent={<Fingerprint size={16} className="text-primary" />}
                    >
                      Elevated_Sync
                    </SelectItem>
                    <SelectItem
                      key="Supreme"
                      startContent={<ShieldAlert size={16} className="text-secondary" />}
                    >
                      Supreme_Authority
                    </SelectItem>
                  </Select>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="light"
                  color="danger"
                  className="font-black uppercase text-[10px] tracking-widest"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  className="font-black uppercase tracking-widest text-[10px] px-10 h-12 shadow-xl shadow-primary/25 rounded-xl hover:scale-105 transition-all"
                  onPress={handleUpdateAccess}
                  isLoading={actionLoading}
                >
                  Confirm Modification
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
