import { ReactNode } from 'react';

export default function InstanceLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen pt-4">{children}</div>;
}
