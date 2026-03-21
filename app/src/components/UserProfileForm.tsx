"use client";

import { UserProfile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

interface UserProfileFormProps {
  profile: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
  errors?: Record<string, string>;
}

export function UserProfileForm({ profile, onUpdate, errors }: UserProfileFormProps) {
  return (
    <Card className="border-primary/10 bg-gradient-to-br from-card to-primary/[0.02]">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </div>
          <CardTitle className="text-lg font-semibold">Personal Details</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={profile.fullName}
              onChange={(e) => onUpdate({ fullName: e.target.value })}
              className={errors?.fullName ? "border-destructive" : ""}
            />
            {errors?.fullName && (
              <p className="text-xs text-destructive">{errors.fullName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">Address</Label>
            <Input
              id="address"
              placeholder="Enter your address"
              value={profile.address}
              onChange={(e) => onUpdate({ address: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="certificateDate" className="text-sm font-medium">Certificate Date</Label>
            <Input
              id="certificateDate"
              type="date"
              value={profile.certificateDate}
              onChange={(e) => onUpdate({ certificateDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="asOnDate" className="text-sm font-medium">
              As On Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="asOnDate"
              type="date"
              value={profile.asOnDate}
              onChange={(e) => onUpdate({ asOnDate: e.target.value })}
              className={errors?.asOnDate ? "border-destructive" : ""}
            />
            {errors?.asOnDate && (
              <p className="text-xs text-destructive">{errors.asOnDate}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
