
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Route, 
  FileText, 
  AlertTriangle, 
  ChevronDown,
  Upload
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'Clientes', url: '/clients', icon: Users },
  { title: 'Rotas', url: '/routes', icon: Route },
  { title: 'Ordens de Serviço', url: '/service-orders', icon: FileText },
  { title: 'Ocorrências', url: '/incidents', icon: AlertTriangle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className={isCollapsed ? 'w-14' : 'w-60'} collapsible>
      <SidebarContent>
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  RouteAssist
                </h2>
                <p className="text-xs text-muted-foreground">OS</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} className="flex items-center space-x-2">
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
