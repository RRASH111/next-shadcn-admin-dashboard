"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { 
  CircleUser, 
  Mail, 
  Calendar, 
  Shield, 
  Key, 
  Building2, 
  Users, 
  CreditCard,
  Settings,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInitials } from "@/lib/utils";

interface UserStats {
  totalVerifications: number;
  creditsUsed: number;
  creditsRemaining: number;
  memberSince: string;
  lastActive: string;
}

export default function AccountPage() {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      // Mock data - replace with actual API call
      setUserStats({
        totalVerifications: 1247,
        creditsUsed: 1247,
        creditsRemaining: 4999,
        memberSince: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown",
        lastActive: new Date().toLocaleDateString(),
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProfile = () => {
    openUserProfile();
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <CircleUser className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Account Settings</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <CircleUser className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Account Settings</h1>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CircleUser className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.imageUrl || undefined} alt={user?.fullName || ""} />
                  <AvatarFallback className="text-lg">
                    {getInitials(user?.fullName || user?.emailAddresses[0]?.emailAddress || "User")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{user?.fullName || "User"}</h3>
                  <p className="text-muted-foreground">{user?.emailAddresses[0]?.emailAddress}</p>
                  <Badge variant="secondary">
                    {user?.emailAddresses[0]?.verification?.status === "verified" ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={user?.firstName || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={user?.lastName || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={user?.username || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={user?.emailAddresses[0]?.emailAddress || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  To update your profile information, please use the{" "}
                  <Button variant="link" className="p-0 h-auto" onClick={handleOpenProfile}>
                    Clerk User Profile
                  </Button>{" "}
                  interface.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Account Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Account Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{userStats?.totalVerifications.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Verifications</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{userStats?.creditsUsed.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Credits Used</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{userStats?.creditsRemaining.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Credits Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{userStats?.memberSince}</div>
                  <div className="text-sm text-muted-foreground">Member Since</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-muted-foreground">Last updated: {formatDate(new Date())}</p>
                  </div>
                  <Button variant="outline" onClick={handleOpenProfile}>
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Not Enabled</Badge>
                    <Button variant="outline" onClick={handleOpenProfile}>
                      <Settings className="h-4 w-4 mr-2" />
                      Setup 2FA
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Verification</h4>
                    <p className="text-sm text-muted-foreground">
                      Status: {user?.emailAddresses[0]?.verification?.status === "verified" ? "Verified" : "Unverified"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {user?.emailAddresses[0]?.verification?.status === "verified" ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Security settings are managed through Clerk. Use the{" "}
                  <Button variant="link" className="p-0 h-auto" onClick={handleOpenProfile}>
                    User Profile
                  </Button>{" "}
                  to update your security preferences.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Active Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <div>
                      <div className="font-medium">Current Session</div>
                      <div className="text-sm text-muted-foreground">
                        Chrome on Windows • {new Date().toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organization Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Personal Organization</h3>
                  <p className="text-sm text-muted-foreground">Owner</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Organization Name</Label>
                  <Input value="Personal Organization" disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Organization Slug</Label>
                  <Input value="personal-org" disabled className="bg-muted" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">1 Member</span>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Organization management features will be available in a future update.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{userStats?.creditsRemaining.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Credits Remaining</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{userStats?.creditsUsed.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Credits Used</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Quick Actions</h4>
                <div className="flex gap-2">
                  <Button onClick={() => window.location.href = '/dashboard/topup'}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Add Credits
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/dashboard/billing'}>
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Billing
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}