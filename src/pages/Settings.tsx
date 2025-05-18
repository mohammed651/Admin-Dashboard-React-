import { useState } from "react";
import {
  Check,
  Save,
  Settings as SettingsIcon,
  User,
  Lock,
  Bell,
  Palette,
  Menu,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";
import { changePassword } from "@/store/slices/userSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/use-AppDispatch";
import { updateOwnUser } from "@/store/slices/userSlice";

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const isMobile = useIsMobile();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
 const [fullName, setFullName] = useState(localStorage.getItem("firstName") || "");
const [lastName, setLastName] = useState(localStorage.getItem("lastName") || "");
const [email, setEmail] = useState(localStorage.getItem("email") || "");
const [bio, setBio] = useState(localStorage.getItem("bio") || "");
const [phone, setPhone] = useState(localStorage.getItem("phone") || "");
const [location, setLocation] = useState(localStorage.getItem("location") || "");
const [gender, setGender] = useState(localStorage.getItem("gender") || "");
const [dob, setDob] = useState(localStorage.getItem("dob") || "")

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "Error", description: "All fields are required." });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match." });
      return;
    }

    setLoading(true);

    try {
      const message = await dispatch(
        changePassword({ oldpass: currentPassword, newpass: newPassword })
      ).unwrap();

      toast({ title: "Success", description: message });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({ title: "Error", description: error });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (section: string) => {
    toast({
      title: "Settings saved",
      description: `Your ${section} settings have been updated successfully.`,
    });
  };
 const handleAccountSave = async () => {
  const updatedFields: any = {};

  if (fullName !== localStorage.getItem("firstName")) {
    updatedFields.firstName = fullName;
    localStorage.setItem("firstName", fullName);
  }
  if (lastName !== localStorage.getItem("lastName")) {
    updatedFields.lastName = lastName;
    localStorage.setItem("lastName", lastName);
  }
  if (email !== localStorage.getItem("email")) {
    updatedFields.email = email;
    localStorage.setItem("email", email);
  }
  if (phone !== localStorage.getItem("phone")) {
    updatedFields.phone = phone;
    localStorage.setItem("phone", phone);
  }
  if (location !== localStorage.getItem("location")) {
    updatedFields.location = location;
    localStorage.setItem("location", location);
  }
  if (gender !== localStorage.getItem("gender")) {
    updatedFields.gender = gender;
    localStorage.setItem("gender", gender);
  }
  if (dob !== localStorage.getItem("dob")) {
    updatedFields.dob = dob;
    localStorage.setItem("dob", dob);
  }

  if (Object.keys(updatedFields).length === 0) {
    toast({
      title: "No changes",
      description: "You haven't changed any fields.",
    });
    return;
  }

  try {
    await dispatch(updateOwnUser(updatedFields)).unwrap();
    toast({ title: "Success", description: "Profile updated successfully" });
  } catch (error: any) {
    toast({
      title: "Error",
      description: error || "Failed to update profile",
    });
  }
};

  return (
    <DashboardLayout>
      <div className="space-y-6 p-2 sm:p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList
            className={`w-full ${
              isMobile ? "flex overflow-x-auto pb-2 gap-1" : "inline-flex gap-2"
            }`}
          >
            <TabsTrigger
              value="account"
              className={`flex items-center justify-center ${
                isMobile ? "px-3 py-2 text-sm flex-shrink-0" : "px-4 py-2"
              }`}
            >
              <User
                size={isMobile ? 14 : 16}
                className={isMobile ? "mr-1" : "mr-2"}
              />
              {!isMobile && "Account"}
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className={`flex items-center justify-center ${
                isMobile ? "px-3 py-2 text-sm flex-shrink-0" : "px-4 py-2"
              }`}
            >
              <Lock
                size={isMobile ? 14 : 16}
                className={isMobile ? "mr-1" : "mr-2"}
              />
              {!isMobile && "Security"}
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className={`flex items-center justify-center ${
                isMobile ? "px-3 py-2 text-sm flex-shrink-0" : "px-4 py-2"
              }`}
            >
              <Bell
                size={isMobile ? 14 : 16}
                className={isMobile ? "mr-1" : "mr-2"}
              />
              {!isMobile && "Notifications"}
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className={`flex items-center justify-center ${
                isMobile ? "px-3 py-2 text-sm flex-shrink-0" : "px-4 py-2"
              }`}
            >
              <Palette
                size={isMobile ? 14 : 16}
                className={isMobile ? "mr-1" : "mr-2"}
              />
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
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="First Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Input
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleAccountSave}
                    className="gap-2 w-full sm:w-auto"
                  >
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
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handlePasswordChange}
                    className="gap-2 w-full sm:w-auto"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 mr-2"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4l5-5-5-5v4a12 12 0 100 24v-4a8 8 0 01-8-8z"
                          />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} /> Update Password
                      </>
                    )}
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
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch id="email-notif" defaultChecked={true} />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notif">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications in the app
                      </p>
                    </div>
                    <Switch id="push-notif" defaultChecked={true} />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketing-notif">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about new features
                      </p>
                    </div>
                    <Switch id="marketing-notif" defaultChecked={false} />
                  </div>
                  <Button
                    onClick={() => handleSave("notification")}
                    className="gap-2 w-full sm:w-auto"
                  >
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
                      <p className="text-sm text-muted-foreground">
                        Enable dark mode for the interface
                      </p>
                    </div>
                    <Switch id="dark-mode" defaultChecked={false} />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="compact-mode">Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Use a more compact layout
                      </p>
                    </div>
                    <Switch id="compact-mode" defaultChecked={false} />
                  </div>
                  <Button
                    onClick={() => handleSave("appearance")}
                    className="gap-2 w-full sm:w-auto"
                  >
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
