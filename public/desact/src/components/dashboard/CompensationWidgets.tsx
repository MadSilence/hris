import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { 
  DollarSign,
  TrendingUp,
  Award,
  Target,
  BarChart3,
  Users,
  Calculator,
  PieChart,
  ArrowUp,
  ArrowDown,
  Briefcase,
  CreditCard
} from 'lucide-react';

export const PayrollOverview: React.FC = () => (
  <Card className="p-6 border-brown-200 bg-gradient-to-br from-green-50 to-white">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 bg-green-100 rounded-full">
        <DollarSign className="w-6 h-6 text-green-600" />
      </div>
      <div>
        <div className="text-2xl font-bold">$2.4M</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Monthly Payroll</div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <ArrowUp className="w-4 h-4 text-green-600" />
      <span className="text-sm font-medium text-green-600">+5.2% vs last month</span>
    </div>
  </Card>
);

export const AverageSalary: React.FC = () => {
  const departments = [
    { name: 'Engineering', salary: '$95K', change: '+3.2%' },
    { name: 'Sales', salary: '$78K', change: '+2.1%' },
    { name: 'Marketing', salary: '$68K', change: '+1.8%' },
    { name: 'HR', salary: '$62K', change: '+2.5%' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Average Salary</span>
      </div>
      <div className="text-center mb-4">
        <div className="text-2xl font-bold">$75K</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Company Average</div>
      </div>
      <div className="space-y-2">
        {departments.map((dept, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-brown-50 rounded">
            <span className="text-sm">{dept.name}</span>
            <div className="text-right">
              <div className="text-sm font-bold">{dept.salary}</div>
              <div className="text-xs text-green-600">{dept.change}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const SalaryRanges: React.FC = () => {
  const ranges = [
    { range: '$40K-60K', count: 78, percentage: 28 },
    { range: '$60K-80K', count: 124, percentage: 44 },
    { range: '$80K-100K', count: 89, percentage: 32 },
    { range: '$100K+', count: 67, percentage: 24 },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Salary Distribution</span>
      </div>
      <div className="space-y-3">
        {ranges.map((range, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{range.range}</span>
              <span className="text-sm font-bold">{range.count}</span>
            </div>
            <div className="w-full bg-brown-100 rounded-full h-2">
              <div 
                className="bg-brown-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${range.percentage}%` }}
              />
            </div>
            <div className="text-xs text-right" style={{ color: 'var(--color-text-tertiary)' }}>
              {range.percentage}% of employees
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const BonusDistribution: React.FC = () => {
  const bonusData = [
    { employee: 'Sarah Johnson', amount: '$8,500', type: 'Performance' },
    { employee: 'Mike Chen', amount: '$6,200', type: 'Project' },
    { employee: 'Emily Davis', amount: '$7,800', type: 'Annual' },
    { employee: 'David Kim', amount: '$5,900', type: 'Retention' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-yellow-500" />
        <span className="font-semibold">Recent Bonuses</span>
      </div>
      <div className="space-y-3">
        {bonusData.map((bonus, index) => (
          <div key={index} className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-yellow-200 text-yellow-700 text-xs">
                {bonus.employee.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium">{bonus.employee}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{bonus.type} Bonus</div>
            </div>
            <div className="text-sm font-bold text-green-600">{bonus.amount}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-brown-100">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold">$320K</div>
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Total Distributed</div>
          </div>
          <div>
            <div className="text-lg font-bold">89</div>
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Recipients</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const PayEquityAnalysis: React.FC = () => {
  const equityMetrics = [
    { category: 'Gender Pay Gap', score: 96, trend: 'up' },
    { category: 'Role Consistency', score: 94, trend: 'up' },
    { category: 'Experience Alignment', score: 92, trend: 'stable' },
    { category: 'Department Equity', score: 98, trend: 'up' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Pay Equity Analysis</span>
      </div>
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-green-600">95%</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Overall Equity Score</div>
      </div>
      <div className="space-y-3">
        {equityMetrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-brown-50 rounded">
            <span className="text-sm">{metric.category}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{metric.score}%</span>
              {metric.trend === 'up' && <ArrowUp className="w-3 h-3 text-green-600" />}
              {metric.trend === 'down' && <ArrowDown className="w-3 h-3 text-red-600" />}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const BenefitsCost: React.FC = () => {
  const benefits = [
    { type: 'Health Insurance', cost: '$425K', percentage: 48 },
    { type: 'Retirement Plan', cost: '$185K', percentage: 21 },
    { type: 'Life Insurance', cost: '$95K', percentage: 11 },
    { type: 'Other Benefits', cost: '$185K', percentage: 20 },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Benefits Cost</span>
      </div>
      <div className="text-center mb-4">
        <div className="text-2xl font-bold">$890K</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Total Monthly</div>
      </div>
      <div className="space-y-3">
        {benefits.map((benefit, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm">{benefit.type}</span>
              <span className="text-sm font-bold">{benefit.cost}</span>
            </div>
            <div className="w-full bg-brown-100 rounded-full h-2">
              <div 
                className="bg-brown-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${benefit.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-brown-100 text-center">
        <div className="text-lg font-bold">$2.8K</div>
        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Per employee/month</div>
      </div>
    </Card>
  );
};

export const CompensationTrends: React.FC = () => {
  const data = [
    { quarter: 'Q1', value: 2.1 },
    { quarter: 'Q2', value: 2.2 },
    { quarter: 'Q3', value: 2.3 },
    { quarter: 'Q4', value: 2.4 },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Compensation Growth</span>
      </div>
      
      {/* Chart Area */}
      <div className="h-32 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis 
              dataKey="quarter" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }}
            />
            <YAxis hide />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#8B4513" 
              strokeWidth={2}
              dot={{ fill: '#8B4513', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 4, fill: '#8B4513' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Quarterly Values */}
      <div className="flex justify-between items-center mb-4">
        {data.map((item, index) => (
          <div key={index} className="text-center">
            <div className="font-medium text-sm">${item.value}M</div>
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{item.quarter}</div>
          </div>
        ))}
      </div>

      {/* Growth Summary */}
      <div className="text-center">
        <div className="text-lg font-bold text-green-600">+14.3%</div>
        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Annual growth</div>
      </div>
    </Card>
  );
};

export const DepartmentPayroll: React.FC = () => {
  const departments = [
    { name: 'Engineering', amount: '$890K', employees: 125, avg: '$7.1K' },
    { name: 'Sales', amount: '$450K', employees: 67, avg: '$6.7K' },
    { name: 'Marketing', amount: '$320K', employees: 48, avg: '$6.7K' },
    { name: 'HR', amount: '$185K', employees: 23, avg: '$8.0K' },
    { name: 'Finance', amount: '$165K', employees: 18, avg: '$9.2K' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Department Payroll</span>
      </div>
      <div className="space-y-3">
        {departments.map((dept, index) => (
          <div key={index} className="p-3 bg-brown-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{dept.name}</span>
              <span className="text-sm font-bold">{dept.amount}</span>
            </div>
            <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              <span>{dept.employees} employees</span>
              <span>{dept.avg} avg/employee</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};