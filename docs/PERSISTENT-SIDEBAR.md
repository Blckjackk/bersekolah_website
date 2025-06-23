# Persistent Sidebar Implementation Guide

This documentation explains how to use the persistent sidebar state implementation in the Bersekolah project.

## Overview

The sidebar state (open/closed) now persists across page navigation. When the sidebar is opened or closed, it will stay in that state even when the user navigates to a different page.

## Features

- Sidebar state persists across page navigation
- State is stored in localStorage for persistence across page refreshes
- Context API is used for global state management
- Works for both Admin and Beswan sidebars

## Files Added

1. `src/contexts/SidebarContext.tsx` - The main Context API implementation
2. `src/component/shared/sidebar-toggle.tsx` - A reusable toggle button component
3. `src/component/shared/app-layout.tsx` - Wrapper component that provides the SidebarContext
4. `src/styles/sidebar.css` - Custom styles for sidebar persistence
5. `src/component/shared/dashboard-layout.tsx` - Example implementation for dashboard

## How to Use

### 1. Wrap your application with the SidebarProvider

Make sure your main layout or page component is wrapped with the `AppLayout` component:

```tsx
import { AppLayout } from '@/component/shared/app-layout';

export default function YourPage() {
  return (
    <AppLayout>
      {/* Your page content here */}
    </AppLayout>
  );
}
```

### 2. Use the AppSidebar components

The Admin and Beswan sidebar components have been updated to use the SidebarContext:

```tsx
// Example: Admin dashboard with sidebar
import { AppSidebar } from '@/component/admin/app-sidebar';
import { DashboardLayout } from '@/component/shared/dashboard-layout';

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="flex h-screen">
        <AppSidebar />
        <main className="flex-1">
          {/* Dashboard content */}
        </main>
      </div>
    </DashboardLayout>
  );
}
```

### 3. Use the SidebarToggle component

Add the SidebarToggle component to your header or navbar:

```tsx
import { SidebarToggle } from '@/component/shared/sidebar-toggle';

export function Header() {
  return (
    <header className="flex items-center p-4 border-b">
      <SidebarToggle />
      <h1 className="ml-4">Dashboard</h1>
    </header>
  );
}
```

### 4. Using the SidebarContext directly (advanced)

If you need more control over the sidebar state, you can use the `useSidebar` hook:

```tsx
import { useSidebar } from '@/contexts/SidebarContext';

export function CustomComponent() {
  const { isOpen, toggle, open, close } = useSidebar();
  
  return (
    <div>
      <p>Sidebar is {isOpen ? 'open' : 'closed'}</p>
      <button onClick={toggle}>Toggle Sidebar</button>
      <button onClick={open}>Open Sidebar</button>
      <button onClick={close}>Close Sidebar</button>
    </div>
  );
}
```

## Importing Styles

Make sure to import the sidebar styles in your main CSS file:

```css
@import '../styles/sidebar.css';
```

Or add this line to your main layout component:

```tsx
import '@/styles/sidebar.css';
```

## Troubleshooting

If the sidebar state is not persisting:

1. Check if localStorage is accessible (private browsing mode might block it)
2. Ensure the SidebarProvider is wrapping your entire application
3. Verify that the correct CSS classes are being applied
