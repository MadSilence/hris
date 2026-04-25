import React, { useState, useEffect } from 'react';
import { ArrowLeft, Menu, Target, TrendingUp, Activity, BarChart3, Clock, Users, CheckCircle, AlertCircle, FileText, Settings, Play, Pause } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
import { MainSidebar } from './shared/MainSidebar';

interface ActivityGaugesPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const ActivityGaugesPage: React.FC<ActivityGaugesPageProps> = ({ 
  onBack, 
  components, 
  onComponentClick, 
  currentComponent 
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  
  // Interactive states for gauges
  const [progressValue, setProgressValue] = useState(65);
  const [isAnimating, setIsAnimating] = useState(false);
  const [customValues, setCustomValues] = useState({
    productivity: 78,
    engagement: 85,
    completion: 92,
    performance: 67
  });

  const { inputRef: sidebarInputRef, handleKeyDown: handleSidebarKeyDown } = useInputKeyboardShortcuts({
    value: sidebarSearchTerm,
    onChange: setSidebarSearchTerm,
    enableGlobalShortcuts: false,
    onFocus: () => {
      console.log('Sidebar search focused');
    },
  });

  const copyToClipboard = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 73;
      const elementTop = element.offsetTop - headerHeight - 24;
      window.scrollTo({
        top: elementTop,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'linear-progress', 'circular-progress', 'activity-rings', 'performance-gauges', 'status-indicators', 'interactive-gauges', 'implementation'];
      const scrollPosition = window.scrollY + 150;
      let currentSection = sections[0];
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element) {
          const { offsetTop } = element;
          if (scrollPosition >= offsetTop) {
            currentSection = sections[i];
            break;
          }
        }
      }
      
      setActiveSection(currentSection);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sidebarSections = [
    { id: 'overview', label: 'Overview', icon: Menu },
    { id: 'linear-progress', label: 'Linear Progress', icon: BarChart3 },
    { id: 'circular-progress', label: 'Circular Progress', icon: Target },
    { id: 'activity-rings', label: 'Activity Rings', icon: Activity },
    { id: 'performance-gauges', label: 'Performance Gauges', icon: TrendingUp },
    { id: 'status-indicators', label: 'Status Indicators', icon: CheckCircle },
    { id: 'interactive-gauges', label: 'Interactive Gauges', icon: Settings },
    { id: 'implementation', label: 'Implementation', icon: FileText },
  ];

  const PreviewCard: React.FC<{ children: React.ReactNode; title?: string; className?: string }> = ({ 
    children, 
    title, 
    className = "" 
  }) => (
    <Card className={`p-6 border-brown-200 ${className} relative overflow-visible`}>
      {title && <h4 className="font-semibold mb-4">{title}</h4>}
      {children}
    </Card>
  );

  // Circular progress component
  const CircularProgress: React.FC<{ value: number; size?: number; strokeWidth?: number; className?: string }> = ({ 
    value, 
    size = 120, 
    strokeWidth = 8, 
    className = "" 
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className={`relative ${className}`} style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-brown-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="text-brown-700 transition-all duration-300 ease-in-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-brown-900">{value}%</span>
        </div>
      </div>
    );
  };

  // Activity ring component
  const ActivityRing: React.FC<{ 
    value: number; 
    max: number; 
    color: string; 
    size?: number; 
    strokeWidth?: number; 
  }> = ({ value, max, color, size = 60, strokeWidth = 4 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / max) * circumference;

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-brown-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-300 ease-in-out"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-brown-50/30 flex">
      {/* Main Sidebar */}
      <MainSidebar
        onBack={onBack}
        components={components}
        onComponentClick={onComponentClick}
        currentComponent={currentComponent}
        sidebarSearchTerm={sidebarSearchTerm}
        setSidebarSearchTerm={setSidebarSearchTerm}
        collapsedCategories={collapsedCategories}
        setCollapsedCategories={setCollapsedCategories}
        sidebarInputRef={sidebarInputRef}
        handleSidebarKeyDown={handleSidebarKeyDown}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-brown-200 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-brown-50">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold">Activity Gauges</h1>
                  <Badge variant="secondary" className="bg-brown-100 text-brown-700 border-brown-200">
                    Components
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Progress indicators and activity gauges for tracking HR metrics and employee engagement
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content with Floating Navigation */}
        <div className="flex-1 relative">
          {/* Floating Navigation */}
          <div className="fixed right-8 top-40 z-30 hidden xl:block">
            <div className="bg-white rounded-lg border border-brown-200 shadow-lg p-4 w-56">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-brown-100">
                <Menu className="h-4 w-4" style={{ color: 'var(--color-text-quaternary)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>On this page</span>
              </div>
              <nav className="space-y-1">
                {sidebarSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded transition-all duration-200 ${
                      activeSection === section.id
                        ? 'font-medium bg-brown-50 border-l-2 border-brown-500 pl-3'
                        : 'hover:bg-brown-50'
                    }`}
                    style={{ 
                      color: activeSection === section.id 
                        ? 'var(--color-fg-brand-primary)'
                        : 'var(--color-text-tertiary)' 
                    }}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8 xl:pr-72">
            <div className="max-w-4xl mx-auto space-y-16">
              {/* Overview Section */}
              <section id="overview" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Activity Gauges Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Visual progress indicators and activity gauges help track employee performance, engagement metrics, 
                      and project completion rates with clear, accessible feedback for HR teams and managers.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <BarChart3 className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Linear Progress</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Horizontal progress bars for tracking completion and performance metrics.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Target className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Circular Progress</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Radial indicators perfect for showing goal completion and KPI achievement.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Activity className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Activity Rings</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Multi-layered rings for tracking multiple metrics simultaneously.</p>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Linear Progress Section */}
              <section id="linear-progress" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Linear Progress Indicators
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Horizontal progress bars for tracking completion rates, performance metrics, and goal achievement.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Performance Tracking">
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-brown-900">Goal Completion</span>
                            <span className="text-sm text-brown-600">85%</span>
                          </div>
                          <Progress value={85} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-brown-900">Training Progress</span>
                            <span className="text-sm text-brown-600">62%</span>
                          </div>
                          <Progress value={62} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-brown-900">Project Milestones</span>
                            <span className="text-sm text-brown-600">94%</span>
                          </div>
                          <Progress value={94} className="h-2" />
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Team Performance Dashboard">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-brown-600" />
                            <span className="font-medium text-brown-900">Team Productivity</span>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span>Q4 Goals</span>
                              <span className="text-brown-600">78%</span>
                            </div>
                            <Progress value={78} className="h-3" />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-brown-600" />
                            <span className="font-medium text-brown-900">Time Tracking</span>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span>Weekly Target</span>
                              <span className="text-brown-600">92%</span>
                            </div>
                            <Progress value={92} className="h-3" />
                          </div>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Circular Progress Section */}
              <section id="circular-progress" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Circular Progress Indicators
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Radial progress indicators that provide a compact, visually appealing way to display completion percentages.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Employee Performance Metrics">
                      <div className="grid md:grid-cols-4 gap-8 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          <CircularProgress value={78} size={100} />
                          <div>
                            <div className="font-medium text-brown-900">Productivity</div>
                            <div className="text-sm text-brown-600">Above Target</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-center space-y-3">
                          <CircularProgress value={85} size={100} />
                          <div>
                            <div className="font-medium text-brown-900">Engagement</div>
                            <div className="text-sm text-brown-600">Excellent</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-center space-y-3">
                          <CircularProgress value={92} size={100} />
                          <div>
                            <div className="font-medium text-brown-900">Attendance</div>
                            <div className="text-sm text-brown-600">Outstanding</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-center space-y-3">
                          <CircularProgress value={67} size={100} />
                          <div>
                            <div className="font-medium text-brown-900">Training</div>
                            <div className="text-sm text-brown-600">In Progress</div>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Department Overview">
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-brown-50 rounded-lg p-6 text-center">
                          <CircularProgress value={89} size={120} strokeWidth={10} />
                          <div className="mt-4">
                            <h4 className="font-semibold text-brown-900">Engineering</h4>
                            <p className="text-sm text-brown-600 mt-1">24 employees • Q4 goals</p>
                          </div>
                        </div>
                        <div className="bg-brown-50 rounded-lg p-6 text-center">
                          <CircularProgress value={73} size={120} strokeWidth={10} />
                          <div className="mt-4">
                            <h4 className="font-semibold text-brown-900">Marketing</h4>
                            <p className="text-sm text-brown-600 mt-1">12 employees • Q4 goals</p>
                          </div>
                        </div>
                        <div className="bg-brown-50 rounded-lg p-6 text-center">
                          <CircularProgress value={96} size={120} strokeWidth={10} />
                          <div className="mt-4">
                            <h4 className="font-semibold text-brown-900">Sales</h4>
                            <p className="text-sm text-brown-600 mt-1">18 employees • Q4 goals</p>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Activity Rings Section */}
              <section id="activity-rings" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Activity Rings
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Multi-layered ring indicators for tracking multiple related metrics simultaneously with clear visual hierarchy.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Daily Activity Overview">
                      <div className="grid md:grid-cols-4 gap-8">
                        <div className="text-center">
                          <div className="relative inline-block">
                            <ActivityRing value={8} max={8} color="#92400e" size={80} strokeWidth={6} />
                            <ActivityRing value={6} max={8} color="#a16207" size={68} strokeWidth={5} className="absolute inset-0 mt-1.5 ml-1.5" />
                            <ActivityRing value={12} max={16} color="#ca8a04" size={56} strokeWidth={4} className="absolute inset-0 mt-3 ml-3" />
                          </div>
                          <div className="mt-3">
                            <div className="font-medium text-brown-900">Sarah Johnson</div>
                            <div className="text-xs text-brown-600 mt-1">Goals • Tasks • Time</div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="relative inline-block">
                            <ActivityRing value={6} max={8} color="#92400e" size={80} strokeWidth={6} />
                            <ActivityRing value={8} max={8} color="#a16207" size={68} strokeWidth={5} className="absolute inset-0 mt-1.5 ml-1.5" />
                            <ActivityRing value={10} max={16} color="#ca8a04" size={56} strokeWidth={4} className="absolute inset-0 mt-3 ml-3" />
                          </div>
                          <div className="mt-3">
                            <div className="font-medium text-brown-900">Mike Chen</div>
                            <div className="text-xs text-brown-600 mt-1">Goals • Tasks • Time</div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="relative inline-block">
                            <ActivityRing value={8} max={8} color="#92400e" size={80} strokeWidth={6} />
                            <ActivityRing value={7} max={8} color="#a16207" size={68} strokeWidth={5} className="absolute inset-0 mt-1.5 ml-1.5" />
                            <ActivityRing value={14} max={16} color="#ca8a04" size={56} strokeWidth={4} className="absolute inset-0 mt-3 ml-3" />
                          </div>
                          <div className="mt-3">
                            <div className="font-medium text-brown-900">Lisa Park</div>
                            <div className="text-xs text-brown-600 mt-1">Goals • Tasks • Time</div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="relative inline-block">
                            <ActivityRing value={5} max={8} color="#92400e" size={80} strokeWidth={6} />
                            <ActivityRing value={4} max={8} color="#a16207" size={68} strokeWidth={5} className="absolute inset-0 mt-1.5 ml-1.5" />
                            <ActivityRing value={8} max={16} color="#ca8a04" size={56} strokeWidth={4} className="absolute inset-0 mt-3 ml-3" />
                          </div>
                          <div className="mt-3">
                            <div className="font-medium text-brown-900">David Kim</div>
                            <div className="text-xs text-brown-600 mt-1">Goals • Tasks • Time</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-amber-700"></div>
                          <span className="text-brown-600">Goals (8)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                          <span className="text-brown-600">Tasks (8)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                          <span className="text-brown-600">Time (16h)</span>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Performance Gauges Section */}
              <section id="performance-gauges" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Performance Gauges
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Advanced gauge components for displaying performance metrics with threshold indicators and status colors.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="KPI Dashboard">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-gradient-to-br from-brown-50 to-brown-100 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-brown-900">Employee Satisfaction</h4>
                            <Badge className="bg-green-100 text-green-800 border-green-200">Excellent</Badge>
                          </div>
                          <div className="flex items-center justify-center">
                            <CircularProgress value={87} size={140} strokeWidth={12} />
                          </div>
                          <div className="text-center mt-4">
                            <p className="text-sm text-brown-600">Target: 80% • Current: 87%</p>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-brown-50 to-brown-100 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-brown-900">Retention Rate</h4>
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Good</Badge>
                          </div>
                          <div className="flex items-center justify-center">
                            <CircularProgress value={74} size={140} strokeWidth={12} />
                          </div>
                          <div className="text-center mt-4">
                            <p className="text-sm text-brown-600">Target: 85% • Current: 74%</p>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Status Indicators Section */}
              <section id="status-indicators" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Status Indicators
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Simple status indicators and completion badges for quick visual feedback on task and goal states.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Project Status Overview">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-brown-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                              <h5 className="font-medium text-brown-900">Q4 Performance Reviews</h5>
                              <p className="text-sm text-brown-600">Completed 2 days ago</p>
                            </div>
                          </div>
                          <Progress value={100} className="w-24 h-2" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-brown-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-brown-600" />
                            <div>
                              <h5 className="font-medium text-brown-900">Employee Training Program</h5>
                              <p className="text-sm text-brown-600">In progress • Due in 5 days</p>
                            </div>
                          </div>
                          <Progress value={68} className="w-24 h-2" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-brown-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                            <div>
                              <h5 className="font-medium text-brown-900">Onboarding Checklist</h5>
                              <p className="text-sm text-brown-600">Attention needed • 3 items pending</p>
                            </div>
                          </div>
                          <Progress value={45} className="w-24 h-2" />
                        </div>
                      </div>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Interactive Gauges Section */}
              <section id="interactive-gauges" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Interactive Gauges
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Interactive components that allow users to adjust values and see real-time updates to gauge displays.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Adjustable Performance Tracker">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <label className="text-sm font-medium text-brown-900 block mb-3">
                              Productivity Score: {customValues.productivity}%
                            </label>
                            <Slider
                              value={[customValues.productivity]}
                              onValueChange={(value) => setCustomValues(prev => ({ ...prev, productivity: value[0] }))}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-brown-900 block mb-3">
                              Engagement Score: {customValues.engagement}%
                            </label>
                            <Slider
                              value={[customValues.engagement]}
                              onValueChange={(value) => setCustomValues(prev => ({ ...prev, engagement: value[0] }))}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <CircularProgress value={customValues.productivity} size={120} strokeWidth={10} />
                          <div className="text-center">
                            <p className="font-medium text-brown-900">Overall Performance</p>
                            <p className="text-sm text-brown-600">Productivity & Engagement</p>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Real-time Progress Simulation">
                      <div className="flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <CircularProgress 
                            value={isAnimating ? Math.min(progressValue + 20, 100) : progressValue} 
                            size={160} 
                            strokeWidth={12} 
                            className={isAnimating ? 'transition-all duration-1000' : ''}
                          />
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-brown-700 text-white hover:bg-brown-800"
                              onClick={() => setIsAnimating(!isAnimating)}
                            >
                              {isAnimating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                              {isAnimating ? 'Pause' : 'Start'} Animation
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-brown-300 text-brown-700 hover:bg-brown-100"
                              onClick={() => setProgressValue(Math.floor(Math.random() * 100))}
                            >
                              Random Value
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Implementation Section */}
              <section id="implementation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Implementation Guidelines
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Code examples and best practices for implementing accessible and performant activity gauges.
                    </p>
                  </div>

                  <PreviewCard title="Circular Progress Component">
                    <CodeBlock
                      code={`const CircularProgress: React.FC<{
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}> = ({ value, size = 120, strokeWidth = 8, className = "" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-brown-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-brown-700 transition-all duration-300"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-semibold text-brown-900">{value}%</span>
      </div>
    </div>
  );
};`}
                      language="tsx"
                      id="circular-progress-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};