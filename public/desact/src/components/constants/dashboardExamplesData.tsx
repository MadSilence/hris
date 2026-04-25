import React from 'react';
import { 
  Target,
  Clock,
  CheckCircle,
  DollarSign,
  Users,
  Award,
  Briefcase,
  BarChart3,
  CreditCard,
  Star,
  UserCheck,
  FileText,
  Globe,
  TrendingUp,
  Zap,
  Activity
} from 'lucide-react';
import { 
  SimpleMetricWidget, 
  DualMetricWidget, 
  ListWidget, 
  RangeWidget, 
  ProgressWidget 
} from '../dashboard-examples/WidgetComponents';

export const DASHBOARD_WIDGETS = [
  // Single metric widgets
  <SimpleMetricWidget
    key="positions"
    icon={<Target className="w-6 h-6 text-blue-600" />}
    title="Open Positions"
    value="24"
    trend="+6 this week"
    trendUp={true}
    bgColor="from-blue-50 to-white"
  />,
  
  <SimpleMetricWidget
    key="hire-time"
    icon={<Clock className="w-6 h-6 text-green-600" />}
    title="Days to Hire"
    value="18"
    trend="-3 days vs last month"
    trendUp={false}
    bgColor="from-green-50 to-white"
  />,
  
  <SimpleMetricWidget
    key="acceptance"
    icon={<CheckCircle className="w-6 h-6 text-yellow-600" />}
    title="Offer Acceptance"
    value="87%"
    trend="+5% this quarter"
    trendUp={true}
    bgColor="from-yellow-50 to-white"
  />,

  // Financial widgets
  <SimpleMetricWidget
    key="payroll"
    icon={<DollarSign className="w-6 h-6 text-green-600" />}
    title="Total Payroll"
    value="$2.4M"
    trend="+5.2% vs last month"
    trendUp={true}
    bgColor="from-green-50 to-white"
  />,

  <SimpleMetricWidget
    key="avg-salary"
    icon={<Users className="w-6 h-6 text-blue-600" />}
    title="Average Salary"
    value="$75K"
    trend="+2.1% annual"
    trendUp={true}
    bgColor="from-blue-50 to-white"
  />,

  // Dual metric widgets
  <DualMetricWidget
    key="bonuses"
    icon={<Award className="w-5 h-5 text-yellow-500" />}
    title="Bonuses"
    leftValue="$320K"
    leftLabel="Total"
    rightValue="89"
    rightLabel="Recipients"
  />,

  <DualMetricWidget
    key="benefits"
    icon={<CreditCard className="w-5 h-5 text-brown-600" />}
    title="Benefits"
    leftValue="$890K"
    leftLabel="Total"
    rightValue="$2.8K"
    rightLabel="Per Employee"
  />,

  // Progress widget
  <ProgressWidget
    key="pay-equity"
    icon={<BarChart3 className="w-5 h-5 text-brown-600" />}
    title="Pay Equity"
    percentage={94}
    label="Improving"
    trendText="+2% this quarter"
  />,

  // Range widget
  <RangeWidget
    key="salary-ranges"
    icon={<BarChart3 className="w-5 h-5 text-brown-600" />}
    title="Salary Ranges"
    ranges={[
      { label: '$50K-70K', count: 89, percentage: 35 },
      { label: '$70K-90K', count: 124, percentage: 60 },
      { label: '$90K+', count: 67, percentage: 45 }
    ]}
  />,

  // List widget
  <ListWidget
    key="by-department"
    icon={<Briefcase className="w-5 h-5 text-brown-600" />}
    title="By Department"
    items={[
      { label: 'Engineering', value: '$890K' },
      { label: 'Sales', value: '$450K' },
      { label: 'Marketing', value: '$320K' }
    ]}
  />,

  // More simple widgets
  <SimpleMetricWidget
    key="trends"
    icon={<TrendingUp className="w-6 h-6 text-green-600" />}
    title="Growth Trends"
    value="+7.2%"
    trend="YoY"
    trendUp={true}
    bgColor="from-green-50 to-white"
  />,

  <SimpleMetricWidget
    key="employee-count"
    icon={<Users className="w-6 h-6 text-blue-600" />}
    title="Total Employees"
    value="324"
    trend="+12 this month"
    trendUp={true}
    bgColor="from-blue-50 to-white"
  />,

  <SimpleMetricWidget
    key="retention"
    icon={<UserCheck className="w-6 h-6 text-green-600" />}
    title="Retention Rate"
    value="94%"
    trend="+3% vs last year"
    trendUp={true}
    bgColor="from-green-50 to-white"
  />,

  <DualMetricWidget
    key="applications"
    icon={<FileText className="w-5 h-5 text-brown-600" />}
    title="Applications"
    leftValue="456"
    leftLabel="This Month"
    rightValue="89"
    rightLabel="Qualified"
  />,

  <ProgressWidget
    key="training"
    icon={<Star className="w-5 h-5 text-yellow-500" />}
    title="Training Completion"
    percentage={78}
    label="Company Wide"
    trendText="+12% this quarter"
  />,

  <SimpleMetricWidget
    key="remote-work"
    icon={<Globe className="w-6 h-6 text-blue-600" />}
    title="Remote Workers"
    value="45%"
    trend="+8% vs last year"
    trendUp={true}
    bgColor="from-blue-50 to-white"
  />,

  <ListWidget
    key="top-skills"
    icon={<Activity className="w-5 h-5 text-brown-600" />}
    title="Top Skills in Demand"
    items={[
      { label: 'React/Frontend', value: '24 roles' },
      { label: 'Data Science', value: '18 roles' },
      { label: 'DevOps', value: '12 roles' }
    ]}
  />,

  <DualMetricWidget
    key="performance"
    icon={<Zap className="w-5 h-5 text-yellow-500" />}
    title="Performance Reviews"
    leftValue="92%"
    leftLabel="Completed"
    rightValue="4.2"
    rightLabel="Avg Score"
  />
];

export const CODE_EXAMPLE = `// Simple Metric Widget Example
const SimpleMetricWidget = ({ icon, title, value, trend, trendUp }) => (
  <Card className="p-6 border-brown-200 bg-gradient-to-br from-blue-50 to-white">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 bg-white/70 rounded-full">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-gray-500">{title}</div>
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

// Usage in Pinterest Layout
<PinterestLayout>
  <SimpleMetricWidget
    icon={<Target className="w-6 h-6 text-blue-600" />}
    title="Open Positions"
    value="24"
    trend="+6 this week"
    trendUp={true}
  />
  <SimpleMetricWidget
    icon={<Clock className="w-6 h-6 text-green-600" />}
    title="Days to Hire"
    value="18"
    trend="-3 days vs last month"
    trendUp={false}
  />
  // More widgets...
</PinterestLayout>`;