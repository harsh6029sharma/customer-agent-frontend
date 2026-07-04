"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

interface Analytics {
  totalTickets: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/tickets/analytics");
      setAnalytics(res.data.data); // ← ApiResponse wrapper ki wajah se ".data.data"
    } catch (err: any) {
      toast.error(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const renderBreakdown = (
    title: string,
    data: Record<string, number> | undefined,
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {!data || Object.entries(data).length === 0 ? (
          <p className="text-sm text-muted-foreground">No data</p>
        ) : (
          Object.entries(data).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground">{key}</span>
              <span className="font-medium text-foreground">{value}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Welcome, {user?.name ?? "User"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Here's an overview of your tickets
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/tickets">
              <Button variant="outline">My Tickets</Button>
            </Link>
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : !analytics ? (
          <p className="text-muted-foreground">No analytics available.</p>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-foreground">
                  {analytics.totalTickets}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderBreakdown("By Category", analytics.byCategory)}
              {renderBreakdown("By Priority", analytics.byPriority)}
              {renderBreakdown("By Status", analytics.byStatus)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
