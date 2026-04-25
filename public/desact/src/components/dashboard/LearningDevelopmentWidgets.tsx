import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { 
  BookOpen,
  Award,
  Target,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Star,
  ArrowUp,
  PlayCircle,
  GraduationCap,
  BarChart3
} from 'lucide-react';

export const TrainingCompletion: React.FC = () => (
  <Card className="p-6 border-brown-200 bg-gradient-to-br from-blue-50 to-white">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 bg-blue-100 rounded-full">
        <BookOpen className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <div className="text-2xl font-bold">78%</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Training Completion</div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <ArrowUp className="w-4 h-4 text-green-600" />
      <span className="text-sm font-medium text-green-600">+12% this quarter</span>
    </div>
  </Card>
);

export const SkillDevelopment: React.FC = () => {
  const skills = [
    { name: 'Leadership', inProgress: 24, completed: 67 },
    { name: 'Technical', inProgress: 18, completed: 89 },
    { name: 'Communication', inProgress: 15, completed: 45 },
    { name: 'Project Management', inProgress: 12, completed: 34 },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Skill Development</span>
      </div>
      <div className="space-y-3">
        {skills.map((skill, index) => (
          <div key={index} className="p-2 bg-brown-50 rounded">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{skill.name}</span>
              <span className="text-sm font-bold">{skill.completed + skill.inProgress}</span>
            </div>
            <div className="flex gap-1">
              <div className="flex-1 bg-green-200 rounded h-2">
                <div 
                  className="bg-green-500 h-2 rounded-l"
                  style={{ width: `${(skill.completed / (skill.completed + skill.inProgress)) * 100}%` }}
                />
              </div>
              <div className="flex-1 bg-blue-200 rounded h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-r"
                  style={{ width: `${(skill.inProgress / (skill.completed + skill.inProgress)) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
              <span>{skill.completed} completed</span>
              <span>{skill.inProgress} in progress</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const Certifications: React.FC = () => {
  const recentCerts = [
    { employee: 'Sarah Johnson', cert: 'AWS Solutions Architect', date: 'Jul 15' },
    { employee: 'Mike Chen', cert: 'Google Analytics', date: 'Jul 10' },
    { employee: 'Emily Davis', cert: 'Project Management', date: 'Jun 28' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-yellow-500" />
        <span className="font-semibold">Recent Certifications</span>
      </div>
      <div className="space-y-3">
        {recentCerts.map((cert, index) => (
          <div key={index} className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-yellow-200 text-yellow-700 text-xs">
                {cert.employee.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium">{cert.employee}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{cert.cert}</div>
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {cert.date}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-brown-100">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-600">23</div>
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Earned</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-600">8</div>
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>In Progress</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const LearningHours: React.FC = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const hours = [980, 1120, 1040, 1200, 1180, 1240];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Learning Hours</span>
      </div>
      <div className="text-center mb-4">
        <div className="text-2xl font-bold">1,240</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>This month</div>
      </div>
      <div className="h-20 flex items-end gap-1 mb-3">
        {hours.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className="w-full bg-brown-500 rounded-t transition-all duration-500"
              style={{ height: `${((value - 900) / 400) * 60}px` }}
            />
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {months[index]}
            </div>
          </div>
        ))}
      </div>
      <div className="text-center">
        <div className="text-lg font-bold">3.8h</div>
        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Average per employee</div>
      </div>
    </Card>
  );
};

export const TopLearners: React.FC = () => {
  const learners = [
    { name: 'Sarah Johnson', hours: 24, courses: 8, dept: 'Engineering' },
    { name: 'Mike Chen', hours: 22, courses: 6, dept: 'Design' },
    { name: 'Emily Davis', hours: 20, courses: 7, dept: 'Marketing' },
    { name: 'David Kim', hours: 18, courses: 5, dept: 'Sales' },
    { name: 'Lisa Wang', hours: 16, courses: 4, dept: 'HR' },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Top Learners</span>
      </div>
      <div className="space-y-3">
        {learners.map((learner, index) => (
          <div key={index} className="flex items-center gap-3 p-2 bg-brown-50 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-brown-200 flex items-center justify-center">
              <span className="text-xs font-bold text-brown-700">#{index + 1}</span>
            </div>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-brown-200 text-brown-700 text-xs">
                {learner.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium">{learner.name}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {learner.dept} • {learner.courses} courses
              </div>
            </div>
            <div className="text-sm font-bold">{learner.hours}h</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const CourseRatings: React.FC = () => {
  const topCourses = [
    { name: 'Leadership Fundamentals', rating: 4.8, reviews: 45 },
    { name: 'Project Management', rating: 4.6, reviews: 32 },
    { name: 'Data Analysis', rating: 4.5, reviews: 28 },
    { name: 'Communication Skills', rating: 4.3, reviews: 41 },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-yellow-500" />
        <span className="font-semibold">Course Ratings</span>
      </div>
      <div className="text-center mb-4">
        <div className="text-2xl font-bold">4.3</div>
        <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Average Rating</div>
      </div>
      <div className="space-y-2">
        {topCourses.map((course, index) => (
          <div key={index} className="p-2 bg-brown-50 rounded">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{course.name}</span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500" />
                <span className="text-sm font-bold">{course.rating}</span>
              </div>
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {course.reviews} reviews
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const LearningPaths: React.FC = () => {
  const paths = [
    { name: 'Management Track', active: 12, completed: 8, progress: 67 },
    { name: 'Technical Skills', active: 15, completed: 12, progress: 80 },
    { name: 'Sales Excellence', active: 9, completed: 6, progress: 67 },
    { name: 'Creative Design', active: 7, completed: 4, progress: 57 },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Learning Paths</span>
      </div>
      <div className="space-y-3">
        {paths.map((path, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{path.name}</span>
              <span className="text-sm font-bold">{path.active + path.completed}</span>
            </div>
            <div className="w-full bg-brown-100 rounded-full h-2">
              <div 
                className="bg-brown-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${path.progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              <span>{path.completed} completed</span>
              <span>{path.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const LearningTrends: React.FC = () => {
  const data = [
    { quarter: 'Q1', value: 65 },
    { quarter: 'Q2', value: 72 },
    { quarter: 'Q3', value: 78 },
    { quarter: 'Q4', value: 85 },
  ];

  return (
    <Card className="p-6 border-brown-200">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-brown-600" />
        <span className="font-semibold">Learning Engagement</span>
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
        <div className="text-lg font-bold text-green-600">+30.8%</div>
        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Annual growth</div>
      </div>
    </Card>
  );
};