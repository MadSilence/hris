import React, { useState } from 'react';
import { Card } from './ui/card';

interface ComponentCardProps {
  name: string;
  blockCount: number;
  thumbnail: React.ReactNode;
  onClick?: () => void;
}

export const ComponentCard: React.FC<ComponentCardProps> = ({ name, blockCount, thumbnail, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Clone the thumbnail element and pass the isHovered prop
  const thumbnailWithHover = React.isValidElement(thumbnail) 
    ? React.cloneElement(thumbnail as React.ReactElement<{isHovered?: boolean}>, { isHovered })
    : thumbnail;

  return (
    <Card 
      className="p-0 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border-brown-200/60 hover:border-brown-300"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-square relative overflow-hidden bg-stone-100">
        {thumbnailWithHover}
      </div>
      <div className="px-4 pb-4 text-center">
        <h3 className="mb-1 font-medium transition-colors duration-200 group-hover:text-brown-700">
          {name}
        </h3>
        <p className="text-muted-foreground text-xs">
          {blockCount} Blocks
        </p>
      </div>
    </Card>
  );
};