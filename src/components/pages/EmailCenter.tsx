// @ts-nocheck
"use client";

import React, { useEffect, useState } from 'react';
import { AppLink } from '@/components/ui/app-link';
import { adminApi } from '@/lib/api';
import {
  Button,
  Input,
  Card,
  CardBody,
  Chip,
  Divider,
} from '@heroui/react';
import { Mail, Send, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { EliteCard } from '@/components/ui/elite-card';

const EmailCenter = () => {
  const [status, setStatus] = useState(null);
  const [to, setTo] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.getEmailStatus();
        setStatus(res.data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const sendTest = async () => {
    if (!to.trim()) return;
    setSending(true);
    try {
      await adminApi.sendTestEmail(to.trim());
      alert('Test email queued. Check inbox and server logs.');
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to queue email');
    } finally {
      setSending(false);
    }
  };

  const ok = status?.smtp_configured;

  return (
    <div className="admin-page space-y-8 max-w-3xl">
      <EliteCard>
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-primary/15 text-primary">
            <Mail size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase italic">Communication<span className="text-primary not-italic">_Center</span></h1>
            <p className="text-small text-default-500 font-medium">
              Manage platform-wide mail delivery. SMTP status is synchronized with your server environment.
            </p>
          </div>
        </div>
      </EliteCard>

      <Card className="rounded-[2.5rem] bg-content1 border-none shadow-xl shadow-default-500/5">
        <CardBody className="p-8 gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${ok ? 'bg-success/15 text-success border border-success/20' : 'bg-danger/15 text-danger border border-danger/20'}`}>
                {ok ? (
                  <CheckCircle2 size={28} />
                ) : (
                  <XCircle size={28} />
                )}
              </div>
              <div>
                <p className="font-black uppercase tracking-widest text-[10px] text-default-400 mb-1">SMTP Server Status</p>
                <p className="text-lg font-black italic tracking-tighter text-default-900 leading-none">
                  {ok ? 'Connection Established' : 'Configuration Required'}
                </p>
                <p className="text-xs text-default-500 font-medium mt-1">
                    {ok ? 'Ready to process outgoing transmissions.' : 'Please verify EMAIL_USER and EMAIL_PASSWORD in .env'}
                </p>
              </div>
            </div>
            <Chip color={ok ? 'success' : 'danger'} variant="shadow" className="font-black uppercase tracking-widest h-10 px-6">
              {status?.host}:{status?.port}
            </Chip>
          </div>
          
          <Divider className="opacity-10" />
          
          <div className="space-y-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Delivery Validation</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  label="Test Recipient"
                  labelPlacement="outside"
                  placeholder="recipient@example.com"
                  value={to}
                  onValueChange={setTo}
                  className="flex-1"
                  radius="2xl"
                  classNames={{
                      inputWrapper: "h-16 px-6 bg-default-100 border-2 border-divider/50 focus-within:!border-primary transition-all",
                      label: "font-bold uppercase text-[10px] tracking-widest text-default-400 mb-2 ml-4",
                      input: "font-bold"
                  }}
                />
                <Button
                  color="primary"
                  className="h-16 px-10 sm:mt-8 font-black uppercase tracking-widest shadow-xl shadow-primary/20 rounded-2xl hover:scale-105 transition-all"
                  startContent={<Send size={20} />}
                  onPress={sendTest}
                  isLoading={sending}
                  isDisabled={!ok}
                >
                  Run Test
                </Button>
              </div>
          </div>
        </CardBody>
      </Card>

      <AppLink href="/broadcast" className="block group/link">
        <EliteCard className="cursor-pointer hover:border-primary/35 transition-all group p-10 rounded-[3rem] border-2 border-divider/20 hover:scale-[1.01]">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-primary shadow-xl shadow-primary/30 flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
                   <Mail size={32} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Bulk Communications</p>
                  <p className="text-3xl font-black tracking-tighter italic uppercase text-default-900 group-hover:text-primary transition-colors">Configure Broadcast</p>
                  <p className="text-sm text-default-500 font-bold mt-2 uppercase tracking-wide">Send high-priority alerts to all authenticated users.</p>
                </div>
            </div>
            <div className="w-14 h-14 rounded-full bg-default-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                <ArrowRight className="shrink-0 group-hover/link:translate-x-1 transition-transform" size={24} />
            </div>
          </div>
        </EliteCard>
      </AppLink>
    </div>
  );
};

export default EmailCenter;
