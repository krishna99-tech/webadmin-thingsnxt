"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Input,
  Button,
  Checkbox,
  Link,
} from "@heroui/react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Lock,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Activity,
  Radio,
  Cpu,
  Eye,
  EyeOff,
  LogIn,
} from "lucide-react";

const fieldClassNames = {
  label:
    "text-default-800 dark:text-default-100 font-semibold text-sm font-heading pb-0",
  mainWrapper: "gap-2",
  base: "w-full",
  input: "text-[16px] placeholder:text-default-400",
  innerWrapper: "gap-3",
  inputWrapper:
    "h-14 px-4 bg-default-100/80 dark:bg-default-50/10 shadow-none " +
    "border-2 border-default-200/90 dark:border-default-100/15 " +
    "data-[hover=true]:border-default-300 dark:data-[hover=true]:border-default-100/30 " +
    "group-data-[focus=true]:border-primary group-data-[focus=true]:shadow-[0_0_0_3px_hsl(var(--primary)/0.18)] " +
    "rounded-xl transition-[border-color,box-shadow] duration-200",
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await login(username, password);
      if (result.success) {
        router.replace("/");
      } else {
        setError(result.message || "Invalid username or password.");
      }
    } catch {
      setError("Could not reach the server. Check your connection and API URL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-root min-h-screen w-full flex flex-col lg:flex-row bg-default-100 dark:bg-[hsl(222_47%_4%)] selection:bg-primary/20">
      <aside className="relative lg:w-[46%] xl:w-[44%] min-h-[280px] lg:min-h-screen flex flex-col justify-between px-8 py-14 lg:px-16 lg:py-20 text-white overflow-hidden shadow-[20px_0_60px_-15px_rgba(0,0,0,0.1)]">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-indigo-900"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.2),transparent_40%)]" aria-hidden />

        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-4 mb-16 group cursor-default">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-white/20 ring-1 ring-white/30 shadow-2xl backdrop-blur-md transition-all duration-500 group-hover:rotate-12 group-hover:scale-110">
              <Cpu className="h-7 w-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tighter font-heading italic">Things<span className="text-white/80 not-italic font-medium">NXT</span></p>
              <p className="text-[10px] text-white/60 font-black tracking-[0.3em] uppercase">
                Enterprise Terminal
              </p>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl xl:text-[3.25rem] font-black font-heading tracking-tighter leading-[1.05] text-white italic">
            Command your <span className="text-white/80 not-italic">IoT Ecosystem.</span>
          </h1>
          <p className="mt-8 text-lg text-white/70 leading-relaxed max-w-md font-medium">
            Unified orchestration for devices, identities, and mission-critical platform parameters.
          </p>

          <ul className="mt-16 space-y-6 hidden sm:block">
            {[
              { icon: Activity, text: "Real-time telemetry and mission overview" },
              { icon: Radio, text: "MQTT infrastructure and pulse monitoring" },
              { icon: ShieldCheck, text: "Granular access control and audit registries" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-5 text-base text-white/85 font-semibold tracking-tight group">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 transition-all group-hover:bg-white/20 group-hover:scale-105">
                  <Icon className="h-5 w-5" strokeWidth={2.5} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-8 mt-12">
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
              © {new Date().getFullYear()} ThingsNXT · Platform Authorization Required
            </p>
        </div>
      </aside>

      <main className="relative flex-1 flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-16 xl:px-24 bg-[hsl(210_25%_98%)] dark:bg-[hsl(222_47%_6%)] min-h-[70vh] lg:min-h-screen">
        <div className="w-full max-w-[460px] mx-auto">
          <div className="mb-12 lg:mb-14 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6 mx-auto lg:mx-0">
               <ShieldCheck size={14} className="animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.14em]">Secure Auth Portal</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-heading text-default-900 dark:text-default-50 tracking-tighter italic">
              Terminal<span className="text-primary not-italic">_Access</span>
            </h2>
            <p className="mt-4 text-[15px] text-default-500 dark:text-default-400 font-medium leading-relaxed">
              Identify yourself to initialize the administrative environment. <br className="hidden sm:block"/> Sessions are cryptographically logged for audit.
            </p>
          </div>

          <Card
            shadow="none"
            classNames={{
              base:
                "border-none bg-content1/70 dark:bg-content1/40 backdrop-blur-2xl " +
                "shadow-[0_32px_128px_-12px_rgba(0,0,0,0.12)] dark:shadow-[0_32px_128px_-12px_rgba(0,0,0,0.6)] " +
                "rounded-[2.5rem] overflow-hidden p-2",
              body: "p-8 sm:p-10 gap-0",
            }}
          >
            <CardBody>
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <Input
                  label="Identity"
                  labelPlacement="outside"
                  placeholder="Username or email"
                  type="text"
                  autoComplete="username"
                  variant="flat"
                  radius="2xl"
                  size="lg"
                  value={username}
                  onValueChange={setUsername}
                  startContent={
                    <div className="p-2 rounded-xl bg-default-200/50 dark:bg-default-100/10 mr-1">
                        <UserIcon
                          className="text-primary w-4 h-4 shrink-0 pointer-events-none"
                          strokeWidth={3}
                        />
                    </div>
                  }
                  classNames={{
                      ...fieldClassNames,
                      inputWrapper: "h-16 px-5 bg-default-100/40 dark:bg-default-100/10 border-2 border-divider/50 data-[hover=true]:border-primary/50 focus-within:!border-primary rounded-[1.25rem] transition-all",
                      label: "font-black uppercase text-[10px] tracking-widest text-default-400 mb-2 ml-1",
                      input: "text-base font-bold tracking-tight"
                  }}
                  isRequired
                />

                <div className="flex flex-col gap-1.5">
                  <Input
                    label="Authentication"
                    labelPlacement="outside"
                    placeholder="Private access key"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    variant="flat"
                    radius="2xl"
                    size="lg"
                    value={password}
                    onValueChange={setPassword}
                    startContent={
                      <div className="p-2 rounded-xl bg-default-200/50 dark:bg-default-100/10 mr-1">
                          <Lock
                            className="text-primary w-4 h-4 shrink-0 pointer-events-none"
                            strokeWidth={3}
                          />
                      </div>
                    }
                    endContent={
                      <button
                        type="button"
                        className="flex items-center justify-center p-2.5 rounded-xl text-default-400 hover:text-primary hover:bg-primary/10 outline-none transition-colors"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" strokeWidth={2.5} />
                        ) : (
                          <Eye className="w-5 h-5" strokeWidth={2.5} />
                        )}
                      </button>
                    }
                    classNames={{
                        ...fieldClassNames,
                        inputWrapper: "h-16 px-5 bg-default-100/40 dark:bg-default-100/10 border-2 border-divider/50 data-[hover=true]:border-primary/50 focus-within:!border-primary rounded-[1.25rem] transition-all",
                        label: "font-black uppercase text-[10px] tracking-widest text-default-400 mb-2 ml-1",
                        input: "text-base font-bold tracking-tight"
                    }}
                    isRequired
                  />
                  <div className="flex items-center justify-between px-2 py-1">
                    <Checkbox
                      size="sm"
                      radius="md"
                      isSelected={remember}
                      onValueChange={setRemember}
                      classNames={{
                        base: "m-0 items-center gap-2",
                        label: "text-[10px] text-default-600 dark:text-default-400 font-black uppercase tracking-[0.1em]",
                      }}
                    >
                      Remember session
                    </Checkbox>
                    <Link
                      href="#"
                      className="text-[10px] text-primary font-black uppercase tracking-widest hover:opacity-80 transition-opacity"
                      onClick={(e) => e.preventDefault()}
                    >
                      Recovery Protocol
                    </Link>
                  </div>
                </div>

                {error ? (
                  <div
                    className="rounded-[1.5rem] border-2 border-danger/20 bg-danger/5 px-5 py-4 flex gap-4 items-center animate-in fade-in slide-in-from-top-2"
                    role="alert"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/10">
                      <ShieldAlert className="h-5 w-5 text-danger" strokeWidth={2.5} />
                    </div>
                    <p className="text-sm text-danger font-bold leading-tight">
                      {error}
                    </p>
                  </div>
                ) : null}

                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  radius="2xl"
                  className="w-full h-16 text-sm font-black uppercase tracking-[0.2em] rounded-[1.25rem] shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all"
                  startContent={
                    !loading ? <ShieldCheck className="h-5 w-5" strokeWidth={3} /> : undefined
                  }
                  endContent={
                    !loading ? <ArrowRight className="h-5 w-5" strokeWidth={3} /> : undefined
                  }
                  isLoading={loading}
                >
                  {loading ? "Authorizing..." : "Authorize Access"}
                </Button>
              </form>
            </CardBody>
          </Card>

          <div className="mt-10 p-5 rounded-2xl bg-default-100/50 dark:bg-default-100/5 border border-divider/40 text-center flex items-center justify-center gap-4 group">
            <Activity size={16} className="text-primary group-hover:scale-125 transition-transform" />
            <p className="text-[10px] font-black text-default-400 uppercase tracking-[0.3em]">
              API_UPLINK: <span className="text-primary font-mono tracking-normal ml-2">AUTHENTICATED_SECURE_CHANNEL</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
