"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { CreditCard, RefreshCw, Loader2 } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
import { Logo } from "@/components/logo";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

interface CreditsData {
  credits: number;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const [credits, setCredits] = useState<CreditsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/credits/balance');
      if (response.ok) {
        const data = await response.json();
        setCredits(data);
      } else {
        console.error('Failed to fetch credits');
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCredits();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  const handleAddCredits = () => {
    router.push("/dashboard/topup");
  };

  return (
    <Sidebar {...props} className="h-screen">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Logo size={24} className="size-6 flex-shrink-0" />
                <span className="text-base font-semibold">ZenVerifier</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col">
        <NavMain items={sidebarItems} />
        
        <div className="mt-auto px-2 py-4">
          <div className="rounded-lg border bg-card p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Credits Balance</span>
              </div>
              <button 
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Available for verification</p>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <>
                    <span className="text-3xl font-bold">
                      {credits ? credits.credits.toLocaleString() : '0'}
                    </span>
                    <span className="text-xs text-muted-foreground">credits remaining</span>
                  </>
                )}
              </div>
              <Button size="sm" className="w-full" variant="default" onClick={handleAddCredits}>
                + Add Credits
              </Button>
            </div>
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
