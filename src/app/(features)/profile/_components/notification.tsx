"use client";

import { Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Notification() {
  return (
    <Card className="border-border/50">
      <CardContent className="py-12 text-center">
        <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-2">No notifications</p>
        <p className="text-sm text-muted-foreground/80">
          Notifications will appear here when available.
        </p>
      </CardContent>
    </Card>
  );
}
