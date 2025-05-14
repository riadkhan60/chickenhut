// app/layout.tsx
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/Dashboard/app-sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <main className="w-full">
        <div className="flex items-center justify-between py-2">
          <SidebarTrigger  />
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
