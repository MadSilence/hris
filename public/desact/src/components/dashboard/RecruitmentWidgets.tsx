import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  Star,
  Activity,
  Target,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  MapPin,
  ArrowUp,
  ArrowDown,
  UserPlus,
  Eye
} from 'lucide-react';

export const OpenPositions: React.FC = () => (
  <Card className="p-6 border-brown-200 bg-gradient-to-br from-blue-50 to-white">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 bg-blue-100 rounded-full">
        <Target className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <div className="text-2xl font-bold">24</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Open Positions</div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <ArrowUp className="w-4 h-4 text-green-600" />
      <span className="text-sm font-medium text-green-600">+6 this week</span>
    </div>
  </Card>
);

export const CandidatePipeline: React.FC = () => {
  const candidates = [
    { name: 'Sarah Johnson', role: 'Sr. Engineer', stage: 'Final Interview', progress: 90 },
    { name: 'Mike Chen', role: 'Designer', stage: 'Technical', progress: 70 },
    { name: 'Emily Davis', role: 'PM', stage: 'Screening', progress: 40 },
    { name: 'David Kim', role: 'Analyst', stage: 'Review', progress: 25 },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Active Candidates</span>
      </div>
      <div className="space-y-4">
        {candidates.map((candidate, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-brown-200 text-brown-700 text-xs">
                  {candidate.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-medium">{candidate.name}</div>
                <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{candidate.role}</div>
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {candidate.progress}%
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-brown-100 rounded-full h-2">
                <div 
                  className="bg-brown-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${candidate.progress}%` }}
                />
              </div>
              <Badge variant="secondary" className="text-xs">
                {candidate.stage}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const HiringFunnel: React.FC = () => {
  const funnelData = [
    { stage: 'Applied', count: 342, width: 100 },
    { stage: 'Screened', count: 89, width: 75 },
    { stage: 'Interviewed', count: 56, width: 60 },
    { stage: 'Technical', count: 28, width: 45 },
    { stage: 'Final', count: 15, width: 30 },
    { stage: 'Offers', count: 8, width: 20 },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Hiring Funnel</span>
      </div>
      <div className="space-y-3">
        {funnelData.map((stage, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-16 text-xs font-medium">{stage.stage}</div>
            <div className="flex-1">
              <div 
                className="bg-brown-500 rounded-full h-6 flex items-center justify-center text-white text-xs font-medium transition-all duration-500"
                style={{ width: `${stage.width}%` }}
              >
                {stage.count}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-brown-100 text-center">
        <div className="text-lg font-bold text-green-600">2.3%</div>
        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Conversion Rate</div>
      </div>
    </Card>
  );
};

export const TopSources: React.FC = () => {
  const sources = [
    { name: 'LinkedIn', count: 156, percentage: 45 },
    { name: 'Referrals', count: 89, percentage: 26 },
    { name: 'Indeed', count: 67, percentage: 19 },
    { name: 'Company Site', count: 34, percentage: 10 },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Top Sources</span>
      </div>
      <div className="space-y-3">
        {sources.map((source, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brown-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-brown-600">#{index + 1}</span>
              </div>
              <span className="text-sm font-medium">{source.name}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold">{source.count}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{source.percentage}%</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const TimeToHire: React.FC = () => (
  <Card className="p-6 border-brown-200 bg-gradient-to-br from-green-50 to-white">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 bg-green-100 rounded-full">
        <Clock className="w-6 h-6 text-green-600" />
      </div>
      <div>
        <div className="text-2xl font-bold">18</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Days to Hire</div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <ArrowDown className="w-4 h-4 text-green-600" />
      <span className="text-sm font-medium text-green-600">-3 days vs last month</span>
    </div>
  </Card>
);

export const OfferAcceptance: React.FC = () => (
  <Card className="p-6 border-brown-200 bg-gradient-to-br from-yellow-50 to-white">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 bg-yellow-100 rounded-full">
        <CheckCircle className="w-6 h-6 text-yellow-600" />
      </div>
      <div>
        <div className="text-2xl font-bold">87%</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Offer Acceptance</div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <ArrowUp className="w-4 h-4 text-green-600" />
      <span className="text-sm font-medium text-green-600">+5% this quarter</span>
    </div>
  </Card>
);

export const RecentHires: React.FC = () => {
  const hires = [
    { name: 'Sarah Johnson', role: 'Frontend Engineer', dept: 'Engineering', date: 'Jul 22' },
    { name: 'Mike Chen', role: 'Product Designer', dept: 'Design', date: 'Jul 20' },
    { name: 'Emily Davis', role: 'Sales Manager', dept: 'Sales', date: 'Jul 18' },
    { name: 'David Kim', role: 'Data Analyst', dept: 'Analytics', date: 'Jul 15' },
    { name: 'Lisa Wang', role: 'Marketing Lead', dept: 'Marketing', date: 'Jul 12' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="w-5 h-5 text-green-600" />
        <span className="font-semibold">Recent Hires</span>
      </div>
      <div className="space-y-3">
        {hires.map((hire, index) => (
          <div key={index} className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-green-200 text-green-700 text-xs">
                {hire.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium">{hire.name}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{hire.role}</div>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="text-xs mb-1">{hire.dept}</Badge>
              <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{hire.date}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const RecruitmentTrends: React.FC = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const applications = [234, 267, 198, 345, 289, 342];
  const hires = [12, 15, 8, 18, 14, 16];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Monthly Trends</span>
      </div>
      <div className="h-32 flex items-end gap-1 mb-4">
        {applications.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full relative">
              <div 
                className="w-full bg-brown-200 rounded-t"
                style={{ height: `${(value / 400) * 80}px` }}
              />
              <div 
                className="w-full bg-brown-500 rounded-t absolute bottom-0"
                style={{ height: `${(hires[index] / 20) * 80}px` }}
              />
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {months[index]}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-brown-200 rounded" />
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Applications</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-brown-500 rounded" />
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Hires</span>
        </div>
      </div>
    </Card>
  );
};

export const CandidateQuality: React.FC = () => {
  const qualityMetrics = [
    { metric: 'Interview Score', value: '4.2/5', trend: 'up' },
    { metric: 'Skills Match', value: '89%', trend: 'up' },
    { metric: 'Cultural Fit', value: '4.7/5', trend: 'stable' },
    { metric: 'Experience Level', value: '95%', trend: 'up' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-yellow-500" />
        <span className="font-semibold">Candidate Quality</span>
      </div>
      <div className="space-y-3">
        {qualityMetrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-brown-50 rounded">
            <span className="text-sm">{metric.metric}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{metric.value}</span>
              {metric.trend === 'up' && <ArrowUp className="w-3 h-3 text-green-600" />}
              {metric.trend === 'down' && <ArrowDown className="w-3 h-3 text-red-600" />}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};