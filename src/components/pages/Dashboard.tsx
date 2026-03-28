// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { Skeleton, Divider, Button } from '@heroui/react';
import { 
  Users, 
  Cpu, 
  Wifi, 
  WifiOff, 
  Activity as ActivityIcon,
  RefreshCw,
  Zap,
  Globe,
  Bell,
  Terminal as TerminalIcon,
  ShieldCheck,
  Signal
} from 'lucide-react';
import { EliteCard, EliteStatCard } from '@/components/ui/elite-card';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // Simulate live logs
    const interval = setInterval(() => {
      const actions = ["AUTHENTICATION", "UPLINK_SYNC", "NODE_DISCOVERY", "DATA_RELAY", "IAM_VALIDATION"];
      const newLog = {
        id: Date.now(),
        action: actions[Math.floor(Math.random() * actions.length)],
        node: `NODE_${Math.floor(Math.random() * 900) + 100}`,
        timestamp: new Date().toLocaleTimeString(),
        status: Math.random() > 0.1 ? "SUCCESS" : "INTERCEPTED"
      };
      setLogs(prev => [newLog, ...prev].slice(0, 8));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAnalytics();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const activityData = stats?.activity_by_type || {};
  const currentStats = stats?.current_stats || {};
  const totalActivity = Object.values(activityData).reduce((a, b) => a + b, 0);

  return (
    <div className="admin-page space-y-10">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="absolute -inset-2 bg-primary/20 blur-lg rounded-lg animate-pulse"></div>
              <div className="relative p-2.5 bg-primary text-white rounded-xl shadow-2xl shadow-primary/40">
                <TerminalIcon size={20} strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] leading-none mb-1">Command_Center.v4</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
                <span className="text-[9px] font-black text-success uppercase tracking-widest">Core_Link_Stable</span>
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-default-900 uppercase italic">
            Nexus <span className="text-primary tracking-normal">Analytics</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4 bg-default-100/50 backdrop-blur-xl p-2 rounded-2xl border border-divider/20">
          <Button 
            variant="flat" 
            className="font-black uppercase tracking-widest text-[10px] h-12 px-8 bg-background border border-divider shadow-xl"
            startContent={<RefreshCw size={16} className={loading ? "animate-spin" : "text-primary"} />}
            onClick={fetchStats}
            isDisabled={loading}
          >
            Terminal Sync
          </Button>
          <Divider orientation="vertical" className="h-8 mx-1" />
          <div className="flex gap-2 px-2">
            <Button isIconOnly variant="flat" className="bg-primary/10 text-primary h-12 w-12 rounded-xl border border-primary/20">
              <Signal size={20} />
            </Button>
            <Button isIconOnly variant="flat" className="bg-secondary/10 text-secondary h-12 w-12 rounded-xl border border-secondary/20">
              <Bell size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* High-Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <EliteStatCard 
          title="Active Identities" 
          value={currentStats.total_users || 0} 
          icon={Users} 
          color="primary"
          subtitle="+12%"
          loading={loading}
        />
        <EliteStatCard 
          title="Node Population" 
          value={currentStats.total_devices || 0} 
          icon={Cpu} 
          color="secondary"
          loading={loading}
        />
        <EliteStatCard 
          title="Live Uplinks" 
          value={currentStats.online_devices || 0} 
          icon={Wifi} 
          color="success"
          subtitle="98% UPTIME"
          loading={loading}
        />
        <EliteStatCard 
          title="Critical Alerts" 
          value={currentStats.offline_devices || 0} 
          icon={WifiOff} 
          color="danger"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Advanced Distribution Mapping */}
        <div className="lg:col-span-5">
          <EliteCard className="h-full border-primary/10 bg-primary/[0.02]">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20 shadow-inner">
                  <Globe size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic">Signal Distro</h3>
                  <p className="text-[10px] font-black text-default-400 uppercase tracking-widest">Global Protocol Balance</p>
                </div>
              </div>
              <ShieldCheck size={20} className="text-success" />
            </div>
            
            <div className="space-y-10">
              {Object.entries(activityData).map(([type, count]) => {
                const percentage = totalActivity > 0 ? (count / totalActivity) * 100 : 0;
                return (
                  <div key={type} className="group">
                    <div className="flex justify-between items-end mb-3 px-1">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-default-400 uppercase tracking-widest leading-none mb-1">Protocol_{type.substring(0,3)}</span>
                        <span className="text-sm font-black text-default-900 uppercase italic tracking-tight group-hover:text-primary transition-colors">
                          {type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-default-900 font-mono tracking-tighter leading-none">
                          {percentage.toFixed(1)}<span className="text-xs text-default-400">%</span>
                        </span>
                      </div>
                    </div>
                    <div className="relative h-4 w-full bg-default-100/50 rounded-lg p-1 overflow-hidden border border-divider/10">
                      <div
                        className="h-full max-w-full bg-gradient-to-r from-primary via-primary/80 to-primary/40 rounded-sm relative overflow-hidden transition-[width] duration-700 ease-out"
                        style={{ width: `${percentage}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-shimmer scale-x-150" />
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {loading && <div className="space-y-8">{[1,2,3,4].map(i => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between"><Skeleton className="h-4 w-24 rounded" /><Skeleton className="h-4 w-12 rounded" /></div>
                  <Skeleton className="h-4 w-full rounded-lg" />
                </div>
              ))}</div>}
              
              {!loading && Object.keys(activityData).length === 0 && (
                <div className="py-24 text-center border-2 border-dashed border-divider/20 rounded-[2rem]">
                  <Globe size={48} className="mx-auto text-default-200 mb-4" strokeWidth={1} />
                  <p className="text-default-400 font-black uppercase tracking-[0.4em] text-[10px]">Inert Signal Protocol Detected</p>
                </div>
              )}
            </div>
          </EliteCard>
        </div>

        {/* Global Event Stream */}
        <div className="lg:col-span-7">
          <EliteCard className="h-full border-secondary/10 bg-secondary/[0.02]">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-2xl text-secondary border border-secondary/20 shadow-inner">
                  <ActivityIcon size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic">System Pulse</h3>
                  <p className="text-[10px] font-black text-default-400 uppercase tracking-widest">Real-time Telemetry Stream</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full border border-success/20">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-ping"></div>
                <span className="text-[9px] font-black text-success uppercase tracking-widest">Monitoring_Active</span>
              </div>
            </div>
            
            <div className="space-y-4 max-h-[520px] overflow-y-auto pr-4 scrollbar-hide">
                {logs.map((log) => (
                  <div 
                    key={log.id}
                    className="relative p-5 rounded-3xl border border-divider/40 bg-background/40 hover:bg-default-100/50 hover:border-primary/30 transition-all duration-300 group overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-500"></div>
                    <div className="flex justify-between items-center relative z-10">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-1 shadow-inner transition-colors
                          ${log.status === 'SUCCESS' ? 'bg-success/5 border-success/20 text-success' : 'bg-danger/5 border-danger/20 text-danger'}`}>
                          <Zap size={22} strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-default-900 tracking-tight uppercase italic">{log.action}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{log.node}</span>
                            <span className="w-1 h-1 rounded-full bg-default-300"></span>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${log.status === 'SUCCESS' ? 'text-success' : 'text-danger'}`}>
                              {log.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-default-800 font-mono tracking-tighter">{log.timestamp}</p>
                        <p className="text-[9px] font-bold text-default-400 uppercase tracking-widest">Sequence_{log.id.toString().slice(-4)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              
              {logs.length === 0 && [1,2,3,4,5].map(i => (
                <Skeleton key={i} className="h-20 w-full rounded-[2rem]" />
              ))}
            </div>
          </EliteCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
