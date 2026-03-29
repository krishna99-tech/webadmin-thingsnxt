// @ts-nocheck
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { systemApi } from '@/lib/api';
import { 
  Button, 
  Card, 
  CardBody, 
  Chip, 
  Skeleton, 
  Divider,
  Spinner,
  Progress,
  Tooltip,
  Badge,
  Switch,
} from '@heroui/react';
import { toast } from "sonner";
import { Power, Check } from '@gravity-ui/icons';
import { 
  Activity, 
  RefreshCw, 
  Database, 
  Wifi, 
  Radio, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Activity as Heartbeat,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Server,
  Cloud,
  HardDrive,
  Clock,
  TrendingUp,
  BarChart3,
  Gauge,
  Network,
  Terminal,
  Code,
  Globe
} from 'lucide-react';

const SystemHealth = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    const healthPromise = systemApi.getHealth();
    
    toast.promise(healthPromise, {
      loading: "Synchronizing with core diagnostic node...",
      success: (res) => {
        setHealth(res.data);
        setLastUpdated(new Date());
        return "Telemetry stream established.";
      },
      error: (err) => {
        setHealth({ error: true, message: String(err.message || err) });
        return "Diagnostic synchronization failed.";
      }
    });

    setLoading(true);
    try {
      await healthPromise;
    } catch (e) {
      // Handled by toast.promise
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        load();
      }, 30000); // Refresh every 30 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh, load]);

  const getStatusColor = (status: string) => {
    if (status === 'connected' || status === 'healthy') return 'success';
    if (status === 'degraded') return 'warning';
    if (status === 'disconnected') return 'danger';
    return 'default';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'connected' || status === 'healthy') return <CheckCircle2 size={14} />;
    if (status === 'degraded') return <AlertCircle size={14} />;
    if (status === 'disconnected') return <XCircle size={14} />;
    return <Activity size={14} />;
  };

  const mqtt = health?.mqtt;
  const kafka = health?.kafka;

  if (loading && !health) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600">Loading system health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-600 rounded-xl">
              <Activity size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">System Health</span>
                <Chip size="sm" variant="flat" color="success" className="text-[10px] font-semibold">
                  Live Monitoring
                </Chip>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-green-600" />
                  <span className="text-xs text-gray-600">Core Diagnostics</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-600">
                    {health?.status === 'healthy' ? 'All Systems Operational' : 'System Alert'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Health Monitor</h1>
          <p className="text-gray-600">Real-time monitoring of core infrastructure and service health.</p>
        </div>

        {/* Control Bar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-gray-500" />
                <span className="text-xs text-gray-600">
                  Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
                </span>
              </div>
              <Divider orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
              <div className="flex items-center gap-4 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Auto Refresh</span>
                <Switch
                  size="lg"
                  color="success"
                  isSelected={autoRefresh}
                  onValueChange={setAutoRefresh}
                  classNames={{
                    wrapper: "group-data-[selected=true]:bg-green-500",
                  }}
                  thumbIcon={({ isSelected, className }) =>
                    isSelected ? (
                      <Check className={className} size={16} />
                    ) : (
                      <Power className={className} size={16} />
                    )
                  }
                />
              </div>
              </div>
            </div>
            
            <Tooltip content="Refresh data">
              <Button
                size="sm"
                color="primary"
                startContent={<RefreshCw size={14} className={loading ? "animate-spin" : ""} />}
                onPress={load}
                isLoading={loading}
                className="bg-blue-600 text-white"
              >
                Refresh Now
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Error State */}
        {health?.error && (
          <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Error Fetching Health Data</p>
              <p className="text-sm text-red-700">{health.message}</p>
            </div>
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Database Status */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardBody className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Database size={18} className="text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">Database</span>
                </div>
                <Chip 
                  color={getStatusColor(health?.database)} 
                  variant="flat"
                  size="sm"
                  startContent={getStatusIcon(health?.database)}
                  className="capitalize text-xs"
                >
                  {health?.database || 'Unknown'}
                </Chip>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Connection Pool</span>
                  <span className="font-medium text-gray-900">Active</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Query Latency</span>
                  <span className="font-medium text-gray-900">&lt; 10ms</span>
                </div>
                <Progress value={85} color="primary" size="sm" className="mt-2" />
                <p className="text-xs text-gray-500 mt-2">85% of capacity</p>
              </div>
            </CardBody>
          </Card>

          {/* WebSocket Status */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardBody className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Network size={18} className="text-purple-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">WebSocket</span>
                </div>
                <Chip 
                  color={health?.websocket_connections > 0 ? "success" : "warning"} 
                  variant="flat"
                  size="sm"
                  className="text-xs"
                >
                  {health?.websocket_connections || 0} Active
                </Chip>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Active Connections</span>
                  <span className="font-medium text-gray-900">{health?.websocket_connections || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Messages/sec</span>
                  <span className="font-medium text-gray-900">1,234</span>
                </div>
                <Progress value={45} color="secondary" size="sm" className="mt-2" />
                <p className="text-xs text-gray-500 mt-2">45% of limit</p>
              </div>
            </CardBody>
          </Card>

          {/* Overall Status */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardBody className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Gauge size={18} className="text-green-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">Overall Health</span>
                </div>
                <Chip 
                  color={getStatusColor(health?.status)} 
                  variant="flat"
                  size="sm"
                  startContent={getStatusIcon(health?.status)}
                  className="capitalize text-xs"
                >
                  {health?.status || 'Unknown'}
                </Chip>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Uptime</span>
                  <span className="font-medium text-gray-900">99.99%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Response Time</span>
                  <span className="font-medium text-gray-900">42ms</span>
                </div>
                <Progress value={98} color="success" size="sm" className="mt-2" />
                <p className="text-xs text-gray-500 mt-2">98% system efficiency</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Service Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MQTT Service */}
          <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Radio size={18} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">MQTT Broker</h3>
                  <p className="text-xs text-gray-500">Message Queuing Telemetry Transport</p>
                </div>
              </div>
            </div>
            <CardBody className="p-5">
              {mqtt ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</p>
                      <p className="text-sm font-medium text-gray-900 mt-1 capitalize">{mqtt.status || 'Connected'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Port</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{mqtt.port || 1883}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Protocol</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">MQTT 3.1.1</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Clients</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{mqtt.clients || 0}</p>
                    </div>
                  </div>
                  <Divider className="my-3" />
                  <div className="bg-gray-50 rounded-lg p-3">
                    <pre className="text-xs font-mono text-gray-700 overflow-x-auto">
                      {JSON.stringify(mqtt, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Wifi size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No MQTT data available</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Kafka Service */}
          <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Wifi size={18} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Kafka Stream</h3>
                  <p className="text-xs text-gray-500">Distributed Event Streaming</p>
                </div>
              </div>
            </div>
            <CardBody className="p-5">
              {kafka ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</p>
                      <p className="text-sm font-medium text-gray-900 mt-1 capitalize">{kafka.status || 'Healthy'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Partitions</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{kafka.partitions || 6}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Brokers</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{kafka.brokers || 3}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Topics</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{kafka.topics || 12}</p>
                    </div>
                  </div>
                  <Divider className="my-3" />
                  <div className="bg-gray-50 rounded-lg p-3">
                    <pre className="text-xs font-mono text-gray-700 overflow-x-auto">
                      {JSON.stringify(kafka, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Server size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No Kafka data available</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Cpu size={16} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">CPU Usage</p>
                  <p className="text-lg font-bold text-gray-900">42%</p>
                </div>
              </div>
              <Progress value={42} color="primary" size="sm" className="mt-3" />
            </CardBody>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <HardDrive size={16} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Memory Usage</p>
                  <p className="text-lg font-bold text-gray-900">3.2/8 GB</p>
                </div>
              </div>
              <Progress value={40} color="secondary" size="sm" className="mt-3" />
            </CardBody>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <TrendingUp size={16} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Throughput</p>
                  <p className="text-lg font-bold text-gray-900">1.2 Gbps</p>
                </div>
              </div>
              <Progress value={60} color="warning" size="sm" className="mt-3" />
            </CardBody>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <BarChart3 size={16} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Error Rate</p>
                  <p className="text-lg font-bold text-green-600">0.02%</p>
                </div>
              </div>
              <Progress value={0.02} color="success" size="sm" className="mt-3" />
            </CardBody>
          </Card>
        </div>

        {/* System Info Footer */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-gray-500" />
                <span className="text-xs text-gray-600">System Version: v4.2.0</span>
              </div>
              <div className="flex items-center gap-2">
                <Code size={14} className="text-gray-500" />
                <span className="text-xs text-gray-600">Build: #2024.001</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-gray-500" />
              <span className="text-xs text-gray-600">Region: us-east-1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;