import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const srcDir = path.join(root, "..", "iotadminconsole", "src", "pages");
const outDir = path.join(root, "src", "components", "pages");

const map = [
  ["MissionControl.jsx", "mission-control.tsx"],
  ["Dashboard.jsx", "analytics-dashboard.tsx"],
  ["UserManagement.jsx", "user-management.tsx"],
  ["UserDetail.jsx", "user-detail.tsx"],
  ["DeviceManagement.jsx", "device-management.tsx"],
  ["SecurityRules.jsx", "security-rules.tsx"],
  ["Broadcast.jsx", "broadcast.tsx"],
  ["ActivityLogs.jsx", "activity-logs.tsx"],
  ["PlatformSettings.jsx", "platform-settings.tsx"],
  ["EmailCenter.jsx", "email-center.tsx"],
  ["SystemHealth.jsx", "system-health.tsx"],
  ["Login.jsx", "login-page.tsx"],
];

function common(code) {
  code = `"use client";\n\n` + code;
  code = code.replaceAll("from '../services/api'", "from '@/lib/api'");
  code = code.replaceAll("from '../contexts/AuthContext'", "from '@/contexts/auth-context'");
  code = code.replaceAll(
    "from '../components/ui/EliteCard'",
    "from '@/components/ui/elite-card'"
  );
  code = code.replaceAll("{ EliteCard }", "{ EliteCard, EliteStatCard }");
  // elite-card exports EliteStatCard - ensure UserManagement imports both - Dashboard uses EliteStatCard from EliteCard - original: import { EliteCard, EliteStatCard } from '../components/ui/EliteCard'
  // MissionControl only EliteCard - adding EliteStatCard to import is wrong for MissionControl
  code = code.replace(
    /import \{ EliteCard, EliteStatCard \} from '@\/components\/ui\/elite-card'/g,
    "import { EliteCard } from '@/components/ui/elite-card'"
  );
  // Fix double: first common added EliteStatCard to all - revert for files that only need EliteCard
  const onlyEliteCard = [
    "mission-control.tsx",
    "device-management.tsx",
    "security-rules.tsx",
    "broadcast.tsx",
    "activity-logs.tsx",
    "platform-settings.tsx",
    "email-center.tsx",
    "system-health.tsx",
    "login-page.tsx",
    "user-management.tsx",
    "user-detail.tsx",
  ];
  return { code, onlyEliteCard };
}

fs.mkdirSync(outDir, { recursive: true });

for (const [from, to] of map) {
  let code = fs.readFileSync(path.join(srcDir, from), "utf8");
  const { onlyEliteCard } = common("");
  let out = `"use client";\n\n` + code;
  out = out.replaceAll("from '../services/api'", "from '@/lib/api'");
  out = out.replaceAll("from '../contexts/AuthContext'", "from '@/contexts/auth-context'");
  out = out.replaceAll(
    "from '../components/ui/EliteCard'",
    "from '@/components/ui/elite-card'"
  );

  if (to === "analytics-dashboard.tsx") {
    out = out.replace(
      "import { EliteCard } from '@/components/ui/elite-card'",
      "import { EliteCard, EliteStatCard } from '@/components/ui/elite-card'"
    );
  }

  out = out.replace(
    "import { useNavigate } from 'react-router-dom';\n",
    "import { useRouter } from 'next/navigation';\n"
  );
  out = out.replace(/\bconst navigate = useNavigate\(\);/g, "const router = useRouter();");
  out = out.replace(/\bnavigate\(/g, "router.push(");

  out = out.replace(
    "import { useParams, useNavigate } from 'react-router-dom';\n",
    "import { useParams, useRouter } from 'next/navigation';\n"
  );
  out = out.replace(
    /const \{ id \} = useParams\(\);/g,
    "const params = useParams();\n  const id = params.id as string;"
  );
  out = out.replace(/\bconst navigate = useRouter\(\);/g, "const router = useRouter();");

  out = out.replace(
    "import { useNavigate, Navigate } from 'react-router-dom';\n",
    "import { useRouter } from 'next/navigation';\n"
  );
  out = out.replace(
    /\/\/ If already logged in, redirect to dashboard\n  if \(user\) \{\n    return <Navigate to="\/" replace \/>;\n  \}/g,
    `// Redirect handled after mount\n  const router = useRouter();\n  React.useEffect(() => {\n    if (user) router.replace("/");\n  }, [user, router]);\n  if (user) return null;`
  );

  // Login page - need React import for useEffect - Login already imports React
  // Simpler: replace if (user) block with useEffect redirect
  if (to === "login-page.tsx") {
    out = out.replace(
      "import { useRouter } from 'next/navigation';\n",
      ""
    );
    out = out.replace(
      "  const { login, user } = useAuth();\n  const navigate = useNavigate();",
      "  const { login, user } = useAuth();\n  const router = useRouter();"
    );
    out = out.replace(
      "  // If already logged in, redirect to dashboard\n  if (user) {\n    return <Navigate to=\"/\" replace />;\n  }\n",
      ""
    );
    out = out.replace(
      "import { useRouter } from 'next/navigation';\n",
      "import { useRouter } from 'next/navigation';\nimport { useEffect } from 'react';\n"
    );
    // Fix duplicate - let me read login file after and fix manually

    out = out.replace("navigate('/');", "router.replace('/');");
  }

  out = out.replace(
    "import { Link } from 'react-router-dom';\n",
    "import Link from 'next/link';\n"
  );
  out = out.replace(/<Link to=/g, "<Link href=");

  out = out.replace(
    "import { EliteCard } from '@/components/ui/elite-card'",
    "import { EliteCard, EliteStatCard } from '@/components/ui/elite-card'"
  );
  if (onlyEliteCard.includes(to) && to !== "analytics-dashboard.tsx") {
    out = out.replace(
      "import { EliteCard, EliteStatCard } from '@/components/ui/elite-card'",
      "import { EliteCard } from '@/components/ui/elite-card'"
    );
  }
  if (to === "analytics-dashboard.tsx") {
    // already EliteStatCard
  }

  fs.writeFileSync(path.join(outDir, to), out);
  console.log("Wrote", to);
}
