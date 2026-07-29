import React, { useEffect, useState } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ClientOnly renders children ONLY on the client after mount.
 *
 * Use this to wrap any component that uses browser-only APIs
 * (window, canvas, DOMMatrix, etc.) to prevent SSR crashes.
 * During server render and the initial client render pass,
 * the `fallback` is shown instead.
 */
export const ClientOnly: React.FC<ClientOnlyProps> = ({
  children,
  fallback = null,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default ClientOnly;
