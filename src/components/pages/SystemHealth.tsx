// @ts-nocheck
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { systemApi } from '@/lib/api';
import { Button, Card, CardBody, Chip } from '@heroui/react';
import { Activity, RefreshCw, Database, Wifi, Radio } from 'lucide-react';
import { EliteCard } from '@/components/ui/elite-card';

const SystemHealth = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await systemApi.getHealth();
      setHealth(res.data);
    } catch (e) {
      console.error(e);
      setHealth({ error: true, message: String(e.message || e) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const mqtt = health?.mqtt;
  const kafka = health?.kafka;

  return (
    <div className="admin-page space-y-8">
      <EliteCard className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-success/15 text-success">
            <Activity size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">System health</h1>
            <p className="text-small text-default-500">Live read from GET /health (includes MQTT & Kafka summary).</p>
          </div>
        </div>
        <Button startContent={<RefreshCw size={18} />} variant="flat" onPress={load} isLoading={loading}>
          Refresh
        </Button>
      </EliteCard>

      {loading && !health ? (
        <p className="text-default-400">Loading…</p>
      ) : health?.error ? (
        <Card className="rounded-2xl border border-danger/30 shadow-sm">
          <CardBody>{health.message}</CardBody>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="rounded-2xl bg-content1 border border-default-200/70 dark:border-default-100/10 shadow-sm">
            <CardBody className="gap-3 p-8">
              <div className="flex items-center gap-2">
                <Database size={20} />
                <span className="font-black">API & database</span>
              </div>
              <Chip color={health?.database === 'connected' ? 'success' : 'warning'} variant="flat">
                DB: {health?.database || 'unknown'}
              </Chip>
              <p className="text-small text-default-500">Status: {health?.status}</p>
              <p className="text-small text-default-500">
                WebSocket sessions: {health?.websocket_connections ?? '—'}
              </p>
              <p className="text-[10px] font-mono text-default-400">{health?.timestamp}</p>
            </CardBody>
          </Card>

          <Card className="rounded-2xl bg-content1 border border-default-200/70 dark:border-default-100/10 shadow-sm">
            <CardBody className="gap-3 p-8">
              <div className="flex items-center gap-2">
                <Radio size={20} />
                <span className="font-black">MQTT</span>
              </div>
              <pre className="text-[11px] font-mono overflow-auto max-h-48 bg-black/30 p-3 rounded-xl">
                {JSON.stringify(mqtt || {}, null, 2)}
              </pre>
            </CardBody>
          </Card>

          <Card className="rounded-2xl bg-content1 border border-default-200/70 dark:border-default-100/10 shadow-sm md:col-span-2">
            <CardBody className="gap-3 p-8">
              <div className="flex items-center gap-2">
                <Wifi size={20} />
                <span className="font-black">Kafka pipeline</span>
              </div>
              <pre className="text-[11px] font-mono overflow-auto max-h-48 bg-black/30 p-3 rounded-xl">
                {JSON.stringify(kafka || {}, null, 2)}
              </pre>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SystemHealth;
