"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  Button,
  Checkbox,
  Link,
  Divider,
  Input,
} from "@heroui/react";
import {
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Globe,
  Zap,
  Mail,
  ShieldAlert,
  Activity,
  User as UserIcon
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const result = await login(identifier, password);
      if (!result.success) {
        setError(result.message || "Authentication failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-primary/10 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background selection:bg-primary/30">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-purple-500/10 rounded-full blur-[80px]" />
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="w-full max-w-[1200px] px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Left Side: Brand & Features */}
        <div className="hidden lg:flex flex-col space-y-10 animate-in fade-in slide-in-from-left-12 duration-1000">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-2xl shadow-primary/30 animate-float">
              <Terminal size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-foreground italic">
                Things<span className="text-primary not-italic">NXT</span>
              </h1>
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Infrastructure OS</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-6xl font-black leading-[1.05] tracking-tighter text-foreground italic">
              Universal <br />
              <span className="text-gradient not-italic">Mesh Control.</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-md font-medium">
              The neural center for your entire IoT infrastructure. Secure, deterministic, and exponentially faster.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-4">
            {[
              { icon: ShieldCheck, title: "Quantum-Safe", desc: "Military grade crypto" },
              { icon: Globe, title: "Edge Mesh", desc: "Global distributed sync" },
              { icon: Zap, title: "Zero Latency", desc: "Sub-ms execution" },
              { icon: Activity, title: "Live Insights", desc: "Real-time telemetry" },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-[2rem] bg-muted/30 border border-border/50 hover:bg-muted/50 transition-all duration-500 group">
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                  <feature.icon size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm tracking-tight">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground font-medium">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex justify-center animate-in fade-in slide-in-from-right-12 duration-1000">
          <div className="w-full max-w-[460px] relative">
            {/* Form Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-[3rem] blur-2xl opacity-50" />
            
            <Card className="glass-card border-none rounded-[3rem] overflow-hidden shadow-[0_32px_128px_-12px_rgba(0,0,0,0.2)]">
              <CardBody className="p-10 sm:p-12">
                <div className="lg:hidden flex justify-center mb-10">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg">
                      <Terminal size={24} />
                    </div>
                    <span className="text-3xl font-black text-foreground tracking-tight italic">ThingsNXT</span>
                  </div>
                </div>

                <div className="mb-10 text-center lg:text-left">
                  <h1 className="text-3xl font-black text-foreground mb-3 tracking-tight italic">Terminal<span className="text-primary not-italic">_Init</span></h1>
                  <p className="text-muted-foreground font-semibold text-[15px]">Establish primitive authorization to access the workspace.</p>
                </div>

                {error && (
                  <div className="mb-8 p-5 rounded-[1.5rem] bg-danger/10 border border-danger/20 flex gap-4 items-center animate-in slide-in-from-top-2">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-danger/10 flex items-center justify-center">
                      <ShieldAlert className="text-danger" size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-danger uppercase tracking-widest mb-0.5">Access Denied</h4>
                      <p className="text-[13px] text-danger/90 font-bold leading-tight">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    isRequired
                    label="Primitive Identity"
                    labelPlacement="outside"
                    placeholder="Admin ID or Email"
                    type="text"
                    variant="bordered"
                    autoComplete="username"
                    value={identifier}
                    onValueChange={setIdentifier}
                    startContent={<UserIcon className="text-muted-foreground mb-0.5" size={20} />}
                    isInvalid={!!error}
                    classNames={{
                      label: "font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground mb-2 ml-1",
                      input: "font-bold text-base",
                      inputWrapper: "h-[4.5rem] px-6 border-2 hover:border-primary/50 focus-within:!border-primary rounded-2xl transition-all duration-300",
                    }}
                  />

                  <Input
                    isRequired
                    label="Quantum Security Key"
                    labelPlacement="outside"
                    placeholder="••••••••••••"
                    type={isVisible ? "text" : "password"}
                    variant="bordered"
                    autoComplete="current-password"
                    value={password}
                    onValueChange={setPassword}
                    startContent={<Lock className="text-muted-foreground mb-0.5" size={20} />}
                    isInvalid={!!error}
                    errorMessage={error}
                    endContent={
                      <button className="focus:outline-none p-2 rounded-xl hover:bg-muted transition-colors" type="button" onClick={toggleVisibility}>
                        {isVisible ? (
                          <EyeOff className="text-muted-foreground" size={20} />
                        ) : (
                          <Eye className="text-muted-foreground" size={20} />
                        )}
                      </button>
                    }
                    classNames={{
                      label: "font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground mb-2 ml-1",
                      input: "font-bold text-base",
                      inputWrapper: "h-[4.5rem] px-6 border-2 hover:border-primary/50 focus-within:!border-primary rounded-2xl transition-all duration-300",
                    }}
                  />

                  <div className="flex items-center justify-between pb-2 px-1">
                    <Checkbox 
                      size="sm" 
                      classNames={{
                        label: "text-[11px] font-black uppercase tracking-widest text-muted-foreground",
                        wrapper: "rounded-lg border-2",
                      }}
                    >
                      Persistent
                    </Checkbox>
                    <Link href="#" className="text-[11px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-opacity">
                      Recovery_01
                    </Link>
                  </div>

                  <Button
                    fullWidth
                    color="primary"
                    size="lg"
                    type="submit"
                    isLoading={isSubmitting}
                    className="h-[4.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                    endContent={!isSubmitting && <ArrowRight size={20} strokeWidth={3} />}
                  >
                    Authorize Session
                  </Button>
                </form>

                <div className="mt-12 flex items-center gap-6">
                  <Divider className="flex-1 opacity-50" />
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Live Secure Mode</span>
                  </div>
                  <Divider className="flex-1 opacity-50" />
                </div>
              </CardBody>
            </Card>
            
            {/* Version Badge */}
            <div className="mt-8 text-center">
              <p className="text-[10px] text-muted-foreground/50 font-black uppercase tracking-[0.4em]">
                &copy; 2024 ThingsNXT Architecture · v2.4.0-Stable
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
