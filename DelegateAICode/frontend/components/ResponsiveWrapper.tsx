import { ReactNode } from 'react';

interface ResponsiveWrapperProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveWrapper({ children, className = '' }: ResponsiveWrapperProps) {
  return (
    <div className={`
      w-full 
      min-h-0 
      flex flex-col
      container-normal
      ${className}
    `}>
      <div className="
        w-full 
        max-w-full 
        overflow-hidden
        flex-1
        flex flex-col
      ">
        {children}
      </div>
    </div>
  );
}

// Hook for responsive behavior
export function useResponsiveLayout() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    containerClass: isMobile 
      ? 'px-4 py-2' 
      : isTablet 
        ? 'px-6 py-4' 
        : 'px-8 py-6'
  };
}