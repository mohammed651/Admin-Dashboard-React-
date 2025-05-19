import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Book,
  Users,
  ChartBar,
  Settings,
  Bell,
  Menu,
  X,
  BarChart2,
  BookOpen,
  DollarSign,
  UserCog,
  ListTree,
  GraduationCap,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationDropdown } from "./NotificationDropdown";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Courses", href: "/courses", icon: Book },
  { name: "Instructors", href: "/instructors", icon: GraduationCap },
  { name: "Categories", href: "/categories", icon: ListTree },
  { name: "Users", href: "/users", icon: UserCog },
  { name: "Success Stories", href: "/SuccessStory", icon: BookOpen },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Revenue", href: "/revenue", icon: DollarSign },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({ isMobileOpen, onClose }: { isMobileOpen?: boolean, onClose?: () => void }) {
  const [expanded, setExpanded] = useState(true);
  const isMobile = useIsMobile();
  const [userData, setUserData] = useState({
    email: '',
    username: '',
    userImage: ''
  });

  useEffect(() => {
    if (isMobile) {
      setExpanded(false);
    }
    
    // Load user data from localStorage
    const email = localStorage.getItem("email") || '';
    const username = localStorage.getItem("username") || '';
    const userImage = localStorage.getItem("userImage") || '';
    
    setUserData({ email, username, userImage });
  }, [isMobile]);

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen transition-all duration-300 flex flex-col fixed lg:relative z-50",
        expanded ? "w-64" : "w-20",
        isMobile && !isMobileOpen ? "hidden" : "block",
        isMobile ? "left-0 top-0" : ""
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800 gap-1">
        <div className="flex items-center">
          {expanded && (
            <img src="/download.svg" alt="coursera logo" className="w-20 h-20 rounded-full" />
          )}
          {!expanded && <div className="w-8 h-8 rounded-full bg-coursera-blue text-white flex items-center justify-center font-bold">C</div>}
        </div>
        <button
          onClick={() => {
            if (isMobile) {
              onClose?.();
            } else {
              setExpanded(!expanded);
            }
          }}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
        >
          {expanded || isMobile ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className="flex-1 overflow-auto py-4 scrollbar-hide">
        <nav className="flex flex-col px-2 space-y-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => isMobile && onClose?.()}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-coursera-blue-bg text-coursera-blue"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                  expanded ? "justify-start" : "justify-center"
                )
              }
            >
              <item.icon className={cn("flex-shrink-0 w-6 h-6", expanded ? "mr-3" : "")} />
              {expanded && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User profile section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className={cn("flex items-center", expanded ? "justify-between" : "justify-center")}>
          <div className="flex items-center space-x-3">
            {userData.userImage ? (
              <img 
                src={userData.userImage} 
                alt="User avatar" 
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-coursera-blue text-white flex items-center justify-center font-bold">
                {userData.username?.charAt(0) || 'A'}
              </div>
            )}
          </div>
          {expanded && (
            <div className="flex-1 ml-3 overflow-hidden">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                {userData.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {userData.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}