import {
  Clock,
  History,
  FileText,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Clock,
      },
      {
        title: "Bulk Jobs",
        url: "/dashboard/bulk-jobs",
        icon: FileText,
      },
      {
        title: "Verification History",
        url: "/dashboard/verification-history",
        icon: History,
      },
    ],
  },
];
