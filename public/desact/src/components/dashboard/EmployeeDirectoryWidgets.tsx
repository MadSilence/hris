import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { 
  Users, 
  TrendingUp,
  Building2,
  Globe,
  UserCheck,
  UserX,
  PieChart,
  BarChart3,
  MapPin,
  Calendar,
  Star,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

// Compact widgets for Pinterest timeline
export const TotalHeadcount: React.FC = () => (
  <Card className="p-6 border-brown-200 bg-gradient-to-br from-brown-50 to-white">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 bg-brown-100 rounded-full">
        <Users className="w-6 h-6 text-brown-600" />
      </div>
      <div>
        <div className="text-2xl font-bold">1,247</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Total Employees</div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <ArrowUp className="w-4 h-4 text-green-600" />
      <span className="text-sm font-medium text-green-600">+23 this month</span>
    </div>
  </Card>
);

export const NewHiresThisMonth: React.FC = () => {
  const newHires = [
    { name: 'Sarah Chen', role: 'Designer', date: 'Jul 20' },
    { name: 'Mike Davis', role: 'Engineer', date: 'Jul 18' },
    { name: 'Lisa Wang', role: 'Manager', date: 'Jul 15' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <UserCheck className="w-5 h-5 text-green-600" />
        <span className="font-semibold">New Hires</span>
      </div>
      <div className="space-y-3">
        {newHires.map((hire, index) => (
          <div key={index} className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                {hire.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium">{hire.name}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{hire.role}</div>
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{hire.date}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-brown-100">
        <div className="text-lg font-bold text-green-600">23</div>
        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>This month</div>
      </div>
    </Card>
  );
};

export const DepartmentBreakdown: React.FC = () => {
  const departments = [
    { name: 'Engineering', count: 145, percentage: 45, color: 'bg-blue-500' },
    { name: 'Sales', count: 89, percentage: 28, color: 'bg-green-500' },
    { name: 'Marketing', count: 67, percentage: 21, color: 'bg-purple-500' },
    { name: 'HR', count: 34, percentage: 11, color: 'bg-orange-500' },
    { name: 'Finance', count: 23, percentage: 7, color: 'bg-pink-500' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Departments</span>
      </div>
      <div className="space-y-3">
        {departments.map((dept, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{dept.name}</span>
              <span className="text-sm font-bold">{dept.count}</span>
            </div>
            <div className="w-full bg-brown-100 rounded-full h-2">
              <div 
                className={`${dept.color} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${dept.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const HeadcountGrowth: React.FC = () => {
  const data = [
    { month: 'Jan', value: 1180 },
    { month: 'Feb', value: 1195 },
    { month: 'Mar', value: 1210 },
    { month: 'Apr', value: 1225 },
    { month: 'May', value: 1235 },
    { month: 'Jun', value: 1247 },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Growth Trend</span>
      </div>
      
      {/* Chart Area */}
      <div className="h-32 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis 
              dataKey="month" 
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

      {/* Growth Summary */}
      <div className="text-center">
        <div className="text-lg font-bold text-green-600">+5.7%</div>
        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>6-month growth</div>
      </div>
    </Card>
  );
};

export const TopPerformers: React.FC = () => {
  const performers = [
    { name: 'Sarah Johnson', score: 98, dept: 'Engineering' },
    { name: 'Mike Chen', score: 95, dept: 'Sales' },
    { name: 'Emily Davis', score: 93, dept: 'Design' },
    { name: 'David Kim', score: 91, dept: 'Marketing' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-yellow-500" />
        <span className="font-semibold">Top Performers</span>
      </div>
      <div className="space-y-3">
        {performers.map((performer, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="text-xs font-bold text-yellow-700">#{index + 1}</span>
            </div>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-brown-200 text-brown-700 text-xs">
                {performer.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium">{performer.name}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{performer.dept}</div>
            </div>
            <div className="text-sm font-bold">{performer.score}%</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const GeographicDistribution: React.FC = () => {
  const locations = [
    { city: 'San Francisco', count: 456, percentage: 37 },
    { city: 'New York', count: 312, percentage: 25 },
    { city: 'Austin', count: 234, percentage: 19 },
    { city: 'Seattle', count: 156, percentage: 12 },
    { city: 'Remote', count: 89, percentage: 7 },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Locations</span>
      </div>
      <div className="space-y-3">
        {locations.map((location, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-brown-500 rounded-full" />
              <span className="text-sm">{location.city}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold">{location.count}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{location.percentage}%</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const AttritionRate: React.FC = () => (
  <Card className="p-6 border-brown-200 bg-gradient-to-br from-red-50 to-white">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 bg-red-100 rounded-full">
        <UserX className="w-6 h-6 text-red-600" />
      </div>
      <div>
        <div className="text-2xl font-bold text-red-600">3.2%</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Attrition Rate</div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <ArrowDown className="w-4 h-4 text-green-600" />
      <span className="text-sm font-medium text-green-600">-0.8% vs last quarter</span>
    </div>
  </Card>
);

export const EmployeeTimeline: React.FC = () => {
  const events = [
    { type: 'hire', name: 'Sarah Chen joined Design', time: '2h ago', icon: UserCheck },
    { type: 'promotion', name: 'Mike Davis promoted to Lead', time: '5h ago', icon: TrendingUp },
    { type: 'departure', name: 'Lisa Wang departure', time: '1d ago', icon: UserX },
    { type: 'hire', name: 'Tom Brown joined Sales', time: '2d ago', icon: UserCheck },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Recent Activity</span>
      </div>
      <div className="space-y-4">
        {events.map((event, index) => {
          const IconComponent = event.icon;
          return (
            <div key={index} className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${
                event.type === 'hire' ? 'bg-green-100' :
                event.type === 'promotion' ? 'bg-blue-100' :
                'bg-red-100'
              }`}>
                <IconComponent className={`w-4 h-4 ${
                  event.type === 'hire' ? 'text-green-600' :
                  event.type === 'promotion' ? 'text-blue-600' :
                  'text-red-600'
                }`} />
              </div>
              <div className="flex-1">
                <div className="text-sm">{event.name}</div>
                <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{event.time}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export const DiversityStats: React.FC = () => {
  const stats = [
    { label: 'Gender Diversity', value: '52% / 48%', subtext: 'Female / Male' },
    { label: 'Age Range', value: '28-45', subtext: 'Average age: 34' },
    { label: 'Remote Workers', value: '24%', subtext: '298 employees' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Diversity</span>
      </div>
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center p-3 bg-brown-50 rounded-lg">
            <div className="text-lg font-bold">{stat.value}</div>
            <div className="text-sm font-medium">{stat.label}</div>
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{stat.subtext}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};