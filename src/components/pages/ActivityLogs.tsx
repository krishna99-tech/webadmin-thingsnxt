// @ts-nocheck
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import { Button, Card, CardBody, Chip, Pagination, Skeleton } from '@heroui/react';
import { RefreshCw, Shield } from 'lucide-react';
import { EliteCard } from '@/components/ui/elite-card';

const ActivityLogs = () => {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 25;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getActivity({ page, limit });
      setData(res.data.data || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (e) {
      console.error(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="admin-page space-y-6">
      <EliteCard className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 -m-6 sm:-m-7 mb-0 p-6 sm:p-8 border-b border-default-200/60 dark:border-default-100/10">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Shield size={26} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-default-900">Audit trail</h1>
              <p className="text-sm text-default-500">
                Admin actions, broadcasts, and security updates ({total} records).
              </p>
            </div>
          </div>
          <Button
            color="primary"
            variant="flat"
            radius="lg"
            startContent={<RefreshCw size={18} />}
            onPress={load}
            isLoading={loading}
          >
            Refresh
          </Button>
        </div>
      </EliteCard>

      <Card className="bg-content1 border border-default-200/70 dark:border-default-100/10 rounded-2xl shadow-sm">
        <CardBody className="p-6 gap-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ) : data.length === 0 ? (
            <p className="text-center text-default-400 py-16">No activity yet.</p>
          ) : (
            data.map((row) => {
              const id = String(row["id"] ?? row["_id"] ?? Math.random());
              const extras = Object.fromEntries(
                Object.entries(row).filter(
                  ([k]) => !['_id', 'id', 'action', 'timestamp', 'admin_id'].includes(k)
                )
              );
              return (
                <div
                  key={id}
                  className="flex flex-col md:flex-row md:items-start gap-3 p-4 rounded-xl bg-default-50/80 dark:bg-default-100/5 border border-default-200/60 dark:border-default-100/10"
                >
                  <Chip size="sm" variant="flat" color="primary" className="font-mono text-[10px] uppercase shrink-0">
                    {String(row["action"] ?? "—")}
                  </Chip>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-mono text-default-600 break-all">{JSON.stringify(extras)}</p>
                    <p className="text-[10px] text-default-400 mt-2">
                      {row["timestamp"] ? new Date(row["timestamp"] as string).toISOString() : '—'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </CardBody>
      </Card>

      {pages > 1 && (
        <div className="flex justify-center">
          <Pagination page={page} total={pages} onChange={setPage} color="primary" radius="lg" />
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
