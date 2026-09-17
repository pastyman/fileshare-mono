import { ReactNode } from 'react';

interface InstanceLayoutProps {
  children: ReactNode;
}

export default function InstanceLayout({ children }: InstanceLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Instance-level navigation could go here */}
      {children}
    </div>
  );
}
