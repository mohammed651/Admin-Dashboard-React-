import { useState, useEffect } from "react";
import { Bell, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSocket } from "@/hooks/use-socket";
import { useAppDispatch, useAppSelector } from "@/hooks/use-AppDispatch";
import { fetchNotifications, markAllNotificationsAsRead, markNotificationAsRead, receiveNotification } from "@/store/slices/notificationSlice";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector(state => state.notifications);
  const socket = useSocket();

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (!socket) return;

    socket.on("newNotification", (notification) => {
      dispatch(receiveNotification(notification));
    });

    return () => {
      socket.off("newNotification");
    };
  }, [socket, dispatch]);

  const handleMarkAsRead = (id: string) => {
    dispatch(markNotificationAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  return (
    <div className="relative">
      {/* زر الجرس مع عداد */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        aria-label="Toggle Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-0 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-red-600 text-white text-xs font-semibold animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* قائمة الإشعارات المنسدلة */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[350px] max-h-[500px] overflow-y-auto bg-white rounded-lg shadow-lg border z-50 p-3">
          {/* رأس القائمة */}
          <div className="flex justify-between items-center pb-3 mb-2 border-b border-gray-200">
            <h5 className="m-0 text-base font-semibold text-gray-900">Notifications</h5>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="text-xs text-blue-600 rounded px-2 py-1 hover:bg-blue-100 disabled:text-gray-400 disabled:hover:bg-transparent"
              >
                Mark all as read
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close Notifications"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* محتوى الإشعارات */}
          <div>
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
            ) : (
              <ul>
                {notifications.map(notification => (
                  <li
                    key={notification._id}
                    className={cn(
                      "flex justify-between items-start p-3 mb-2 rounded-md transition-all duration-200 cursor-pointer hover:bg-blue-50",
                      !notification.isRead && "bg-gray-100 border-l-4 border-blue-600"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <h6 className="mb-1 text-sm font-semibold text-gray-900 truncate">{notification.title}</h6>
                      <p className="mb-1 text-sm text-gray-700 truncate">{notification.message}</p>
                      <small className="text-xs text-gray-400">{new Date(notification.createdAt).toLocaleString()}</small>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="ml-3 text-blue-600 hover:text-blue-800 rounded px-2 py-1 text-xs"
                        aria-label="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
