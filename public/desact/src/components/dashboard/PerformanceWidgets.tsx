import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { 
  Target, 
  Star,
  Clock,
  Calendar,
  CheckCircle,
  Trophy,
  ArrowUp,
  Activity,
  TrendingUp,
  Users,
  Award,
  MessageSquare,
  BookOpen,
  ArrowDown,
  BarChart3
} from 'lucide-react';

export const PerformanceOverview: React.FC = () => (
  <Card className="p-6 border-brown-200 bg-gradient-to-br from-yellow-50 to-white">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 bg-yellow-100 rounded-full">
        <Star className="w-6 h-6 text-yellow-600" />
      </div>
      <div>
        <div className="text-2xl font-bold">4.2</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Avg. Performance</div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <ArrowUp className="w-4 h-4 text-green-600" />
      <span className="text-sm font-medium text-green-600">+0.3 vs last quarter</span>
    </div>
  </Card>
);

export const TopPerformers: React.FC = () => {
  const performers = [
    { name: 'Sarah Johnson', score: 4.9, role: 'Sr. Engineer', trend: 'up' },
    { name: 'Mike Chen', score: 4.8, role: 'Designer', trend: 'up' },
    { name: 'Emily Davis', score: 4.7, role: 'PM', trend: 'stable' },
    { name: 'David Kim', score: 4.6, role: 'Analyst', trend: 'up' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <span className="font-semibold">Top Performers</span>
      </div>
      <div className="space-y-3">
        {performers.map((performer, index) => (
          <div key={index} className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-yellow-200 flex items-center justify-center">
              <span className="text-xs font-bold text-yellow-700">#{index + 1}</span>
            </div>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-brown-200 text-brown-700 text-xs">
                {performer.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium">{performer.name}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{performer.role}</div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold">{performer.score}</span>
              {performer.trend === 'up' && <ArrowUp className="w-3 h-3 text-green-600" />}
              {performer.trend === 'stable' && <div className="w-3 h-3" />}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const GoalCompletion: React.FC = () => {
  const goals = [
    { dept: 'Engineering', completed: 23, total: 28, percentage: 82 },
    { dept: 'Sales', completed: 18, total: 20, percentage: 90 },
    { dept: 'Marketing', completed: 14, total: 18, percentage: 78 },
    { dept: 'Design', completed: 11, total: 12, percentage: 92 },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Goal Progress</span>
      </div>
      <div className="space-y-4">
        {goals.map((goal, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{goal.dept}</span>
              <span className="text-sm font-bold">{goal.completed}/{goal.total}</span>
            </div>
            <div className="w-full bg-brown-100 rounded-full h-2">
              <div 
                className="bg-brown-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${goal.percentage}%` }}
              />
            </div>
            <div className="text-xs text-right" style={{ color: 'var(--color-text-tertiary)' }}>
              {goal.percentage}% complete
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const UpcomingReviews: React.FC = () => {
  const reviews = [
    { name: 'Sarah Johnson', date: 'Jul 28', type: 'Quarterly' },
    { name: 'Mike Chen', date: 'Jul 30', type: 'Annual' },
    { name: 'Emily Davis', date: 'Aug 2', type: 'Quarterly' },
    { name: 'David Kim', date: 'Aug 5', type: 'Mid-year' },
    { name: 'Lisa Wang', date: 'Aug 8', type: 'Quarterly' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Upcoming Reviews</span>
      </div>
      <div className="space-y-3">
        {reviews.map((review, index) => (
          <div key={index} className="flex items-center gap-3 p-2 bg-brown-50 rounded-lg">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-brown-200 text-brown-700 text-xs">
                {review.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium">{review.name}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{review.type} Review</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{review.date}</div>
              <Badge variant="outline" className="text-xs">Scheduled</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const PerformanceTrends: React.FC = () => {
  const data = [
    { quarter: 'Q1', value: 3.8 },
    { quarter: 'Q2', value: 4.0 },
    { quarter: 'Q3', value: 4.1 },
    { quarter: 'Q4', value: 4.2 },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Performance Trend</span>
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

      {/* Quarter Values */}
      <div className="flex justify-between items-center mb-4">
        {data.map((item, index) => (
          <div key={index} className="text-center">
            <div className="font-medium text-sm">{item.value}</div>
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{item.quarter}</div>
          </div>
        ))}
      </div>

      {/* Growth Summary */}
      <div className="text-center">
        <div className="text-lg font-bold text-green-600">+10.5%</div>
        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Annual growth</div>
      </div>
    </Card>
  );
};

export const FeedbackSummary: React.FC = () => {
  const feedback = [
    { category: 'Communication', score: 4.5, responses: 156 },
    { category: 'Leadership', score: 4.2, responses: 89 },
    { category: 'Technical Skills', score: 4.7, responses: 234 },
    { category: 'Collaboration', score: 4.3, responses: 178 },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">360° Feedback</span>
      </div>
      <div className="space-y-3">
        {feedback.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-brown-50 rounded">
            <div>
              <div className="text-sm font-medium">{item.category}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{item.responses} responses</div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-bold">{item.score}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const ProbationProgress: React.FC = () => {
  const probationEmployees = [
    { name: 'Alex Turner', progress: 75, endDate: 'Aug 15', status: 'On Track' },
    { name: 'Maria Garcia', progress: 60, endDate: 'Sep 2', status: 'Needs Support' },
    { name: 'James Wilson', progress: 90, endDate: 'Jul 30', status: 'Excellent' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Probation Progress</span>
      </div>
      <div className="space-y-4">
        {probationEmployees.map((employee, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-brown-200 text-brown-700 text-xs">
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-medium">{employee.name}</div>
                <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Ends {employee.endDate}</div>
              </div>
              <Badge 
                variant={employee.status === 'Excellent' ? 'default' : employee.status === 'Needs Support' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {employee.status}
              </Badge>
            </div>
            <div className="w-full bg-brown-100 rounded-full h-2">
              <div 
                className="bg-brown-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${employee.progress}%` }}
              />
            </div>
            <div className="text-xs text-right" style={{ color: 'var(--color-text-tertiary)' }}>
              {employee.progress}% complete
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const CareerDevelopment: React.FC = () => {
  const developmentStats = [
    { metric: 'Training Hours', value: '2,456', trend: 'up' },
    { metric: 'Certifications', value: '89', trend: 'up' },
    { metric: 'Promotions', value: '12', trend: 'stable' },
    { metric: 'Skill Assessments', value: '156', trend: 'up' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Development</span>
      </div>
      <div className="space-y-3">
        {developmentStats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-brown-50 rounded">
            <span className="text-sm">{stat.metric}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{stat.value}</span>
              {stat.trend === 'up' && <ArrowUp className="w-3 h-3 text-green-600" />}
              {stat.trend === 'down' && <ArrowDown className="w-3 h-3 text-red-600" />}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};