/**
 * ADMIN CONSOLE - ENHANCED WITH CAMPAIGN MANAGEMENT
 * =================================================
 * 
 * Updated admin console to include comprehensive campaign management
 * alongside existing admin features.
 */

import React, { useState, useEffect } from 'react';
import {
  Users, Monitor, Shield, BarChart3, Database, Terminal, Target,
  Activity, Settings, Bell, Download, Upload, RefreshCw, AlertTriangle,
  CheckCircle, TrendingUp, Calendar, Clock, Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useApp } from './AppContext';
import AdminCampaignManager from './AdminCampaignManager';

// ============================================================================
// ADMIN CONSOLE COMPONENT
// ============================================================================

export function AdminConsole() {
  const { currentView } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  // Set active tab based on current view
  useEffect(() => {
    switch (currentView) {
      case 'admin':
        setActiveTab('overview');
        break;
      case 'admin-users':
        setActiveTab('users');
        break;
      case 'admin-monitor':
        setActiveTab('monitor');
        break;
      case 'admin-security':
        setActiveTab('security');
        break;
      case 'admin-analytics':
        setActiveTab('analytics');
        break;
      case 'admin-database':
        setActiveTab('database');
        break;
      case 'admin-logs':
        setActiveTab('logs');
        break;
      case 'admin-campaigns':
        setActiveTab('campaigns');
        break;
      default:
        setActiveTab('overview');
    }
  }, [currentView]);

  // Mock data for demo
  const systemStats = {
    totalUsers: 1247,
    activeUsers: 89,
    totalSessions: 2456,
    averageSessionDuration: 12.3,
    errorRate: 0.02,
    uptime: 99.97,
    responseTime: 145,
    cpuUsage: 34,
    memoryUsage: 67,
    diskUsage: 23
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Currently online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.uptime}%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.responseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Average API response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>CPU</span>
                <span>{systemStats.cpuUsage}%</span>
              </div>
              <Progress value={systemStats.cpuUsage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Memory</span>
                <span>{systemStats.memoryUsage}%</span>
              </div>
              <Progress value={systemStats.memoryUsage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Disk</span>
                <span>{systemStats.diskUsage}%</span>
              </div>
              <Progress value={systemStats.diskUsage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: '2 minutes ago', event: 'New user registration', status: 'success' },
              { time: '5 minutes ago', event: 'Campaign session completed', status: 'info' },
              { time: '12 minutes ago', event: 'System backup completed', status: 'success' },
              { time: '1 hour ago', event: 'Database optimization completed', status: 'info' },
              { time: '2 hours ago', event: 'Security scan completed', status: 'success' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-500' : 
                    activity.status === 'info' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-sm">{activity.event}</span>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPlaceholder = (title: string, description: string, icon: React.ReactNode) => (
    <Card>
      <CardContent className="pt-6 text-center">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">{title}</h3>
        <p className="text-gray-500 mb-4">{description}</p>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Configure
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Console</h1>
        <p className="text-gray-600">Monitor and manage your Delegate AI system</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Monitor
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Database
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          <AdminCampaignManager />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          {renderPlaceholder(
            'User Management',
            'Manage user accounts, permissions, and access controls',
            <Users className="w-8 h-8 text-gray-400" />
          )}
        </TabsContent>

        <TabsContent value="monitor" className="mt-6">
          {renderPlaceholder(
            'System Monitoring',
            'Real-time system performance monitoring and alerts',
            <Activity className="w-8 h-8 text-gray-400" />
          )}
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          {renderPlaceholder(
            'Security Center',
            'Security settings, access logs, and threat monitoring',
            <Shield className="w-8 h-8 text-gray-400" />
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          {renderPlaceholder(
            'Analytics Dashboard',
            'User behavior analytics and system usage statistics',
            <BarChart3 className="w-8 h-8 text-gray-400" />
          )}
        </TabsContent>

        <TabsContent value="database" className="mt-6">
          {renderPlaceholder(
            'Database Management',
            'Database operations, backups, and maintenance tools',
            <Database className="w-8 h-8 text-gray-400" />
          )}
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          {renderPlaceholder(
            'System Logs',
            'Application logs, error tracking, and debugging tools',
            <Terminal className="w-8 h-8 text-gray-400" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminConsole;