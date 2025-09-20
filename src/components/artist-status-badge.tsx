
"use client";

import { CheckCircle, ShieldAlert, Clock } from "lucide-react";
import type { ArtistVerificationStatus } from "@/lib/types";

interface ArtistStatusBadgeProps {
  status: ArtistVerificationStatus;
}

export function ArtistStatusBadge({ status }: ArtistStatusBadgeProps) {
  if (status === 'verified') {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="h-5 w-5" />
        <span className="font-semibold">Verified</span>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="flex items-center gap-2 text-amber-600">
        <Clock className="h-5 w-5" />
        <span className="font-semibold">Pending</span>
      </div>
    );
  }

  if (status === 'flagged') {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <ShieldAlert className="h-5 w-5" />
        <span className="font-semibold">Flagged</span>
      </div>
    );
  }

  return null;
}
