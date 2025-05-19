import { ChevronDown, LogOut, Menu, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationDropdown } from "./NotificationDropdown";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function Header({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const role = localStorage.getItem("role");
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");
  const email = localStorage.getItem("email");
  const username = localStorage.getItem("username");
  const userImage = localStorage.getItem("userImage");
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("role");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("email");
    navigate("/login");
  };
  const handleGotoProfile = () => {
    navigate("/settings");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200 dark:border-gray-800 h-16">
      <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Section - Sidebar Toggle and Branding */}
        <div className="flex items-center gap-4">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

        </div>

        {/* Right Section - Notifications and User Menu */}
        <div className="flex items-center gap-4">
          {!isMobile && <NotificationDropdown />}

          {/* User Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/default.png" alt="User Avatar" />
                   {userImage ? (
              <img 
                src={userImage} 
                alt="User avatar" 
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-coursera-blue text-white flex items-center justify-center font-bold">
                {username?.charAt(0) || 'A'}
              </div>
            )}
                </Avatar>
                {!isMobile && (
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {firstName || "Admin"}
                    </span>
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-56" 
              align="end" 
              sideOffset={8}
            >
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {firstName} {lastName}
                </p>
                <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                  {email}
                </p>
              </div>
              <DropdownMenuItem className="cursor-pointer" onClick={handleGotoProfile}>
                <User className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-700 dark:text-gray-300">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Logout Button */}
          {isMobile && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Log out</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </header>
  );
}