import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Search, ChevronRight, Menu, Layers, Package, Award, AlertTriangle, CheckCircle, XCircle, AlertCircle, Info, Clock, Star, Users, Building2, UserCheck, FileText, Settings, Calendar, Briefcase, Shield, Target, TrendingUp, Code2, Eye, Hash, Zap, Activity, DollarSign, BookOpen, HelpCircle, Coffee, Plane, GraduationCap, Heart, Gift, Timer, PanelLeftOpen, Megaphone, Command, Edit, PaletteIcon as PaletteIcon, Upload, Gauge, ArrowUpDown, RefreshCw, Smartphone, Filter, Download, Plus, Bell, LogOut, Grid3X3, List, PieChart, Type, Lightbulb, Ban, CircleAlert, BarChart3, X, CreditCard, Layout, Navigation, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
// Static icon mappings
const categoryIcons: Record<string, React.ElementType> = {
  'Base components': Layers,
  'Application UI': Zap,
  'Marketing': Star,
  'Documentation': FileText
};

const componentIcons: Record<string, React.ElementType> = {
  'Buttons': Award,
  'Forms': Edit,
  'Input': Layout,
  'Layout': Layout,
  'HR Cards': CreditCard,
  'Accordion': List,
  'Navigation': Navigation,
  'Breadcrumbs': ArrowRight,
  'Pagination': ArrowUpDown,
  'Interaction': Award,
  'Badges': Award,
  'Alerts': AlertTriangle,
  'Data Display': Grid3X3,
  'Charts': PieChart,
  'Lists': List,
  'Skeletons': Package,
  'Modals': Award,
  'Drawer': PanelLeftOpen,
  'Avatars': Users,
  'File Upload': Upload,
  'Dashboard': Gauge,
  'Simple Insight': TrendingUp,
  'Color Picker': PaletteIcon,
  'Command Menu': Command,
  'Text Editor': Edit,
  'Status': Activity,
  'Typography': Type,
  'System Colors': PaletteIcon,
  'Icons': Hash,
  'Miscellaneous': Settings,
  'Default': Package
};
import { DesactLogo } from './shared/DesactLogo';

interface AlertsPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ 
  onBack, 
  components, 
  onComponentClick, 
  currentComponent 
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<number>>(new Set());

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

  const toggleCategory = (category: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  const dismissAlert = (id: number) => {
    setDismissedAlerts(prev => new Set([...prev, id]));
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'default', 'destructive', 'info', 'warning', 'success', 'dismissible', 'complex', 'hr-examples', 'best-practices', 'implementation'];
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
    { id: 'overview', label: 'Overview', icon: AlertCircle },
    { id: 'default', label: 'Default Alerts', icon: Info },
    { id: 'destructive', label: 'Destructive Alerts', icon: AlertTriangle },
    { id: 'info', label: 'Info Alerts', icon: Info },
    { id: 'warning', label: 'Warning Alerts', icon: AlertTriangle },
    { id: 'success', label: 'Success Alerts', icon: CheckCircle },
    { id: 'dismissible', label: 'Dismissible Alerts', icon: X },
    { id: 'complex', label: 'Complex Alerts', icon: Package },
    { id: 'hr-examples', label: 'HR Examples', icon: Users },
    { id: 'best-practices', label: 'Best Practices', icon: CheckCircle },
    { id: 'implementation', label: 'Implementation', icon: Code2 },
  ];

  // Group components by category
  const componentsByCategory = components.reduce((acc, component) => {
    if (!acc[component.category]) {
      acc[component.category] = [];
    }
    acc[component.category].push(component);
    return acc;
  }, {} as Record<string, typeof components>);

  // Filter components based on search
  const filteredComponentsByCategory = Object.entries(componentsByCategory).reduce((acc, [category, categoryComponents]) => {
    const filtered = categoryComponents.filter(component =>
      component.name.toLowerCase().includes(sidebarSearchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, typeof components>);

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

  const DismissibleAlert: React.FC<{ 
    children: React.ReactNode; 
    id: number; 
    variant?: 'default' | 'destructive' | 'warning' | 'info' | 'success';
    className?: string;
  }> = ({ 
    children, 
    id, 
    variant = 'default', 
    className = '' 
  }) => {
    if (dismissedAlerts.has(id)) return null;

    return (
      <Alert variant={variant} className={`relative ${className}`}>
        {children}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dismissAlert(id)}
          className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-black/10"
        >
          <X className="h-3 w-3" />
        </Button>
      </Alert>
    );
  };

  return (
    <div className="min-h-screen bg-brown-50/30 flex">
      {/* Main Sidebar */}
      <div className="w-72 bg-white border-r border-brown-200 flex flex-col h-screen sticky top-0">
        {/* Header */}
        <div className="p-6 border-b border-brown-100">
          <div 
            className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-brown-50 rounded-lg p-2 -m-2 transition-colors"
            onClick={onBack}
          >
            <DesactLogo 
              onClick={onBack}
              animated={false}
            />
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 w-4 h-4" />
            <Input
              ref={sidebarInputRef}
              type="text"
              placeholder="Search..."
              className="pl-10 pr-16 bg-brown-50 border-brown-200 text-sm"
              value={sidebarSearchTerm}
              onChange={(e) => setSidebarSearchTerm(e.target.value)}
              onKeyDown={handleSidebarKeyDown}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <kbd className="pointer-events-none hidden md:inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[9px] font-medium text-muted-foreground opacity-50">
                <span className="text-[9px]">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {Object.entries(filteredComponentsByCategory).map(([category, categoryComponents]) => {
              const IconComponent = categoryIcons[category] || categoryIcons['Base components'];
              
              return (
                <div key={category}>
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between text-sm font-medium hover:text-brown-700 py-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                      <span>{category}</span>
                    </div>
                    <ChevronRight 
                      className={`w-4 h-4 transition-transform ${
                        !collapsedCategories.has(category) ? 'rotate-90' : ''
                      }`} 
                    />
                  </button>
                  {!collapsedCategories.has(category) && (
                    <div className="ml-6 space-y-1">
                      {categoryComponents.map((component) => {
                        const ComponentIcon = componentIcons[component.name] || componentIcons['Default'];
                        
                        return (
                          <button
                            key={component.name}
                            onClick={() => onComponentClick(component.name)}
                            className={`w-full text-left text-sm py-2 px-3 rounded-md transition-colors flex items-center gap-2 ${
                              component.name === currentComponent
                                ? 'bg-brown-50 font-medium'
                                : 'hover:bg-brown-50'
                            }`}
                            style={{ 
                              color: component.name === currentComponent 
                                ? 'var(--color-fg-brand-primary)'
                                : 'var(--color-text-tertiary)' 
                            }}
                          >
                            <ComponentIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{component.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

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
                  <h1 className="text-xl font-semibold">Alerts</h1>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                    Notifications
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Display important messages and notifications to users
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
                      Alert Components Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Alerts are contextual feedback messages that provide important information to users about system status, 
                      user actions, or potential issues in HR applications.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <AlertCircle className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Multiple Variants</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Five distinct variants for different message types and severity levels.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Accessible Design</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Built with proper ARIA roles and semantic structure for screen readers.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">HR Focused</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Perfect for employee notifications, system updates, and workflow status messages.</p>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Alert Variants Overview">
                    <div className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Default Alert</AlertTitle>
                        <AlertDescription>
                          This is a default alert for general information and updates.
                        </AlertDescription>
                      </Alert>
                      
                      <Alert variant="info">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Info Alert</AlertTitle>
                        <AlertDescription>
                          This is an informational alert with blue styling.
                        </AlertDescription>
                      </Alert>

                      <Alert variant="warning">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Warning Alert</AlertTitle>
                        <AlertDescription>
                          This is a warning alert for important notices.
                        </AlertDescription>
                      </Alert>

                      <Alert variant="success">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Success Alert</AlertTitle>
                        <AlertDescription>
                          This is a success alert for positive outcomes.
                        </AlertDescription>
                      </Alert>
                      
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Destructive Alert</AlertTitle>
                        <AlertDescription>
                          This is a destructive alert for errors and critical issues.
                        </AlertDescription>
                      </Alert>
                    </div>
                    <p className="text-sm mt-4" style={{ color: 'var(--color-text-tertiary)' }}>
                      Use appropriate alert variants based on message severity and context.
                    </p>
                  </PreviewCard>
                </div>
              </section>

              {/* Default Alerts */}
              <section id="default" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Default Alerts</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>General purpose alerts for informational messages and updates.</p>
                  </div>

                  <PreviewCard title="Basic Default Alerts">
                    <div className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>System Update</AlertTitle>
                        <AlertDescription>
                          The HR system will be undergoing maintenance this weekend from 2:00 AM to 6:00 AM EST.
                        </AlertDescription>
                      </Alert>
                      
                      <Alert>
                        <Calendar className="h-4 w-4" />
                        <AlertTitle>New Feature Available</AlertTitle>
                        <AlertDescription>
                          Employee self-service portal now includes benefits enrollment and time-off requests.
                        </AlertDescription>
                      </Alert>
                      
                      <Alert>
                        <FileText className="h-4 w-4" />
                        <AlertTitle>Policy Update</AlertTitle>
                        <AlertDescription>
                          Updated remote work policy is now available in the employee handbook. Please review the new guidelines.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Alert, AlertTitle, AlertDescription } from './components/ui/alert';
import { Info, Calendar, FileText } from 'lucide-react';

// Basic default alert
<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>System Update</AlertTitle>
  <AlertDescription>
    The HR system will be undergoing maintenance this weekend.
  </AlertDescription>
</Alert>

// Alert with different icon
<Alert>
  <Calendar className="h-4 w-4" />
  <AlertTitle>New Feature Available</AlertTitle>
  <AlertDescription>
    Employee self-service portal now includes benefits enrollment 
    and time-off requests.
  </AlertDescription>
</Alert>`}
                      language="tsx"
                      id="default-alerts"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Info Alerts */}
              <section id="info" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Info Alerts</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Informational alerts with blue styling for neutral messages.</p>
                  </div>

                  <PreviewCard title="Information Alert Examples">
                    <div className="space-y-4">
                      <Alert variant="info">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Information</AlertTitle>
                        <AlertDescription>
                          Your profile information has been successfully updated. Changes may take up to 24 hours to reflect across all systems.
                        </AlertDescription>
                      </Alert>
                      
                      <Alert variant="info">
                        <Lightbulb className="h-4 w-4" />
                        <AlertTitle>Tip</AlertTitle>
                        <AlertDescription>
                          You can set up automatic time-off reminders in your notification preferences to never miss important deadlines.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Alert, AlertTitle, AlertDescription } from './components/ui/alert';
import { Info, Lightbulb } from 'lucide-react';

// Info alert variant
<Alert variant="info">
  <Info className="h-4 w-4" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>
    Your profile information has been successfully updated.
  </AlertDescription>
</Alert>

// Tip alert
<Alert variant="info">
  <Lightbulb className="h-4 w-4" />
  <AlertTitle>Tip</AlertTitle>
  <AlertDescription>
    Set up automatic reminders in your notification preferences.
  </AlertDescription>
</Alert>`}
                      language="tsx"
                      id="info-alerts"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Warning Alerts */}
              <section id="warning" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Warning Alerts</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Warning alerts for important notices that require user attention.</p>
                  </div>

                  <PreviewCard title="Warning Alert Examples">
                    <div className="space-y-4">
                      <Alert variant="warning">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Action Required</AlertTitle>
                        <AlertDescription>
                          Your annual performance review is due in 3 days. Please complete the self-assessment form to avoid delays.
                        </AlertDescription>
                      </Alert>
                      
                      <Alert variant="warning">
                        <Clock className="h-4 w-4" />
                        <AlertTitle>Deadline Approaching</AlertTitle>
                        <AlertDescription>
                          Benefits enrollment closes in 5 days. Make sure to review and update your selections before the deadline.
                        </AlertDescription>
                      </Alert>

                      <Alert variant="warning">
                        <Shield className="h-4 w-4" />
                        <AlertTitle>Security Notice</AlertTitle>
                        <AlertDescription>
                          Multiple login attempts detected. Consider updating your password for enhanced account security.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Alert, AlertTitle, AlertDescription } from './components/ui/alert';
import { AlertTriangle, Clock, Shield } from 'lucide-react';

// Warning alert
<Alert variant="warning">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>Action Required</AlertTitle>
  <AlertDescription>
    Your annual performance review is due in 3 days.
  </AlertDescription>
</Alert>

// Security warning
<Alert variant="warning">
  <Shield className="h-4 w-4" />
  <AlertTitle>Security Notice</AlertTitle>
  <AlertDescription>
    Multiple login attempts detected. Consider updating your password.
  </AlertDescription>
</Alert>`}
                      language="tsx"
                      id="warning-alerts"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Success Alerts */}
              <section id="success" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Success Alerts</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Success alerts to confirm completed actions and positive outcomes.</p>
                  </div>

                  <PreviewCard title="Success Alert Examples">
                    <div className="space-y-4">
                      <Alert variant="success">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Application Submitted</AlertTitle>
                        <AlertDescription>
                          Your vacation request has been successfully submitted. You'll receive a confirmation email shortly.
                        </AlertDescription>
                      </Alert>
                      
                      <Alert variant="success">
                        <Star className="h-4 w-4" />
                        <AlertTitle>Performance Review Complete</AlertTitle>
                        <AlertDescription>
                          Your self-assessment has been saved. Your manager will schedule a follow-up meeting within 2 business days.
                        </AlertDescription>
                      </Alert>

                      <Alert variant="success">
                        <UserCheck className="h-4 w-4" />
                        <AlertTitle>Profile Updated</AlertTitle>
                        <AlertDescription>
                          Your contact information and emergency contacts have been successfully updated in the system.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Alert, AlertTitle, AlertDescription } from './components/ui/alert';
import { CheckCircle, Star, UserCheck } from 'lucide-react';

// Success alert
<Alert variant="success">
  <CheckCircle className="h-4 w-4" />
  <AlertTitle>Application Submitted</AlertTitle>
  <AlertDescription>
    Your vacation request has been successfully submitted.
  </AlertDescription>
</Alert>

// Achievement alert
<Alert variant="success">
  <Star className="h-4 w-4" />
  <AlertTitle>Performance Review Complete</AlertTitle>
  <AlertDescription>
    Your self-assessment has been saved successfully.
  </AlertDescription>
</Alert>`}
                      language="tsx"
                      id="success-alerts"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Destructive Alerts */}
              <section id="destructive" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Destructive Alerts</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Error alerts for critical issues that require immediate attention.</p>
                  </div>

                  <PreviewCard title="Error Alert Examples">
                    <div className="space-y-4">
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Authentication Failed</AlertTitle>
                        <AlertDescription>
                          Your session has expired. Please log in again to continue accessing the HR system.
                        </AlertDescription>
                      </Alert>
                      
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Application Submission Failed</AlertTitle>
                        <AlertDescription>
                          There was an error submitting your leave request. Please check your internet connection and try again.
                        </AlertDescription>
                      </Alert>
                      
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Data Validation Error</AlertTitle>
                        <AlertDescription>
                          Some required fields are missing or contain invalid data. Please review your information and resubmit.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Alert, AlertTitle, AlertDescription } from './components/ui/alert';
import { AlertTriangle, XCircle, AlertCircle } from 'lucide-react';

// Destructive alert with icon
<Alert variant="destructive">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>Authentication Failed</AlertTitle>
  <AlertDescription>
    Your session has expired. Please log in again to continue.
  </AlertDescription>
</Alert>

// Error alert with action guidance
<Alert variant="destructive">
  <XCircle className="h-4 w-4" />
  <AlertTitle>Application Submission Failed</AlertTitle>
  <AlertDescription>
    There was an error submitting your request. Please check your 
    internet connection and try again.
  </AlertDescription>
</Alert>`}
                      language="tsx"
                      id="destructive-alerts"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Dismissible Alerts */}
              <section id="dismissible" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Dismissible Alerts</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Interactive alerts that users can dismiss when they've read the content.</p>
                  </div>

                  <PreviewCard title="Dismissible Alert Examples">
                    <div className="space-y-4">
                      <DismissibleAlert id={1}>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Welcome to the new HR portal!</AlertTitle>
                        <AlertDescription>
                          We've updated the interface to make it easier to access your benefits, submit requests, and track your progress.
                        </AlertDescription>
                      </DismissibleAlert>
                      
                      <DismissibleAlert id={2} variant="warning">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Maintenance Notice</AlertTitle>
                        <AlertDescription>
                          The system will be offline for scheduled maintenance on Sunday, March 15th from 2:00 AM to 4:00 AM EST.
                        </AlertDescription>
                      </DismissibleAlert>

                      <DismissibleAlert id={3} variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Action Required</AlertTitle>
                        <AlertDescription>
                          Your password will expire in 7 days. Please update it to maintain access to your account.
                        </AlertDescription>
                      </DismissibleAlert>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Alert, AlertTitle, AlertDescription } from './components/ui/alert';
import { Button } from './components/ui/button';
import { X, Info, AlertTriangle, XCircle } from 'lucide-react';
import { useState } from 'react';

const DismissibleAlert = ({ children, id, variant = 'default', className = '' }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <Alert variant={variant} className={\`relative \${className}\`}>
      {children}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-black/10"
      >
        <X className="h-3 w-3" />
      </Button>
    </Alert>
  );
};

// Usage
<DismissibleAlert id={1}>
  <Info className="h-4 w-4" />
  <AlertTitle>Welcome to the new HR portal!</AlertTitle>
  <AlertDescription>
    We've updated the interface to make it easier to access your benefits.
  </AlertDescription>
</DismissibleAlert>`}
                      language="tsx"
                      id="dismissible-alerts"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Complex Alerts */}
              <section id="complex" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Complex Alerts</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Alerts with additional elements like buttons, links, and detailed content.</p>
                  </div>

                  <PreviewCard title="Complex Alert Examples">
                    <div className="space-y-4">
                      <Alert variant="info">
                        <Lightbulb className="h-4 w-4" />
                        <AlertTitle>Benefits Enrollment Reminder</AlertTitle>
                        <AlertDescription>
                          <div className="space-y-3">
                            <p>Open enrollment for 2024 benefits is now available. Review your current selections and make changes if needed.</p>
                            <div className="flex items-center gap-2">
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                Review Benefits
                              </Button>
                              <Button variant="ghost" size="sm" className="text-blue-700 hover:text-blue-900">
                                Learn More
                              </Button>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                      
                      <Alert variant="destructive">
                        <Shield className="h-4 w-4" />
                        <AlertTitle>Security Alert</AlertTitle>
                        <AlertDescription>
                          <div className="space-y-3">
                            <p>Unusual activity detected on your account. We recommend taking immediate action to secure your account.</p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              <li>Change your password immediately</li>
                              <li>Review recent login activity</li>
                              <li>Enable two-factor authentication</li>
                            </ul>
                            <div className="flex items-center gap-2">
                              <Button size="sm" className="bg-red-700 hover:bg-red-800 text-white">
                                Secure Account
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-700 hover:bg-red-100">
                                View Activity
                              </Button>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Alert, AlertTitle, AlertDescription } from './components/ui/alert';
import { Button } from './components/ui/button';
import { Lightbulb, Shield } from 'lucide-react';

// Complex alert with actions
<Alert variant="info">
  <Lightbulb className="h-4 w-4" />
  <AlertTitle>Benefits Enrollment Reminder</AlertTitle>
  <AlertDescription>
    <div className="space-y-3">
      <p>Open enrollment for 2024 benefits is now available.</p>
      <div className="flex items-center gap-2">
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
          Review Benefits
        </Button>
        <Button variant="ghost" size="sm">
          Learn More
        </Button>
      </div>
    </div>
  </AlertDescription>
</Alert>`}
                      language="tsx"
                      id="complex-alerts"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* HR Examples */}
              <section id="hr-examples" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>HR Examples</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Real-world examples of alerts commonly used in HR applications and workflows.</p>
                  </div>

                  <PreviewCard title="Common HR Alert Scenarios">
                    <div className="space-y-4">
                      <Alert>
                        <Briefcase className="h-4 w-4" />
                        <AlertTitle>Onboarding Status</AlertTitle>
                        <AlertDescription>
                          Welcome! You have 3 pending onboarding tasks to complete before your start date. Please review your checklist.
                        </AlertDescription>
                      </Alert>
                      
                      <Alert variant="info">
                        <Target className="h-4 w-4" />
                        <AlertTitle>Goal Setting Period</AlertTitle>
                        <AlertDescription>
                          It's time to set your goals for Q2 2024. Please work with your manager to establish 3-5 key objectives.
                        </AlertDescription>
                      </Alert>

                      <Alert variant="warning">
                        <Calendar className="h-4 w-4" />
                        <AlertTitle>Training Required</AlertTitle>
                        <AlertDescription>
                          Annual compliance training must be completed by March 31st. Current progress: 2 of 4 modules completed.
                        </AlertDescription>
                      </Alert>

                      <Alert variant="success">
                        <DollarSign className="h-4 w-4" />
                        <AlertTitle>Payroll Processing</AlertTitle>
                        <AlertDescription>
                          Your timesheet for the week ending March 8th has been approved. Direct deposit will occur on March 15th.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Alert, AlertTitle, AlertDescription } from './components/ui/alert';
import { Briefcase, Target, Calendar, DollarSign } from 'lucide-react';

// Onboarding alert
<Alert>
  <Briefcase className="h-4 w-4" />
  <AlertTitle>Onboarding Status</AlertTitle>
  <AlertDescription>
    Welcome! You have 3 pending onboarding tasks to complete.
  </AlertDescription>
</Alert>

// Goal setting alert
<Alert variant="info">
  <Target className="h-4 w-4" />
  <AlertTitle>Goal Setting Period</AlertTitle>
  <AlertDescription>
    It's time to set your goals for Q2 2024.
  </AlertDescription>
</Alert>`}
                      language="tsx"
                      id="hr-alerts"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Best Practices */}
              <section id="best-practices" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Best Practices</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Guidelines for using alerts effectively in HR applications.</p>
                  </div>

                  <PreviewCard title="Usage Guidelines">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Do's
                        </h4>
                        <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li>• Use clear, actionable language</li>
                          <li>• Include relevant icons for quick recognition</li>
                          <li>• Provide specific next steps when needed</li>
                          <li>• Use appropriate alert types for message severity</li>
                          <li>• Keep messages concise but informative</li>
                          <li>• Include timestamps for time-sensitive alerts</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          Don'ts
                        </h4>
                        <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li>• Don't overuse destructive alerts</li>
                          <li>• Don't use alerts for regular content</li>
                          <li>• Don't make alerts too verbose</li>
                          <li>• Don't stack too many alerts at once</li>
                          <li>• Don't use alerts without clear purpose</li>
                          <li>• Don't ignore accessibility requirements</li>
                        </ul>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Alert Hierarchy">
                    <div className="space-y-4">
                      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                        <h4 className="font-medium text-red-900 mb-2">1. Critical/Destructive (Red)</h4>
                        <p className="text-sm text-red-800">System errors, security issues, failed actions that require immediate attention.</p>
                      </div>
                      
                      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                        <h4 className="font-medium text-yellow-900 mb-2">2. Warning (Yellow)</h4>
                        <p className="text-sm text-yellow-800">Important notices, approaching deadlines, actions that need user attention.</p>
                      </div>
                      
                      <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">3. Informational (Blue)</h4>
                        <p className="text-sm text-blue-800">General updates, tips, neutral information that might be helpful.</p>
                      </div>
                      
                      <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">4. Success (Green)</h4>
                        <p className="text-sm text-green-800">Successful completions, confirmations, positive outcomes.</p>
                      </div>

                      <div className="p-4 border border-brown-200 bg-brown-50 rounded-lg">
                        <h4 className="font-medium text-brown-900 mb-2">5. Default (Neutral)</h4>
                        <p className="text-sm text-brown-800">General messages that don't fall into other categories.</p>
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
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Technical implementation details and advanced usage patterns.</p>
                  </div>

                  <PreviewCard title="Alert Component API">
                    <CodeBlock
                      code={`// Alert component props
interface AlertProps {
  variant?: 'default' | 'destructive' | 'warning' | 'info' | 'success';
  className?: string;
  children: React.ReactNode;
}

// AlertTitle component props
interface AlertTitleProps {
  className?: string;
  children: React.ReactNode;
}

// AlertDescription component props
interface AlertDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

// Basic usage
import { Alert, AlertTitle, AlertDescription } from './components/ui/alert';

<Alert variant="info" className="custom-class">
  <AlertTitle>Title goes here</AlertTitle>
  <AlertDescription>
    Description content goes here
  </AlertDescription>
</Alert>`}
                      language="tsx"
                      id="alert-api"
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