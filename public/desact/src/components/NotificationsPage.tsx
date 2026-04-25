import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, Bell, Check, Info, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { Toaster } from './ui/sonner';
import { CodeBlock } from './shared/CodeBlock';
import { MainSidebar } from './shared/MainSidebar';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { motion } from 'motion/react';

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
    { id: 'center', label: 'Notification Center', icon: Bell },
    { id: 'inline', label: 'Inline Notifications', icon: Info },
    { id: 'email', label: 'Email Templates', icon: Bell },
    { id: 'push', label: 'Push Notifications', icon: Bell },
    { id: 'settings', label: 'Settings Panel', icon: Bell },
    { id: 'types', label: 'HR Notification Types', icon: Bell }
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
      case 'success':
        return <Check className="w-4 h-4 text-green-600"/>;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600"/>;
      case 'error':
        return <X className="w-4 h-4 text-red-600"/>;
      case 'info':
        return <Info className="w-4 h-4 text-blue-600"/>;
      default:
        return <Bell className="w-4 h-4 text-brown-600"/>;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-brown-50 border-brown-200';
    }
  };

  // Fixed toast function with proper console logging and error handling
  const showToastNotification = (type: 'success' | 'error' | 'info' | 'warning') => {
    console.log('Toast button clicked:', type);

    const messages = {
      success: 'Employee onboarding completed successfully!',
      error: 'Failed to process benefits enrollment',
      info: 'New company policy has been published',
      warning: 'Compliance training deadline in 2 days'
    };

    try {
      console.log('Calling toast function with message:', messages[type]);

      switch (type) {
        case 'success':
          toast.success(messages[type], {
            duration: 4000,
            position: 'top-right'
          });
          break;
        case 'error':
          toast.error(messages[type], {
            duration: 4000,
            position: 'top-right'
          });
          break;
        case 'warning':
          toast.warning(messages[type], {
            duration: 4000,
            position: 'top-right'
          });
          break;
        case 'info':
          toast.info(messages[type], {
            duration: 4000,
            position: 'top-right'
          });
          break;
      }

      console.log('Toast function executed successfully');
    } catch (error) {
      console.error('Toast error:', error);
      // Fallback - try basic toast
      try {
        toast(messages[type]);
        console.log('Fallback toast executed');
      } catch (fallbackError) {
        console.error('Fallback toast also failed:', fallbackError);
      }
    }
  };

  const basicToastCode = `import { toast } from 'sonner@2.0.3';

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
                <ArrowLeft className="h-4 w-4"/>
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
                <Menu className="h-4 w-4" style={{ color: 'var(--color-text-quaternary)' }}/>
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
                        <Bell className="w-6 h-6 text-brown-600"/>
                      </div>
                      <h3 className="font-semibold mb-2">Toast Notifications</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Temporary notifications for success
                        confirmations, errors, and quick alerts.</p>
                    </PreviewCard>

                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Bell className="w-6 h-6 text-green-600"/>
                      </div>
                      <h3 className="font-semibold mb-2">Notification Center</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Centralized view of all notifications with
                        read/unread states and filtering.</p>
                    </PreviewCard>

                    <PreviewCard>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Bell className="w-6 h-6 text-purple-600"/>
                      </div>
                      <h3 className="font-semibold mb-2">Notification Settings</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Customizable preferences for email, push, and
                        in-app notifications.</p>
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

                  <PreviewCard title="Interactive Toast Demo">
                    <p className="text-sm mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
                      Click any button below to see the toast notification in action:
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => showToastNotification('success')}
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                      >
                        <Check className="w-4 h-4"/>
                        Success Toast
                      </Button>
                      <Button
                        onClick={() => showToastNotification('error')}
                        variant="destructive"
                        className="flex items-center gap-2"
                      >
                        <X className="w-4 h-4"/>
                        Error Toast
                      </Button>
                      <Button
                        onClick={() => showToastNotification('warning')}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2"
                      >
                        <AlertTriangle className="w-4 h-4"/>
                        Warning Toast
                      </Button>
                      <Button
                        onClick={() => showToastNotification('info')}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                      >
                        <Info className="w-4 h-4"/>
                        Info Toast
                      </Button>
                    </div>
                  </PreviewCard>

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

              {/* Notification Center */}
              <section id="center" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Notification Center
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      A centralized view of all notifications with read/unread states and category filtering.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg border border-brown-200 p-6 mb-6">
                    <Card className="w-full max-w-md">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5"/>
                            Notifications
                            {notifications.filter(n => n.unread).length > 0 && (
                              <Badge variant="destructive" className="ml-2">
                                {notifications.filter(n => n.unread).length}
                              </Badge>
                            )}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-xs"
                          >
                            Mark all read
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {notifications.map(notification => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              notification.unread ? getNotificationBgColor(notification.type) : 'bg-white border-brown-200'
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="mt-0.5">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-sm truncate">
                                      {notification.title}
                                    </h4>
                                    <Badge variant="outline" className="text-xs">
                                      {notification.category}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <span className="text-xs text-muted-foreground">
                                    {notification.time}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {notification.unread && (
                                  <div className="w-2 h-2 bg-brown-600 rounded-full"/>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(notification.id);
                                  }}
                                  className="h-auto p-1"
                                >
                                  <X className="w-3 h-3"/>
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        {notifications.length === 0 && (
                          <div className="text-center py-6 text-muted-foreground">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50"/>
                            <p className="text-sm">No notifications</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <CodeBlock
                    code={notificationCenterCode}
                    language="tsx"
                    title="Notification Center Component"
                    id="notification-center"
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </div>
              </section>

              {/* Inline Notifications */}
              <section id="inline" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Inline Notifications
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Persistent notifications that appear within the page content to provide contextual information.
                    </p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="p-4 rounded-lg border bg-green-50 border-green-200 text-green-800">
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 mt-0.5"/>
                        <div className="flex-1">
                          <h4 className="font-medium">Employee Onboarding Complete</h4>
                          <p className="text-sm mt-1">Sarah Johnson has successfully completed all onboarding requirements and is ready to
                            start.</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-auto p-1">
                          <X className="w-4 h-4"/>
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border bg-yellow-50 border-yellow-200 text-yellow-800">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 mt-0.5"/>
                        <div className="flex-1">
                          <h4 className="font-medium">Action Required: Benefits Enrollment</h4>
                          <p className="text-sm mt-1">3 employees haven't completed their benefits enrollment. Deadline is in 5 days.</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-auto p-1">
                          <X className="w-4 h-4"/>
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border bg-red-50 border-red-200 text-red-800">
                      <div className="flex items-start gap-3">
                        <X className="w-5 h-5 mt-0.5"/>
                        <div className="flex-1">
                          <h4 className="font-medium">Payroll Error</h4>
                          <p className="text-sm mt-1">Failed to process payroll for 2 employees due to missing bank information. Please
                            update records.</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-auto p-1">
                          <X className="w-4 h-4"/>
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border bg-blue-50 border-blue-200 text-blue-800">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 mt-0.5"/>
                        <div className="flex-1">
                          <h4 className="font-medium">Policy Update Available</h4>
                          <p className="text-sm mt-1">New remote work policy has been published. All employees should review the updated
                            guidelines.</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-auto p-1">
                          <X className="w-4 h-4"/>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <CodeBlock
                    code={inlineNotificationCode}
                    language="tsx"
                    title="Inline Notification Component"
                    id="inline-notifications"
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </div>
              </section>

              {/* Email Templates Section */}
              <section id="email" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Email Templates
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Pre-built email notification templates for common HR scenarios and workflows.
                    </p>
                  </div>

                  <PreviewCard>
                    <div className="space-y-4">
                      <div className="p-4 bg-brown-50 rounded-lg">
                        <h4 className="font-medium mb-2">Welcome Email Template</h4>
                        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          Automated welcome email sent to new employees during onboarding
                        </p>
                      </div>
                      <div className="p-4 bg-brown-50 rounded-lg">
                        <h4 className="font-medium mb-2">Performance Review Reminder</h4>
                        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          Scheduled reminders for upcoming performance evaluations
                        </p>
                      </div>
                      <div className="p-4 bg-brown-50 rounded-lg">
                        <h4 className="font-medium mb-2">Policy Update Notification</h4>
                        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          Company-wide notifications for policy changes and updates
                        </p>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Push Notifications Section */}
              <section id="push" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Push Notifications
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Real-time push notifications for urgent HR matters and time-sensitive updates.
                    </p>
                  </div>

                  <PreviewCard>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-brown-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">Urgent: System Maintenance</h4>
                          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                            HR system will be down for maintenance tonight
                          </p>
                        </div>
                        <Badge variant="destructive">High Priority</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-brown-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">Time-off Request Approved</h4>
                          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                            Your vacation request for next week has been approved
                          </p>
                        </div>
                        <Badge variant="secondary">Normal</Badge>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Settings Panel Section */}
              <section id="settings" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Notification Settings
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Customizable notification preferences allowing users to control how they receive updates.
                    </p>
                  </div>

                  <PreviewCard title="Notification Preferences">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                            Receive notifications via email
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.email}
                          onCheckedChange={(checked) =>
                            setNotificationSettings(prev => ({ ...prev, email: checked }))
                          }
                        />
                      </div>
                      <Separator/>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Push Notifications</h4>
                          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                            Receive browser push notifications
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.push}
                          onCheckedChange={(checked) =>
                            setNotificationSettings(prev => ({ ...prev, push: checked }))
                          }
                        />
                      </div>
                      <Separator/>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">SMS Notifications</h4>
                          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                            Receive notifications via SMS
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.sms}
                          onCheckedChange={(checked) =>
                            setNotificationSettings(prev => ({ ...prev, sms: checked }))
                          }
                        />
                      </div>
                      <Separator/>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">In-App Notifications</h4>
                          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                            Show notifications within the application
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.inApp}
                          onCheckedChange={(checked) =>
                            setNotificationSettings(prev => ({ ...prev, inApp: checked }))
                          }
                        />
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* HR Notification Types Section */}
              <section id="types" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      HR Notification Types
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Common notification categories and types used in HR management systems.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Employee Lifecycle">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-600"/>
                          </div>
                          <div>
                            <h5 className="font-medium">Onboarding Complete</h5>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>New employee setup finished</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-yellow-600"/>
                          </div>
                          <div>
                            <h5 className="font-medium">Probation Ending</h5>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Review required before completion</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Info className="w-4 h-4 text-blue-600"/>
                          </div>
                          <div>
                            <h5 className="font-medium">Anniversary Date</h5>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Work anniversary milestone</p>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Performance & Reviews">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Bell className="w-4 h-4 text-purple-600"/>
                          </div>
                          <div>
                            <h5 className="font-medium">Review Due</h5>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Performance review scheduled</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-600"/>
                          </div>
                          <div>
                            <h5 className="font-medium">Goals Achieved</h5>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Performance targets met</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <X className="w-4 h-4 text-red-600"/>
                          </div>
                          <div>
                            <h5 className="font-medium">Action Plan Required</h5>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Performance improvement needed</p>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
      <Toaster/>
    </div>
  );
}
