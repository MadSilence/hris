import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { 
  Heart,
  MessageSquare,
  TrendingUp,
  Users,
  Award,
  Calendar,
  Target,
  Zap,
  ArrowUp,
  ArrowDown,
  Smile,
  Star
} from 'lucide-react';

export const EngagementScore: React.FC = () => (
  <Card className="p-6 border-brown-200 bg-gradient-to-br from-pink-50 to-white">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 bg-pink-100 rounded-full">
        <Heart className="w-6 h-6 text-pink-600" />
      </div>
      <div>
        <div className="text-2xl font-bold">7.8</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Engagement Score</div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <ArrowUp className="w-4 h-4 text-green-600" />
      <span className="text-sm font-medium text-green-600">+0.3 vs last month</span>
    </div>
  </Card>
);

export const SurveyParticipation: React.FC = () => (
  <Card className="p-6 border-brown-200">
    <div className="flex items-center gap-2 mb-4">
      <MessageSquare className="w-5 h-5 text-brown-600" />
      <span className="font-semibold">Survey Response</span>
    </div>
    <div className="space-y-3">
      <div className="text-center p-3 bg-brown-50 rounded-lg">
        <div className="text-2xl font-bold">89%</div>
        <div className="text-sm">Participation Rate</div>
      </div>
      <div className="text-center p-3 bg-brown-50 rounded-lg">
        <div className="text-2xl font-bold">142</div>
        <div className="text-sm">Total Responses</div>
      </div>
    </div>
  </Card>
);

export const TeamSatisfaction: React.FC = () => {
  const teams = [
    { name: 'Engineering', score: 8.7, trend: 'up' },
    { name: 'Sales', score: 8.2, trend: 'up' },
    { name: 'Marketing', score: 7.9, trend: 'stable' },
    { name: 'HR', score: 8.5, trend: 'up' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Smile className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Team Satisfaction</span>
      </div>
      <div className="space-y-3">
        {teams.map((team, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-brown-50 rounded">
            <span className="text-sm font-medium">{team.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{team.score}</span>
              {team.trend === 'up' && <ArrowUp className="w-3 h-3 text-green-600" />}
              {team.trend === 'down' && <ArrowDown className="w-3 h-3 text-red-600" />}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const RecognitionProgram: React.FC = () => {
  const recognitions = [
    { employee: 'Sarah Johnson', award: 'Employee of Month', date: 'Jul 2024' },
    { employee: 'Mike Chen', award: 'Innovation Award', date: 'Jun 2024' },
    { employee: 'Emily Davis', award: 'Team Player', date: 'Jun 2024' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-yellow-500" />
        <span className="font-semibold">Recent Recognition</span>
      </div>
      <div className="space-y-3">
        {recognitions.map((recognition, index) => (
          <div key={index} className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-yellow-200 text-yellow-700 text-xs">
                {recognition.employee.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium">{recognition.employee}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{recognition.award}</div>
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {recognition.date}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-brown-100 text-center">
        <div className="text-lg font-bold">12</div>
        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>This month</div>
      </div>
    </Card>
  );
};

export const WellnessPrograms: React.FC = () => {
  const programs = [
    { name: 'Fitness Challenge', participants: 45, status: 'Active' },
    { name: 'Mental Health Workshop', participants: 32, status: 'Upcoming' },
    { name: 'Meditation Sessions', participants: 28, status: 'Active' },
    { name: 'Nutrition Coaching', participants: 19, status: 'Active' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Wellness Programs</span>
      </div>
      <div className="space-y-3">
        {programs.map((program, index) => (
          <div key={index} className="p-2 bg-brown-50 rounded">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{program.name}</span>
              <Badge 
                variant={program.status === 'Active' ? 'default' : 'secondary'} 
                className="text-xs"
              >
                {program.status}
              </Badge>
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {program.participants} participants
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const OneOnOneMeetings: React.FC = () => {
  const upcoming = [
    { employee: 'Sarah Johnson', manager: 'Alex Turner', date: 'Today 3:00 PM' },
    { employee: 'Mike Chen', manager: 'Lisa Wang', date: 'Tomorrow 10:00 AM' },
    { employee: 'Emily Davis', manager: 'Tom Brown', date: 'Friday 2:00 PM' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Upcoming 1:1s</span>
      </div>
      <div className="space-y-3">
        {upcoming.map((meeting, index) => (
          <div key={index} className="p-2 bg-brown-50 rounded">
            <div className="text-sm font-medium">{meeting.employee}</div>
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              with {meeting.manager}
            </div>
            <div className="text-xs font-medium text-blue-600">{meeting.date}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-brown-100">
        <div className="flex justify-between">
          <span className="text-sm">Completion Rate</span>
          <span className="text-sm font-bold text-green-600">92%</span>
        </div>
      </div>
    </Card>
  );
};

export const EngagementTrends: React.FC = () => {
  const data = [
    { month: 'Jan', value: 7.2 },
    { month: 'Feb', value: 7.4 },
    { month: 'Mar', value: 7.6 },
    { month: 'Apr', value: 7.5 },
    { month: 'May', value: 7.7 },
    { month: 'Jun', value: 7.8 },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Engagement Trends</span>
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

      {/* Monthly Values */}
      <div className="flex justify-between items-center mb-4">
        {data.map((item, index) => (
          <div key={index} className="text-center">
            <div className="font-medium text-sm">{item.value}</div>
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{item.month}</div>
          </div>
        ))}
      </div>

      {/* Growth Summary */}
      <div className="text-center">
        <div className="text-lg font-bold text-green-600">+8.3%</div>
        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>6-month growth</div>
      </div>
    </Card>
  );
};

export const PulseResults: React.FC = () => {
  const results = [
    { metric: 'Job Satisfaction', score: 8.2, responses: 156, trend: 'up' },
    { metric: 'Work-Life Balance', score: 7.8, responses: 142, trend: 'up' },
    { metric: 'Career Growth', score: 7.5, responses: 138, trend: 'stable' },
    { metric: 'Manager Support', score: 8.0, responses: 149, trend: 'up' },
    { metric: 'Company Culture', score: 8.4, responses: 161, trend: 'up' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Pulse Survey Results</span>
      </div>
      <div className="space-y-3">
        {results.map((result, index) => (
          <div key={index} className="p-3 bg-brown-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{result.metric}</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-bold">{result.score}</span>
                </div>
                {result.trend === 'up' && <ArrowUp className="w-3 h-3 text-green-600" />}
                {result.trend === 'down' && <ArrowDown className="w-3 h-3 text-red-600" />}
              </div>
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {result.responses} responses
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};