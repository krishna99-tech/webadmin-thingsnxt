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
  Tooltip,
  Spinner
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
  Workflow,
  CheckCircle2,
  XCircle,
  Code,
  Network,
  Zap
} from 'lucide-react';
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
  const [status, setStatus] = useState(null);
  
  // React Flow State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    fetchRules();
  }, []);

  useEffect(() => {
    if (rules) {
      generateFlow(rules);
    }
  }, [rules]);

  const fetchRules = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const response = await adminApi.getSecurityRules();
      setRules(response.data);
      setEditedRules(JSON.stringify(response.data, null, 2));
      setStatus({ success: true, message: 'Security rules loaded successfully' });
    } catch (error) {
      console.error('Failed to fetch security rules:', error);
      setStatus({ success: false, message: 'Failed to load security rules' });
    } finally {
      setTimeout(() => setLoading(false), 500);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const generateFlow = (rulesObj) => {
    const newNodes = [];
    const newEdges = [];
    
    // Core Node
    newNodes.push({
      id: 'root',
      data: { label: 'Security Core' },
      position: { x: 400, y: 0 },
      type: 'input',
      className: 'bg-blue-600 text-white font-semibold rounded-lg shadow-md px-4 py-2',
    });

    let colX = 0;
    const spacing = 450;
    
    Object.entries(rulesObj).forEach(([collection, config]) => {
      const colId = `col-${collection}`;
      
      // Collection Node
      newNodes.push({
        id: colId,
        data: { label: collection },
        position: { x: colX, y: 150 },
        className: 'bg-white border-2 border-gray-200 rounded-xl p-3 font-semibold text-gray-900 shadow-sm',
      });

      newEdges.push({
        id: `e-root-${colId}`,
        source: 'root',
        target: colId,
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      });

      // Child Rules
      if (typeof config === 'object') {
        let opY = 300;
        Object.entries(config).forEach(([op, ruleExpr]) => {
          const opId = `op-${collection}-${op}`;
          
          if (typeof ruleExpr === 'object') {
             newNodes.push({
                id: opId,
                data: { label: op },
                position: { x: colX, y: opY },
                className: 'bg-purple-50 border-2 border-purple-200 rounded-lg p-3 font-semibold text-sm text-purple-700',
             });
             newEdges.push({ id: `e-${colId}-${opId}`, source: colId, target: opId, style: { stroke: '#a855f7' } });
             
             let subOpY = opY + 120;
             Object.entries(ruleExpr).forEach(([subOp, expr]) => {
                const subId = `sub-${collection}-${op}-${subOp}`;
                const exprPreview = typeof expr === 'string' 
                  ? (expr.length > 40 ? expr.slice(0, 40) + '...' : expr)
                  : 'Complex Expression';
                newNodes.push({
                  id: subId,
                  data: { label: `${subOp}: ${exprPreview}` },
                  position: { x: colX - 50, y: subOpY },
                  className: 'bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-mono max-w-[250px]',
                });
                newEdges.push({ id: `e-${opId}-${subId}`, source: opId, target: subId });
                subOpY += 80;
             });
             opY = subOpY + 50;
          } else {
             const exprPreview = typeof ruleExpr === "string"
               ? (ruleExpr.length > 40 ? ruleExpr.slice(0, 40) + '...' : ruleExpr)
               : String(ruleExpr);
             newNodes.push({
                id: opId,
                data: { label: `${op}: ${exprPreview}` },
                position: { x: colX, y: opY },
                className: 'bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-mono max-w-[250px]',
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
    setStatus(null);
    try {
      const parsedRules = JSON.parse(editedRules);
      await adminApi.updateSecurityRules(parsedRules);
      setRules(parsedRules);
      setStatus({ success: true, message: 'Security rules deployed successfully' });
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      setStatus({ success: false, message: `Syntax error: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (rules) {
      setEditedRules(JSON.stringify(rules, null, 2));
      setStatus({ success: true, message: 'Reset to last saved version' });
      setTimeout(() => setStatus(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600">Loading security rules...</p>
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
            <div className="p-2 bg-purple-600 rounded-xl">
              <LockKeyhole size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Security Console</span>
                <Chip size="sm" variant="flat" color="success" className="text-[10px] font-semibold">
                  v4.0
                </Chip>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-green-600" />
                  <span className="text-xs text-gray-600">Access Control Active</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-600">Rules Engine Online</span>
                </div>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Rules Engine</h1>
          <p className="text-gray-600">Define and manage fine-grained access control policies for your application.</p>
        </div>

        {/* Status Message */}
        {status && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
            status.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {status.success ? (
              <CheckCircle2 size={18} className="text-green-600 mt-0.5" />
            ) : (
              <XCircle size={18} className="text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${status.success ? 'text-green-800' : 'text-red-800'}`}>
                {status.success ? 'Success' : 'Error'}
              </p>
              <p className={`text-sm ${status.success ? 'text-green-700' : 'text-red-700'}`}>
                {status.message}
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Panel - Info */}
          <div className="lg:col-span-3 space-y-4">
            {/* Info Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={16} className="text-blue-600" />
                <h3 className="font-semibold text-gray-900">Active Policies</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Rules are evaluated in real-time for every authenticated request to ensure proper access control.
              </p>
              <div className="flex flex-wrap gap-2">
                <Chip size="sm" variant="flat" className="bg-blue-50 text-blue-700 text-xs">.read</Chip>
                <Chip size="sm" variant="flat" className="bg-blue-50 text-blue-700 text-xs">.write</Chip>
                <Chip size="sm" variant="flat" className="bg-blue-50 text-blue-700 text-xs">.validate</Chip>
                <Chip size="sm" variant="flat" className="bg-blue-50 text-blue-700 text-xs">.index</Chip>
              </div>
            </div>

            {/* Warning Card */}
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-amber-600" />
                <h3 className="font-semibold text-amber-900">Important Notice</h3>
              </div>
              <p className="text-sm text-amber-800">
                Changes take effect immediately across all nodes. Incorrect rules may break application functionality.
              </p>
            </div>

            {/* Pattern Card */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Terminal size={16} className="text-gray-600" />
                <h3 className="font-semibold text-gray-900">Rule Pattern</h3>
              </div>
              <code className="block bg-white p-3 rounded-lg text-xs font-mono text-gray-700 border border-gray-200 mb-3">
                {"auth.uid === resource.owner_id"}
              </code>
              <p className="text-xs text-gray-500">Ownership validation pattern</p>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <Network size={16} className="text-blue-600 mx-auto mb-1" />
                  <p className="text-[10px] font-medium text-gray-500 uppercase">Collections</p>
                  <p className="text-xl font-bold text-gray-900">{rules ? Object.keys(rules).length : 0}</p>
                </div>
                <div className="text-center">
                  <Zap size={16} className="text-amber-600 mx-auto mb-1" />
                  <p className="text-[10px] font-medium text-gray-500 uppercase">Active Rules</p>
                  <p className="text-xl font-bold text-amber-600">Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Editor */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              
              {/* Action Bar */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Code size={14} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Rule Editor</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip content="Reset to last saved">
                    <Button
                      size="sm"
                      variant="flat"
                      className="bg-white border border-gray-200 text-gray-700"
                      onPress={handleReset}
                      isDisabled={saving}
                    >
                      <RotateCcw size={14} />
                      <span className="ml-1 text-xs">Reset</span>
                    </Button>
                  </Tooltip>
                  <Tooltip content="Deploy changes">
                    <Button
                      size="sm"
                      color="primary"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onPress={handleSave}
                      isLoading={saving}
                    >
                      <Save size={14} />
                      <span className="ml-1 text-xs">{saving ? 'Deploying...' : 'Deploy'}</span>
                    </Button>
                  </Tooltip>
                </div>
              </div>

              {/* Tabs */}
              <Tabs 
                aria-label="Editor modes" 
                variant="underlined"
                color="primary"
                classNames={{
                  tabList: "gap-6 px-6 pt-4 border-b border-gray-200",
                  tab: "h-10",
                  tabContent: "group-data-[selected=true]:text-blue-600 text-gray-600 text-sm font-medium"
                }}
              >
                <Tab 
                  key="editor" 
                  title={
                    <div className="flex items-center gap-2">
                      <FileJson size={14} />
                      <span>Editor</span>
                    </div>
                  }
                >
                  <div className="p-6">
                    <textarea
                      className="w-full h-[500px] p-4 font-mono text-sm bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none text-gray-900"
                      value={editedRules}
                      onChange={(e) => setEditedRules(e.target.value)}
                      placeholder="Enter security rules in JSON format..."
                      spellCheck={false}
                    />
                    <div className="mt-3 flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        JSON format required • {editedRules.length} characters
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-xs text-gray-500">Live editing</span>
                      </div>
                    </div>
                  </div>
                </Tab>
                
                <Tab 
                  key="flow" 
                  title={
                    <div className="flex items-center gap-2">
                      <Workflow size={14} />
                      <span>Visualizer</span>
                    </div>
                  }
                >
                  <div className="h-[500px] w-full relative">
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      fitView
                      className="bg-gray-50 rounded-lg"
                    >
                      <Background color="#e5e7eb" gap={20} />
                      <Controls className="bg-white border border-gray-200 rounded-lg shadow-sm" />
                    </ReactFlow>
                    
                    <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm">
                      <p className="text-[10px] font-medium text-gray-600">Rule Dependency Graph</p>
                    </div>
                  </div>
                </Tab>

                <Tab 
                  key="preview" 
                  title={
                    <div className="flex items-center gap-2">
                      <Eye size={14} />
                      <span>Preview</span>
                    </div>
                  }
                >
                  <div className="p-6">
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-auto max-h-[500px]">
                      <pre className="p-4 font-mono text-sm text-gray-700 whitespace-pre-wrap">
                        <code>{rules ? JSON.stringify(rules, null, 2) : 'No rules loaded'}</code>
                      </pre>
                    </div>
                    <p className="mt-3 text-xs text-gray-500 text-center">
                      Current active security rules configuration
                    </p>
                  </div>
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityRules;