import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Clock,
  Users,
  Target,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Zap,
  AlertCircle,
  Activity
} from 'lucide-react';

export const ComplianceScore: React.FC = () => (
  <Card className="p-6 border-brown-200 bg-gradient-to-br from-green-50 to-white">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 bg-green-100 rounded-full">
        <Shield className="w-6 h-6 text-green-600" />
      </div>
      <div>
        <div className="text-2xl font-bold">94%</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Compliance Score</div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <ArrowUp className="w-4 h-4 text-green-600" />
      <span className="text-sm font-medium text-green-600">+2% improvement</span>
    </div>
  </Card>
);

export const OpenViolations: React.FC = () => {
  const violations = [
    { type: 'Data Privacy', severity: 'Medium', date: 'Jul 20', dept: 'IT' },
    { type: 'Safety Protocol', severity: 'Low', date: 'Jul 18', dept: 'Operations' },
    { type: 'Documentation', severity: 'Low', date: 'Jul 15', dept: 'HR' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <span className="font-semibold">Open Violations</span>
      </div>
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-red-600">3</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Active Issues</div>
      </div>
      <div className="space-y-2">
        {violations.map((violation, index) => (
          <div key={index} className="p-2 bg-red-50 rounded">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{violation.type}</span>
              <Badge 
                variant={violation.severity === 'Medium' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {violation.severity}
              </Badge>
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {violation.dept} • {violation.date}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-brown-100 text-center">
        <div className="text-lg font-bold text-green-600">12</div>
        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Resolved this month</div>
      </div>
    </Card>
  );
};

export const PolicyAcknowledgment: React.FC = () => {
  const policies = [
    { name: 'Data Protection Policy', completion: 95, updated: 'Jul 1' },
    { name: 'Code of Conduct', completion: 89, updated: 'Jun 15' },
    { name: 'Safety Guidelines', completion: 92, updated: 'Jun 1' },
    { name: 'Remote Work Policy', completion: 87, updated: 'May 20' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Policy Acknowledgment</span>
      </div>
      <div className="space-y-3">
        {policies.map((policy, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{policy.name}</span>
              <span className="text-sm font-bold">{policy.completion}%</span>
            </div>
            <div className="w-full bg-brown-100 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${policy.completion}%` }}
              />
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Updated {policy.updated}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const AuditReadiness: React.FC = () => {
  const auditItems = [
    { category: 'Documentation', score: 92, status: 'Complete' },
    { category: 'Process Review', score: 85, status: 'In Progress' },
    { category: 'Risk Assessment', score: 89, status: 'Complete' },
    { category: 'Training Records', score: 94, status: 'Complete' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Audit Readiness</span>
      </div>
      <div className="text-center mb-4">
        <div className="text-2xl font-bold">87%</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Overall Readiness</div>
      </div>
      <div className="space-y-2">
        {auditItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-brown-50 rounded">
            <div>
              <div className="text-sm font-medium">{item.category}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{item.status}</div>
            </div>
            <span className="text-sm font-bold">{item.score}%</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-brown-100 text-center">
        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          Last audit: 6 months ago
        </div>
      </div>
    </Card>
  );
};

export const TrainingCompliance: React.FC = () => {
  const overdueTraining = [
    { employee: 'John Smith', course: 'Security Awareness', overdue: '5 days' },
    { employee: 'Lisa Brown', course: 'Data Protection', overdue: '2 days' },
    { employee: 'Tom Wilson', course: 'Safety Training', overdue: '8 days' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Training Compliance</span>
      </div>
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-green-600">92%</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Completion Rate</div>
      </div>
      <div className="space-y-2">
        <div className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          Overdue Training:
        </div>
        {overdueTraining.map((training, index) => (
          <div key={index} className="flex items-center gap-3 p-2 bg-red-50 rounded">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-red-200 text-red-700 text-xs">
                {training.employee.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium">{training.employee}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{training.course}</div>
            </div>
            <div className="text-xs text-red-600 font-medium">
              {training.overdue}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const IncidentReports: React.FC = () => {
  const incidents = [
    { type: 'Data Breach Attempt', severity: 'High', date: 'Jul 22', resolved: false },
    { type: 'Policy Violation', severity: 'Medium', date: 'Jul 20', resolved: true },
    { type: 'Safety Concern', severity: 'Low', date: 'Jul 18', resolved: true },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-orange-600" />
        <span className="font-semibold">Recent Incidents</span>
      </div>
      <div className="text-center mb-4">
        <div className="text-2xl font-bold">3</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>This month</div>
      </div>
      <div className="space-y-2">
        {incidents.map((incident, index) => (
          <div key={index} className="p-2 bg-brown-50 rounded">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{incident.type}</span>
              <Badge 
                variant={
                  incident.severity === 'High' ? 'destructive' :
                  incident.severity === 'Medium' ? 'secondary' : 'outline'
                }
                className="text-xs"
              >
                {incident.severity}
              </Badge>
            </div>
            <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              <span>{incident.date}</span>
              <span className={incident.resolved ? 'text-green-600' : 'text-red-600'}>
                {incident.resolved ? 'Resolved' : 'Open'}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-brown-100 flex items-center justify-center gap-2">
        <ArrowDown className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium text-green-600">-50% vs last month</span>
      </div>
    </Card>
  );
};

export const RiskAssessment: React.FC = () => {
  const riskAreas = [
    { area: 'Data Security', level: 'Low', score: 85 },
    { area: 'Operational Risk', level: 'Medium', score: 72 },
    { area: 'Compliance Risk', level: 'Low', score: 89 },
    { area: 'Financial Risk', level: 'Low', score: 91 },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Risk Assessment</span>
      </div>
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-green-600">Low</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Overall Risk Level</div>
      </div>
      <div className="space-y-2">
        {riskAreas.map((risk, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-brown-50 rounded">
            <span className="text-sm">{risk.area}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{risk.score}</span>
              <Badge 
                variant={
                  risk.level === 'High' ? 'destructive' :
                  risk.level === 'Medium' ? 'secondary' : 'default'
                }
                className="text-xs"
              >
                {risk.level}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const ComplianceTrends: React.FC = () => {
  const data = [
    { quarter: 'Q1', value: 89 },
    { quarter: 'Q2', value: 91 },
    { quarter: 'Q3', value: 92 },
    { quarter: 'Q4', value: 94 },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Compliance Trends</span>
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
            <div className="font-medium text-sm">{item.value}%</div>
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{item.quarter}</div>
          </div>
        ))}
      </div>

      {/* Growth Summary */}
      <div className="text-center">
        <div className="text-lg font-bold text-green-600">+5.6%</div>
        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Annual improvement</div>
      </div>
    </Card>
  );
};