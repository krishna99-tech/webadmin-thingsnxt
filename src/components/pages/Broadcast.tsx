// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { 
  Button, 
  Input, 
  Divider,
  RadioGroup,
  Radio,
  Autocomplete,
  AutocompleteItem,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Tooltip,
  Spinner,
  Textarea as TextArea,
} from '@heroui/react';
import { toast } from "sonner";

const Label = ({ children, className = "" }) => (
  <label className={`text-sm font-semibold text-gray-700 mb-1 block ${className}`}>
    {children}
  </label>
);
import { 
  Send, 
  AlertTriangle, 
  CheckCircle2,
  Terminal,
  Signal,
  Radio as RadioIcon,
  Fingerprint,
  Globe,
  MessageSquare,
  ShieldAlert,
  Hash,
  History as HistoryIcon,
  Users,
  Target,
  Mail,
  Activity,
  Shield,
  Lock,
  Eye,
  Layers,
  Database,
  ChevronRight,
  User,
  AtSign,
  FileText,
  AlertCircle
} from 'lucide-react';
import { EliteCard } from '@/components/ui/elite-card';
import { useAuth } from '@/contexts/auth-context';

const Broadcast = () => {
  const { user: currentUser } = useAuth();
  const [targetType, setTargetType] = useState('all');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('compose');

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

  const handleUserSelect = (key) => {
    setSelectedUserId(key);
    const user = users.find(u => u.id === key);
    setSelectedUser(user);
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Identity required: Subject and Message body must be populated.');
      return;
    }
    if (targetType === 'individual' && !selectedUserId) {
      toast.error('Node targeting error: Recipient identity must be established.');
      return;
    }
    
    const sendPromise = (async () => {
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
      
      // Clear form after successful send
      setSubject('');
      setMessage('');
      if (targetType !== 'all') {
        setSelectedUserId('');
        setSelectedUser(null);
      }
      return response;
    })();

    toast.promise(sendPromise, {
      loading: "Establishing secure transmission uplink...",
      success: "Message broadcast successfully dispatched.",
      error: (err) => err.response?.data?.detail || "Transmission uplink failure.",
    });
  };

  // Access Denied Page
  if (currentUser && currentUser.access_right === 'Standard') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={40} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-6">You don't have permission to access this feature.</p>
            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Lock size={14} className="text-red-500" />
                <span>Requires Elevated or Supreme access level</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Terminal size={14} className="text-red-500" />
                <span>Contact your system administrator</span>
              </div>
            </div>
          </div>
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
            <div className="p-2 bg-blue-600 rounded-xl">
              <RadioIcon size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Broadcast Center</span>
                <Chip size="sm" variant="flat" color="success" className="text-[10px] font-semibold">
                  v3.0
                </Chip>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-600">System Online</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Signal size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-600">Secure Channel</span>
                </div>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Message Broadcast</h1>
          <p className="text-gray-600">Send system-wide announcements or targeted messages to individual users.</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-8">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Fingerprint size={18} className="text-blue-600" />
                  <h2 className="font-semibold text-gray-900">Transmission Settings</h2>
                </div>
                <p className="text-xs text-gray-500 mt-1">Configure your broadcast parameters</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Target Selection */}
                <RadioGroup
                  value={targetType}
                  onValueChange={setTargetType}
                  className="space-y-3"
                >
                  <div 
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      targetType === 'all' 
                        ? 'border-blue-500 bg-blue-50/50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setTargetType('all')}
                  >
                    <div className="flex items-start gap-3">
                      <Radio value="all" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Global Broadcast</p>
                            <p className="text-xs text-gray-500 mt-0.5">Send to all users in the system</p>
                          </div>
                          <Globe size={18} className={targetType === 'all' ? 'text-blue-500' : 'text-gray-400'} />
                        </div>
                        {targetType === 'all' && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-blue-600">
                            <ChevronRight size={12} />
                            <span>Will reach all active users</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      targetType === 'individual' 
                        ? 'border-purple-500 bg-purple-50/50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setTargetType('individual')}
                  >
                    <div className="flex items-start gap-3">
                      <Radio value="individual" color="secondary" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Individual Message</p>
                            <p className="text-xs text-gray-500 mt-0.5">Send to a specific user</p>
                          </div>
                          <Target size={18} className={targetType === 'individual' ? 'text-purple-500' : 'text-gray-400'} />
                        </div>
                        {targetType === 'individual' && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-purple-600">
                            <ChevronRight size={12} />
                            <span>Select a recipient below</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </RadioGroup>

                {/* User Selection */}
                {targetType === 'individual' && (
                  <div className="space-y-3">
                    <Divider />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Recipient
                      </label>
                      <Autocomplete
                        placeholder="Search by name or email..."
                        onSelectionChange={handleUserSelect}
                        isLoading={loadingUsers}
                        items={users}
                        startContent={<Users size={14} className="text-gray-400" />}
                        classNames={{
                          trigger: "h-12 bg-gray-50 border border-gray-200 rounded-xl",
                          input: "text-sm",
                          listbox: "rounded-xl border border-gray-200",
                        }}
                      >
                        {(user) => (
                          <AutocompleteItem 
                            key={user.id} 
                            textValue={safeText(user.email)}
                          >
                            <div className="flex items-center gap-3 py-1">
                              <Avatar size="sm" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{safeText(user.full_name || user.username)}</span>
                                <span className="text-xs text-gray-500">{safeText(user.email)}</span>
                              </div>
                            </div>
                          </AutocompleteItem>
                        )}
                      </Autocomplete>
                      
                      {selectedUser && (
                        <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                          <div className="flex items-center gap-2 text-sm text-purple-700">
                            <User size={14} />
                            <span className="font-medium">Selected:</span>
                            <span>{safeText(selectedUser.full_name || selectedUser.username)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Info Cards */}
                <div className="space-y-3 pt-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-start gap-3">
                      <Shield size={16} className="text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-900">Encryption</p>
                        <p className="text-xs text-gray-500 mt-1">All messages are encrypted with AES-256 and sent over TLS 1.3</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-xl text-center">
                      <Mail size={16} className="text-blue-600 mx-auto mb-1" />
                      <p className="text-[10px] font-medium text-gray-500 uppercase">Total Sent</p>
                      <p className="text-xl font-bold text-gray-900">2,847</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl text-center">
                      <Activity size={16} className="text-green-600 mx-auto mb-1" />
                      <p className="text-[10px] font-medium text-gray-500 uppercase">Success Rate</p>
                      <p className="text-xl font-bold text-green-600">99.8%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Message Composer */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              
              {/* Tabs */}
              <div className="border-b border-gray-200 bg-gray-50/50">
                <Tabs 
                  selectedKey={activeTab}
                  onSelectionChange={setActiveTab}
                  variant="underlined"
                  classNames={{
                    tabList: "gap-1 px-6 pt-2",
                    tab: "h-10",
                    tabContent: "group-data-[selected=true]:text-blue-600 text-gray-600 text-sm font-medium"
                  }}
                >
                  <Tab key="compose" title={
                    <div className="flex items-center gap-2">
                      <FileText size={14} />
                      <span>Compose</span>
                    </div>
                  } />
                  <Tab key="preview" title={
                    <div className="flex items-center gap-2">
                      <Eye size={14} />
                      <span>Preview</span>
                    </div>
                  } />
                  <Tab key="templates" title={
                    <div className="flex items-center gap-2">
                      <Layers size={14} />
                      <span>Templates</span>
                    </div>
                  } />
                </Tabs>
              </div>

              <div className="p-6">
                {activeTab === 'compose' && (
                  <div className="space-y-6">
                    {/* Subject Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject Line
                      </label>
                      <Input
                        placeholder="e.g., System Maintenance Notice, Security Update, etc."
                        value={subject}
                        onValueChange={setSubject}
                        startContent={<Hash size={16} className="text-gray-400" />}
                        classNames={{
                          inputWrapper: "h-12 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-blue-400",
                          input: "text-sm",
                        }}
                      />
                    </div>

                    {/* Message Body */}
                    <div>
                    <div className="flex w-full flex-col gap-4">
                      <div key="flat" className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
                        <TextArea
                          label="Message Body"
                          placeholder="Write your message here... Use clear and professional language."
                          minRows={12}
                          variant="flat"
                          value={message}
                          onValueChange={setMessage}
                          classNames={{
                            inputWrapper: "bg-gray-100/50 border-none rounded-xl p-4",
                            input: "text-sm leading-relaxed",
                            label: "text-sm font-semibold text-gray-700",
                          }}
                        />
                      </div>
                    </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">
                          {message.length} characters
                        </p>
                        <p className="text-xs text-gray-400">
                          Supports plain text
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="bordered"
                        className="border-gray-300 text-gray-700 rounded-xl"
                        onPress={() => {
                          setSubject('');
                          setMessage('');
                        }}
                      >
                        Clear
                      </Button>
                      <Button 
                        color="primary"
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8"
                        startContent={!loading && <Send size={16} />}
                        onClick={handleSend}
                        isLoading={loading}
                      >
                        {loading ? 'Sending...' : 'Send Message'}
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'preview' && (
                  <div className="space-y-4">
                    <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-gray-500" />
                            <span className="text-xs font-medium text-gray-600">System Message</span>
                          </div>
                          <span className="text-xs text-gray-400">Preview</span>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            {subject || "No Subject"}
                          </h3>
                          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {message || "Your message will appear here..."}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      This is how your message will appear to recipients
                    </p>
                  </div>
                )}

                {activeTab === 'templates' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { 
                          title: 'Welcome Message', 
                          desc: 'Onboarding for new team nodes.',
                          subject: 'Welcome to ThingsNXT: Mission Control Initialized',
                          message: `Hello,\n\nWelcome to the ThingsNXT Enterprise Platform. Your node identity has been established and your credentials are now active.\n\nTo begin your journey:\n1. Access the Mission Control dashboard.\n2. Provision your initial edge devices.\n3. Configure your telemetry pipelines.\n\nIf you require technical uplink support, please contact the system administrator.\n\nBest regards,\nThingsNXT Command`
                        },
                        { 
                          title: 'Security Alert', 
                          desc: 'Identity and access incident notification.',
                          subject: '[CRITICAL] Security Alert: Unauthorized Access Attempt',
                          message: `URGENT SECURITY NOTICE,\n\nOur automated monitoring system has detected an unusual login attempt associated with your account from a previously unknown infrastructure node.\n\nLocation: Unknown\nTimestamp: ${new Date().toISOString()}\n\nIf this was not you, please perform an immediate identity rotation (reset password) and notify the Security Operations Center (SOC) through the established secure channel.\n\nSecurity is our primary directive.\n\nThingsNXT Security Hub`
                        },
                        { 
                          title: 'Maintenance Notice', 
                          desc: 'Scheduled infrastructure maintenance.',
                          subject: 'Infrastructure Update: Scheduled System Maintenance',
                          message: `ATTN: System Maintenance Scheduled,\n\nWe will be performing a critical core update to the ThingsNXT Mesh infrastructure during the following window:\n\nStart: Sunday, 02:00 UTC\nEnd: Sunday, 04:00 UTC\n\nImpact: The Admin Dashboard and API Gateway will be intermittently unavailable. Data ingestion from edge devices will be queued but may experience latency.\n\nThank you for your cooperation in maintaining our platform's exponential speed.\n\nSystem Operations`
                        },
                        { 
                          title: 'Policy Update', 
                          desc: 'Terms and compliance changes.',
                          subject: 'Updates to ThingsNXT Terms of Service & Privacy Protocol',
                          message: `Hello,\n\nWe are updating our Service Protocols to better support global compliance standards. These changes will take effect within 30 days.\n\nKey Updates:\n- Refined data retention parameters for telemetry logs.\n- Enhanced encryption transparency for P2P mesh links.\n- Updated cross-border data transfer clauses.\n\nYou can review the full protocol documentation in the 'Legal' section of your dashboard.\n\nCompliance Office`
                        },
                      ].map((template, index) => (
                        <div 
                          key={index} 
                          className="p-5 bg-white rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer group"
                          onClick={() => {
                            setSubject(template.subject);
                            setMessage(template.message);
                            setActiveTab('compose');
                            toast.success(`Template "${template.title}" loaded.`);
                          }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="p-2 bg-blue-50 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              <Layers size={18} />
                            </div>
                            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg">Template</span>
                          </div>
                          <p className="text-base font-bold text-gray-900 mb-1 tracking-tight">{template.title}</p>
                          <p className="text-xs text-gray-500 leading-relaxed font-medium">{template.desc}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      Click any template to load it into the composer
                    </p>
                  </div>
                )}

                {/* Action feedback handled by toast.promise() */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Broadcast;