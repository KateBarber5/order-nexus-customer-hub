import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { FileSearch, History, User, Menu, X, LayoutDashboard, LogOut, Settings, CreditCard, Map, MapPin } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const mainNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Place New Order', path: '/orders', icon: <FileSearch className="h-5 w-5" /> },
    { name: 'Order History', path: '/history', icon: <History className="h-5 w-5" /> },
    { name: 'Florida Map', path: '/florida-map', icon: <Map className="h-5 w-5" /> },
    { name: 'Counties & Cities', path: '/counties-cities', icon: <MapPin className="h-5 w-5" /> },
    { name: 'Subscriptions', path: '/subscriptions', icon: <CreditCard className="h-5 w-5" /> },
    { name: 'Admin', path: '/admin', icon: <Settings className="h-5 w-5" /> },
  ];

  const handleLogout = () => {
    // Here you would typically implement logout logic
    console.log('Logging out');
    // For example: redirect to login page
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <img src="/lovable-uploads/f4f5a45d-725c-449d-a9ed-aae40a746a0f.png" alt="Logo" className="h-10" />
              </Link>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {mainNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                    isActive(item.path)
                      ? "border-primary text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  )}
                >
                  {item.icon}
                  <span className="ml-1">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden sm:flex sm:items-center">
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(
                "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                isActive('/profile')
                  ? "border-primary text-gray-900"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              )}>
                <User className="h-5 w-5" />
                <span className="ml-1">Profile</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Edit Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="bg-white p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 text-base font-medium",
                  isActive(item.path)
                    ? "bg-primary-50 border-l-4 border-primary text-primary"
                    : "border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </Link>
            ))}
            
            {/* Profile items in mobile menu */}
            <Link
              to="/profile"
              className={cn(
                "flex items-center px-3 py-2 text-base font-medium",
                isActive("/profile")
                  ? "bg-primary-50 border-l-4 border-primary text-primary"
                  : "border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="h-5 w-5" />
              <span className="ml-2">Edit Profile</span>
            </Link>
            
            <button
              className="flex w-full items-center px-3 py-2 text-base font-medium border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-2">Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
