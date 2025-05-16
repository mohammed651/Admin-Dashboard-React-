import { useState } from "react";
import { Search, Bell, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("role");
    navigate("/login"); // أو "/signin" حسب الراوت عندك
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16">
      <div className="h-full flex items-center justify-end px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="relative p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-coursera-blue dark:text-gray-400 dark:hover:text-white"
          >
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
          </button>

          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-coursera-blue flex items-center justify-center text-white font-medium">
              A
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
              {role}
            </span>

            {/* زر تسجيل الخروج */}
            <button
              onClick={handleLogout}
              className="flex items-center text-sm text-gray-500 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5 mr-1" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
