import { memo } from 'react';

interface AdminAccessProps {
  children: React.ReactNode;
  isAdmin: boolean;
}

export const AdminAccess = memo(({ children, isAdmin }: AdminAccessProps) => {
  if (!isAdmin) return null;
  return <>{children}</>;
});

AdminAccess.displayName = 'AdminAccess';