import { useState } from "react";
import { Check, Save, Settings as SettingsIcon, User, Lock, Bell, Palette, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const isMobile = useIsMobile();
  
  const handleSave = (section: string) => {
    toast({
      title: "Settings saved",
      description: `Your ${section} settings have been updated successfully.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-2 sm:p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`w-full ${isMobile ? 'flex overflow-x-auto pb-2 gap-1' : 'inline-flex gap-2'}`}>
    <TabsTrigger 
      value="account" 
      className={`flex items-center justify-center ${isMobile ? 'px-3 py-2 text-sm flex-shrink-0' : 'px-4 py-2'}`}
    >
      <User size={isMobile ? 14 : 16} className={isMobile ? "mr-1" : "mr-2"} />
      {!isMobile && "Account"}
    </TabsTrigger>
    <TabsTrigger 
      value="security" 
      className={`flex items-center justify-center ${isMobile ? 'px-3 py-2 text-sm flex-shrink-0' : 'px-4 py-2'}`}
    >
      <Lock size={isMobile ? 14 : 16} className={isMobile ? "mr-1" : "mr-2"} />
      {!isMobile && "Security"}
    </TabsTrigger>
    <TabsTrigger 
      value="notifications" 
      className={`flex items-center justify-center ${isMobile ? 'px-3 py-2 text-sm flex-shrink-0' : 'px-4 py-2'}`}
    >
      <Bell size={isMobile ? 14 : 16} className={isMobile ? "mr-1" : "mr-2"} />
      {!isMobile && "Notifications"}
    </TabsTrigger>
    <TabsTrigger 
      value="appearance" 
      className={`flex items-center justify-center ${isMobile ? 'px-3 py-2 text-sm flex-shrink-0' : 'px-4 py-2'}`}
    >
      <Palette size={isMobile ? 14 : 16} className={isMobile ? "mr-1" : "mr-2"} />
      {!isMobile && "Appearance"}
    </TabsTrigger>
  </TabsList>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={20} /> Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="John Doe" defaultValue="Admin User" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="john@example.com" defaultValue="admin@learnify.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input id="bio" placeholder="Tell us about yourself" defaultValue="Administrator for the Learnify platform" />
                  </div>
                  <Button onClick={() => handleSave("account")} className="gap-2 w-full sm:w-auto">
                    <Save size={16} /> Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock size={20} /> Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                  <Button onClick={() => handleSave("security")} className="gap-2 w-full sm:w-auto">
                    <Save size={16} /> Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell size={20} /> Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notif">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch id="email-notif" defaultChecked={true} />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notif">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications in the app</p>
                    </div>
                    <Switch id="push-notif" defaultChecked={true} />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketing-notif">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">Receive emails about new features</p>
                    </div>
                    <Switch id="marketing-notif" defaultChecked={false} />
                  </div>
                  <Button onClick={() => handleSave("notification")} className="gap-2 w-full sm:w-auto">
                    <Save size={16} /> Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette size={20} /> Appearance Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="dark-mode">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">Enable dark mode for the interface</p>
                    </div>
                    <Switch id="dark-mode" defaultChecked={false} />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="compact-mode">Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">Use a more compact layout</p>
                    </div>
                    <Switch id="compact-mode" defaultChecked={false} />
                  </div>
                  <Button onClick={() => handleSave("appearance")} className="gap-2 w-full sm:w-auto">
                    <Save size={16} /> Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}