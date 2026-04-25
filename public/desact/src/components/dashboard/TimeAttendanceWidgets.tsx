import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { 
  Clock,
  Calendar,
  Home,
  Building2,
  Zap,
  TrendingUp,
  Users,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  Timer
} from 'lucide-react';

export const AttendanceOverview: React.FC = () => (
  <Card className="p-6 border-brown-200 bg-gradient-to-br from-green-50 to-white">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 bg-green-100 rounded-full">
        <Users className="w-6 h-6 text-green-600" />
      </div>
      <div>
        <div className="text-2xl font-bold">94%</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Attendance Rate</div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <ArrowUp className="w-4 h-4 text-green-600" />
      <span className="text-sm font-medium text-green-600">+2.1% vs last month</span>
    </div>
  </Card>
);

export const WorkFromHome: React.FC = () => {
  const locations = [
    { type: 'Remote', count: 156, percentage: 44 },
    { type: 'Office', count: 198, percentage: 56 },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Home className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Work Location</span>
      </div>
      <div className="space-y-4">
        {locations.map((location, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {location.type === 'Remote' ? 
                  <Home className="w-4 h-4 text-blue-600" /> :
                  <Building2 className="w-4 h-4 text-brown-600" />
                }
                <span className="text-sm font-medium">{location.type}</span>
              </div>
              <span className="text-sm font-bold">{location.count}</span>
            </div>
            <div className="w-full bg-brown-100 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  location.type === 'Remote' ? 'bg-blue-500' : 'bg-brown-500'
                }`}
                style={{ width: `${location.percentage}%` }}
              />
            </div>
            <div className="text-xs text-right" style={{ color: 'var(--color-text-tertiary)' }}>
              {location.percentage}%
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const OvertimeHours: React.FC = () => {
  const monthlyData = [
    { month: 'Jan', hours: 420 },
    { month: 'Feb', hours: 385 },
    { month: 'Mar', hours: 456 },
    { month: 'Apr', hours: 398 },
    { month: 'May', hours: 367 },
    { month: 'Jun', hours: 342 },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-orange-600" />
        <span className="font-semibold">Overtime Hours</span>
      </div>
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-orange-600">342h</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>This month</div>
      </div>
      <div className="h-20 flex items-end gap-1 mb-3">
        {monthlyData.map((data, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className="w-full bg-orange-500 rounded-t transition-all duration-500"
              style={{ height: `${(data.hours / 500) * 60}px` }}
            />
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {data.month}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 justify-center">
        <ArrowDown className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium text-green-600">-8% this month</span>
      </div>
    </Card>
  );
};

export const LeaveRequests: React.FC = () => {
  const requests = [
    { employee: 'Sarah Johnson', type: 'Vacation', dates: 'Jul 28-30', status: 'Pending' },
    { employee: 'Mike Chen', type: 'Sick Leave', dates: 'Jul 26', status: 'Approved' },
    { employee: 'Emily Davis', type: 'Personal', dates: 'Aug 1-2', status: 'Approved' },
    { employee: 'David Kim', type: 'Vacation', dates: 'Aug 5-9', status: 'Pending' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Leave Requests</span>
      </div>
      <div className="space-y-3">
        {requests.map((request, index) => (
          <div key={index} className="flex items-center gap-3 p-2 bg-brown-50 rounded">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-brown-200 text-brown-700 text-xs">
                {request.employee.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium">{request.employee}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {request.type} • {request.dates}
              </div>
            </div>
            <Badge 
              variant={request.status === 'Approved' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {request.status}
            </Badge>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-brown-100">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-orange-600">8</div>
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Pending</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">24</div>
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Approved</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const PunctualityScore: React.FC = () => {
  const departments = [
    { dept: 'Engineering', score: 95, trend: 'up' },
    { dept: 'Sales', score: 89, trend: 'stable' },
    { dept: 'Marketing', score: 92, trend: 'up' },
    { dept: 'HR', score: 97, trend: 'up' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Punctuality Score</span>
      </div>
      <div className="text-center mb-4">
        <div className="text-2xl font-bold">92%</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Overall Score</div>
      </div>
      <div className="space-y-2">
        {departments.map((dept, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-brown-50 rounded">
            <span className="text-sm">{dept.dept}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{dept.score}%</span>
              {dept.trend === 'up' && <ArrowUp className="w-3 h-3 text-green-600" />}
              {dept.trend === 'down' && <ArrowDown className="w-3 h-3 text-red-600" />}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const AttendanceTrends: React.FC = () => {
  const data = [
    { week: 'Week 1', value: 92 },
    { week: 'Week 2', value: 94 },
    { week: 'Week 3', value: 93 },
    { week: 'Week 4', value: 96 },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Monthly Trends</span>
      </div>
      
      {/* Chart Area */}
      <div className="h-32 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis 
              dataKey="week" 
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

      {/* Weekly Values */}
      <div className="flex justify-between items-center mb-4">
        {data.map((item, index) => (
          <div key={index} className="text-center">
            <div className="font-medium text-sm">{item.value}%</div>
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{item.week}</div>
          </div>
        ))}
      </div>

      {/* Growth Summary */}
      <div className="text-center">
        <div className="text-lg font-bold text-green-600">+4.3%</div>
        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Monthly improvement</div>
      </div>
    </Card>
  );
};

export const LateArrivals: React.FC = () => {
  const lateEmployees = [
    { name: 'John Smith', time: '9:15 AM', dept: 'Sales' },
    { name: 'Lisa Brown', time: '9:08 AM', dept: 'Marketing' },
    { name: 'Tom Wilson', time: '9:22 AM', dept: 'Engineering' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-orange-600" />
        <span className="font-semibold">Late Arrivals Today</span>
      </div>
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-orange-600">3</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Employees</div>
      </div>
      <div className="space-y-2">
        {lateEmployees.map((employee, index) => (
          <div key={index} className="flex items-center gap-3 p-2 bg-orange-50 rounded">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-orange-200 text-orange-700 text-xs">
                {employee.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium">{employee.name}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{employee.dept}</div>
            </div>
            <div className="text-sm font-medium text-orange-600">{employee.time}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-brown-100 text-center">
        <div className="text-lg font-bold">3.8%</div>
        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Late arrival rate</div>
      </div>
    </Card>
  );
};

export const TimeTracking: React.FC = () => {
  const timeData = [
    { employee: 'Sarah Johnson', hours: 38.5, target: 40, status: 'On Track' },
    { employee: 'Mike Chen', hours: 42.0, target: 40, status: 'Over' },
    { employee: 'Emily Davis', hours: 39.0, target: 40, status: 'On Track' },
    { employee: 'David Kim', hours: 35.5, target: 40, status: 'Under' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Timer className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Weekly Time Tracking</span>
      </div>
      <div className="space-y-3">
        {timeData.map((data, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-brown-200 text-brown-700 text-xs">
                  {data.employee.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-medium">{data.employee}</div>
                <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  {data.hours}h / {data.target}h
                </div>
              </div>
              <Badge 
                variant={
                  data.status === 'On Track' ? 'default' :
                  data.status === 'Over' ? 'destructive' : 'secondary'
                }
                className="text-xs"
              >
                {data.status}
              </Badge>
            </div>
            <div className="w-full bg-brown-100 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  data.status === 'Over' ? 'bg-red-500' :
                  data.status === 'Under' ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min((data.hours / data.target) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};