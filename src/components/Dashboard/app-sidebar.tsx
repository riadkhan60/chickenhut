'use client';

import * as React from 'react';
import { BookOpen, Map, PieChart, Settings, SquareTerminal } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { NavMain } from '@/components/Dashboard/nav-main';
import { NavUser } from '@/components/Dashboard/nav-user';
import { TeamSwitcher } from '@/components/Dashboard/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations('dashboard');
  const navMain = [
    {
      title: t('billing'),
      url: '/dashboard/create-bill',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: t('createBill'),
          url: '/dashboard/create-bill',
        },
        {
          title: t('billingHistory'),
          url: '/dashboard/billing-history',
        },
      ],
    },
    {
      title: t('menuItem'),
      url: '/dashboard/add-item',
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: t('addItem'),
          url: '/dashboard/add-item',
        },
        {
          title: t('itemList'),
          url: '/dashboard/item-list',
        },
      ],
    },
    {
      title: t('restrurent'),
      url: '/dashboard/restrurent',
      icon: Map,
      isActive: true,
      items: [
        {
          title: t('tableList'),
          url: '/dashboard/table-list',
        },
        {
          title: t('billingHistory'),
          url: '/dashboard/billing-history',
        },
      ],
    },
    {
      title: t('statement'),
      url: '/dashboard/statement',
      icon: PieChart,
      isActive: true,
    },
    {
      title: t('settings'),
      url: '/dashboard/settings',
      icon: Settings,
      isActive: true,
    },
  ];
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
