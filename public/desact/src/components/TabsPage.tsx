import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { 
  User, 
  Settings, 
  Bell, 
  CreditCard, 
  Shield, 
  Calendar,
  BarChart3,
  Users,
  FileText,
  HelpCircle,
  Menu,
  Plus,
  Filter,
  Download,
  Search,
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Heart,
  Bookmark,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Underline,
  Circle,
  Building,
  Briefcase,
  Globe,
  UserPlus
} from 'lucide-react';
import { MainSidebar } from './shared/MainSidebar';
import { PageHeader } from './shared/PageHeader';
import { CodeBlock } from './shared/CodeBlock';
import { createCopyHandler } from './shared/copyUtils';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';

interface TabsPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const TabsPage: React.FC<TabsPageProps> = ({
  onBack,
  components,
  onComponentClick,
  currentComponent
}) => {
  const [activeSection, setActiveSection] = useState('basic-tabs');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // MainSidebar required state
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Tab states for interactive examples
  const [basicTabValue, setBasicTabValue] = useState('overview');
  const [iconTabValue, setIconTabValue] = useState('profile');
  const [underlineTabValue, setUnderlineTabValue] = useState('dashboard');
  const [pillTabValue, setPillTabValue] = useState('employees');
  const [userTabValue, setUserTabValue] = useState('account');
  const [verticalTabValue, setVerticalTabValue] = useState('dashboard');
  const [dataTabValue, setDataTabValue] = useState('analytics');
  const [interactiveTabValue, setInteractiveTabValue] = useState('posts');

  // Checkbox states for settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(false);
  const [weeklyReports, setWeeklyReports] = useState(true);

  const { inputRef: sidebarInputRef, handleKeyDown: handleSidebarKeyDown } = useInputKeyboardShortcuts({
    value: sidebarSearchTerm,
    onChange: setSidebarSearchTerm,
    enableGlobalShortcuts: false,
  });

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
      const sections = ['basic-tabs', 'icon-tabs', 'underline-tabs', 'pill-tabs', 'user-tabs', 'vertical-tabs', 'data-tabs', 'interactive-tabs'];
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

  const handleCopyCode = createCopyHandler(setCopiedCode);

  const sections = [
    { id: 'basic-tabs', label: 'Basic Tabs', icon: FileText },
    { id: 'icon-tabs', label: 'Icon Tabs', icon: Star },
    { id: 'underline-tabs', label: 'Underline Tabs', icon: Underline },
    { id: 'pill-tabs', label: 'Pill Tabs', icon: Circle },
    { id: 'user-tabs', label: 'User Tabs', icon: User },
    { id: 'vertical-tabs', label: 'Vertical Tabs', icon: Menu },
    { id: 'data-tabs', label: 'Data Tabs', icon: BarChart3 },
    { id: 'interactive-tabs', label: 'Interactive Tabs', icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-brown-50/30 flex">
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
      
      <div className="flex-1 flex flex-col">
        <PageHeader 
          title="Tabs"
          description="Tab navigation components for organizing content into separate views with clean and accessible interfaces."
          onBack={onBack}
          sections={sections}
        />

        <div className="flex-1 relative">
          {/* Floating Navigation */}
          <div className="fixed right-8 top-40 z-30 hidden xl:block">
            <div className="bg-white rounded-lg border border-brown-200 shadow-lg p-4 w-56">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-brown-100">
                <Menu className="h-4 w-4" style={{ color: 'var(--color-text-quaternary)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>On this page</span>
              </div>
              <nav className="space-y-1">
                {sections.map((section) => (
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

          <main className="p-8 xl:pr-72 max-w-6xl mx-auto space-y-16">
            {/* Basic Tabs */}
            <section id="basic-tabs" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Basic Tabs</h2>
                <p className="text-muted-foreground mb-6">
                  Simple horizontal tab navigation for organizing content into separate panels with clear labels.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <Tabs value={basicTabValue} onValueChange={setBasicTabValue} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="analytics">Analytics</TabsTrigger>
                      <TabsTrigger value="reports">Reports</TabsTrigger>
                      <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="mt-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Overview Dashboard</h3>
                        <p className="text-muted-foreground">
                          Get a comprehensive view of your HR metrics and key performance indicators.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="p-4">
                            <h4 className="font-medium mb-2">Total Employees</h4>
                            <p className="text-2xl font-bold text-brown-600">247</p>
                          </Card>
                          <Card className="p-4">
                            <h4 className="font-medium mb-2">Open Positions</h4>
                            <p className="text-2xl font-bold text-brown-600">12</p>
                          </Card>
                          <Card className="p-4">
                            <h4 className="font-medium mb-2">Pending Reviews</h4>
                            <p className="text-2xl font-bold text-brown-600">8</p>
                          </Card>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Analytics & Insights</h3>
                        <p className="text-muted-foreground">
                          Deep dive into your workforce analytics and trend analysis.
                        </p>
                        <div className="h-48 bg-brown-50 rounded-lg border border-brown-200 flex items-center justify-center">
                          <p className="text-muted-foreground">Analytics Chart Placeholder</p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="reports" className="mt-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Reports & Documents</h3>
                        <p className="text-muted-foreground">
                          Access and manage all your HR reports and documentation.
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                            <span>Q4 Performance Review Report</span>
                            <Button size="sm" variant="outline">Download</Button>
                          </div>
                          <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                            <span>Employee Satisfaction Survey</span>
                            <Button size="sm" variant="outline">Download</Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="notifications" className="mt-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Notifications</h3>
                        <p className="text-muted-foreground">
                          Stay updated with the latest HR notifications and alerts.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 border border-brown-200 rounded-lg">
                            <Bell className="w-5 h-5 text-brown-600 mt-0.5" />
                            <div>
                              <p className="font-medium">New Employee Onboarding</p>
                              <p className="text-sm text-muted-foreground">Sarah Johnson starts next Monday</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 border border-brown-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                            <div>
                              <p className="font-medium">Review Deadline</p>
                              <p className="text-sm text-muted-foreground">5 performance reviews due this week</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>

                <CodeBlock
                  title="Basic Tabs"
                  language="tsx"
                  id="basic-tabs-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
    <TabsTrigger value="reports">Reports</TabsTrigger>
    <TabsTrigger value="notifications">Notifications</TabsTrigger>
  </TabsList>
  
  <TabsContent value="overview" className="mt-6">
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Overview Dashboard</h3>
      <p className="text-muted-foreground">
        Get a comprehensive view of your HR metrics and key performance indicators.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h4 className="font-medium mb-2">Total Employees</h4>
          <p className="text-2xl font-bold text-brown-600">247</p>
        </Card>
        <Card className="p-4">
          <h4 className="font-medium mb-2">Open Positions</h4>
          <p className="text-2xl font-bold text-brown-600">12</p>
        </Card>
        <Card className="p-4">
          <h4 className="font-medium mb-2">Pending Reviews</h4>
          <p className="text-2xl font-bold text-brown-600">8</p>
        </Card>
      </div>
    </div>
  </TabsContent>

  <TabsContent value="analytics" className="mt-6">
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Analytics & Insights</h3>
      <p className="text-muted-foreground">
        Deep dive into your workforce analytics and trend analysis.
      </p>
      {/* Content for analytics tab */}
    </div>
  </TabsContent>
</Tabs>`}
                />
              </div>
            </section>

            {/* Icon Tabs */}
            <section id="icon-tabs" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Icon Tabs</h2>
                <p className="text-muted-foreground mb-6">
                  Enhanced tab navigation with icons for better visual hierarchy and user recognition.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <Tabs value={iconTabValue} onValueChange={setIconTabValue} className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Profile
                      </TabsTrigger>
                      <TabsTrigger value="settings" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Settings
                      </TabsTrigger>
                      <TabsTrigger value="billing" className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Billing
                      </TabsTrigger>
                      <TabsTrigger value="security" className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Security
                      </TabsTrigger>
                      <TabsTrigger value="support" className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        Support
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="profile" className="mt-6">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">John Davidson</h3>
                            <p className="text-muted-foreground">HR Manager</p>
                            <p className="text-sm text-muted-foreground">john.davidson@company.com</p>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">First Name</label>
                            <Input defaultValue="John" className="mt-1" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Last Name</label>
                            <Input defaultValue="Davidson" className="mt-1" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Department</label>
                            <Input defaultValue="Human Resources" className="mt-1" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Job Title</label>
                            <Input defaultValue="HR Manager" className="mt-1" />
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button className="bg-brown-600 hover:bg-brown-700">Save Changes</Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="settings" className="mt-6">
                      <div className="space-y-6">
                        <h3 className="font-medium">Preferences</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Email Notifications</p>
                              <p className="text-sm text-muted-foreground">Receive email updates about important events</p>
                            </div>
                            <Checkbox 
                              checked={emailNotifications}
                              onCheckedChange={setEmailNotifications}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Desktop Notifications</p>
                              <p className="text-sm text-muted-foreground">Show notifications on your desktop</p>
                            </div>
                            <Checkbox 
                              checked={desktopNotifications}
                              onCheckedChange={setDesktopNotifications}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Weekly Reports</p>
                              <p className="text-sm text-muted-foreground">Get weekly summary reports</p>
                            </div>
                            <Checkbox 
                              checked={weeklyReports}
                              onCheckedChange={setWeeklyReports}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="billing" className="mt-6">
                      <div className="space-y-6">
                        <h3 className="font-medium">Billing Information</h3>
                        <div className="p-4 border border-brown-200 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="font-medium">Current Plan</p>
                              <p className="text-sm text-muted-foreground">Professional Plan</p>
                            </div>
                            <Badge>Active</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>$99/month</span>
                            <Button variant="outline" size="sm">Upgrade Plan</Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="security" className="mt-6">
                      <div className="space-y-6">
                        <h3 className="font-medium">Security Settings</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Current Password</label>
                            <Input type="password" className="mt-1" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">New Password</label>
                            <Input type="password" className="mt-1" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Confirm Password</label>
                            <Input type="password" className="mt-1" />
                          </div>
                          <Button className="bg-brown-600 hover:bg-brown-700">Update Password</Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="support" className="mt-6">
                      <div className="space-y-6">
                        <h3 className="font-medium">Support & Help</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="p-4">
                            <h4 className="font-medium mb-2">Documentation</h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              Comprehensive guides and tutorials
                            </p>
                            <Button variant="outline" size="sm">View Docs</Button>
                          </Card>
                          <Card className="p-4">
                            <h4 className="font-medium mb-2">Contact Support</h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              Get help from our support team
                            </p>
                            <Button variant="outline" size="sm">Contact Us</Button>
                          </Card>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>

                <CodeBlock
                  title="Icon Tabs"
                  language="tsx"
                  id="icon-tabs-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <TabsList className="grid w-full grid-cols-5">
    <TabsTrigger value="profile" className="flex items-center gap-2">
      <User className="w-4 h-4" />
      Profile
    </TabsTrigger>
    <TabsTrigger value="settings" className="flex items-center gap-2">
      <Settings className="w-4 h-4" />
      Settings
    </TabsTrigger>
    <TabsTrigger value="billing" className="flex items-center gap-2">
      <CreditCard className="w-4 h-4" />
      Billing
    </TabsTrigger>
    <TabsTrigger value="security" className="flex items-center gap-2">
      <Shield className="w-4 h-4" />
      Security
    </TabsTrigger>
    <TabsTrigger value="support" className="flex items-center gap-2">
      <HelpCircle className="w-4 h-4" />
      Support
    </TabsTrigger>
  </TabsList>
  
  <TabsContent value="profile" className="mt-6">
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.initials}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{user.name}</h3>
          <p className="text-muted-foreground">{user.role}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      {/* Profile form content */}
    </div>
  </TabsContent>
</Tabs>`}
                />
              </div>
            </section>

            {/* Underline Tabs */}
            <section id="underline-tabs" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Underline Tabs</h2>
                <p className="text-muted-foreground mb-6">
                  Clean tab navigation with underline indicators for modern interfaces and minimal designs.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <div className="w-full">
                    {/* Custom underline tabs implementation */}
                    <div className="border-b border-brown-200">
                      <nav className="flex space-x-8">
                        {[
                          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                          { id: 'team', label: 'Team', icon: Users },
                          { id: 'projects', label: 'Projects', icon: Briefcase },
                          { id: 'settings', label: 'Settings', icon: Settings }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setUnderlineTabValue(tab.id)}
                            className={`group inline-flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-all duration-200 ${
                              underlineTabValue === tab.id
                                ? 'border-brown-500 text-brown-600'
                                : 'border-transparent text-muted-foreground hover:text-brown-500 hover:border-brown-300'
                            }`}
                          >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                          </button>
                        ))}
                      </nav>
                    </div>
                    
                    <div className="mt-6">
                      {underlineTabValue === 'dashboard' && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">HR Dashboard Overview</h3>
                          <p className="text-muted-foreground">
                            Monitor key HR metrics, employee statistics, and organizational insights from a single dashboard.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="p-4 text-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Users className="w-4 h-4 text-blue-600" />
                              </div>
                              <h4 className="font-medium">Active Employees</h4>
                              <p className="text-2xl font-bold text-brown-600">247</p>
                            </Card>
                            <Card className="p-4 text-center">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                              </div>
                              <h4 className="font-medium">New Hires</h4>
                              <p className="text-2xl font-bold text-brown-600">12</p>
                            </Card>
                            <Card className="p-4 text-center">
                              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Clock className="w-4 h-4 text-yellow-600" />
                              </div>
                              <h4 className="font-medium">Pending Reviews</h4>
                              <p className="text-2xl font-bold text-brown-600">8</p>
                            </Card>
                            <Card className="p-4 text-center">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Target className="w-4 h-4 text-purple-600" />
                              </div>
                              <h4 className="font-medium">Goals Met</h4>
                              <p className="text-2xl font-bold text-brown-600">89%</p>
                            </Card>
                          </div>
                        </div>
                      )}

                      {underlineTabValue === 'team' && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Team Management</h3>
                          <p className="text-muted-foreground">
                            Manage your organization's teams, departments, and reporting structures.
                          </p>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 border border-brown-200 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-brown-100 rounded-full flex items-center justify-center">
                                  <Building className="w-5 h-5 text-brown-600" />
                                </div>
                                <div>
                                  <p className="font-medium">Engineering Team</p>
                                  <p className="text-sm text-muted-foreground">45 members</p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">View Details</Button>
                            </div>
                            <div className="flex items-center justify-between p-4 border border-brown-200 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-brown-100 rounded-full flex items-center justify-center">
                                  <Users className="w-5 h-5 text-brown-600" />
                                </div>
                                <div>
                                  <p className="font-medium">Sales Team</p>
                                  <p className="text-sm text-muted-foreground">32 members</p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">View Details</Button>
                            </div>
                            <div className="flex items-center justify-between p-4 border border-brown-200 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-brown-100 rounded-full flex items-center justify-center">
                                  <Globe className="w-5 h-5 text-brown-600" />
                                </div>
                                <div>
                                  <p className="font-medium">Marketing Team</p>
                                  <p className="text-sm text-muted-foreground">18 members</p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">View Details</Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {underlineTabValue === 'projects' && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">HR Projects & Initiatives</h3>
                          <p className="text-muted-foreground">
                            Track ongoing HR projects, initiatives, and strategic programs across the organization.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-green-600 font-medium">In Progress</span>
                              </div>
                              <h4 className="font-medium mb-2">Employee Wellness Program</h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                Comprehensive wellness initiative including mental health support and fitness benefits.
                              </p>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Due: March 2024</span>
                                <span className="text-brown-600 font-medium">75% Complete</span>
                              </div>
                            </Card>
                            <Card className="p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span className="text-sm text-yellow-600 font-medium">Planning</span>
                              </div>
                              <h4 className="font-medium mb-2">Diversity & Inclusion Initiative</h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                Strategic program to enhance workplace diversity and create inclusive environments.
                              </p>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Due: June 2024</span>
                                <span className="text-brown-600 font-medium">25% Complete</span>
                              </div>
                            </Card>
                          </div>
                        </div>
                      )}

                      {underlineTabValue === 'settings' && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">HR System Settings</h3>
                          <p className="text-muted-foreground">
                            Configure system preferences, notifications, and organizational settings.
                          </p>
                          
                          <div className="space-y-6">
                            <div>
                              <h4 className="font-medium mb-3">General Settings</h4>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">Auto-approve time off requests</p>
                                    <p className="text-sm text-muted-foreground">Automatically approve requests under 2 days</p>
                                  </div>
                                  <Checkbox defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">Send review reminders</p>
                                    <p className="text-sm text-muted-foreground">Email reminders for upcoming performance reviews</p>
                                  </div>
                                  <Checkbox defaultChecked />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                <CodeBlock
                  title="Underline Tabs"
                  language="tsx"
                  id="underline-tabs-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`const UnderlineTabs = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="w-full">
      <div className="border-b border-brown-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={\`group inline-flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-all duration-200 \${
                activeTab === tab.id
                  ? 'border-brown-500 text-brown-600'
                  : 'border-transparent text-muted-foreground hover:text-brown-500 hover:border-brown-300'
              }\`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="mt-6">
        {/* Tab content based on activeTab */}
      </div>
    </div>
  );
};`}
                />
              </div>
            </section>

            {/* Pill Tabs */}
            <section id="pill-tabs" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Pill Tabs</h2>
                <p className="text-muted-foreground mb-6">
                  Rounded pill-style tabs for a softer, more modern approach to navigation with subtle styling.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <div className="w-full">
                    {/* Custom pill tabs implementation */}
                    <div className="p-1 bg-brown-50 rounded-lg inline-flex">
                      {[
                        { id: 'employees', label: 'Employees' },
                        { id: 'departments', label: 'Departments' },
                        { id: 'positions', label: 'Positions' },
                        { id: 'locations', label: 'Locations' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setPillTabValue(tab.id)}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            pillTabValue === tab.id
                              ? 'bg-white text-brown-700 shadow-sm'
                              : 'text-muted-foreground hover:text-brown-600'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                    
                    <div className="mt-6">
                      {pillTabValue === 'employees' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Employee Directory</h3>
                            <Button size="sm" className="bg-brown-600 hover:bg-brown-700">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Employee
                            </Button>
                          </div>
                          
                          <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 w-4 h-4" />
                            <Input placeholder="Search employees..." className="pl-10" />
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 border border-brown-200 rounded-lg hover:bg-brown-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face" />
                                  <AvatarFallback>SC</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">Sarah Chen</p>
                                  <p className="text-sm text-muted-foreground">HR Director • Human Resources</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-100 text-green-700">Active</Badge>
                                <Button variant="ghost" size="sm">View Profile</Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 border border-brown-200 rounded-lg hover:bg-brown-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" />
                                  <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">John Davidson</p>
                                  <p className="text-sm text-muted-foreground">Senior Engineer • Engineering</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-100 text-green-700">Active</Badge>
                                <Button variant="ghost" size="sm">View Profile</Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 border border-brown-200 rounded-lg hover:bg-brown-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" />
                                  <AvatarFallback>MJ</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">Michael Johnson</p>
                                  <p className="text-sm text-muted-foreground">Sales Manager • Sales</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-yellow-100 text-yellow-700">On Leave</Badge>
                                <Button variant="ghost" size="sm">View Profile</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {pillTabValue === 'departments' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Department Overview</h3>
                            <Button size="sm" className="bg-brown-600 hover:bg-brown-700">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Department
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Building className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium">Engineering</h4>
                                  <p className="text-sm text-muted-foreground">Technology & Development</p>
                                </div>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Employees:</span>
                                  <span className="font-medium">45</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Manager:</span>
                                  <span className="font-medium">Alex Thompson</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Budget:</span>
                                  <span className="font-medium">$2.1M</span>
                                </div>
                              </div>
                            </Card>
                            
                            <Card className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                  <Users className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium">Sales</h4>
                                  <p className="text-sm text-muted-foreground">Revenue Generation</p>
                                </div>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Employees:</span>
                                  <span className="font-medium">32</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Manager:</span>
                                  <span className="font-medium">Lisa Rodriguez</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Budget:</span>
                                  <span className="font-medium">$1.8M</span>
                                </div>
                              </div>
                            </Card>
                            
                            <Card className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <Globe className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium">Marketing</h4>
                                  <p className="text-sm text-muted-foreground">Brand & Communications</p>
                                </div>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Employees:</span>
                                  <span className="font-medium">18</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Manager:</span>
                                  <span className="font-medium">David Park</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Budget:</span>
                                  <span className="font-medium">$950K</span>
                                </div>
                              </div>
                            </Card>
                          </div>
                        </div>
                      )}

                      {pillTabValue === 'positions' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Job Positions</h3>
                            <Button size="sm" className="bg-brown-600 hover:bg-brown-700">
                              <Plus className="w-4 h-4 mr-2" />
                              Create Position
                            </Button>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 border border-brown-200 rounded-lg">
                              <div>
                                <p className="font-medium">Senior Software Engineer</p>
                                <p className="text-sm text-muted-foreground">Engineering • Full-time • $120K - $150K</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-100 text-green-700">3 Open</Badge>
                                <Button variant="outline" size="sm">View Details</Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 border border-brown-200 rounded-lg">
                              <div>
                                <p className="font-medium">Product Manager</p>
                                <p className="text-sm text-muted-foreground">Product • Full-time • $110K - $140K</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-yellow-100 text-yellow-700">1 Open</Badge>
                                <Button variant="outline" size="sm">View Details</Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 border border-brown-200 rounded-lg">
                              <div>
                                <p className="font-medium">UX Designer</p>
                                <p className="text-sm text-muted-foreground">Design • Full-time • $85K - $110K</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-red-100 text-red-700">Closed</Badge>
                                <Button variant="outline" size="sm">View Details</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {pillTabValue === 'locations' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Office Locations</h3>
                            <Button size="sm" className="bg-brown-600 hover:bg-brown-700">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Location
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="p-4">
                              <h4 className="font-medium mb-2">San Francisco Headquarters</h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                123 Market Street, San Francisco, CA 94105
                              </p>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Employees:</span>
                                  <span className="font-medium">156</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Capacity:</span>
                                  <span className="font-medium">200</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Status:</span>
                                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                                </div>
                              </div>
                            </Card>
                            
                            <Card className="p-4">
                              <h4 className="font-medium mb-2">New York Office</h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                456 Broadway, New York, NY 10013
                              </p>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Employees:</span>
                                  <span className="font-medium">89</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Capacity:</span>
                                  <span className="font-medium">120</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Status:</span>
                                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                                </div>
                              </div>
                            </Card>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                <CodeBlock
                  title="Pill Tabs"
                  language="tsx"
                  id="pill-tabs-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`const PillTabs = () => {
  const [activeTab, setActiveTab] = useState('employees');

  const tabs = [
    { id: 'employees', label: 'Employees' },
    { id: 'departments', label: 'Departments' },
    { id: 'positions', label: 'Positions' },
    { id: 'locations', label: 'Locations' }
  ];

  return (
    <div className="w-full">
      <div className="p-1 bg-brown-50 rounded-lg inline-flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={\`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 \${
              activeTab === tab.id
                ? 'bg-white text-brown-700 shadow-sm'
                : 'text-muted-foreground hover:text-brown-600'
            }\`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="mt-6">
        {/* Tab content based on activeTab */}
      </div>
    </div>
  );
};`}
                />
              </div>
            </section>

            {/* User Tabs */}
            <section id="user-tabs" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">User Tabs</h2>
                <p className="text-muted-foreground mb-6">
                  User-focused tab navigation for account management and profile settings with integrated user information.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <Tabs value={userTabValue} onValueChange={setUserTabValue} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="account">Account</TabsTrigger>
                      <TabsTrigger value="preferences">Preferences</TabsTrigger>
                      <TabsTrigger value="notifications">Notifications</TabsTrigger>
                      <TabsTrigger value="billing">Billing</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="account" className="mt-6">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-20 h-20">
                            <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face" />
                            <AvatarFallback>SC</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-xl font-medium">Sarah Chen</h3>
                            <p className="text-muted-foreground">HR Director</p>
                            <p className="text-sm text-muted-foreground">sarah.chen@company.com</p>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h4 className="font-medium">Personal Information</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="text-sm font-medium">Full Name</label>
                                <Input defaultValue="Sarah Chen" className="mt-1" />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Email</label>
                                <Input defaultValue="sarah.chen@company.com" className="mt-1" />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Phone</label>
                                <Input defaultValue="+1 (555) 123-4567" className="mt-1" />
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <h4 className="font-medium">Work Information</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="text-sm font-medium">Department</label>
                                <Input defaultValue="Human Resources" className="mt-1" />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Job Title</label>
                                <Input defaultValue="HR Director" className="mt-1" />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Employee ID</label>
                                <Input defaultValue="EMP-2024-001" className="mt-1" />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button variant="outline">Cancel</Button>
                          <Button className="bg-brown-600 hover:bg-brown-700">Save Changes</Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="preferences" className="mt-6">
                      <div className="space-y-6">
                        <h3 className="font-medium">Appearance & Language</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Dark Mode</p>
                              <p className="text-sm text-muted-foreground">Use dark theme for the interface</p>
                            </div>
                            <Checkbox />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Compact View</p>
                              <p className="text-sm text-muted-foreground">Show more content in less space</p>
                            </div>
                            <Checkbox />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Language</label>
                            <Input defaultValue="English (US)" className="mt-1 max-w-xs" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Time Zone</label>
                            <Input defaultValue="Pacific Standard Time (PST)" className="mt-1 max-w-xs" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="notifications" className="mt-6">
                      <div className="space-y-6">
                        <h3 className="font-medium">Notification Preferences</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Email Notifications</p>
                              <p className="text-sm text-muted-foreground">Get notified about important updates via email</p>
                            </div>
                            <Checkbox checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Push Notifications</p>
                              <p className="text-sm text-muted-foreground">Receive push notifications on your devices</p>
                            </div>
                            <Checkbox />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">SMS Notifications</p>
                              <p className="text-sm text-muted-foreground">Get urgent updates via text message</p>
                            </div>
                            <Checkbox />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Weekly Digest</p>
                              <p className="text-sm text-muted-foreground">Receive a summary of weekly activities</p>
                            </div>
                            <Checkbox checked={weeklyReports} onCheckedChange={setWeeklyReports} />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="billing" className="mt-6">
                      <div className="space-y-6">
                        <h3 className="font-medium">Billing & Subscription</h3>
                        <div className="p-4 border border-brown-200 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="font-medium">Enterprise Plan</p>
                              <p className="text-sm text-muted-foreground">For teams and organizations</p>
                            </div>
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Monthly cost</span>
                              <span className="font-medium">$299/month</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Users included</span>
                              <span>50 users</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Next billing date</span>
                              <span>February 28, 2024</span>
                            </div>
                          </div>
                          <Separator className="my-4" />
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Change Plan</Button>
                            <Button variant="outline" size="sm">View Invoice</Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>

                <CodeBlock
                  title="User Tabs"
                  language="tsx"
                  id="user-tabs-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="preferences">Preferences</TabsTrigger>
    <TabsTrigger value="notifications">Notifications</TabsTrigger>
    <TabsTrigger value="billing">Billing</TabsTrigger>
  </TabsList>
  
  <TabsContent value="account" className="mt-6">
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.initials}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-medium">{user.name}</h3>
          <p className="text-muted-foreground">{user.role}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium">Personal Information</h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <Input defaultValue={user.name} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input defaultValue={user.email} className="mt-1" />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-medium">Work Information</h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Department</label>
              <Input defaultValue={user.department} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Job Title</label>
              <Input defaultValue={user.title} className="mt-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </TabsContent>
</Tabs>`}
                />
              </div>
            </section>

            {/* Vertical Tabs */}
            <section id="vertical-tabs" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Vertical Tabs</h2>
                <p className="text-muted-foreground mb-6">
                  Space-efficient vertical tab navigation perfect for sidebar layouts and complex multi-section interfaces.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <Tabs value={userTabValue} onValueChange={setUserTabValue} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="account">Account</TabsTrigger>
                      <TabsTrigger value="performance">Performance</TabsTrigger>
                      <TabsTrigger value="benefits">Benefits</TabsTrigger>
                      <TabsTrigger value="documents">Documents</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="account" className="mt-6">
                      <div className="space-y-6">
                        <div className="flex items-start gap-6">
                          <Avatar className="w-24 h-24">
                            <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face" />
                            <AvatarFallback>SC</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="text-xl font-medium mb-2">Sarah Chen</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Employee ID:</span>
                                <span className="ml-2">EMP-2024-001</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Department:</span>
                                <span className="ml-2">Human Resources</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Position:</span>
                                <span className="ml-2">HR Director</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Start Date:</span>
                                <span className="ml-2">Jan 15, 2022</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Manager:</span>
                                <span className="ml-2">Jennifer Adams</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Location:</span>
                                <span className="ml-2">New York, NY</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h4 className="font-medium mb-3">Contact Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Email</label>
                              <Input defaultValue="sarah.chen@company.com" className="mt-1" />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Phone</label>
                              <Input defaultValue="+1 (555) 123-4567" className="mt-1" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-sm font-medium">Address</label>
                              <Input defaultValue="123 Business Ave, New York, NY 10001" className="mt-1" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="performance" className="mt-6">
                      <div className="space-y-6">
                        <h3 className="font-medium">Performance Overview</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="p-4 text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <h4 className="font-medium">Overall Rating</h4>
                            <p className="text-2xl font-bold text-green-600">4.8</p>
                            <p className="text-sm text-muted-foreground">Exceeds Expectations</p>
                          </Card>
                          
                          <Card className="p-4 text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Target className="w-6 h-6 text-blue-600" />
                            </div>
                            <h4 className="font-medium">Goals Completed</h4>
                            <p className="text-2xl font-bold text-blue-600">12/15</p>
                            <p className="text-sm text-muted-foreground">80% Completion</p>
                          </Card>
                          
                          <Card className="p-4 text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                            <h4 className="font-medium">Improvement</h4>
                            <p className="text-2xl font-bold text-purple-600">+15%</p>
                            <p className="text-sm text-muted-foreground">vs Last Quarter</p>
                          </Card>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3">Recent Reviews</h4>
                          <div className="space-y-3">
                            <div className="p-4 border border-brown-200 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Q4 2024 Review</span>
                                <Badge>Completed</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Exceptional leadership in implementing new HR policies and procedures.
                              </p>
                            </div>
                            <div className="p-4 border border-brown-200 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Mid-Year Review</span>
                                <Badge variant="outline">In Progress</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Current review period focuses on team development and strategic initiatives.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="benefits" className="mt-6">
                      <div className="space-y-6">
                        <h3 className="font-medium">Benefits & Compensation</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card className="p-4">
                            <h4 className="font-medium mb-3">Health Insurance</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Plan:</span>
                                <span>Premium PPO</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Coverage:</span>
                                <span>Employee + Family</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Deductible:</span>
                                <span>$1,000</span>
                              </div>
                            </div>
                          </Card>
                          
                          <Card className="p-4">
                            <h4 className="font-medium mb-3">Retirement</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>401(k) Balance:</span>
                                <span>$45,230</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Company Match:</span>
                                <span>6%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Contribution:</span>
                                <span>8%</span>
                              </div>
                            </div>
                          </Card>
                          
                          <Card className="p-4">
                            <h4 className="font-medium mb-3">Paid Time Off</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Available:</span>
                                <span>18 days</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Used:</span>
                                <span>7 days</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Pending:</span>
                                <span>2 days</span>
                              </div>
                            </div>
                          </Card>
                          
                          <Card className="p-4">
                            <h4 className="font-medium mb-3">Other Benefits</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Life Insurance:</span>
                                <span>$100,000</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Disability:</span>
                                <span>Short & Long Term</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Transit:</span>
                                <span>$150/month</span>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="documents" className="mt-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Employee Documents</h3>
                          <Button size="sm" className="bg-brown-600 hover:bg-brown-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Upload Document
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 border border-brown-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-brown-600" />
                              <div>
                                <p className="font-medium">Employment Contract</p>
                                <p className="text-sm text-muted-foreground">Uploaded: Jan 15, 2022</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">View</Button>
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-4 border border-brown-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-brown-600" />
                              <div>
                                <p className="font-medium">Tax Documents (W-2)</p>
                                <p className="text-sm text-muted-foreground">Uploaded: Feb 1, 2024</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">View</Button>
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-4 border border-brown-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-brown-600" />
                              <div>
                                <p className="font-medium">Performance Review</p>
                                <p className="text-sm text-muted-foreground">Uploaded: Dec 15, 2023</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">View</Button>
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>

                <CodeBlock
                  title="User Tabs"
                  language="tsx"
                  id="user-tabs-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="performance">Performance</TabsTrigger>
    <TabsTrigger value="benefits">Benefits</TabsTrigger>
    <TabsTrigger value="documents">Documents</TabsTrigger>
  </TabsList>
  
  <TabsContent value="account" className="mt-6">
    <div className="space-y-6">
      <div className="flex items-start gap-6">
        <Avatar className="w-24 h-24">
          <AvatarImage src={employee.avatar} />
          <AvatarFallback>{employee.initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-xl font-medium mb-2">{employee.name}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Employee ID:</span>
              <span className="ml-2">{employee.id}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Department:</span>
              <span className="ml-2">{employee.department}</span>
            </div>
            {/* Additional employee details */}
          </div>
        </div>
      </div>
      {/* Account information content */}
    </div>
  </TabsContent>
</Tabs>`}
                />
              </div>
            </section>

            {/* Vertical Tabs */}
            <section id="vertical-tabs" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Vertical Tabs</h2>
                <p className="text-muted-foreground mb-6">
                  Sidebar-style vertical tab navigation for complex interfaces with multiple sections.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="border-brown-200 overflow-hidden">
                  <Tabs value={verticalTabValue} onValueChange={setVerticalTabValue} orientation="vertical" className="flex h-96">
                    <div className="w-48 border-r border-brown-200 bg-brown-50/50">
                      <TabsList className="flex flex-col h-full w-full bg-transparent p-2">
                        <TabsTrigger value="dashboard" className="w-full justify-start">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Dashboard
                        </TabsTrigger>
                        <TabsTrigger value="employees" className="w-full justify-start">
                          <Users className="w-4 h-4 mr-2" />
                          Employees
                        </TabsTrigger>
                        <TabsTrigger value="recruitment" className="w-full justify-start">
                          <User className="w-4 h-4 mr-2" />
                          Recruitment
                        </TabsTrigger>
                        <TabsTrigger value="payroll" className="w-full justify-start">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Payroll
                        </TabsTrigger>
                        <TabsTrigger value="compliance" className="w-full justify-start">
                          <Shield className="w-4 h-4 mr-2" />
                          Compliance
                        </TabsTrigger>
                        <TabsTrigger value="reports" className="w-full justify-start">
                          <FileText className="w-4 h-4 mr-2" />
                          Reports
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <div className="flex-1 p-6">
                      <TabsContent value="dashboard" className="m-0">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">HR Dashboard</h3>
                          <p className="text-muted-foreground">
                            Overview of key HR metrics and recent activities.
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <Card className="p-4">
                              <h4 className="font-medium mb-2">Active Employees</h4>
                              <p className="text-2xl font-bold text-brown-600">247</p>
                              <p className="text-sm text-green-600">+3 this month</p>
                            </Card>
                            <Card className="p-4">
                              <h4 className="font-medium mb-2">Pending Approvals</h4>
                              <p className="text-2xl font-bold text-brown-600">12</p>
                              <p className="text-sm text-orange-600">Requires attention</p>
                            </Card>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="employees" className="m-0">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Employee Management</h3>
                            <Button size="sm" className="bg-brown-600 hover:bg-brown-700">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Employee
                            </Button>
                          </div>
                          
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 w-4 h-4" />
                            <Input placeholder="Search employees..." className="pl-10" />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face" />
                                  <AvatarFallback>SC</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">Sarah Chen</p>
                                  <p className="text-sm text-muted-foreground">HR Director</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">View</Button>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" />
                                  <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">John Davidson</p>
                                  <p className="text-sm text-muted-foreground">HR Manager</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">View</Button>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="recruitment" className="m-0">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Recruitment Pipeline</h3>
                          <p className="text-muted-foreground">
                            Manage job postings and track candidate progress.
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <Card className="p-4">
                              <h4 className="font-medium mb-2">Open Positions</h4>
                              <p className="text-2xl font-bold text-brown-600">8</p>
                            </Card>
                            <Card className="p-4">
                              <h4 className="font-medium mb-2">Active Candidates</h4>
                              <p className="text-2xl font-bold text-brown-600">23</p>
                            </Card>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="payroll" className="m-0">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Payroll Management</h3>
                          <p className="text-muted-foreground">
                            Process payroll and manage compensation.
                          </p>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                              <span>Current Pay Period</span>
                              <Badge>In Progress</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                              <span>Payroll Processing</span>
                              <Button size="sm" variant="outline">Process</Button>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="compliance" className="m-0">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Compliance Center</h3>
                          <p className="text-muted-foreground">
                            Monitor compliance requirements and regulations.
                          </p>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span>OSHA Training</span>
                              </div>
                              <Badge>Complete</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-orange-600" />
                                <span>Diversity Training</span>
                              </div>
                              <Badge variant="outline">Pending</Badge>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="reports" className="m-0">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Reports & Analytics</h3>
                          <p className="text-muted-foreground">
                            Generate and view HR reports and analytics.
                          </p>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                              <span>Monthly Headcount Report</span>
                              <Button size="sm" variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                              <span>Performance Analytics</span>
                              <Button size="sm" variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </Card>

                <CodeBlock
                  title="Vertical Tabs"
                  language="tsx"
                  id="vertical-tabs-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="flex h-96">
  <div className="w-48 border-r bg-brown-50/50">
    <TabsList className="flex flex-col h-full w-full bg-transparent p-2">
      <TabsTrigger value="dashboard" className="w-full justify-start">
        <BarChart3 className="w-4 h-4 mr-2" />
        Dashboard
      </TabsTrigger>
      <TabsTrigger value="employees" className="w-full justify-start">
        <Users className="w-4 h-4 mr-2" />
        Employees
      </TabsTrigger>
      <TabsTrigger value="recruitment" className="w-full justify-start">
        <User className="w-4 h-4 mr-2" />
        Recruitment
      </TabsTrigger>
      <TabsTrigger value="payroll" className="w-full justify-start">
        <CreditCard className="w-4 h-4 mr-2" />
        Payroll
      </TabsTrigger>
      <TabsTrigger value="compliance" className="w-full justify-start">
        <Shield className="w-4 h-4 mr-2" />
        Compliance
      </TabsTrigger>
      <TabsTrigger value="reports" className="w-full justify-start">
        <FileText className="w-4 h-4 mr-2" />
        Reports
      </TabsTrigger>
    </TabsList>
  </div>
  
  <div className="flex-1 p-6">
    <TabsContent value="dashboard" className="m-0">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">HR Dashboard</h3>
        <p className="text-muted-foreground">
          Overview of key HR metrics and recent activities.
        </p>
        {/* Dashboard content */}
      </div>
    </TabsContent>
    {/* Other tab contents */}
  </div>
</Tabs>`}
                />
              </div>
            </section>

            {/* Data Tabs */}
            <section id="data-tabs" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Data Tabs</h2>
                <p className="text-muted-foreground mb-6">
                  Data-driven tab interfaces for analytics, reports, and metric visualization.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <Tabs value={dataTabValue} onValueChange={setDataTabValue} className="w-full">
                    <div className="flex items-center justify-between mb-6">
                      <TabsList>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        <TabsTrigger value="engagement">Engagement</TabsTrigger>
                        <TabsTrigger value="retention">Retention</TabsTrigger>
                      </TabsList>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Filter className="w-4 h-4 mr-2" />
                          Filter
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                    
                    <TabsContent value="analytics" className="mt-6">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <Card className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="w-4 h-4 text-brown-600" />
                              <span className="text-sm font-medium">Total Employees</span>
                            </div>
                            <p className="text-2xl font-bold">247</p>
                            <p className="text-xs text-green-600">+5.2% from last month</p>
                          </Card>
                          
                          <Card className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-4 h-4 text-brown-600" />
                              <span className="text-sm font-medium">Avg. Performance</span>
                            </div>
                            <p className="text-2xl font-bold">4.2</p>
                            <p className="text-xs text-green-600">+0.3 from last quarter</p>
                          </Card>
                          
                          <Card className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-brown-600" />
                              <span className="text-sm font-medium">Avg. Tenure</span>
                            </div>
                            <p className="text-2xl font-bold">3.2y</p>
                            <p className="text-xs text-blue-600">+2 months</p>
                          </Card>
                          
                          <Card className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="w-4 h-4 text-brown-600" />
                              <span className="text-sm font-medium">Goal Achievement</span>
                            </div>
                            <p className="text-2xl font-bold">87%</p>
                            <p className="text-xs text-green-600">+12% from last quarter</p>
                          </Card>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3">Department Breakdown</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                              <span>Engineering</span>
                              <div className="flex items-center gap-3">
                                <div className="w-24 bg-brown-100 rounded-full h-2">
                                  <div className="w-3/4 bg-brown-600 h-2 rounded-full"></div>
                                </div>
                                <span className="text-sm font-medium">85</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                              <span>Sales</span>
                              <div className="flex items-center gap-3">
                                <div className="w-24 bg-brown-100 rounded-full h-2">
                                  <div className="w-2/3 bg-brown-600 h-2 rounded-full"></div>
                                </div>
                                <span className="text-sm font-medium">62</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                              <span>Marketing</span>
                              <div className="flex items-center gap-3">
                                <div className="w-24 bg-brown-100 rounded-full h-2">
                                  <div className="w-1/2 bg-brown-600 h-2 rounded-full"></div>
                                </div>
                                <span className="text-sm font-medium">34</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                              <span>Human Resources</span>
                              <div className="flex items-center gap-3">
                                <div className="w-24 bg-brown-100 rounded-full h-2">
                                  <div className="w-1/4 bg-brown-600 h-2 rounded-full"></div>
                                </div>
                                <span className="text-sm font-medium">18</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="performance" className="mt-6">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="p-4 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h4 className="font-medium">High Performers</h4>
                            <p className="text-2xl font-bold text-green-600">68</p>
                            <p className="text-sm text-muted-foreground">27% of workforce</p>
                          </Card>
                          
                          <Card className="p-4 text-center">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Star className="w-8 h-8 text-yellow-600" />
                            </div>
                            <h4 className="font-medium">Average Performers</h4>
                            <p className="text-2xl font-bold text-yellow-600">156</p>
                            <p className="text-sm text-muted-foreground">63% of workforce</p>
                          </Card>
                          
                          <Card className="p-4 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h4 className="font-medium">Needs Improvement</h4>
                            <p className="text-2xl font-bold text-red-600">23</p>
                            <p className="text-sm text-muted-foreground">10% of workforce</p>
                          </Card>
                        </div>
                        
                        <div className="h-48 bg-brown-50 rounded-lg border border-brown-200 flex items-center justify-center">
                          <p className="text-muted-foreground">Performance Trend Chart Placeholder</p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="engagement" className="mt-6">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card className="p-4">
                            <h4 className="font-medium mb-3">Engagement Score</h4>
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-full border-4 border-brown-600 flex items-center justify-center">
                                <span className="text-xl font-bold text-brown-600">8.2</span>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">out of 10</p>
                                <p className="text-xs text-green-600">+0.5 from last survey</p>
                              </div>
                            </div>
                          </Card>
                          
                          <Card className="p-4">
                            <h4 className="font-medium mb-3">Survey Participation</h4>
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-full border-4 border-brown-600 flex items-center justify-center">
                                <span className="text-xl font-bold text-brown-600">92%</span>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Response rate</p>
                                <p className="text-xs text-green-600">+8% improvement</p>
                              </div>
                            </div>
                          </Card>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3">Engagement Factors</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span>Work-Life Balance</span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 bg-brown-100 rounded-full h-2">
                                  <div className="w-4/5 bg-brown-600 h-2 rounded-full"></div>
                                </div>
                                <span className="text-sm">8.1</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Career Development</span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 bg-brown-100 rounded-full h-2">
                                  <div className="w-3/4 bg-brown-600 h-2 rounded-full"></div>
                                </div>
                                <span className="text-sm">7.8</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Management Support</span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 bg-brown-100 rounded-full h-2">
                                  <div className="w-5/6 bg-brown-600 h-2 rounded-full"></div>
                                </div>
                                <span className="text-sm">8.5</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Compensation</span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 bg-brown-100 rounded-full h-2">
                                  <div className="w-3/5 bg-brown-600 h-2 rounded-full"></div>
                                </div>
                                <span className="text-sm">7.2</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="retention" className="mt-6">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="p-4">
                            <h4 className="font-medium mb-2">Retention Rate</h4>
                            <p className="text-3xl font-bold text-brown-600">94.2%</p>
                            <p className="text-sm text-green-600">+2.1% from last year</p>
                          </Card>
                          
                          <Card className="p-4">
                            <h4 className="font-medium mb-2">Voluntary Turnover</h4>
                            <p className="text-3xl font-bold text-brown-600">5.8%</p>
                            <p className="text-sm text-red-600">-1.2% from last year</p>
                          </Card>
                          
                          <Card className="p-4">
                            <h4 className="font-medium mb-2">Avg. Tenure</h4>
                            <p className="text-3xl font-bold text-brown-600">3.2y</p>
                            <p className="text-sm text-blue-600">+3 months</p>
                          </Card>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3">Turnover by Department</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                              <span>Sales</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="destructive">8.5%</Badge>
                                <span className="text-sm text-muted-foreground">High</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                              <span>Marketing</span>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-yellow-600">6.2%</Badge>
                                <span className="text-sm text-muted-foreground">Medium</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                              <span>Engineering</span>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-600">3.1%</Badge>
                                <span className="text-sm text-muted-foreground">Low</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                              <span>HR</span>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-600">2.8%</Badge>
                                <span className="text-sm text-muted-foreground">Low</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>

                <CodeBlock
                  title="Data Tabs"
                  language="tsx"
                  id="data-tabs-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <div className="flex items-center justify-between mb-6">
    <TabsList>
      <TabsTrigger value="analytics">Analytics</TabsTrigger>
      <TabsTrigger value="performance">Performance</TabsTrigger>
      <TabsTrigger value="engagement">Engagement</TabsTrigger>
      <TabsTrigger value="retention">Retention</TabsTrigger>
    </TabsList>
    
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <Filter className="w-4 h-4 mr-2" />
        Filter
      </Button>
      <Button variant="outline" size="sm">
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>
    </div>
  </div>
  
  <TabsContent value="analytics" className="mt-6">
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-brown-600" />
            <span className="text-sm font-medium">Total Employees</span>
          </div>
          <p className="text-2xl font-bold">247</p>
          <p className="text-xs text-green-600">+5.2% from last month</p>
        </Card>
        {/* Additional metric cards */}
      </div>
      {/* Charts and detailed analytics */}
    </div>
  </TabsContent>
</Tabs>`}
                />
              </div>
            </section>

            {/* Interactive Tabs */}
            <section id="interactive-tabs" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Interactive Tabs</h2>
                <p className="text-muted-foreground mb-6">
                  Advanced tab interfaces with interactive elements, social features, and dynamic content.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <Tabs value={interactiveTabValue} onValueChange={setInteractiveTabValue} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="posts" className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Posts
                        <Badge className="bg-brown-600 text-white">12</Badge>
                      </TabsTrigger>
                      <TabsTrigger value="saved" className="flex items-center gap-2">
                        <Bookmark className="w-4 h-4" />
                        Saved
                        <Badge className="bg-brown-600 text-white">8</Badge>
                      </TabsTrigger>
                      <TabsTrigger value="liked" className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Liked
                        <Badge className="bg-brown-600 text-white">24</Badge>
                      </TabsTrigger>
                      <TabsTrigger value="shared" className="flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Shared
                        <Badge className="bg-brown-600 text-white">5</Badge>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="posts" className="mt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Recent Posts</h3>
                          <Button size="sm" className="bg-brown-600 hover:bg-brown-700">
                            <Plus className="w-4 h-4 mr-2" />
                            New Post
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          <Card className="p-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face" />
                                <AvatarFallback>SC</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium">Sarah Chen</span>
                                  <Badge variant="outline">HR Director</Badge>
                                  <span className="text-sm text-muted-foreground">2 hours ago</span>
                                </div>
                                <p className="text-sm mb-3">
                                  Excited to announce our new employee wellness program! This initiative will focus on mental health support, fitness benefits, and work-life balance improvements.
                                </p>
                                <div className="flex items-center gap-4">
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                    <Heart className="w-4 h-4 mr-1" />
                                    24
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <MessageSquare className="w-4 h-4 mr-1" />
                                    8
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Share2 className="w-4 h-4 mr-1" />
                                    Share
                                  </Button>
                                  <Button variant="ghost" size="sm" className="ml-auto">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                          
                          <Card className="p-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" />
                                <AvatarFallback>JD</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium">John Davidson</span>
                                  <Badge variant="outline">HR Manager</Badge>
                                  <span className="text-sm text-muted-foreground">5 hours ago</span>
                                </div>
                                <p className="text-sm mb-3">
                                  Great turnout at today's team building event! It's amazing to see our teams collaborate and connect outside of work.
                                </p>
                                <div className="flex items-center gap-4">
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                    <Heart className="w-4 h-4 mr-1" />
                                    18
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <MessageSquare className="w-4 h-4 mr-1" />
                                    12
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Share2 className="w-4 h-4 mr-1" />
                                    Share
                                  </Button>
                                  <Button variant="ghost" size="sm" className="ml-auto">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="saved" className="mt-6">
                      <div className="space-y-4">
                        <h3 className="font-medium">Saved Posts</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Bookmark className="w-5 h-5 text-brown-600" />
                              <div>
                                <p className="font-medium">Company Policy Updates</p>
                                <p className="text-sm text-muted-foreground">Saved 3 days ago</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Bookmark className="w-5 h-5 text-brown-600" />
                              <div>
                                <p className="font-medium">Remote Work Guidelines</p>
                                <p className="text-sm text-muted-foreground">Saved 1 week ago</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Bookmark className="w-5 h-5 text-brown-600" />
                              <div>
                                <p className="font-medium">Performance Review Templates</p>
                                <p className="text-sm text-muted-foreground">Saved 2 weeks ago</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="liked" className="mt-6">
                      <div className="space-y-4">
                        <h3 className="font-medium">Liked Posts</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Heart className="w-5 h-5 text-red-600 fill-current" />
                              <div>
                                <p className="font-medium">Employee Recognition Program</p>
                                <p className="text-sm text-muted-foreground">Liked 2 hours ago</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Heart className="w-5 h-5 text-red-600 fill-current" />
                              <div>
                                <p className="font-medium">New Office Space Tour</p>
                                <p className="text-sm text-muted-foreground">Liked yesterday</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Heart className="w-5 h-5 text-red-600 fill-current" />
                              <div>
                                <p className="font-medium">Team Achievement Celebration</p>
                                <p className="text-sm text-muted-foreground">Liked 3 days ago</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="shared" className="mt-6">
                      <div className="space-y-4">
                        <h3 className="font-medium">Shared Posts</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Share2 className="w-5 h-5 text-brown-600" />
                              <div>
                                <p className="font-medium">Q4 Company Results</p>
                                <p className="text-sm text-muted-foreground">Shared to Engineering Team</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Share2 className="w-5 h-5 text-brown-600" />
                              <div>
                                <p className="font-medium">Training Schedule Updates</p>
                                <p className="text-sm text-muted-foreground">Shared to All Employees</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>

                <CodeBlock
                  title="Interactive Tabs"
                  language="tsx"
                  id="interactive-tabs-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="posts" className="flex items-center gap-2">
      <MessageSquare className="w-4 h-4" />
      Posts
      <Badge className="bg-brown-600 text-white">{postCount}</Badge>
    </TabsTrigger>
    <TabsTrigger value="saved" className="flex items-center gap-2">
      <Bookmark className="w-4 h-4" />
      Saved
      <Badge className="bg-brown-600 text-white">{savedCount}</Badge>
    </TabsTrigger>
    <TabsTrigger value="liked" className="flex items-center gap-2">
      <Heart className="w-4 h-4" />
      Liked
      <Badge className="bg-brown-600 text-white">{likedCount}</Badge>
    </TabsTrigger>
    <TabsTrigger value="shared" className="flex items-center gap-2">
      <Share2 className="w-4 h-4" />
      Shared
      <Badge className="bg-brown-600 text-white">{sharedCount}</Badge>
    </TabsTrigger>
  </TabsList>
  
  <TabsContent value="posts" className="mt-6">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Recent Posts</h3>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>
      
      {posts.map((post) => (
        <Card key={post.id} className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback>{post.author.initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{post.author.name}</span>
                <Badge variant="outline">{post.author.role}</Badge>
                <span className="text-sm text-muted-foreground">{post.timestamp}</span>
              </div>
              <p className="text-sm mb-3">{post.content}</p>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                  <Heart className="w-4 h-4 mr-1" />
                  {post.likes}
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  {post.comments}
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </TabsContent>
</Tabs>`}
                />
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};