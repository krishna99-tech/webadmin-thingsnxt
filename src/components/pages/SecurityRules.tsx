// @ts-nocheck
"use client";

import "reactflow/dist/style.css";
import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { 
  Button, 
  Tabs, 
  Tab, 
  Chip,
  Snippet,
} from '@heroui/react';
import { 
  Save, 
  RotateCcw, 
  FileJson, 
  Eye, 
  AlertTriangle,
  ShieldCheck,
  Terminal,
  LockKeyhole,
  Workflow
} from 'lucide-react';
import { EliteCard } from '@/components/ui/elite-card';
import ReactFlow, { 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState,
} from 'reactflow';

const SecurityRules = () => {
  const [rules, setRules] = useState(null);
  const [editedRules, setEditedRules] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // React Flow State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    fetchRules();
  }, []);

  // Effect to update flow chart when rules change
  useEffect(() => {
    if (rules) {
      generateFlow(rules);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rules]);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getSecurityRules();
      setRules(response.data);
      setEditedRules(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Failed to fetch security rules:', error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const generateFlow = (rulesObj) => {
    const newNodes = [];
    const newEdges = [];
    
    // Core Node
    newNodes.push({
      id: 'root',
      data: { label: 'SECURITY_CORE' },
      position: { x: 400, y: 0 },
      type: 'input',
      className: 'bg-primary text-white font-black rounded-2xl border-none p-4 shadow-2xl shadow-primary/20 tracking-widest text-xs italic',
    });

    let colX = 0;
    const spacing = 450;
    
    Object.entries(rulesObj).forEach(([collection, config]) => {
      const colId = `col-${collection}`;
      
      // Collection Node
      newNodes.push({
        id: colId,
        data: { label: collection.toUpperCase() },
        position: { x: colX, y: 150 },
        className: 'bg-background border-2 border-divider p-6 rounded-[2rem] font-black italic tracking-tighter text-lg shadow-xl',
      });

      newEdges.push({
        id: `e-root-${colId}`,
        source: 'root',
        target: colId,
        animated: true,
        style: { stroke: 'rgba(var(--primary-rgb), 0.3)', strokeWidth: 2 },
      });

      // Child Rules (like .read, .write or wildcard keys)
      if (typeof config === 'object') {
        let opY = 300;
        Object.entries(config).forEach(([op, ruleExpr]) => {
          const opId = `op-${collection}-${op}`;
          
          if (typeof ruleExpr === 'object') {
             // Handle wildcards like $device_id
             newNodes.push({
                id: opId,
                data: { label: op },
                position: { x: colX, y: opY },
                className: 'bg-secondary/10 border-2 border-secondary/30 p-4 rounded-2xl font-black text-[10px] tracking-widest text-secondary',
             });
             newEdges.push({ id: `e-${colId}-${opId}`, source: colId, target: opId, style: { stroke: 'rgba(var(--secondary-rgb), 0.5)' } });
             
             // Nest deeper for wildcards
             let subOpY = opY + 120;
             Object.entries(ruleExpr).forEach(([subOp, expr]) => {
                const subId = `sub-${collection}-${op}-${subOp}`;
                newNodes.push({
                  id: subId,
                  data: { label: `${subOp}: ${typeof expr === 'string' ? expr.slice(0, 30) + '...' : 'EXPR_COMPLEX'}` },
                  position: { x: colX - 50, y: subOpY },
                  className: 'bg-default-100 border-1 border-divider p-4 rounded-xl font-mono text-[9px] w-[250px] overflow-hidden text-ellipsis',
                });
                newEdges.push({ id: `e-${opId}-${subId}`, source: opId, target: subId });
                subOpY += 80;
             });
             opY = subOpY + 50;
          } else {
             const exprPreview =
               typeof ruleExpr === "string"
                 ? `${ruleExpr.slice(0, 30)}...`
                 : String(ruleExpr);
             newNodes.push({
                id: opId,
                data: { label: `${op}: ${exprPreview}` },
                position: { x: colX, y: opY },
                className: 'bg-default-50 border-1 border-divider p-4 rounded-xl font-mono text-[9px] w-[250px]',
             });
             newEdges.push({ id: `e-${colId}-${opId}`, source: colId, target: opId });
             opY += 100;
          }
        });
      }

      colX += spacing;
    });

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const parsedRules = JSON.parse(editedRules);
      await adminApi.updateSecurityRules(parsedRules);
      setRules(parsedRules);
      alert('Security_Protocol_Deployed: Access control nodes updated successfully.');
    } catch (error) {
      alert('SYNTAX_ERROR: Failed to parse security JSON. Root: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page space-y-10">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-2 bg-secondary/20 blur-lg rounded-lg animate-pulse"></div>
              <div className="relative p-3 bg-secondary text-white rounded-2xl shadow-2xl shadow-secondary/40">
                <LockKeyhole size={24} strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-secondary uppercase tracking-[0.5em] leading-none mb-1">Firewall_Orchestration.v4</span>
              <div className="flex items-center gap-2">
                <ShieldCheck size={12} className="text-success" />
                <span className="text-[9px] font-black text-success uppercase tracking-widest">Access_Control_Optimal</span>
              </div>
            </div>
          </div>
          <h1 className="text-6xl font-black tracking-tight uppercase text-default-900 italic leading-none">
            Guard<span className="text-primary not-italic">.v4</span>
          </h1>
          <p className="text-default-400 font-bold text-xs max-w-lg leading-relaxed uppercase tracking-wider">
            Fine-grained RBAC orchestration and policy deployment. <br/>
            Validating <span className="text-primary">Global</span> security rules across all infrastructure nodes.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-default-100/50 backdrop-blur-xl p-3 rounded-2xl border border-divider/20">
          <Button 
            variant="flat"
            className="font-black uppercase tracking-widest text-[10px] h-14 px-8 bg-background border border-divider shadow-xl hover:translate-y-[-2px] transition-all"
            startContent={<RotateCcw size={18} className={loading || saving ? "animate-spin" : "text-primary"} />}
            onClick={fetchRules}
            isDisabled={loading || saving}
          >
            Reset_Protocol
          </Button>
          <Button 
            color="primary" 
            variant="shadow"
            className="font-black uppercase tracking-widest px-10 h-14 shadow-2xl shadow-primary/30 rounded-2xl hover:scale-105 transition-all"
            startContent={<Save size={20} strokeWidth={3} />} 
            onClick={handleSave}
            isLoading={saving}
            isDisabled={loading}
          >
            Deploy Change
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Info HUD Panel */}
        <div className="lg:col-span-3 space-y-8">
          <EliteCard className="bg-primary/[0.02] border-primary/10">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <ShieldCheck size={20} />
              <span className="font-black uppercase tracking-widest text-xs">Active Shield</span>
            </div>
            <p className="text-[10px] font-bold text-default-500 leading-relaxed uppercase tracking-tight">
              evaluated in real-time by the <span className="text-primary">SecurityRulesEngine</span> for every synchronous request.
            </p>
            <div className="flex flex-wrap gap-2 pt-6">
              <Chip size="sm" variant="flat" color="primary" className="font-black uppercase text-[9px] px-2 h-6">.read</Chip>
              <Chip size="sm" variant="flat" color="primary" className="font-black uppercase text-[9px] px-2 h-6">.write</Chip>
              <Chip size="sm" variant="flat" color="primary" className="font-black uppercase text-[9px] px-2 h-6">.telemetry</Chip>
            </div>
          </EliteCard>

          <EliteCard className="bg-warning/[0.02] border-warning/10">
            <div className="flex items-center gap-3 mb-4 text-warning">
              <AlertTriangle size={20} />
              <span className="font-black uppercase tracking-widest text-xs">Policy Warning</span>
            </div>
            <p className="text-[10px] font-bold text-warning/80 leading-relaxed uppercase tracking-tight">
              Changes take effect immediately across all nodes. Root access is required for full deployment.
            </p>
          </EliteCard>

          <EliteCard className="bg-secondary/[0.02] border-secondary/10">
            <div className="flex items-center gap-3 mb-4 text-secondary">
              <Terminal size={20} />
              <span className="font-black uppercase tracking-widest text-xs">Rule Pattern</span>
            </div>
            <Snippet hideSymbol variant="bordered" className="text-[9px] bg-background border-divider/30 font-mono w-full overflow-hidden">
              {`"auth.uid === data.owner_id"`}
            </Snippet>
            <p className="text-[9px] font-bold text-default-400 uppercase mt-3">Ownership match sequence</p>
          </EliteCard>
        </div>

        {/* Intelligence Editor HUD */}
        <div className="lg:col-span-9">
          <EliteCard className="p-0 overflow-hidden border-divider/30">
            <Tabs 
              aria-label="Editor modes" 
              variant="underlined"
              color="primary"
              classNames={{
                tabList: "px-10 border-b border-divider/10 w-full bg-default-50/20",
                tab: "max-w-fit px-0 h-20 mr-10",
                tabContent: "font-black uppercase italic tracking-tighter text-lg leading-none group-data-[selected=true]:text-primary group-data-[selected=true]:translate-y-[-2px] transition-all",
                cursor: "w-full bg-primary h-1 rounded-full shadow-lg shadow-primary/40"
              }}
            >
              <Tab 
                key="editor" 
                title={
                  <div className="flex items-center gap-3">
                    <FileJson size={20} />
                    <span>Policy_Editor</span>
                  </div>
                }
              >
                <div className="p-10 relative group">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  <textarea
                    className="w-full h-[600px] p-10 font-mono text-sm bg-background/50 backdrop-blur-3xl rounded-[2.5rem] border-2 border-divider/40 focus:outline-none focus:border-primary focus:shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)] transition-all duration-500 resize-none text-default-900 selection:bg-primary/20"
                    value={editedRules}
                    onChange={(e) => setEditedRules(e.target.value)}
                    placeholder="Initialize security registry JSON..."
                    spellCheck={false}
                  />
                  <div className="absolute bottom-16 right-16 flex items-center gap-2 px-4 py-2 bg-background/80 rounded-full border border-divider/40 shadow-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Real_Time_Policy_Sync</span>
                  </div>
                </div>
              </Tab>
              
              <Tab 
                key="flow" 
                title={
                  <div className="flex items-center gap-3">
                    <Workflow size={20} />
                    <span>Visual_Registry</span>
                  </div>
                }
              >
                 <div className="h-[600px] w-full p-6 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.05)_0%,transparent_100%)]"></div>
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      fitView
                      className="rounded-[2.5rem]"
                    >
                      <Background color="rgba(var(--primary-rgb), 0.1)" gap={20} />
                      <Controls className="bg-background border-divider rounded-xl shadow-2xl" />
                    </ReactFlow>
                    
                    <div className="absolute top-10 right-10 z-10 p-4 bg-background/80 backdrop-blur-xl border border-divider/20 rounded-2xl shadow-xl space-y-2">
                       <p className="text-[9px] font-black uppercase tracking-widest text-primary">Protocol Map Visualization</p>
                       <p className="text-[11px] font-bold text-default-400 italic">Evaluating security graph with ReactFlow engine...</p>
                    </div>
                 </div>
              </Tab>

              <Tab 
                key="preview" 
                title={
                  <div className="flex items-center gap-3">
                    <Eye size={20} />
                    <span>Schema_View</span>
                  </div>
                }
              >
                <div className="p-10">
                  <div className="p-10 bg-background/50 backdrop-blur-3xl rounded-[2.5rem] border-2 border-divider/40 overflow-auto max-h-[600px] scrollbar-hide">
                    <pre className="font-mono text-sm text-primary/80 leading-relaxed">
                      <code>{JSON.stringify(rules, null, 2)}</code>
                    </pre>
                  </div>
                </div>
              </Tab>
            </Tabs>
          </EliteCard>
        </div>
      </div>
    </div>
  );
};

export default SecurityRules;
