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
  Tooltip,
  Tabs,
  Tab,
} from '@heroui/react';
import { 
  Search, 
  Cpu, 
  Trash2, 
  RefreshCw,
  UserCheck,
  Activity,
  Zap,
  Radio,
  Unplug,
  Box,
  Hash,
  Signal
} from 'lucide-react';
import { EliteCard } from '@/components/ui/elite-card';

const DeviceManagement = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const params = { 
        page, 
        limit, 
        search: search || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter
      };
      const response = await adminApi.getDevices(params);
      setDevices(response.data.data ?? []);
      setTotal(response.data.total ?? 0);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const columns = [
    { name: "TACTICAL NODE", uid: "name" },
    { name: "ALLOCATED OPERATOR", uid: "owner" },
    { name: "PROTOCOL STATE", uid: "status" },
    { name: "LAST PULSE", uid: "last_active" },
    { name: "NODE CREDENTIALS", uid: "credentials" },
    { name: "OPERATIONS", uid: "actions" },
  ];

  const renderCell = (device, columnKey) => {
    switch (columnKey) {
      case "name":
        return (
          <div className="flex items-start gap-3 min-w-0 max-w-full">
            <div className="relative group/icon shrink-0">
              <div className="absolute -inset-1 bg-primary/20 blur-md rounded-xl opacity-0 group-hover/icon:opacity-100 transition-opacity"></div>
              <div className="relative p-3 rounded-2xl bg-default-100 text-primary border-1 border-divider/40 group-hover/icon:bg-primary/10 transition-colors">
                <Box size={22} strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-black text-sm sm:text-base tracking-tight uppercase italic text-default-900 leading-snug mb-1 break-words [overflow-wrap:anywhere]">{device.name}</span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.25em]">{device.type || 'Generic_IoT_Node'}</span>
                <span className="w-1 h-1 rounded-full bg-default-300 shrink-0"></span>
                <span className="text-[9px] font-mono text-default-400">HW_REV.v2.1</span>
              </div>
            </div>
          </div>
        );
      case "owner":
        return (
          <div className="flex flex-col min-w-0 max-w-full">
            <span className="text-sm font-black uppercase italic tracking-tight text-default-800 leading-snug mb-1 break-words [overflow-wrap:anywhere]">{device.owner_name}</span>
            <span className="text-[10px] font-bold text-default-400 font-mono tracking-tighter break-all">{device.owner_email}</span>
          </div>
        );
      case "status":
        const isOnline = device.status === 'online';
        return (
          <div className="flex items-center gap-3">
             <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-success shadow-[0_0_12px_rgba(34,197,94,0.8)] animate-pulse' : 'bg-danger shadow-[0_0_12px_rgba(239,68,68,0.8)]'}`}></div>
             <Chip
               color={isOnline ? "success" : "danger"}
               variant="flat"
               size="sm"
               className="font-black uppercase tracking-[0.2em] text-[10px] h-7 px-3 bg-default-100/50"
             >
               {device.status}
             </Chip>
          </div>
        );
      case "last_active":
        return (
          <div className="flex flex-col">
            <span className="text-xs font-black text-default-900 font-mono tracking-tighter uppercase">
              {device.last_active ? new Date(device.last_active).toLocaleTimeString() : 'SIGNAL_LOST'}
            </span>
            <span className="text-[9px] font-bold text-default-400 uppercase tracking-widest mt-0.5">
              {device.last_active ? new Date(device.last_active).toLocaleDateString() : 'INERT_NODE'}
            </span>
          </div>
        );
      case "credentials":
        return (
          <div className="flex flex-col gap-1.5 min-w-[180px]">
            <div className="flex items-center gap-2 px-2 py-1 bg-default-100 rounded-lg border border-divider/20 group/id">
              <Hash size={10} className="text-default-400" />
              <span className="text-[9px] font-black font-mono text-default-600 truncate uppercase">ID_{device.id.slice(-8)}</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 bg-primary/5 rounded-lg border border-primary/10">
              <Zap size={10} className="text-primary" />
              <span className="text-[9px] font-black font-mono text-primary uppercase">TOKEN_ENCRYPTED</span>
            </div>
          </div>
        );
      case "actions":
        return (
          <div className="flex justify-end items-center gap-3 pr-4">
            <Tooltip content="Re-Initialize Node" closeDelay={0}>
              <Button isIconOnly size="md" variant="flat" className="bg-primary/10 text-primary border-1 border-primary/20 rounded-2xl hover:bg-primary hover:text-white transition-all duration-300">
                <RefreshCw size={18} />
              </Button>
            </Tooltip>
            <Tooltip content="Ownership Handshake" closeDelay={0}>
              <Button isIconOnly size="md" variant="flat" className="bg-secondary/10 text-secondary border-1 border-secondary/20 rounded-2xl hover:bg-secondary hover:text-white transition-all duration-300">
                <UserCheck size={18} />
              </Button>
            </Tooltip>
            <Tooltip content="Decommission Node" color="danger" closeDelay={0}>
              <Button isIconOnly size="md" variant="flat" className="bg-danger/10 text-danger border-1 border-danger/20 rounded-2xl hover:bg-danger hover:text-white transition-all duration-300">
                <Trash2 size={18} />
              </Button>
            </Tooltip>
          </div>
        );
      default:
        return device[columnKey];
    }
  };

  return (
    <div className="admin-page space-y-10">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-2 bg-primary/20 blur-lg rounded-lg animate-pulse"></div>
              <div className="relative p-3 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/40">
                <Radio size={24} strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] leading-none mb-1">Fleet_Orchestrator.v4</span>
              <div className="flex items-center gap-2">
                <Signal size={12} className="text-success" />
                <span className="text-[9px] font-black text-success uppercase tracking-widest">Global_Uplink_Optimal</span>
              </div>
            </div>
          </div>
          <h1 className="text-6xl font-black tracking-tight uppercase text-default-900 italic leading-none">
            Fleet<span className="text-primary not-italic">.v4</span>
          </h1>
          <p className="text-default-400 font-bold text-xs max-w-lg leading-relaxed uppercase tracking-wider">
            Real-time node administration and telemetry validation. <br/>
            Monitoring <span className="text-primary">{total}</span> authenticated hardware units.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-default-100/50 backdrop-blur-xl p-3 rounded-2xl border border-divider/20">
          <Button 
            variant="flat"
            className="font-black uppercase tracking-widest text-[10px] h-14 px-8 bg-background border border-divider shadow-xl hover:translate-y-[-2px] transition-all"
            startContent={<Activity size={18} className="text-primary" />}
          >
            Signal Audit
          </Button>
          <Button 
            color="primary" 
            variant="shadow"
            className="font-black uppercase tracking-widest px-10 h-14 shadow-2xl shadow-primary/30 rounded-2xl hover:scale-105 transition-all"
            startContent={<Cpu size={20} strokeWidth={3} />} 
          >
            Provision node
          </Button>
        </div>
      </div>

      <EliteCard className="p-0 border-divider/30 overflow-visible">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-8 p-10 border-b border-divider/10 bg-default-50/20">
          <div className="relative w-full sm:max-w-[450px]">
             <Tabs 
               selectedKey={statusFilter} 
               onSelectionChange={(key) => setStatusFilter(key)}
               variant="solid" 
               radius="xl"
               size="lg"
               classNames={{
                 tabList: "bg-default-100/50 p-1.5 border border-divider/20",
                 tab: "h-11 px-6",
                 tabContent: "font-black text-[10px] uppercase tracking-widest group-data-[selected=true]:text-white",
                 cursor: "bg-primary shadow-lg shadow-primary/30"
               }}
             >
               <Tab key="all" title="All_Nodes" />
               <Tab key="online" title="Live_Uplink" />
               <Tab key="offline" title="Signal_Lost" />
             </Tabs>
          </div>

          <div className="relative w-full sm:max-w-[400px]">
            <Input
              isClearable
              placeholder="Filter by node designation, ID or owner..."
              startContent={<Search size={22} className="text-primary ml-2" />}
              value={search}
              onClear={() => setSearch('')}
              onValueChange={setSearch}
              variant="flat"
              radius="2xl"
              classNames={{
                inputWrapper: "bg-background border-2 border-divider/40 h-16 group-data-[focus=true]:border-primary group-data-[focus=true]:shadow-xl group-data-[focus=true]:shadow-primary/10 transition-all duration-500 pr-4",
                input: "text-md font-black tracking-tight"
              }}
            />
          </div>
        </div>

        <div className="overflow-x-auto p-4 lg:p-10">
          <Table 
            aria-label="Fleet management registry"
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
              items={devices} 
              loadingContent={<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>}
              loadingState={loading ? "loading" : "idle"}
              emptyContent={
                <div className="py-40 text-center flex flex-col items-center gap-6">
                  <div className="p-10 bg-default-100 rounded-[3rem] border-2 border-dashed border-divider/20">
                    <Unplug size={64} className="text-default-200" strokeWidth={1} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-black uppercase italic tracking-tighter">Sector Dark</p>
                    <p className="text-[10px] font-bold text-default-400 uppercase tracking-widest">No active hardware nodes detected in local sector</p>
                  </div>
                </div>
              }
            >
              {(item) => (
                <TableRow key={item.id} className="border-b border-divider/5 last:border-0 group hover:bg-primary/[0.03] transition-all duration-500">
                  {(columnKey) => <TableCell className="py-8">{renderCell(item, columnKey)}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </EliteCard>
    </div>
  );
};

export default DeviceManagement;
