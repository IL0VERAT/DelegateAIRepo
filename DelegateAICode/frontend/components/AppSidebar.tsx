/**
 * APP SIDEBAR - WITH EXTRA PROMINENT HEADER TEXT
 * ===============================================
 * 
 * Enhanced header layout with extra prominent, professionally styled title:
 * - Full-width logo spanning entire sidebar width
 * - "Delegate AI" header text with maximum prominence and impact
 * - Header text positioned higher with reduced spacing for better hierarchy
 * - Enhanced typography with 22px size, increased weight, and subtle effects
 * - Demo mode badge removed from sidebar for cleaner appearance
 * - Admin badge retained for important role indication
 * - Rectangular styling with rounded-lg corners maintained
 * - Professional branding presentation with maximum visual impact
 */

import { useState } from 'react';
import { useApp } from './AppContext';
import { useAuth } from './AuthContext';
import type { CurrentView } from './AppContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator
} from './ui/sidebar';
import { 
  MessageSquare, 
  Mic, 
  Globe,
  FileText, 
  Settings, 
  HelpCircle,
  Shield,
  Crown,
  Database,
  BarChart3,
  Users,
  Terminal,
  Activity,
  AlertTriangle,
  LogOut,
  User,
  ChevronDown,
  ExternalLink,
  Target
} from 'lucide-react';
import  config  from '../config/environment';

// Import the logo image --> FIX LATER
//import projectDelegateLogo from 'figma:asset/4f2992a59b773cf322400bb3e2ac13b4f63fe517.png';

interface MenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  view: CurrentView;
  badge?: string;
  description?: string;
  adminOnly?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
  adminOnly?: boolean;
}

export function AppSidebar() {
  const { currentView, setCurrentView } = useApp();
  const { isAuthenticated, user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN' || user?.email === 'your-admin-email@domain.com'; // Replace with your email

  // Define menu sections with admin access
  const menuSections: MenuSection[] = [
    {
      title: "Main Features",
      items: [
        {
          title: "Chat",
          icon: MessageSquare,
          view: "chat",
          description: "Text conversations with AI"
        },
        {
          title: "Voice",
          icon: Mic,
          view: "voice",
          description: "Voice-to-voice conversations"
        },
        {
          title: "Campaigns",
          icon: Globe,
          view: "campaigns",
          description: "Model UN diplomatic simulations"
        },
        {
          title: "Transcripts",
          icon: FileText,
          view: "transcripts",
          description: "Conversation history"
        }
      ]
    },
    {
      title: "Configuration",
      items: [
        {
          title: "Settings",
          icon: Settings,
          view: "settings",
          description: "App configuration"
        },
        {
          title: "Help",
          icon: HelpCircle,
          view: "help",
          description: "Documentation & support"
        }
      ]
    },
    // Admin-only section
    {
      title: "Administration",
      adminOnly: true,
      items: [
        {
          title: "Admin Console",
          icon: Shield,
          view: "admin",
          badge: "ADMIN",
          description: "System management dashboard",
          adminOnly: true
        },
        {
          title: "User Management",
          icon: Users,
          view: "admin-users",
          description: "Manage user accounts",
          adminOnly: true
        },
        {
          title: "Campaign Management",
          icon: Target,
          view: "admin-campaigns",
          description: "Manage Model UN campaigns",
          adminOnly: true
        },
        {
          title: "System Monitor",
          icon: Activity,
          view: "admin-monitor",
          description: "Performance metrics",
          adminOnly: true
        },
        {
          title: "Security Center",
          icon: AlertTriangle,
          view: "admin-security",
          description: "Security monitoring",
          adminOnly: true
        },
        {
          title: "Analytics",
          icon: BarChart3,
          view: "admin-analytics",
          description: "Usage analytics",
          adminOnly: true
        },
        {
          title: "Database",
          icon: Database,
          view: "admin-database",
          description: "Database management",
          adminOnly: true
        },
        {
          title: "System Logs",
          icon: Terminal,
          view: "admin-logs",
          description: "Application logs",
          adminOnly: true
        }
      ]
    }
  ];

  // Filter sections based on admin access
  const visibleSections = menuSections.filter(section => {
    if (section.adminOnly && !isAdmin) return false;
    return true;
  });

  const handleMenuClick = (view: CurrentView) => {
    setCurrentView(view);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentView('chat'); // Redirect to chat after logout
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setShowUserMenu(false);
  };

  const getMenuItemClasses = (view: string, isActive: boolean) => {
    const baseClasses = "sidebar-nav-button w-full justify-start gap-3 h-10 px-3 rounded-md transition-all duration-200";
    if (isActive) {
      return `${baseClasses} sidebar-nav-button-active bg-sidebar-accent text-sidebar-accent-foreground font-medium`;
    }
    return `${baseClasses} hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground`;
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4 pb-2">
        {/* FULL-WIDTH RECTANGULAR LOGO SECTION AT TOP */}
        <div className="mb-1">
          <div className="flex items-center justify-center w-full">
            <div className="relative group w-full">
              {/* Subtle background accent with rectangular shape - full width */}
              <div className="absolute inset-0 bg-brand-blue/5 rounded-lg blur-sm scale-105 group-hover:bg-brand-blue/8 transition-all duration-300"></div>
              
              {/* Full-width rectangular logo container with elegant styling */}
              <div className="relative flex items-center justify-center p-2.5 bg-white/3 backdrop-blur-sm rounded-lg border border-brand-blue/10 hover:border-brand-blue/20 transition-all duration-300 hover:scale-102 cursor-pointer shadow-sm hover:shadow-md w-full">
                <img 
                  //src={projectDelegateLogo} --> FIX HERE!!
                  alt="Project Delegate Logo"
                  className="w-full h-10 object-contain rounded-lg transition-all duration-300 group-hover:scale-105"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(91, 155, 213, 0.15)) contrast(1.02) saturate(1.05)',
                  }}
                />
              </div>
              
              {/* Very subtle glow effect with rectangular shape - full width */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-brand-blue/3 via-transparent to-brand-blue-light/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>
          </div>
          
          {/* Subtle branding text - centered, positioned higher */}
          <div className="flex items-center justify-center mt-1">
            <span className="text-xs text-muted-foreground/50 tracking-wide">
              AI ASSISTANT PLATFORM
            </span>
          </div>
        </div>

        {/* ENHANCED HEADER WITH EXTRA PROMINENT CENTERED TITLE */}
        <div className="header-clean-container">
          
          {/* Row 1: Extra Prominent Centered Title Text - positioned higher */}
          <div className="header-title-only-row">
            <div className="header-title-container-clean flex justify-center">
              <h1 className="header-title-text-extra-prominent">
                <span className="title-main-extra-prominent">Delegate</span>
                <span className="title-accent-extra-prominent">AI</span>
              </h1>
            </div>
          </div>
          
          {/* Row 2: Status Badges (Admin only - Demo mode badge removed) */}
          {isAdmin && (
            <div className="header-status-row justify-center">
              {/* Admin Badge - Only shown when user is admin */}
              <div className="admin-badge-subtle">
                <Crown className="admin-crown-subtle" />
                <span className="admin-text-subtle">Admin</span>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 pt-2">
        {visibleSections.map((section, sectionIndex) => (
          <SidebarGroup key={sectionIndex}>
            <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground">
              {section.title}
              {section.adminOnly && (
                <Shield className="w-3 h-3 ml-2 inline-block" />
              )}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items
                  .filter(item => !item.adminOnly || isAdmin)
                  .map((item, itemIndex) => (
                    <SidebarMenuItem key={itemIndex}>
                      <SidebarMenuButton 
                        className={getMenuItemClasses(item.view, currentView === item.view)}
                        onClick={() => handleMenuClick(item.view)}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1 truncate">{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            {item.badge}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Admin Quick Stats - Only visible to admins */}
        {isAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground">
                Quick Stats
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <Card className="mx-2 mb-2">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Active Users</span>
                      <span className="font-medium">127</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">API Calls/hr</span>
                      <span className="font-medium">1.2k</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">System Load</span>
                      <span className="font-medium text-green-600">Normal</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2 h-8 text-xs"
                      onClick={() => handleMenuClick('admin')}
                    >
                      <Activity className="w-3 h-3 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        {isAuthenticated && user ? (
          <div className="space-y-2">
            {/* User Profile Section */}
            <Card>
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">
                      {user.name || user.email?.split('@')[0]}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground truncate flex-1">
                        {user.email}
                      </p>
                      {isAdmin && (
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 flex-shrink-0"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
                
                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className="mt-3 pt-3 border-t space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-8 text-xs"
                      onClick={() => {
                        handleMenuClick('settings');
                        setShowUserMenu(false);
                      }}
                    >
                      <Settings className="w-3 h-3 mr-2" />
                      Settings
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-8 text-xs"
                        onClick={() => {
                          handleMenuClick('admin');
                          setShowUserMenu(false);
                        }}
                      >
                        <Shield className="w-3 h-3 mr-2" />
                        Admin Console
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-3 h-3 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Demo Mode Indicator */}
            {config.ENABLE_MOCK_DATA && (
              <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Demo Mode Active
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        No authentication required
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          // Not authenticated state
          <Card>
            <CardContent className="p-3">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  {config.ENABLE_MOCK_DATA ? 'Demo Mode - No sign in required' : 'Please sign in to continue'}
                </p>
                {!config.ENABLE_MOCK_DATA && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs"
                    onClick={() => handleMenuClick('chat')} // This will trigger login flow
                  >
                    <User className="w-3 h-3 mr-2" />
                    Sign In
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
