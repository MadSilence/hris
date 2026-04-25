import React, { useEffect, useRef, useState } from 'react';

interface PinterestLayoutProps {
  children: React.ReactElement[];
  columns?: number;
  gap?: number;
}

export const PinterestLayout: React.FC<PinterestLayoutProps> = ({ 
  children, 
  columns = 4, 
  gap = 24 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnHeights, setColumnHeights] = useState<number[]>([]);
  const [responsiveColumns, setResponsiveColumns] = useState(columns);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setResponsiveColumns(1);
      else if (width < 768) setResponsiveColumns(2);
      else if (width < 1024) setResponsiveColumns(3);
      else if (width < 1280) setResponsiveColumns(4);
      else setResponsiveColumns(5);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  useEffect(() => {
    setColumnHeights(new Array(responsiveColumns).fill(0));
  }, [responsiveColumns]);

  const getShortestColumnIndex = () => {
    return columnHeights.indexOf(Math.min(...columnHeights));
  };

  return (
    <div 
      ref={containerRef}
      className="relative"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: `${gap}px`,
        alignItems: 'start'
      }}
    >
      {children.map((child, index) => (
        <div key={index} className="break-inside-avoid">
          {child}
        </div>
      ))}
    </div>
  );
};