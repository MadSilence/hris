import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Search, ChevronRight, ChevronDown, Menu, Layers, Zap, Star, FileText, Bell, X, AlertTriangle, Info, Calendar, Clock, Users, DollarSign, BookOpen, Shield, Award, User, Settings, Package, Code2, Eye, MessageSquare, Hash, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { CodeBlock } from './shared/CodeBlock';
import { DesactLogo } from './shared/DesactLogo';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { motion } from 'motion/react';

// Static icon mappings
const categoryIcons: Record<string, React.ElementType> = {
  'Base components': Layers,
  'Application UI': Zap,
  'Marketing': Star,
  'Documentation': FileText
};

const componentIcons: Record<string, React.ElementType> = {
  'Buttons': Bell,
  'Forms': MessageSquare,
  'Input': MessageSquare,
  'Layout': Hash,
  'HR Cards': Activity,
  'Accordion': Hash,
  'Navigation': Hash,
  'Breadcrumbs': Hash,
  'Pagination': Hash,
  'Interaction': Award,
  'Badges': Award,
  'Alerts': AlertTriangle,
  'Data Display': Hash,
  'Charts': Hash,
  'Lists': Hash,
  'Skeletons': Package,
  'Modals': Hash,
  'Drawer': Hash,
  'Avatars': User,
  'File Upload': Hash,
  'Dashboard': Hash,
  'Simple Insight': Hash,
  'Color Picker': Hash,
  'Command Menu': Hash,
  'Text Editor': Hash,
  'Status': Activity,
  'Typography': Hash,
  'System Colors': Hash,
  'Icons': Hash,
  'Miscellaneous': Settings,
  'Notifications': Bell,
  'Default': Package
};

interface ComponentPageProps {
  onBack: () => void;
  components: Array<{ name: string; blockCount: number; thumbnail: React.ReactNode; category: string }>;
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export function NotificationsPage({ onBack, components, onComponentClick, currentComponent }: ComponentPageProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

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

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'toast', 'center', 'inline', 'email', 'push', 'settings', 'types'];
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
    { id: 'overview', label: 'Overview', icon: Bell },
    { id: 'toast', label: 'Toast Notifications', icon: Bell },
    { id: 'center', label: 'Notification Center', icon: MessageSquare },
    { id: 'inline', label: 'Inline Notifications', icon: Info },
    { id: 'email', label: 'Email Templates', icon: MessageSquare },
    { id: 'push', label: 'Push Notifications', icon: Bell },
    { id: 'settings', label: 'Settings Panel', icon: Settings },
    { id: 'types', label: 'HR Notification Types', icon: Code2 }
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

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Performance Review Completed',
      message: 'Sarah Johnson has completed her Q4 performance review.',
      time: '2 minutes ago',
      unread: true,
      category: 'Performance'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Time-off Request Pending',
      message: 'Mike Chen has requested 3 days off starting next Monday.',
      time: '15 minutes ago',
      unread: true,
      category: 'Time-off'
    },
    {
      id: 3,
      type: 'info',
      title: 'Training Deadline Approaching',
      message: 'Cybersecurity training due in 3 days for 12 employees.',
      time: '1 hour ago',
      unread: false,
      category: 'Training'
    },
    {
      id: 4,
      type: 'error',
      title: 'Payroll Processing Issue',
      message: 'Bank transfer failed for 2 employees. Immediate action required.',
      time: '2 hours ago',
      unread: true,
      category: 'Payroll'
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    inApp: true
  });

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, unread: false }))
    );
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <Check className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <X className="w-4 h-4 text-red-600" />;
      case 'info': return <Info className="w-4 h-4 text-blue-600" />;
      default: return <Bell className="w-4 h-4 text-brown-600" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-brown-50 border-brown-200';
    }
  };

  const showToastNotification = (type: 'success' | 'error' | 'info' | 'warning') => {
    const messages = {
      success: 'Employee onboarding completed successfully!',
      error: 'Failed to process benefits enrollment',
      info: 'New company policy has been published',
      warning: 'Compliance training deadline in 2 days'
    };

    if (type === 'success') {
      toast.success(messages[type]);
    } else if (type === 'error') {
      toast.error(messages[type]);
    } else if (type === 'warning') {
      toast.warning(messages[type]);
    } else {
      toast.info(messages[type]);
    }
  };

  const basicToastCode = `import { toast } from 'sonner';

// Success notification
toast.success('Employee record updated successfully!');

// Error notification  
toast.error('Failed to save changes');

// Warning notification
toast.warning('Session expires in 5 minutes');

// Info notification
toast.info('New policy document available');`;

  const notificationCenterCode = `const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Performance Review Completed',
      message: 'Sarah Johnson completed her Q4 review.',
      time: '2 minutes ago',
      unread: true
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );
  };

  return (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={\`p-3 rounded-lg border \${
              notification.unread ? 'bg-brown-50' : 'bg-white'
            }\`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-sm">
                  {notification.title}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
                <span className="text-xs text-muted-foreground">
                  {notification.time}
                </span>
              </div>
              {notification.unread && (
                <div className="w-2 h-2 bg-brown-600 rounded-full" />
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};`;

  const inlineNotificationCode = `const InlineNotification = ({ type, title, message, onClose }) => {
  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={\`p-4 rounded-lg border \${getStyles(type)}\`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div>
            <h4 className="font-medium">{title}</h4>
            <p className="text-sm mt-1">{message}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-auto p-1"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};`;

  const emailNotificationCode = `const EmailNotificationTemplate = ({ type, data }) => {
  const templates = {
    'time-off-request': {
      subject: 'Time-off Request Submitted',
      body: \`Hi \${data.managerName},
      
\${data.employeeName} has submitted a time-off request:

• Dates: \${data.startDate} to \${data.endDate}
• Duration: \${data.duration} days
• Reason: \${data.reason}

Please review and approve/decline the request in the HR portal.

Best regards,
HR Team\`
    },
    'performance-reminder': {
      subject: 'Performance Review Due Soon',
      body: \`Hi \${data.employeeName},
      
This is a reminder that your Q\${data.quarter} performance review is due on \${data.dueDate}.

Please complete your self-assessment and submit it by the deadline.

If you have any questions, contact your manager or HR.

Best regards,
HR Team\`
    }
  };

  return templates[type];
};`;

  const pushNotificationCode = `// Service Worker for Push Notifications
self.addEventListener('push', function(event) {
  const options = {
    body: event.data.text(),
    icon: '/icons/hr-icon-192.png',
    badge: '/icons/hr-badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Dismiss',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('HR System', options)
  );
});

// Client-side notification request
const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

const sendHRNotification = (title, options) => {
  if (requestNotificationPermission()) {
    new Notification(title, {
      body: options.body,
      icon: '/icons/hr-icon.png',
      tag: options.tag || 'hr-notification'
    });
  }
};`;

  const notificationSettingsCode = `const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    email: true,
    push: true,
    sms: false,
    inApp: true,
    categories: {
      performance: true,
      timeOff: true,
      payroll: true,
      training: false,
      compliance: true
    }
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateCategorySetting = (category, value) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: value
      }
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how you want to receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Delivery Methods</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="email">Email notifications</label>
              <Switch
                id="email"
                checked={settings.email}
                onCheckedChange={(checked) => updateSetting('email', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="push">Push notifications</label>
              <Switch
                id="push"
                checked={settings.push}
                onCheckedChange={(checked) => updateSetting('push', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium mb-3">Categories</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="performance">Performance Reviews</label>
              <Switch
                id="performance"
                checked={settings.categories.performance}
                onCheckedChange={(checked) => 
                  updateCategorySetting('performance', checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="timeOff">Time-off Requests</label>
              <Switch
                id="timeOff"
                checked={settings.categories.timeOff}
                onCheckedChange={(checked) => 
                  updateCategorySetting('timeOff', checked)
                }
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};`;

  const hrNotificationTypesCode = `// HR-specific notification types and scenarios

const HRNotificationTypes = {
  // Employee Lifecycle
  NEW_HIRE: {
    type: 'info',
    category: 'onboarding',
    title: 'New Employee Starting',
    template: (data) => \`\${data.name} starts on \${data.startDate}\`
  },
  
  EMPLOYEE_DEPARTURE: {
    type: 'warning',
    category: 'offboarding',
    title: 'Employee Departure',
    template: (data) => \`\${data.name}'s last day is \${data.lastDay}\`
  },

  // Performance Management
  REVIEW_DUE: {
    type: 'warning',
    category: 'performance',
    title: 'Performance Review Due',
    template: (data) => \`Review for \${data.employee} due \${data.dueDate}\`
  },

  GOAL_DEADLINE: {
    type: 'info',
    category: 'performance',
    title: 'Goal Deadline Approaching',
    template: (data) => \`Goal "\${data.goal}" due in \${data.days} days\`
  },

  // Time & Attendance
  TIME_OFF_REQUEST: {
    type: 'info',
    category: 'time-off',
    title: 'Time-off Request',
    template: (data) => \`\${data.employee} requested \${data.days} days off\`
  },

  OVERTIME_APPROVAL: {
    type: 'warning',
    category: 'time-off',
    title: 'Overtime Requires Approval',
    template: (data) => \`\${data.employee} worked \${data.hours} overtime\`
  },

  // Payroll & Benefits
  PAYROLL_PROCESSED: {
    type: 'success',
    category: 'payroll',
    title: 'Payroll Processed',
    template: (data) => \`Payroll for \${data.period} completed successfully\`
  },

  BENEFITS_ENROLLMENT: {
    type: 'info',
    category: 'benefits',
    title: 'Benefits Enrollment',
    template: (data) => \`Open enrollment ends \${data.deadline}\`
  },

  // Training & Development
  TRAINING_DUE: {
    type: 'warning',
    category: 'training',
    title: 'Training Deadline',
    template: (data) => \`\${data.course} due in \${data.days} days\`
  },

  CERTIFICATION_EXPIRING: {
    type: 'error',
    category: 'compliance',
    title: 'Certification Expiring',
    template: (data) => \`\${data.certification} expires \${data.date}\`
  },

  // Compliance & Policy
  POLICY_UPDATE: {
    type: 'info',
    category: 'compliance',
    title: 'Policy Update',
    template: (data) => \`New policy: \${data.title}\`
  },

  COMPLIANCE_VIOLATION: {
    type: 'error',
    category: 'compliance',
    title: 'Compliance Issue',
    template: (data) => \`Violation detected: \${data.description}\`
  }
};`;

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
                    {!collapsedCategories.has(category) ? (
                      <ChevronDown className="w-4 h-4 transition-transform" />
                    ) : (
                      <ChevronRight className="w-4 h-4 transition-transform" />
                    )}
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
                  <h1 className="text-xl font-semibold">Notifications</h1>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                    Components
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Toast notifications, notification centers, and alert systems for HR applications
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
                      Notifications Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Comprehensive notification system components for HR applications including toast notifications, 
                      notification centers, email templates, and push notification configurations.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Bell className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Toast Notifications</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Temporary notifications for success confirmations, errors, and quick alerts.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <MessageSquare className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Notification Center</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Centralized view of all notifications with read/unread states and filtering.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Settings className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Notification Settings</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Customizable preferences for email, push, and in-app notifications.</p>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Toast Notifications */}
              <section id="toast" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Toast Notifications
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Temporary notifications that appear and disappear automatically. Perfect for success confirmations and quick alerts.
                    </p>
                  </div>
                  
                  <div className="grid gap-4 mb-6">
                    <div className="flex gap-2">
                      <Button onClick={() => showToastNotification('success')} className="bg-green-600 hover:bg-green-700">
                        Success Toast
                      </Button>
                      <Button onClick={() => showToastNotification('error')} variant="destructive">
                        Error Toast
                      </Button>
                      <Button onClick={() => showToastNotification('warning')} className="bg-yellow-600 hover:bg-yellow-700">
                        Warning Toast
                      </Button>
                      <Button onClick={() => showToastNotification('info')} className="bg-blue-600 hover:bg-blue-700">
                        Info Toast
                      </Button>
                    </div>
                  </div>

                  <CodeBlock
                    code={basicToastCode}
                    language="tsx"
                    title="Basic Toast Notifications"
                    id="basic-toast"
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </div>
              </section>

              {/* More sections would continue here with the rest of the content... */}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}