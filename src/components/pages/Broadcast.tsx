// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { 
  Card, 
  CardBody, 
  Button, 
  Input, 
  Textarea, 
  Divider,
  RadioGroup,
  Radio,
  Autocomplete,
  AutocompleteItem,
  Avatar,
  Chip,
} from '@heroui/react';
import { 
  Send, 
  AlertTriangle, 
  CheckCircle2,
  Terminal,
  UserCheck,
  Signal,
  Radio as RadioIcon,
  Fingerprint,
  Globe,
  MessageSquare,
  ShieldAlert,
  Hash,
  History as HistoryIcon
} from 'lucide-react';
import { EliteCard } from '@/components/ui/elite-card';
import { useAuth } from '@/contexts/auth-context';

const Broadcast = () => {
  const { user: currentUser } = useAuth();
  const [targetType, setTargetType] = useState('all');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  // Safe String Logic
  const safeText = (text) => {
    if (!text) return "";
    if (typeof text === 'string') return text;
    if (typeof text === 'object') {
       if (text.role) return text.role;
       return JSON.stringify(text);
    }
    return String(text);
  };

  useEffect(() => {
    if (targetType === 'individual') {
      fetchUsers();
    }
  }, [targetType]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await adminApi.getUsers({ limit: 100 });
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch recipients:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSend = async () => {
    if (!subject || !message) {
      setStatus({ success: false, message: 'Required fields are missing: Please enter a subject and message.' });
      return;
    }
    if (targetType === 'individual' && !selectedUserId) {
      setStatus({ success: false, message: 'No recipient selected: Please identify a target user.' });
      return;
    }
    
    setLoading(true);
    setStatus(null);
    
    try {
      let response;
      if (targetType === 'all') {
        response = await adminApi.broadcast({ subject, message });
      } else {
        response = await adminApi.alertUser({ 
          user_id: selectedUserId, 
          subject, 
          message 
        });
      }
      
      setStatus({ 
        success: true, 
        message: response.data.message || 'Transmission Successful: Your message has been dispatched.' 
      });
      setSubject('');
      setMessage('');
      if (targetType !== 'all') setSelectedUserId('');
    } catch (error) {
      setStatus({ 
        success: false, 
        message: error.response?.data?.detail || 'Delivery Failed: Could not establish a connection to the mail server.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (currentUser && currentUser.access_right === 'Standard') {
    return (
      <div className="p-12 sm:p-20 text-center admin-page-muted space-y-12">
        <EliteCard className="max-w-2xl mx-auto py-20 border-danger/30 bg-danger/5 backdrop-blur-3xl relative overflow-hidden rounded-[3rem]">
          <div className="absolute inset-0 bg-gradient-to-b from-danger/10 to-transparent pointer-events-none"></div>
          <div className="w-24 h-24 bg-danger/20 text-danger rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-danger/20 border-2 border-danger/30 relative z-10">
            <ShieldAlert size={48} strokeWidth={2.5} className="animate-pulse" />
          </div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-default-900 leading-none relative z-10">Restricted Access</h2>
          <p className="text-[11px] font-black text-danger uppercase tracking-[0.5em] mt-6 relative z-10 animate-pulse">Insufficient Administrative Clearance</p>
          <div className="mt-12 p-8 bg-background/50 rounded-3xl border border-divider/20 text-left max-w-sm mx-auto relative z-10">
            <p className="text-[10px] font-bold text-default-400 uppercase leading-relaxed tracking-wider text-center">
               Global broadcasting is restricted to <strong>Elevated</strong> or <strong>Supreme</strong> administrative accounts. Contact your system lead for access.
            </p>
          </div>
        </EliteCard>
      </div>
    );
  }

  return (
    <div className="admin-page space-y-10">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-2 bg-primary/20 blur-lg rounded-lg animate-pulse"></div>
              <div className="relative p-3 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/40">
                <RadioIcon size={24} strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] leading-none mb-1">Broadcast Hub</span>
              <div className="flex items-center gap-2">
                <Signal size={12} className="text-success" />
                <span className="text-[9px] font-black text-success uppercase tracking-widest">Active Link Established</span>
              </div>
            </div>
          </div>
          <h1 className="text-6xl font-black tracking-tight uppercase text-default-900 italic leading-none">
            Broadcast<span className="text-primary not-italic">_Center</span>
          </h1>
          <p className="text-default-400 font-bold text-xs max-w-lg leading-relaxed uppercase tracking-wider">
            Enterprise-grade communication uplink. <br/>
            Deploying <span className="text-primary">Platform-wide</span> or <span className="text-secondary">Targeted</span> notifications.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-default-100/50 backdrop-blur-xl p-3 rounded-2xl border border-divider/20">
          <div className="flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full border border-success/20">
             <div className="w-1.5 h-1.5 rounded-full bg-success animate-ping"></div>
             <span className="text-[9px] font-black text-success uppercase tracking-widest">System Green</span>
          </div>
          <Divider orientation="vertical" className="h-8 mx-1" />
          <Button 
            isIconOnly 
            variant="flat" 
            className="h-14 w-14 rounded-2xl bg-background border border-divider shadow-xl text-primary"
          >
            <HistoryIcon size={20} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Settings Panel HUD */}
        <div className="lg:col-span-4">
          <EliteCard className="h-full border-divider/30 bg-background/20 backdrop-blur-2xl rounded-[3rem]">
            <div className="space-y-10">
              <div className="flex items-center gap-4 text-primary">
                <div className="p-3 bg-primary/10 rounded-2xl shadow-inner border border-primary/20">
                  <Fingerprint size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Recipient Info</h3>
                  <p className="text-[9px] font-black text-default-400 uppercase tracking-widest leading-none mt-1">Configure Target Parameters</p>
                </div>
              </div>

              <RadioGroup
                value={targetType}
                onValueChange={setTargetType}
                classNames={{
                  wrapper: "gap-4"
                }}
              >
                <div 
                  className={`relative p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 group
                    ${targetType === 'all' ? 'border-primary bg-primary/[0.03] shadow-2xl shadow-primary/20' : 'border-divider/30 bg-default-50/20 hover:border-divider'}`} 
                  onClick={() => setTargetType('all')}
                >
                  <div className="flex items-start gap-4">
                    <Radio value="all" className="mt-1" />
                    <div className="flex flex-col">
                      <p className="text-sm font-black uppercase italic tracking-tighter text-default-900 group-hover:text-primary transition-colors">Broadcast All</p>
                      <p className="text-[10px] text-default-400 font-bold uppercase tracking-widest mt-1">Send to entire database</p>
                    </div>
                  </div>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                    <Globe size={20} className={targetType === 'all' ? 'text-primary' : 'text-default-400'} />
                  </div>
                </div>

                <div 
                  className={`relative p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 group
                    ${targetType === 'individual' ? 'border-secondary bg-secondary/[0.03] shadow-2xl shadow-secondary/20' : 'border-divider/30 bg-default-50/20 hover:border-divider'}`} 
                  onClick={() => setTargetType('individual')}
                >
                  <div className="flex items-start gap-4">
                    <Radio value="individual" color="secondary" className="mt-1" />
                    <div className="flex flex-col">
                      <p className="text-sm font-black uppercase italic tracking-tighter text-default-900 group-hover:text-secondary transition-colors">Specific User</p>
                      <p className="text-[10px] text-default-400 font-bold uppercase tracking-widest mt-1">Direct individual alert</p>
                    </div>
                  </div>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                    <UserCheck size={20} className={targetType === 'individual' ? 'text-secondary' : 'text-default-400'} />
                  </div>
                </div>
              </RadioGroup>

              {targetType === 'individual' && (
                <div className="space-y-6 pt-4">
                    <div className="relative">
                      <Autocomplete
                        label="Recipient Selection"
                        labelPlacement="outside"
                        variant="flat"
                        radius="2xl"
                        placeholder="Search by name or email..."
                        onSelectionChange={(key) => setSelectedUserId(key)}
                        isLoading={loadingUsers}
                        items={users}
                        classNames={{
                          base: "w-full",
                          listbox: "bg-background/90 backdrop-blur-2xl border-1 border-divider rounded-[2rem] p-4",
                          popoverContent: "rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] bg-transparent",
                          trigger: "bg-default-100/50 h-16 border-2 border-divider/40 focus-within:border-secondary transition-all px-6",
                          label: "font-black uppercase tracking-widest text-[10px] text-default-400 mb-2 ml-2"
                        }}
                      >
                        {(user) => (
                          <AutocompleteItem 
                            key={user.id} 
                            textValue={safeText(user.email)}
                            className="rounded-2xl py-4 hover:bg-secondary/10"
                          >
                            <div className="flex items-center gap-4">
                              <Avatar size="md" className="border-2 border-secondary/20" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
                              <div className="flex flex-col">
                                <span className="text-sm font-bold tracking-tight text-default-900">{safeText(user.full_name || user.username)}</span>
                                <span className="text-[10px] font-medium text-default-400 uppercase tracking-widest">{safeText(user.email)}</span>
                              </div>
                            </div>
                          </AutocompleteItem>
                        )}
                      </Autocomplete>
                    </div>
                </div>
              )}

              <Divider className="opacity-10" />

              <div className="flex items-start gap-5 p-6 bg-primary/5 border-1 border-primary/20 rounded-3xl">
                <AlertTriangle size={20} className="text-primary shrink-0" />
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary leading-none">Security Note</p>
                  <p className="text-[10px] text-primary/70 font-bold leading-relaxed uppercase tracking-tight italic">
                    Messages are sent officially from the platform. Delivery is subject to SMTP throughput.
                  </p>
                </div>
              </div>
            </div>
          </EliteCard>
        </div>

        {/* Compose Panel HUD */}
        <div className="lg:col-span-8">
          <EliteCard 
            className="h-full border-none bg-background/30 backdrop-blur-3xl transition-all duration-500 shadow-2xl overflow-hidden rounded-[2.5rem]"
          >
            <div className="flex flex-col h-full">
              {/* Cinematic Compose Header */}
              <div className="p-8 sm:p-10 border-b border-divider/10 bg-default-50/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white shadow-2xl shadow-primary/30">
                      <MessageSquare size={28} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-2xl font-black uppercase italic tracking-tighter text-default-900 leading-none">Message Composer</h2>
                      <p className="text-[10px] font-black text-default-400 uppercase tracking-widest mt-1">Prepare high-priority system dispatch</p>
                    </div>
                 </div>
                 <Chip 
                   variant="flat" 
                   color="primary" 
                   className="font-black uppercase text-[9px] tracking-widest px-4 h-8 bg-primary/10"
                   startContent={<Terminal size={12} />}
                 >
                   PLATFORM_CERTIFIED
                 </Chip>
              </div>

              {/* Compose Body */}
              <div className="p-8 sm:p-10 flex-1 overflow-y-auto scrollbar-hide">
                 <div className="flex flex-col gap-10">
                    <div className="relative group/subject">
                      <Input
                        label="Message Subject"
                        labelPlacement="outside"
                        placeholder="Enter a descriptive subject line"
                        variant="flat"
                        radius="2xl"
                        size="lg"
                        value={subject}
                        onValueChange={setSubject}
                        classNames={{
                          inputWrapper: "h-20 bg-default-100/60 dark:bg-default-100/10 border-2 border-divider/40 px-8 data-[hover=true]:border-primary focus-within:!border-primary transition-all duration-500 shadow-xl",
                          input: "text-lg font-bold tracking-tight text-default-900 placeholder:text-default-300",
                          label: "font-black uppercase tracking-[0.4em] text-[10px] text-primary mb-3 ml-2"
                        }}
                      />
                    </div>
                    
                    <div className="relative group/content flex-1">
                      <Textarea
                        label="Dispatch Body"
                        labelPlacement="outside"
                        placeholder="Compose your high-priority transmission here... HTML is supported."
                        variant="flat"
                        radius="3xl"
                        minRows={14}
                        value={message}
                        onValueChange={setMessage}
                        classNames={{
                          inputWrapper: "bg-default-100/60 dark:bg-default-100/05 border-2 border-divider/40 p-8 data-[hover=true]:border-primary focus-within:!border-primary transition-all duration-500 shadow-xl",
                          input: "text-base font-medium text-default-800 leading-relaxed placeholder:text-default-300 scrollbar-hide",
                          label: "font-black uppercase tracking-[0.4em] text-[10px] text-primary mb-3 ml-2"
                        }}
                      />
                    </div>
                 </div>

                   {status && (
                     <div
                       className={`p-6 rounded-3xl border-2 flex items-center gap-6 shadow-2xl animate-in zoom-in-95 duration-500 ${status.success ? "bg-success/[0.03] border-success/30 text-success shadow-success/10" : "bg-danger/[0.03] border-danger/20 text-danger shadow-danger/10"}`}
                     >
                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status.success ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                         {status.success ? <CheckCircle2 size={24} strokeWidth={2.5} /> : <ShieldAlert size={24} strokeWidth={2.5} />}
                       </div>
                       <div className="flex-1">
                         <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-1 opacity-60 italic">System Status</p>
                         <p className="text-sm font-bold tracking-tight">{status.message}</p>
                       </div>
                     </div>
                   )}
              </div>

              {/* Compose Footer */}
              <div className="p-10 bg-default-50/20 border-t border-divider/10 flex flex-col sm:flex-row justify-between items-center gap-8">
                 <div className="flex items-center gap-5 text-default-400 font-bold uppercase tracking-widest text-[10px]">
                    <div className="p-2 bg-default-100 rounded-lg">
                      <Hash size={16} />
                    </div>
                    <span>Data integrity validated</span>
                 </div>
                 <Button 
                   color="primary" 
                   variant="shadow"
                   radius="full"
                   className="px-20 h-20 font-black uppercase tracking-[0.4em] text-[10px] shadow-[0_32px_64px_-12px_rgba(var(--primary-rgb),0.5)] hover:scale-[1.05] active:scale-95 transition-all"
                   startContent={<Send size={24} strokeWidth={3} className="mr-3" />}
                   onClick={handleSend}
                   isLoading={loading}
                 >
                   Send Message
                 </Button>
              </div>
            </div>
          </EliteCard>
        </div>
      </div>
    </div>
  );
};

export default Broadcast;
