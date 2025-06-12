import {
  LayoutDashboard,
  FileText,
  Database,
  Cpu,
  Shield,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  Settings,
  ClipboardList,
  Plus,
  Target,
  Activity,
  Zap,
  Brain,
  Upload,
  Play
} from "lucide-react";

import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "Overview",
  },
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    description: "System overview and analytics"
  },
  
  {
    navlabel: true,
    subheader: "Asset Management",
  },
  {
    id: uniqueId(),
    title: "Add New Asset",
    icon: Plus,
    href: "/classification/asset-form",
    description: "Register new assets"
  },
  {
    id: uniqueId(),
    title: "Asset Inventory",
    icon: Database,
    href: "/classification/assets",
    description: "View and manage assets"
  },
  {
    id: uniqueId(),
    title: "Asset Classification",
    icon: Cpu,
    href: "/classification/asset-classify",
    description: "Classify asset importance"
  },
  {
    id: uniqueId(),
    title: "Asset Assessment",
    icon: Target,
    href: "/classification/asset-assessment",
    description: "Evaluate asset security"
  },
  
  {
    navlabel: true,
    subheader: "Risk Management",
  },
  {
    id: uniqueId(),
    title: "Risk Identification",
    icon: Shield,
    href: "/classification/risk-identification",
    description: "Identify potential risks"
  },
  {
    id: uniqueId(),
    title: "Risk Analysis",
    icon: TrendingUp,
    href: "/classification/risk-analysis",
    description: "Analyze risk impact"
  },
  {
    id: uniqueId(),
    title: "Risk Treatment",
    icon: ShieldCheck,
    href: "/classification/risk-handling",
    description: "Manage risk responses"
  },
  {
    id: uniqueId(),
    title: "Classification Report",
    icon: FileText,
    href: "/classification/asset-report",
    description: "Comprehensive reports"
  },
  
  {
    navlabel: true,
    subheader: "Machine Learning",
  },
  {
    id: uniqueId(),
    title: "ML Training & Testing",
    icon: Brain,
    href: "/ml-training",
    description: "Train and test ML models"
  },
  
  {
    navlabel: true,
    subheader: "Analytics",
  },
  {
    id: uniqueId(),
    title: "Performance Metrics",
    icon: Activity,
    href: "/classification/model-metrics",
    description: "Model performance data"
  },
  
  {
    navlabel: true,
    subheader: "Configuration",
  },
  {
    id: uniqueId(),
    title: "Assessment Settings",
    icon: Settings,
    href: "/settings/asset-assessment",
    description: "Configure assessments"
  },
  {
    id: uniqueId(),
    title: "Question Builder",
    icon: ClipboardList,
    href: "/settings/assessment-form",
    description: "Create assessment questions"
  },
];

export default Menuitems;
