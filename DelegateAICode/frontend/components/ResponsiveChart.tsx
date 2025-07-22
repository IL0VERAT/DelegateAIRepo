import { ReactElement, useEffect, useState } from 'react';
import { ResponsiveContainer } from 'recharts';

interface ResponsiveChartProps {
  children: ReactElement;
  height?: number | string;
  width?: number | string;
  minHeight?: number;
  className?: string;
}

export function ResponsiveChart({ 
  children, 
  height = 300, 
  width = '100%',
  minHeight = 200,
  className = ''
}: ResponsiveChartProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
      
      // Adjust chart dimensions based on viewport
      let chartHeight = typeof height === 'number' ? height : 300;
      let chartWidth = vw;

      // Mobile adjustments
      if (vw < 640) {
        chartHeight = Math.max(minHeight, chartHeight * 0.7);
        chartWidth = vw - 32; // Account for padding
      }
      // Tablet adjustments  
      else if (vw < 1024) {
        chartHeight = Math.max(minHeight, chartHeight * 0.85);
        chartWidth = vw - 48; // Account for padding
      }
      // Desktop
      else {
        chartWidth = Math.min(vw - 64, 1200); // Max width with padding
      }

      setDimensions({ width: chartWidth, height: chartHeight });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, [height, minHeight]);

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div 
        style={{ 
          height: dimensions.height,
          minHeight: minHeight,
          width: '100%'
        }}
        className="flex items-center justify-center"
      >
        <ResponsiveContainer 
          width="100%" 
          height="100%"
          minHeight={minHeight}
        >
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Hook for responsive chart configurations
export function useResponsiveChart() {
  const [config, setConfig] = useState({
    fontSize: 12,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    legendPosition: 'bottom' as 'bottom' | 'top' | 'left' | 'right',
    showGrid: true,
    strokeWidth: 2
  });

  useEffect(() => {
    const updateConfig = () => {
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      
      if (vw < 640) {
        // Mobile configuration
        setConfig({
          fontSize: 10,
          margin: { top: 10, right: 10, bottom: 30, left: 10 },
          legendPosition: 'bottom',
          showGrid: false,
          strokeWidth: 1.5
        });
      } else if (vw < 1024) {
        // Tablet configuration
        setConfig({
          fontSize: 11,
          margin: { top: 15, right: 15, bottom: 25, left: 15 },
          legendPosition: 'bottom',
          showGrid: true,
          strokeWidth: 2
        });
      } else {
        // Desktop configuration
        setConfig({
          fontSize: 12,
          margin: { top: 20, right: 20, bottom: 20, left: 20 },
          legendPosition: 'bottom',
          showGrid: true,
          strokeWidth: 2
        });
      }
    };

    updateConfig();
    window.addEventListener('resize', updateConfig);
    
    return () => window.removeEventListener('resize', updateConfig);
  }, []);

  return config;
}