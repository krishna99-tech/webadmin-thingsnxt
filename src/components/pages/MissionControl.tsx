// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { 
  Skeleton, 
  Chip, 
  Divider, 
  Button, 
  Progress,
  Badge
} from '@heroui/react';
import { 
  Activity,
  Signal,
  Terminal,
  Radio,
  Wifi,
  Wind,
  Layers,
  Search,
  Crosshair,
  Lock,
  Cpu as CpuIcon
} from 'lucide-react';
import { EliteCard } from '@/components/ui/elite-card';

const MissionControl = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNodes, setActiveNodes] = useState([]);
  const [signalStrength, setSignalStrength] = useState(85);
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setSignalStrength(prev => Math.min(100, Math.max(70, prev + (Math.random() - 0.5) * 10)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, devicesRes] = await Promise.all([
        adminApi.getAnalytics(),
        adminApi.getDevices({ limit: 10 })
      ]);
      setStats(analyticsRes.data);
      const deviceList = devicesRes.data.data || devicesRes.data || [];
      setActiveNodes(Array.isArray(deviceList) ? deviceList.slice(0, 6) : []);
    } catch (error) {
      console.error('Mission Control initialization failed:', error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  return (
    <div className="admin-page space-y-10">
      {/* 🚀 ELITE MISSION CONTROL HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-default-100/30 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full animate-pulse"></div>
            <div className="relative w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/40 border border-white/20 rotate-3 group-hover:rotate-0 transition-transform duration-700">
              <Crosshair size={32} strokeWidth={2.5} className="animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge content="LIVE" color="danger" size="sm" shape="rectangle" className="font-black text-[8px] animate-pulse">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Sector_Control.v4</span>
              </Badge>
              <div className="h-px w-12 bg-divider/20"></div>
              <span className="text-[9px] font-bold text-default-400 uppercase tracking-widest font-mono">UPLINK_098_BETA</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-default-900 uppercase italic leading-none">
              Mission <span className="text-primary not-italic">Control</span>
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 relative z-10">
          <div className="flex flex-col items-end gap-1 px-6 border-r border-divider/10">
            <span className="text-[9px] font-black text-default-400 uppercase tracking-widest">Signal_Integrity</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-success font-mono tracking-tighter">{signalStrength.toFixed(0)}%</span>
              <Signal size={16} className="text-success" />
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-background/50 p-2 rounded-2xl border border-divider/20 shadow-xl">
             <Button 
               isIconOnly 
               variant="flat" 
               className="h-12 w-12 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:scale-105 transition-all"
               onClick={fetchData}
             >
               <Activity size={20} className={loading ? "animate-spin" : ""} />
             </Button>
             <Divider orientation="vertical" className="h-8 mx-1 opacity-20" />
             <div className="flex flex-col px-2">
                <span className="text-[8px] font-black text-default-400 uppercase tracking-widest leading-none mb-1">Local_Time</span>
                <span className="text-sm font-black text-default-900 font-mono tracking-tighter">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
             </div>
          </div>
        </div>
      </div>

      {/* 📊 TACTICAL GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: NODE REGISTRY & SEARCH */}
        <div className="lg:col-span-4 space-y-8">
          <EliteCard className="p-0 border-primary/10 bg-primary/5">
            <div className="p-8 border-b border-divider/10">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <CpuIcon size={20} className="text-primary" />
                    <span className="font-black uppercase tracking-widest text-xs italic">Live Node Registry</span>
                 </div>
                 <div className="h-2 w-2 rounded-full bg-primary animate-ping"></div>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-primary/40">
                  <Search size={16} />
                </div>
                <input 
                  type="text" 
                  placeholder="SCAN IDENTITY SEQUENCE..." 
                  className="w-full bg-background/50 border-2 border-divider/40 rounded-2xl py-4 pl-12 pr-6 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-primary transition-all shadow-inner"
                />
              </div>
            </div>
            
            <div className="p-4 max-h-[500px] overflow-y-auto scrollbar-hide space-y-3">
              {activeNodes.map(node => (
                <div 
                  key={node.id}
                  className="p-4 rounded-2xl border border-divider/20 bg-background/40 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer group hover:translate-x-1"
                >
                  <div className="flex justify-between items-center gap-3 min-w-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-default-100 flex items-center justify-center text-default-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Wifi size={18} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black uppercase italic tracking-tighter text-default-900 leading-snug mb-0.5 break-words [overflow-wrap:anywhere]">{node.name}</span>
                        <span className="text-[9px] font-bold text-default-400 uppercase tracking-widest">{node.status}</span>
                      </div>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'online' ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-danger'}`}></div>
                  </div>
                </div>
              ))}
              {loading && [1,2,3,4].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
            </div>
          </EliteCard>

          <EliteCard className="bg-secondary/5 border-secondary/10 overflow-hidden relative">
             <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/10 blur-[60px] rounded-full pointer-events-none"></div>
             <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
                   <Lock size={20} />
                </div>
                <div>
                   <h4 className="font-black uppercase tracking-widest text-xs italic">IAM Sentinel</h4>
                   <p className="text-[9px] font-bold text-default-400 uppercase tracking-widest">Active Clearance Audit</p>
                </div>
             </div>
             <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-end">
                   <span className="text-[9px] font-black uppercase text-default-400 tracking-widest">Threat_Neutralization</span>
                   <span className="text-sm font-black text-secondary font-mono tracking-tighter">99.9%</span>
                </div>
                <Progress 
                  value={99.9} 
                  size="sm" 
                  color="secondary" 
                  className="bg-secondary/10" 
                  classNames={{ indicator: "bg-gradient-to-r from-secondary to-secondary/40 shadow-[0_0_10px_rgba(var(--secondary-rgb),0.5)]" }}
                />
             </div>
          </EliteCard>
        </div>

        {/* CENTER: TELEMETRY PULSE & HEATMAP */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <EliteCard className="bg-background/40 backdrop-blur-3xl border-white/5 relative group h-[400px] overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 overflow-hidden rounded-full">
                  <div className="absolute top-0 left-0 h-full w-20 animate-bar-sweep bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)]" />
               </div>
               
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
                       <Radio size={24} className="animate-pulse" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black uppercase tracking-tighter italic">Signal_Spectrum</h3>
                       <p className="text-[10px] font-black text-default-400 uppercase tracking-widest">Spectral Bandwidth Analysis</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-[9px] font-black text-primary uppercase tracking-widest leading-none mb-1">Core_Band</span>
                     <span className="text-xl font-black text-default-900 font-mono tracking-tighter">2.48 GHz</span>
                  </div>
               </div>

               <div className="flex items-end justify-between h-48 gap-3 relative">
                  <div className="absolute inset-0 border-b border-divider/10 flex flex-col justify-between py-2 pointer-events-none">
                     <div className="h-px w-full bg-divider/5"></div>
                     <div className="h-px w-full bg-divider/10"></div>
                     <div className="h-px w-full bg-divider/5"></div>
                  </div>
                  {[40, 70, 45, 90, 65, 30, 85, 55, 40, 75, 45, 60, 95, 20, 50].map((h, i) => (
                    <div 
                      key={i}
                      style={{ height: `${h}%` }}
                      className="flex-1 min-h-[8%] bg-gradient-to-t from-primary/80 via-primary/40 to-transparent rounded-t-lg group-hover:from-primary transition-all duration-500"
                    />
                  ))}
               </div>
               
               <div className="mt-8 flex justify-between items-center pt-6 border-t border-divider/10">
                  <div className="flex items-center gap-4">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-default-400 uppercase tracking-widest">Pk_Voltage</span>
                        <span className="text-xs font-black text-default-800 font-mono tracking-tighter">3.41V</span>
                     </div>
                     <Divider orientation="vertical" className="h-6" />
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-default-400 uppercase tracking-widest">Curr_Load</span>
                        <span className="text-xs font-black text-default-800 font-mono tracking-tighter">180mA</span>
                     </div>
                  </div>
                  <Button size="sm" variant="flat" className="font-black uppercase text-[10px] tracking-widest" color="primary">Manual_Correction</Button>
               </div>
            </EliteCard>

            <EliteCard className="bg-background/40 backdrop-blur-3xl border-white/5 relative group h-[400px]">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-secondary/10 rounded-2xl text-secondary border border-secondary/20 shadow-inner">
                       <Layers size={24} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black uppercase tracking-tighter italic">Layer_O3_Pulse</h3>
                       <p className="text-[10px] font-black text-default-400 uppercase tracking-widest">Distributed Node Mesh Load</p>
                    </div>
                  </div>
                  <Chip size="sm" variant="flat" color="secondary" className="font-black uppercase text-[9px]">Stable</Chip>
               </div>

               <div className="grid grid-cols-4 gap-4 flex-1">
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                    <div key={i} className="aspect-square bg-default-100/30 rounded-2xl border border-divider/10 flex items-center justify-center relative overflow-hidden group/item">
                       <div
                         className="absolute inset-2 bg-secondary/20 rounded-xl blur-lg opacity-60 animate-pulse"
                         style={{ animationDelay: `${i * 0.15}s` }}
                       />
                       <span className="text-[10px] font-black text-default-400 relative z-10 group-hover/item:text-secondary transition-colors">#{i}</span>
                    </div>
                  ))}
               </div>
               
               <div className="mt-8 flex justify-between items-center pt-6 border-t border-divider/10">
                  <div className="flex items-center gap-3">
                     <span className="text-[9px] font-black uppercase text-secondary tracking-widest animate-pulse">Scanning_Sectors...</span>
                  </div>
                  <span className="text-[9px] font-black text-default-400 uppercase tracking-widest italic">Sync_State_Optimal</span>
               </div>
            </EliteCard>
          </div>

          <EliteCard className="bg-default-900 text-white border-white/10 relative overflow-hidden h-[300px]">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none"></div>
             
             <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   <div>
                      <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-2">Platform_Hearth</h2>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] animate-pulse">Global_Uplink_Saturation</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="flex flex-col items-end">
                         <span className="text-[9px] font-bold text-default-400 uppercase tracking-widest">Latency</span>
                         <span className="text-xl font-black text-white font-mono leading-none mt-1">12ms</span>
                      </div>
                      <Divider orientation="vertical" className="h-10 bg-white/10" />
                      <div className="flex flex-col items-end">
                         <span className="text-[9px] font-bold text-default-400 uppercase tracking-widest">Nodes_Auth</span>
                         <span className="text-xl font-black text-white font-mono leading-none mt-1">{stats?.current_stats?.total_devices || 0}</span>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col gap-6">
                   <div className="flex justify-between items-center px-4 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl group hover:bg-white/10 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                         <span className="text-xs font-black uppercase tracking-[0.2em]">Nexus_Uplink_Established</span>
                      </div>
                      <span className="text-[9px] font-black text-default-400 group-hover:text-primary transition-colors">VIEW_DEEP_LOGS →</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-primary/20 rounded-lg">
                           <Terminal size={14} className="text-primary" />
                         </div>
                         <span className="text-[9px] font-black text-default-400 uppercase tracking-widest">Protocol: THINGS_NXT_SECURE_v4.2.1</span>
                      </div>
                      <div className="flex items-center gap-6">
                         <div className="flex items-center gap-2">
                           <Wifi size={14} className="text-success" />
                           <span className="text-[10px] font-bold text-success uppercase">99.8%</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <Wind size={14} className="text-primary" />
                           <span className="text-[10px] font-bold text-primary uppercase">COOL_OK</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </EliteCard>
        </div>
      </div>
    </div>
  );
};

export default MissionControl;
