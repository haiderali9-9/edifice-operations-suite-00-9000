
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Building, 
  CalendarDays,
  Users,
  PackageOpen,
  Receipt,
  FileText,
  AlertTriangle,
  Settings,
  BarChart3
} from 'lucide-react';

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { 
    title: "Dashboard", 
    href: "/", 
    icon: <LayoutDashboard className="h-5 w-5" />
  },
  { 
    title: "Projects", 
    href: "/projects", 
    icon: <Building className="h-5 w-5" /> 
  },
  { 
    title: "Schedule", 
    href: "/schedule", 
    icon: <CalendarDays className="h-5 w-5" /> 
  },
  { 
    title: "Resources", 
    href: "/resources", 
    icon: <PackageOpen className="h-5 w-5" /> 
  },
  { 
    title: "Team", 
    href: "/team", 
    icon: <Users className="h-5 w-5" /> 
  },
  { 
    title: "Finances", 
    href: "/finances", 
    icon: <Receipt className="h-5 w-5" /> 
  },
  { 
    title: "Reports", 
    href: "/reports", 
    icon: <BarChart3 className="h-5 w-5" /> 
  },
  { 
    title: "Documents", 
    href: "/documents", 
    icon: <FileText className="h-5 w-5" /> 
  },
  { 
    title: "Issues", 
    href: "/issues", 
    icon: <AlertTriangle className="h-5 w-5" /> 
  },
  { 
    title: "Settings", 
    href: "/settings", 
    icon: <Settings className="h-5 w-5" /> 
  }
];

const Sidebar = () => {
  const { pathname } = useLocation();

  return (
    <aside className="bg-white dark:bg-gray-800 border-r min-h-screen w-64 flex flex-col">
      <div className="p-4 border-b">
        <Link to="/" className="flex items-center gap-2">
          <Building className="h-8 w-8 text-construction-700" />
          <div>
            <h1 className="font-bold text-xl tracking-tight text-construction-700">Edifice</h1>
            <p className="text-xs text-gray-500">Construction Management</p>
          </div>
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
              pathname === item.href ? 
                "bg-construction-600 text-white" : 
                "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            )}
          >
            {item.icon}
            {item.title}
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t mt-auto">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-construction-100 flex items-center justify-center text-construction-700 font-medium">
            JS
          </div>
          <div>
            <p className="text-sm font-medium">John Smith</p>
            <p className="text-xs text-gray-500">Project Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
