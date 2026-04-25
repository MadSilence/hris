import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ArrowUp, ArrowDown } from 'lucide-react';

// Simple single metric widgets
export const SimpleMetricWidget: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  value: string; 
  trend: string; 
  trendUp: boolean;
  bgColor?: string;
}> = ({ icon, title, value, trend, trendUp, bgColor = 'from-blue-50 to-white' }) => (
  <Card className={`p-6 border-brown-200 bg-gradient-to-br ${bgColor}`}>
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 bg-white/70 rounded-full">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{title}</div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {trendUp ? 
        <ArrowUp className="w-4 h-4 text-green-600" /> : 
        <ArrowDown className="w-4 h-4 text-green-600" />
      }
      <span className="text-sm font-medium text-green-600">{trend}</span>
    </div>
  </Card>
);

// Dual metric widget
export const DualMetricWidget: React.FC<{
  icon: React.ReactNode;
  title: string;
  leftValue: string;
  leftLabel: string;
  rightValue: string;
  rightLabel: string;
}> = ({ icon, title, leftValue, leftLabel, rightValue, rightLabel }) => (
  <Card className="p-6 border-brown-200">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <span className="font-semibold">{title}</span>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold">{leftValue}</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{leftLabel}</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{rightValue}</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{rightLabel}</div>
      </div>
    </div>
  </Card>
);

// List widget
export const ListWidget: React.FC<{
  icon: React.ReactNode;
  title: string;
  items: { label: string; value: string }[];
}> = ({ icon, title, items }) => (
  <Card className="p-6 border-brown-200">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <span className="font-semibold">{title}</span>
    </div>
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex justify-between items-center p-2 bg-brown-50 rounded">
          <span className="text-sm">{item.label}</span>
          <span className="text-sm font-bold">{item.value}</span>
        </div>
      ))}
    </div>
  </Card>
);

// Range widget with bars
export const RangeWidget: React.FC<{
  icon: React.ReactNode;
  title: string;
  ranges: { label: string; count: number; percentage: number }[];
}> = ({ icon, title, ranges }) => (
  <Card className="p-6 border-brown-200">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <span className="font-semibold">{title}</span>
    </div>
    <div className="space-y-3">
      {ranges.map((range, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{range.label}</span>
            <span className="text-sm font-bold">{range.count}</span>
          </div>
          <div className="w-full bg-brown-100 rounded-full h-2">
            <div 
              className="bg-brown-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${range.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </Card>
);

// Progress widget
export const ProgressWidget: React.FC<{
  icon: React.ReactNode;
  title: string;
  percentage: number;
  label: string;
  trendText?: string;
}> = ({ icon, title, percentage, label, trendText }) => (
  <Card className="p-6 border-brown-200">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <span className="font-semibold">{title}</span>
    </div>
    <div className="text-center mb-4">
      <div className="text-2xl font-bold">{percentage}%</div>
      <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{label}</div>
    </div>
    <div className="w-full bg-brown-100 rounded-full h-3 mb-3">
      <div 
        className="bg-brown-500 h-3 rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
    {trendText && (
      <div className="text-center text-sm text-green-600">{trendText}</div>
    )}
  </Card>
);