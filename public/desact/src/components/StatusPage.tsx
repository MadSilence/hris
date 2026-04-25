import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Menu, Activity, CheckCircle, XCircle, AlertCircle, Info, Clock, Play, Pause, Square, BarChart3, TrendingUp, AlertTriangle, Zap, Signal, Wifi, Battery, Heart, User, Users, Building2, Shield, Target, Gauge, Loader2, RefreshCw, Timer, Eye, EyeOff, Star, Award, ThumbsUp, ThumbsDown, Calendar, MapPin, Phone, Mail, Settings, Code2, Hash, PaletteIcon, Smartphone, Monitor, Server, Database, Cloud, Globe, Lock, Unlock, Key, Power, PowerOff } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
import { MainSidebar } from './shared/MainSidebar';

interface StatusPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const StatusPage: React.FC<StatusPageProps> = ({ 
  onBack, 
  components, 
  onComponentClick, 
  currentComponent 
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Status states for interactive examples
  const [progressValue, setProgressValue] = useState(75);
  const [isOnline, setIsOnline] = useState(true);
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'warning' | 'error'>('healthy');
  const [currentStep, setCurrentStep] = useState(2);

  const { inputRef: sidebarInputRef, handleKeyDown: handleSidebarKeyDown } = useInputKeyboardShortcuts({
    value: sidebarSearchTerm,
    onChange: setSidebarSearchTerm,
    enableGlobalShortcuts: false,
  });

  const copyToClipboard = async (code: string, id: string) => {
    const textToCopy = code.trim();
    let copySuccess = false;

    const canUseClipboard = navigator.clipboard && 
                           window.isSecureContext && 
                           typeof navigator.permissions !== 'undefined';

    if (canUseClipboard) {
      try {
        const permission = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });
        if (permission.state === 'granted' || permission.state === 'prompt') {
          await navigator.clipboard.writeText(textToCopy);
          copySuccess = true;
        }
      } catch (err) {
        copySuccess = false;
      }
    }

    if (!copySuccess) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        textArea.style.fontSize = '16px';
        textArea.setAttribute('readonly', '');
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, textArea.value.length);
        
        copySuccess = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (fallbackErr) {
        copySuccess = false;
      }
    }

    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
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
      const sections = ['overview', 'indicators', 'progress', 'health', 'activity', 'system', 'employee', 'interactive', 'best-practices', 'implementation'];
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
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'indicators', label: 'Status Indicators', icon: CheckCircle },
    { id: 'progress', label: 'Progress Bars', icon: BarChart3 },
    { id: 'health', label: 'Health Status', icon: Heart },
    { id: 'activity', label: 'Activity States', icon: Clock },
    { id: 'system', label: 'System Status', icon: Server },
    { id: 'employee', label: 'Employee Status', icon: Users },
    { id: 'interactive', label: 'Interactive Examples', icon: Gauge },
    { id: 'best-practices', label: 'Best Practices', icon: Target },
    { id: 'implementation', label: 'Implementation', icon: Code2 },
  ];



  const PreviewCard: React.FC<{ children: React.ReactNode; title?: string; className?: string }> = ({ 
    children, 
    title, 
    className = "" 
  }) => (
    <Card className={`p-6 border-brown-200 ${className}`}>
      {title && <h4 className="font-semibold mb-4">{title}</h4>}
      {children}
    </Card>
  );

  const StatusIndicator: React.FC<{
    icon: React.ElementType;
    status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
    label: string;
    description?: string;
  }> = ({ icon: Icon, status, label, description }) => {
    const getStatusColors = () => {
      switch (status) {
        case 'success':
          return 'text-green-600 bg-green-100';
        case 'warning':
          return 'text-yellow-600 bg-yellow-100';
        case 'error':
          return 'text-red-600 bg-red-100';
        case 'info':
          return 'text-blue-600 bg-blue-100';
        default:
          return 'text-gray-600 bg-gray-100';
      }
    };

    return (
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${getStatusColors()}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <div className="font-medium">{label}</div>
          {description && (
            <div className="text-sm text-muted-foreground">{description}</div>
          )}
        </div>
      </div>
    );
  };

  const ProgressExample: React.FC<{
    label: string;
    value: number;
    variant?: 'default' | 'success' | 'warning' | 'error';
  }> = ({ label, value, variant = 'default' }) => {
    const getProgressColor = () => {
      switch (variant) {
        case 'success':
          return 'bg-green-500';
        case 'warning':
          return 'bg-yellow-500';
        case 'error':
          return 'bg-red-500';
        default:
          return '';
      }
    };

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{label}</span>
          <span>{value}%</span>
        </div>
        <Progress 
          value={value} 
          className={`h-2 ${getProgressColor()}`}
        />
      </div>
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
                  <h1 className="text-xl font-semibold">Status</h1>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                    Base Components
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Status indicators, progress bars, and activity states for system and user feedback
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
                      Status Components Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Status components provide visual feedback about system states, user activities, and process progress. 
                      Essential for keeping users informed and engaged in HR applications.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Status Indicators</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Visual indicators for success, warning, error, and info states.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Progress Tracking</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Progress bars and completion indicators for tasks and processes.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Activity className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Activity States</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Real-time activity indicators and user presence states.</p>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Status Component Types">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">Basic Indicators</h4>
                        <div className="space-y-3">
                          <StatusIndicator icon={CheckCircle} status="success" label="Success State" />
                          <StatusIndicator icon={AlertTriangle} status="warning" label="Warning State" />
                          <StatusIndicator icon={XCircle} status="error" label="Error State" />
                          <StatusIndicator icon={Info} status="info" label="Info State" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-medium">Progress Examples</h4>
                        <div className="space-y-4">
                          <ProgressExample label="Onboarding Progress" value={75} />
                          <ProgressExample label="Profile Completion" value={90} variant="success" />
                          <ProgressExample label="Training Required" value={25} variant="warning" />
                        </div>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Status Indicators */}
              <section id="indicators" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Status Indicators</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Visual indicators that communicate different states and conditions</p>
                  </div>
                  
                  <PreviewCard title="Basic Status Types">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="font-medium">Positive States</h4>
                        <div className="space-y-3">
                          <StatusIndicator 
                            icon={CheckCircle} 
                            status="success" 
                            label="Approved" 
                            description="Application has been approved"
                          />
                          <StatusIndicator 
                            icon={ThumbsUp} 
                            status="success" 
                            label="Completed" 
                            description="Task successfully finished"
                          />
                          <StatusIndicator 
                            icon={Award} 
                            status="success" 
                            label="Verified" 
                            description="Identity verified successfully"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium">Warning States</h4>
                        <div className="space-y-3">
                          <StatusIndicator 
                            icon={Clock} 
                            status="warning" 
                            label="Pending" 
                            description="Awaiting manager approval"
                          />
                          <StatusIndicator 
                            icon={AlertTriangle} 
                            status="warning" 
                            label="Expiring Soon" 
                            description="Certificate expires in 7 days"
                          />
                          <StatusIndicator 
                            icon={Timer} 
                            status="warning" 
                            label="Overdue" 
                            description="Performance review is overdue"
                          />
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

// Status Indicator Component
const StatusIndicator = ({ icon: Icon, status, label, description }) => {
  const getStatusColors = () => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'info':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className={\`p-2 rounded-full \${getStatusColors()}\`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="font-medium">{label}</div>
        {description && (
          <div className="text-sm text-muted-foreground">{description}</div>
        )}
      </div>
    </div>
  );
};

// Usage examples
<StatusIndicator icon={CheckCircle} status="success" label="Approved" />
<StatusIndicator icon={AlertTriangle} status="warning" label="Pending Review" />
<StatusIndicator icon={XCircle} status="error" label="Application Rejected" />`}
                      language="tsx"
                      id="status-indicators"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Progress Bars */}
              <section id="progress" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Progress Bars</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Visual representation of task completion and process status</p>
                  </div>
                  
                  <PreviewCard title="Progress Examples">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-4">Employee Onboarding</h4>
                        <div className="space-y-4">
                          <ProgressExample label="Documentation Review" value={100} variant="success" />
                          <ProgressExample label="IT Setup" value={85} />
                          <ProgressExample label="Training Modules" value={60} />
                          <ProgressExample label="Mentorship Assignment" value={25} variant="warning" />
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-4">Skills Assessment</h4>
                        <div className="space-y-4">
                          <ProgressExample label="Technical Skills" value={90} variant="success" />
                          <ProgressExample label="Communication" value={75} />
                          <ProgressExample label="Leadership" value={45} variant="warning" />
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Interactive Progress">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">Adjust Progress:</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setProgressValue(Math.max(0, progressValue - 10))}
                        >
                          -10%
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setProgressValue(Math.min(100, progressValue + 10))}
                        >
                          +10%
                        </Button>
                      </div>
                      <ProgressExample label="Dynamic Progress" value={progressValue} />
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Progress } from './components/ui/progress';

// Progress Component with Custom Styling
const ProgressExample = ({ label, value, variant = 'default' }) => {
  const getProgressColor = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <Progress 
        value={value} 
        className={\`h-2 \${getProgressColor()}\`}
      />
    </div>
  );
};

// Usage examples
<ProgressExample label="Profile Completion" value={85} />
<ProgressExample label="Training Progress" value={60} variant="warning" />
<ProgressExample label="Goals Achieved" value={95} variant="success" />`}
                      language="tsx"
                      id="progress-bars"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Health Status */}
              <section id="health" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Health Status</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>System health indicators and monitoring dashboards</p>
                  </div>
                  
                  <PreviewCard title="System Health Dashboard">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center p-4 border border-green-200 rounded-lg bg-green-50">
                        <Heart className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="font-semibold text-green-800">Healthy</div>
                        <div className="text-sm text-green-600">All systems operational</div>
                      </div>
                      
                      <div className="text-center p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                        <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                        <div className="font-semibold text-yellow-800">Warning</div>
                        <div className="text-sm text-yellow-600">Minor issues detected</div>
                      </div>
                      
                      <div className="text-center p-4 border border-red-200 rounded-lg bg-red-50">
                        <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                        <div className="font-semibold text-red-800">Critical</div>
                        <div className="text-sm text-red-600">Immediate attention required</div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Service Status">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="font-medium">Authentication Service</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Operational</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span className="font-medium">Email Service</span>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">Degraded</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="font-medium">Database</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Operational</Badge>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Activity States */}
              <section id="activity" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Activity States</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Real-time activity indicators and user presence states</p>
                  </div>
                  
                  <PreviewCard title="User Activity States">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="font-medium">Online Presence</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span>Online</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span>Away</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span>Busy</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                            <span>Offline</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium">Activity Indicators</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                            <span>Processing...</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <RefreshCw className="w-4 h-4 text-green-500" />
                            <span>Syncing</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-yellow-500" />
                            <span>Pending</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Complete</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Step Progress Indicator">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Onboarding Steps</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setCurrentStep(currentStep < 4 ? currentStep + 1 : 1)}
                        >
                          Next Step
                        </Button>
                      </div>
                      <div className="flex items-center space-x-4">
                        {[1, 2, 3, 4].map((step) => (
                          <div key={step} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              step <= currentStep 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {step <= currentStep ? <Check className="w-4 h-4" /> : step}
                            </div>
                            {step < 4 && (
                              <div className={`w-16 h-1 ${
                                step < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                              }`} />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Step {currentStep} of 4: {
                          ['Personal Info', 'Documents', 'Training', 'Complete'][currentStep - 1]
                        }
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* System Status */}
              <section id="system" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>System Status</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Infrastructure and service monitoring indicators</p>
                  </div>
                  
                  <PreviewCard title="Infrastructure Status">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">Server Status</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Server className="w-4 h-4 text-green-600" />
                              <span>Web Server</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="text-sm">99.9%</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Database className="w-4 h-4 text-green-600" />
                              <span>Database</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="text-sm">99.8%</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Cloud className="w-4 h-4 text-yellow-600" />
                              <span>CDN</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                              <span className="text-sm">95.2%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium">Security Status</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Shield className="w-4 h-4 text-green-600" />
                              <span>SSL Certificate</span>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Valid</Badge>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Lock className="w-4 h-4 text-green-600" />
                              <span>Firewall</span>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Key className="w-4 h-4 text-yellow-600" />
                              <span>API Keys</span>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-800">Expiring</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Employee Status */}
              <section id="employee" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Employee Status</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Employee-specific status indicators for HR systems</p>
                  </div>
                  
                  <PreviewCard title="Employment Status">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="font-medium">Work Status</h4>
                        <div className="space-y-3">
                          <StatusIndicator 
                            icon={User} 
                            status="success" 
                            label="Active Employee" 
                            description="Full-time, currently working"
                          />
                          <StatusIndicator 
                            icon={Clock} 
                            status="warning" 
                            label="On Leave" 
                            description="Vacation until March 15"
                          />
                          <StatusIndicator 
                            icon={Pause} 
                            status="neutral" 
                            label="Inactive" 
                            description="Account temporarily disabled"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium">Performance Status</h4>
                        <div className="space-y-3">
                          <StatusIndicator 
                            icon={Star} 
                            status="success" 
                            label="Exceeds Expectations" 
                            description="Q1 performance review"
                          />
                          <StatusIndicator 
                            icon={Target} 
                            status="info" 
                            label="Meets Expectations" 
                            description="On track with goals"
                          />
                          <StatusIndicator 
                            icon={AlertTriangle} 
                            status="warning" 
                            label="Needs Improvement" 
                            description="Performance plan in place"
                          />
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Team Overview">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Team Status Summary</h4>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span>8 Active</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span>2 On Leave</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                            <span>1 Remote</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                          { name: 'Sarah Johnson', status: 'online', role: 'Manager' },
                          { name: 'Mike Chen', status: 'away', role: 'Developer' },
                          { name: 'Lisa Williams', status: 'busy', role: 'Designer' },
                          { name: 'James Brown', status: 'offline', role: 'Analyst' },
                          { name: 'Emma Davis', status: 'online', role: 'Developer' },
                          { name: 'Alex Turner', status: 'away', role: 'QA Engineer' }
                        ].map((employee, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className={`w-3 h-3 rounded-full ${
                              employee.status === 'online' ? 'bg-green-500' :
                              employee.status === 'away' ? 'bg-yellow-500' :
                              employee.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{employee.name}</div>
                              <div className="text-sm text-muted-foreground">{employee.role}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Interactive Examples */}
              <section id="interactive" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Interactive Examples</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Live examples with interactive controls</p>
                  </div>
                  
                  <PreviewCard title="Dynamic Status Controls">
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <span className="font-medium">Online Status:</span>
                          <Button 
                            size="sm" 
                            variant={isOnline ? "default" : "outline"}
                            onClick={() => setIsOnline(!isOnline)}
                          >
                            {isOnline ? 'Online' : 'Offline'}
                          </Button>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span>{isOnline ? 'User is currently online' : 'User is offline'}</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <span className="font-medium">System Health:</span>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant={systemStatus === 'healthy' ? "default" : "outline"}
                              onClick={() => setSystemStatus('healthy')}
                              className={systemStatus === 'healthy' ? "bg-green-600 hover:bg-green-700 border-0" : ""}
                            >
                              Healthy
                            </Button>
                            <Button 
                              size="sm" 
                              variant={systemStatus === 'warning' ? "default" : "outline"}
                              onClick={() => setSystemStatus('warning')}
                              className={systemStatus === 'warning' ? "bg-yellow-600 hover:bg-yellow-700 border-0 text-white" : ""}
                            >
                              Warning
                            </Button>
                            <Button 
                              size="sm" 
                              variant={systemStatus === 'error' ? "default" : "outline"}
                              onClick={() => setSystemStatus('error')}
                              className={systemStatus === 'error' ? "bg-red-600 hover:bg-red-700 border-0" : ""}
                            >
                              Error
                            </Button>
                          </div>
                        </div>
                        <StatusIndicator 
                          icon={systemStatus === 'healthy' ? Heart : systemStatus === 'warning' ? AlertTriangle : XCircle}
                          status={systemStatus}
                          label={`System ${systemStatus.charAt(0).toUpperCase() + systemStatus.slice(1)}`}
                          description={
                            systemStatus === 'healthy' ? 'All services running normally' :
                            systemStatus === 'warning' ? 'Some services experiencing issues' :
                            'Critical system failure detected'
                          }
                        />
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Best Practices */}
              <section id="best-practices" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Best Practices</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Guidelines for effective status component usage</p>
                  </div>
                  
                  <PreviewCard title="Design Guidelines">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="font-medium text-green-700">✅ Do</h4>
                        <ul className="space-y-2 text-sm">
                          <li>• Use consistent color coding across your application</li>
                          <li>• Provide clear, actionable status messages</li>
                          <li>• Include progress indicators for long-running tasks</li>
                          <li>• Use animations sparingly for status changes</li>
                          <li>• Make status indicators accessible with proper labels</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium text-red-700">❌ Don't</h4>
                        <ul className="space-y-2 text-sm">
                          <li>• Use colors without additional context or labels</li>
                          <li>• Overuse destructive status indicators</li>
                          <li>• Make status indicators too small to notice</li>
                          <li>• Use blinking or distracting animations</li>
                          <li>• Leave users without feedback on actions</li>
                        </ul>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Color Usage Guidelines">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="text-center p-4 border border-green-200 rounded-lg bg-green-50">
                        <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2"></div>
                        <div className="font-medium text-green-800">Success</div>
                        <div className="text-xs text-green-600 mt-1">Completed, approved, active</div>
                      </div>
                      
                      <div className="text-center p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                        <div className="font-medium text-yellow-800">Warning</div>
                        <div className="text-xs text-yellow-600 mt-1">Pending, expiring, attention needed</div>
                      </div>
                      
                      <div className="text-center p-4 border border-red-200 rounded-lg bg-red-50">
                        <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2"></div>
                        <div className="font-medium text-red-800">Error</div>
                        <div className="text-xs text-red-600 mt-1">Failed, rejected, critical</div>
                      </div>
                      
                      <div className="text-center p-4 border border-blue-200 rounded-lg bg-blue-50">
                        <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2"></div>
                        <div className="font-medium text-blue-800">Info</div>
                        <div className="text-xs text-blue-600 mt-1">New, updated, informational</div>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Implementation */}
              <section id="implementation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Implementation</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Complete implementation examples and code snippets</p>
                  </div>
                  
                  <PreviewCard title="Installation & Setup">
                    <CodeBlock
                      code={`# Install required dependencies
npm install @radix-ui/react-progress
npm install lucide-react
npm install class-variance-authority

# Import components
import { Progress } from './components/ui/progress'
import { Badge } from './components/ui/badge'
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'`}
                      language="bash"
                      id="installation"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>

                  <PreviewCard title="Complete Status System">
                    <CodeBlock
                      code={`import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, Clock, Heart } from 'lucide-react';
import { Progress } from './components/ui/progress';
import { Badge } from './components/ui/badge';

// Status Types
type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

// Status Indicator Component
interface StatusIndicatorProps {
  icon: React.ElementType;
  status: StatusType;
  label: string;
  description?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  icon: Icon, 
  status, 
  label, 
  description 
}) => {
  const getStatusColors = () => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'info':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className={\`p-2 rounded-full \${getStatusColors()}\`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="font-medium">{label}</div>
        {description && (
          <div className="text-sm text-muted-foreground">{description}</div>
        )}
      </div>
    </div>
  );
};

// Progress with Status Component
interface ProgressWithStatusProps {
  label: string;
  value: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const ProgressWithStatus: React.FC<ProgressWithStatusProps> = ({ 
  label, 
  value, 
  variant = 'default' 
}) => {
  const getProgressColor = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    if (value === 100) return CheckCircle;
    if (value >= 75) return Clock;
    if (value >= 50) return AlertTriangle;
    return XCircle;
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <StatusIcon className="w-4 h-4" />
          <span>{label}</span>
        </div>
        <span>{value}%</span>
      </div>
      <Progress 
        value={value} 
        className={\`h-2 \${getProgressColor()}\`}
      />
    </div>
  );
};

// Usage Examples
export const StatusExamples = () => {
  return (
    <div className="space-y-8">
      {/* Status Indicators */}
      <div className="space-y-4">
        <h3 className="font-semibold">Status Indicators</h3>
        <StatusIndicator 
          icon={CheckCircle} 
          status="success" 
          label="Employee Onboarded" 
          description="All documents verified and approved"
        />
        <StatusIndicator 
          icon={AlertTriangle} 
          status="warning" 
          label="Certificate Expiring" 
          description="Renewal required within 30 days"
        />
        <StatusIndicator 
          icon={XCircle} 
          status="error" 
          label="System Error" 
          description="Unable to process request"
        />
      </div>

      {/* Progress Examples */}
      <div className="space-y-4">
        <h3 className="font-semibold">Progress Tracking</h3>
        <ProgressWithStatus 
          label="Training Completion" 
          value={85} 
          variant="success" 
        />
        <ProgressWithStatus 
          label="Profile Setup" 
          value={60} 
          variant="warning" 
        />
        <ProgressWithStatus 
          label="Document Upload" 
          value={25} 
          variant="error" 
        />
      </div>

      {/* System Health */}
      <div className="space-y-4">
        <h3 className="font-semibold">System Health</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 border border-green-200 rounded-lg bg-green-50">
            <Heart className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="font-semibold text-green-800">Healthy</div>
            <div className="text-sm text-green-600">All systems operational</div>
          </div>
          <div className="text-center p-4 border border-yellow-200 rounded-lg bg-yellow-50">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <div className="font-semibold text-yellow-800">Warning</div>
            <div className="text-sm text-yellow-600">Minor issues detected</div>
          </div>
          <div className="text-center p-4 border border-red-200 rounded-lg bg-red-50">
            <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <div className="font-semibold text-red-800">Critical</div>
            <div className="text-sm text-red-600">Immediate attention required</div>
          </div>
        </div>
      </div>
    </div>
  );
};`}
                      language="tsx"
                      id="implementation-complete"
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