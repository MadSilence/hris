import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Search, ChevronRight, Menu, Layers, Package, Award, AlertTriangle, CheckCircle, XCircle, AlertCircle, Info, Clock, Star, Users, Building2, UserCheck, FileText, Settings, Calendar, Briefcase, Shield, Target, TrendingUp, Code2, Eye, Hash, Zap, Activity, DollarSign, BookOpen, HelpCircle, Coffee, Plane, GraduationCap, Heart, Gift, Timer, PanelLeftOpen, Megaphone, Command, Edit, Palette as PaletteIcon, Upload, Gauge, ArrowUpDown, RefreshCw, Smartphone, Filter, Download, Plus, Bell, LogOut, Grid3X3, List, PieChart, Type, Lightbulb, Ban, CircleAlert, BarChart3, ChevronDown, MoreHorizontal, Mail, Phone, MapPin, Globe, ExternalLink, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';
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
  'Data Display': Grid3X3,
  'Default': Package
};
import { DesactLogo } from './shared/DesactLogo';

interface DataDisplayPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const DataDisplayPage: React.FC<DataDisplayPageProps> = ({ 
  onBack, 
  components, 
  onComponentClick, 
  currentComponent 
}) => {
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
      const sections = ['overview', 'tables', 'charts', 'cards', 'progress', 'avatars', 'badges', 'skeletons', 'stats', 'hr-examples', 'best-practices', 'implementation'];
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
    { id: 'overview', label: 'Overview', icon: Grid3X3 },
    { id: 'tables', label: 'Data Tables', icon: List },
    { id: 'charts', label: 'Charts & Graphs', icon: BarChart3 },
    { id: 'cards', label: 'Data Cards', icon: Package },
    { id: 'progress', label: 'Progress Indicators', icon: Activity },
    { id: 'avatars', label: 'Avatars & Photos', icon: Users },
    { id: 'badges', label: 'Status Badges', icon: Award },
    { id: 'skeletons', label: 'Loading States', icon: Zap },
    { id: 'stats', label: 'Statistics Display', icon: TrendingUp },
    { id: 'hr-examples', label: 'HR Examples', icon: Building2 },
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

  // Sample data for examples
  const sampleEmployees = [
    { id: 1, name: "Sarah Johnson", role: "Senior Developer", department: "Engineering", performance: 92, avatar: "", email: "sarah.johnson@company.com", status: "Active" },
    { id: 2, name: "Michael Chen", role: "Product Manager", department: "Product", performance: 88, avatar: "", email: "michael.chen@company.com", status: "Active" },
    { id: 3, name: "Emily Davis", role: "UX Designer", department: "Design", performance: 95, avatar: "", email: "emily.davis@company.com", status: "Active" },
    { id: 4, name: "David Wilson", role: "Data Analyst", department: "Analytics", performance: 87, avatar: "", email: "david.wilson@company.com", status: "On Leave" },
    { id: 5, name: "Lisa Rodriguez", role: "HR Manager", department: "Human Resources", performance: 91, avatar: "", email: "lisa.rodriguez@company.com", status: "Active" }
  ];

  const departmentStats = [
    { department: "Engineering", employees: 45, avgPerformance: 89, budget: 2800000 },
    { department: "Product", employees: 12, avgPerformance: 91, budget: 980000 },
    { department: "Design", employees: 8, avgPerformance: 93, budget: 640000 },
    { department: "Analytics", employees: 6, avgPerformance: 88, budget: 480000 },
    { department: "Human Resources", employees: 4, avgPerformance: 92, budget: 320000 }
  ];

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
                  <h1 className="text-xl font-semibold">Data Display</h1>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                    Visualization
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Present and organize data with tables, charts, and visual components
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
                      Data Display Components Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Comprehensive components for displaying, organizing, and visualizing data in HR applications. 
                      From employee tables to performance charts and status indicators.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <List className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Data Tables</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Structured tables for employee data, payroll, performance metrics, and reports.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <BarChart3 className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Charts & Analytics</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Visual representations of HR data including performance trends and department statistics.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Employee Profiles</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Cards, avatars, and badges for displaying employee information and status.</p>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Data Display Patterns">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Structural Components</h4>
                        <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li>• Data tables with sorting and filtering</li>
                          <li>• Cards for grouped information display</li>
                          <li>• Lists with hierarchical data</li>
                          <li>• Grid layouts for dashboard views</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Visual Components</h4>
                        <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li>• Charts and graphs for analytics</li>
                          <li>• Progress bars for goal tracking</li>
                          <li>• Avatars for employee identification</li>
                          <li>• Badges for status and role indicators</li>
                        </ul>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Data Tables */}
              <section id="tables" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Data Tables</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Structured displays for employee data, performance metrics, and administrative records.</p>
                  </div>

                  <PreviewCard title="Employee Directory Table">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Performance</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sampleEmployees.map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={employee.avatar} />
                                  <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{employee.name}</div>
                                  <div className="text-sm text-muted-foreground">{employee.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{employee.role}</TableCell>
                            <TableCell>{employee.department}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={employee.performance} className="w-16" />
                                <span className="text-sm">{employee.performance}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={employee.status === 'Active' ? 'default' : 'secondary'}
                                className={employee.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                              >
                                {employee.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </PreviewCard>

                  <PreviewCard title="Department Statistics Table">
                    <Table>
                      <TableCaption>Department performance and budget overview for Q4 2024</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Department</TableHead>
                          <TableHead className="text-right">Employees</TableHead>
                          <TableHead className="text-right">Avg Performance</TableHead>
                          <TableHead className="text-right">Annual Budget</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {departmentStats.map((dept) => (
                          <TableRow key={dept.department}>
                            <TableCell className="font-medium">{dept.department}</TableCell>
                            <TableCell className="text-right">{dept.employees}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Progress value={dept.avgPerformance} className="w-16" />
                                <span>{dept.avgPerformance}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              ${(dept.budget / 1000000).toFixed(1)}M
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell>Total</TableCell>
                          <TableCell className="text-right">
                            {departmentStats.reduce((sum, dept) => sum + dept.employees, 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            {Math.round(departmentStats.reduce((sum, dept) => sum + dept.avgPerformance, 0) / departmentStats.length)}%
                          </TableCell>
                          <TableCell className="text-right">
                            ${(departmentStats.reduce((sum, dept) => sum + dept.budget, 0) / 1000000).toFixed(1)}M
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Badge } from './components/ui/badge';
import { Progress } from './components/ui/progress';

// Employee directory table
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Employee</TableHead>
      <TableHead>Role</TableHead>
      <TableHead>Department</TableHead>
      <TableHead>Performance</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {employees.map((employee) => (
      <TableRow key={employee.id}>
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={employee.avatar} />
              <AvatarFallback>{employee.initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{employee.name}</div>
              <div className="text-sm text-muted-foreground">{employee.email}</div>
            </div>
          </div>
        </TableCell>
        <TableCell>{employee.role}</TableCell>
        <TableCell>{employee.department}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Progress value={employee.performance} className="w-16" />
            <span className="text-sm">{employee.performance}%</span>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>
            {employee.status}
          </Badge>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>`}
                      language="tsx"
                      id="data-tables"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Data Cards */}
              <section id="cards" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Data Cards</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Organized containers for displaying grouped information and employee profiles.</p>
                  </div>

                  <PreviewCard title="Employee Profile Cards">
                    <div className="grid md:grid-cols-2 gap-4">
                      {sampleEmployees.slice(0, 4).map((employee) => (
                        <Card key={employee.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={employee.avatar} />
                                <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">{employee.name}</h3>
                                <p className="text-sm text-muted-foreground">{employee.role}</p>
                                <p className="text-xs text-muted-foreground">{employee.department}</p>
                              </div>
                            </div>
                            <Badge 
                              variant={employee.status === 'Active' ? 'default' : 'secondary'}
                              className={employee.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                            >
                              {employee.status}
                            </Badge>
                          </div>
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Performance</span>
                              <span>{employee.performance}%</span>
                            </div>
                            <Progress value={employee.performance} />
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Mail className="h-3 w-3 mr-1" />
                              Message
                            </Button>
                            <Button size="sm" variant="outline">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Department Overview Cards">
                    <div className="grid md:grid-cols-3 gap-4">
                      {departmentStats.slice(0, 3).map((dept) => (
                        <Card key={dept.department} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{dept.department}</h3>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Employees</span>
                              <span className="font-medium">{dept.employees}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Avg Performance</span>
                              <span className="font-medium">{dept.avgPerformance}%</span>
                            </div>
                            <Progress value={dept.avgPerformance} />
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Budget</span>
                              <span className="font-medium">${(dept.budget / 1000000).toFixed(1)}M</span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Card } from './components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Badge } from './components/ui/badge';
import { Progress } from './components/ui/progress';
import { Button } from './components/ui/button';

// Employee profile card
<Card className="p-4">
  <div className="flex items-start justify-between">
    <div className="flex items-center gap-3">
      <Avatar className="h-12 w-12">
        <AvatarImage src={employee.avatar} />
        <AvatarFallback>{employee.initials}</AvatarFallback>
      </Avatar>
      <div>
        <h3 className="font-medium">{employee.name}</h3>
        <p className="text-sm text-muted-foreground">{employee.role}</p>
        <p className="text-xs text-muted-foreground">{employee.department}</p>
      </div>
    </div>
    <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>
      {employee.status}
    </Badge>
  </div>
  <div className="mt-4 space-y-2">
    <div className="flex justify-between text-sm">
      <span>Performance</span>
      <span>{employee.performance}%</span>
    </div>
    <Progress value={employee.performance} />
  </div>
  <div className="mt-4 flex gap-2">
    <Button size="sm" variant="outline" className="flex-1">
      <Mail className="h-3 w-3 mr-1" />
      Message
    </Button>
    <Button size="sm" variant="outline">
      <MoreHorizontal className="h-3 w-3" />
    </Button>
  </div>
</Card>`}
                      language="tsx"
                      id="data-cards"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Progress Indicators */}
              <section id="progress" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Progress Indicators</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Visual indicators for goals, performance metrics, and completion status.</p>
                  </div>

                  <PreviewCard title="Performance Tracking">
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Annual Goal Completion</span>
                          <span>78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">7 of 9 objectives completed</p>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Team Performance</span>
                          <span>91%</span>
                        </div>
                        <Progress value={91} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">Exceeds quarterly targets</p>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Training Completion</span>
                          <span>100%</span>
                        </div>
                        <Progress value={100} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">All mandatory training completed</p>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Multi-level Progress Indicators">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-4">Department Goals 2024</h4>
                        <div className="space-y-4">
                          {[
                            { dept: 'Engineering', progress: 85, target: 'Ship 12 features', status: 'On Track' },
                            { dept: 'Design', progress: 92, target: 'Complete redesign', status: 'Ahead' },
                            { dept: 'Product', progress: 67, target: 'Launch 3 products', status: 'Behind' },
                            { dept: 'Analytics', progress: 88, target: 'Implement 5 dashboards', status: 'On Track' }
                          ].map((item) => (
                            <div key={item.dept} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="font-medium">{item.dept}</span>
                                  <span className="text-sm text-muted-foreground ml-2">{item.target}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="secondary"
                                    className={
                                      item.status === 'Ahead' ? 'bg-green-100 text-green-700' :
                                      item.status === 'Behind' ? 'bg-red-100 text-red-700' :
                                      'bg-blue-100 text-blue-700'
                                    }
                                  >
                                    {item.status}
                                  </Badge>
                                  <span className="text-sm font-medium">{item.progress}%</span>
                                </div>
                              </div>
                              <Progress value={item.progress} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Progress } from './components/ui/progress';
import { Badge } from './components/ui/badge';

// Basic progress indicator
<div>
  <div className="flex justify-between text-sm mb-2">
    <span>Annual Goal Completion</span>
    <span>78%</span>
  </div>
  <Progress value={78} className="h-2" />
  <p className="text-xs text-muted-foreground mt-1">7 of 9 objectives completed</p>
</div>

// Progress with status badge
<div className="space-y-2">
  <div className="flex justify-between items-center">
    <div>
      <span className="font-medium">Engineering</span>
      <span className="text-sm text-muted-foreground ml-2">Ship 12 features</span>
    </div>
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
        On Track
      </Badge>
      <span className="text-sm font-medium">85%</span>
    </div>
  </div>
  <Progress value={85} />
</div>`}
                      language="tsx"
                      id="progress-indicators"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Avatars */}
              <section id="avatars" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Avatars & Photos</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Profile pictures and visual identifiers for employees and users.</p>
                  </div>

                  <PreviewCard title="Avatar Sizes and Styles">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-3">Different Sizes</h4>
                        <div className="flex items-end gap-4">
                          <div className="text-center">
                            <Avatar className="h-6 w-6 mb-2">
                              <AvatarFallback className="text-xs">SJ</AvatarFallback>
                            </Avatar>
                            <p className="text-xs text-muted-foreground">Small</p>
                          </div>
                          <div className="text-center">
                            <Avatar className="h-8 w-8 mb-2">
                              <AvatarFallback className="text-sm">SJ</AvatarFallback>
                            </Avatar>
                            <p className="text-xs text-muted-foreground">Default</p>
                          </div>
                          <div className="text-center">
                            <Avatar className="h-12 w-12 mb-2">
                              <AvatarFallback>SJ</AvatarFallback>
                            </Avatar>
                            <p className="text-xs text-muted-foreground">Large</p>
                          </div>
                          <div className="text-center">
                            <Avatar className="h-16 w-16 mb-2">
                              <AvatarFallback className="text-lg">SJ</AvatarFallback>
                            </Avatar>
                            <p className="text-xs text-muted-foreground">XL</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Team Member Grid</h4>
                        <div className="grid grid-cols-6 gap-3">
                          {sampleEmployees.map((employee, index) => (
                            <div key={employee.id} className="text-center">
                              <Avatar className="h-12 w-12 mb-2 mx-auto">
                                <AvatarImage src={employee.avatar} />
                                <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <p className="text-xs font-medium">{employee.name.split(' ')[0]}</p>
                              <p className="text-xs text-muted-foreground">{employee.role.split(' ')[0]}</p>
                            </div>
                          ))}
                          <div className="text-center">
                            <Avatar className="h-12 w-12 mb-2 mx-auto border-2 border-dashed border-muted-foreground/30">
                              <AvatarFallback className="bg-transparent">
                                <Plus className="h-4 w-4 text-muted-foreground" />
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-xs text-muted-foreground">Add Member</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Avatar with Status Indicators</h4>
                        <div className="flex gap-4">
                          <div className="relative">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>SJ</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                            <p className="text-xs text-center mt-2">Online</p>
                          </div>
                          <div className="relative">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>MC</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-background"></div>
                            <p className="text-xs text-center mt-2">Away</p>
                          </div>
                          <div className="relative">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>ED</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background"></div>
                            <p className="text-xs text-center mt-2">Busy</p>
                          </div>
                          <div className="relative">
                            <Avatar className="h-12 w-12 opacity-60">
                              <AvatarFallback>DW</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-400 rounded-full border-2 border-background"></div>
                            <p className="text-xs text-center mt-2">Offline</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Plus } from 'lucide-react';

// Basic avatar with fallback
<Avatar className="h-12 w-12">
  <AvatarImage src={user.avatar} />
  <AvatarFallback>{user.initials}</AvatarFallback>
</Avatar>

// Avatar with status indicator
<div className="relative">
  <Avatar className="h-12 w-12">
    <AvatarFallback>SJ</AvatarFallback>
  </Avatar>
  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
</div>

// Team member grid
<div className="grid grid-cols-6 gap-3">
  {team.map((member) => (
    <div key={member.id} className="text-center">
      <Avatar className="h-12 w-12 mb-2 mx-auto">
        <AvatarImage src={member.avatar} />
        <AvatarFallback>{member.initials}</AvatarFallback>
      </Avatar>
      <p className="text-xs font-medium">{member.name}</p>
      <p className="text-xs text-muted-foreground">{member.role}</p>
    </div>
  ))}
</div>`}
                      language="tsx"
                      id="avatars"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Loading States */}
              <section id="skeletons" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Loading States</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Skeleton screens and loading indicators for better user experience during data fetching.</p>
                  </div>

                  <PreviewCard title="Table Loading State">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                      <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="flex items-center space-x-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-48" />
                            </div>
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Card Loading State">
                    <div className="grid md:grid-cols-2 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-12 w-12 rounded-full" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-32" />
                                <Skeleton className="h-3 w-20" />
                              </div>
                            </div>
                            <Skeleton className="h-6 w-16 rounded-full" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Skeleton className="h-3 w-20" />
                              <Skeleton className="h-3 w-8" />
                            </div>
                            <Skeleton className="h-2 w-full rounded-full" />
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Skeleton className="h-8 flex-1 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Chart Loading State">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-4 w-64" />
                        </div>
                        <Skeleton className="h-8 w-32" />
                      </div>
                      <div className="flex items-end justify-between h-48 gap-2">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <Skeleton key={i} className="w-12" style={{ height: `${Math.random() * 150 + 50}px` }} />
                        ))}
                      </div>
                      <div className="flex justify-between">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <Skeleton key={i} className="h-3 w-8" />
                        ))}
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Skeleton } from './components/ui/skeleton';
import { Card } from './components/ui/card';

// Table loading skeleton
<div className="space-y-3">
  {Array.from({ length: 4 }).map((_, i) => (
    <div key={i} className="flex items-center space-x-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  ))}
</div>

// Card loading skeleton
<Card className="p-4">
  <div className="flex items-start justify-between mb-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
    <Skeleton className="h-6 w-16 rounded-full" />
  </div>
  <div className="space-y-2">
    <Skeleton className="h-2 w-full rounded-full" />
  </div>
</Card>`}
                      language="tsx"
                      id="loading-states"
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
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>HR Application Examples</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Real-world data display patterns for HR dashboards, employee management, and analytics.</p>
                  </div>

                  <PreviewCard title="Employee Dashboard">
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-4 gap-4">
                        <Card className="p-4 text-center">
                          <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                          <p className="text-2xl font-bold">247</p>
                          <p className="text-sm text-muted-foreground">Total Employees</p>
                        </Card>
                        <Card className="p-4 text-center">
                          <UserCheck className="h-8 w-8 mx-auto mb-2 text-green-600" />
                          <p className="text-2xl font-bold">12</p>
                          <p className="text-sm text-muted-foreground">New Hires</p>
                        </Card>
                        <Card className="p-4 text-center">
                          <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                          <p className="text-2xl font-bold">8</p>
                          <p className="text-sm text-muted-foreground">Pending Reviews</p>
                        </Card>
                        <Card className="p-4 text-center">
                          <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                          <p className="text-2xl font-bold">89%</p>
                          <p className="text-sm text-muted-foreground">Avg Performance</p>
                        </Card>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Performance Review Dashboard">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Q4 2024 Performance Reviews</h3>
                        <Badge className="bg-green-100 text-green-700">92% Complete</Badge>
                      </div>
                      
                      <div className="space-y-4">
                        {[
                          { employee: 'Sarah Johnson', manager: 'Mike Smith', status: 'Complete', score: 4.2, dueDate: 'Dec 15' },
                          { employee: 'Michael Chen', manager: 'Lisa Wong', status: 'In Progress', score: null, dueDate: 'Dec 20' },
                          { employee: 'Emily Davis', manager: 'John Doe', status: 'Pending', score: null, dueDate: 'Dec 18' },
                          { employee: 'David Wilson', manager: 'Sarah Johnson', status: 'Complete', score: 3.8, dueDate: 'Dec 12' }
                        ].map((review, i) => (
                          <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{review.employee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{review.employee}</p>
                                <p className="text-sm text-muted-foreground">Manager: {review.manager}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm">Due: {review.dueDate}</p>
                                {review.score && (
                                  <p className="text-sm font-medium">Score: {review.score}/5</p>
                                )}
                              </div>
                              <Badge
                                variant="secondary"
                                className={
                                  review.status === 'Complete' ? 'bg-green-100 text-green-700' :
                                  review.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }
                              >
                                {review.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Recruitment Pipeline">
                    <div className="space-y-6">
                      <h3 className="font-semibold">Open Positions & Candidates</h3>
                      
                      <div className="grid gap-4">
                        {[
                          { position: 'Senior Frontend Developer', applications: 24, interviews: 8, offers: 2, status: 'Active' },
                          { position: 'Product Manager', applications: 31, interviews: 12, offers: 1, status: 'Active' },
                          { position: 'UX Designer', applications: 18, interviews: 6, offers: 3, status: 'Closed' },
                          { position: 'Data Scientist', applications: 42, interviews: 15, offers: 0, status: 'Active' }
                        ].map((job, i) => (
                          <div key={i} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-medium">{job.position}</h4>
                                <p className="text-sm text-muted-foreground">Engineering Department</p>
                              </div>
                              <Badge
                                variant="secondary"
                                className={job.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                              >
                                {job.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center">
                                <p className="text-lg font-semibold">{job.applications}</p>
                                <p className="text-xs text-muted-foreground">Applications</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-semibold">{job.interviews}</p>
                                <p className="text-xs text-muted-foreground">Interviews</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-semibold">{job.offers}</p>
                                <p className="text-xs text-muted-foreground">Offers</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example - HR Dashboard">
                    <CodeBlock
                      code={`import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Users, UserCheck, Clock, TrendingUp } from 'lucide-react';

// HR Statistics Cards
<div className="grid md:grid-cols-4 gap-4">
  <Card className="p-4 text-center">
    <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
    <p className="text-2xl font-bold">247</p>
    <p className="text-sm text-muted-foreground">Total Employees</p>
  </Card>
  <Card className="p-4 text-center">
    <UserCheck className="h-8 w-8 mx-auto mb-2 text-green-600" />
    <p className="text-2xl font-bold">12</p>
    <p className="text-sm text-muted-foreground">New Hires</p>
  </Card>
  {/* More stat cards */}
</div>

// Performance Review List
<div className="space-y-4">
  {reviews.map((review) => (
    <div key={review.id} className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{review.initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{review.employee}</p>
          <p className="text-sm text-muted-foreground">Manager: {review.manager}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm">Due: {review.dueDate}</p>
          {review.score && <p className="text-sm font-medium">Score: {review.score}/5</p>}
        </div>
        <Badge variant={review.status === 'Complete' ? 'default' : 'secondary'}>
          {review.status}
        </Badge>
      </div>
    </div>
  ))}
</div>`}
                      language="tsx"
                      id="hr-examples"
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
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Guidelines for effective data display and user experience in HR applications.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Data Organization">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Prioritize key metrics</span>
                            <p className="text-sm text-gray-600">Display the most important information first and use hierarchy to guide attention.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Group related data</span>
                            <p className="text-sm text-gray-600">Use cards, sections, and whitespace to create logical groupings of information.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Enable sorting and filtering</span>
                            <p className="text-sm text-gray-600">Allow users to customize views and find specific information quickly.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Show loading states</span>
                            <p className="text-sm text-gray-600">Use skeleton screens during data fetching to maintain perceived performance.</p>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Visual Design">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Use consistent status indicators</span>
                            <p className="text-sm text-gray-600">Establish color conventions for different states and stick to them throughout the application.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Optimize for scanning</span>
                            <p className="text-sm text-gray-600">Use typography hierarchy, alignment, and spacing to make data easy to scan.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Progressive disclosure</span>
                            <p className="text-sm text-gray-600">Show summary information first, then allow users to drill down for details.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Mobile responsiveness</span>
                            <p className="text-sm text-gray-600">Ensure data remains accessible and readable on smaller screens.</p>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Data Display Patterns">
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                          <h4 className="font-medium text-blue-900 mb-2">Tables</h4>
                          <ul className="list-disc pl-4 text-sm text-blue-800 space-y-1">
                            <li>Use for comparing data across multiple dimensions</li>
                            <li>Include search and filter capabilities</li>
                            <li>Enable column sorting for large datasets</li>
                            <li>Show row hover states for better tracking</li>
                          </ul>
                        </div>
                        
                        <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                          <h4 className="font-medium text-green-900 mb-2">Cards</h4>
                          <ul className="list-disc pl-4 text-sm text-green-800 space-y-1">
                            <li>Perfect for employee profiles and summaries</li>
                            <li>Group related information together</li>
                            <li>Include primary actions directly on cards</li>
                            <li>Use consistent card layouts for scanning</li>
                          </ul>
                        </div>
                        
                        <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                          <h4 className="font-medium text-purple-900 mb-2">Progress Indicators</h4>
                          <ul className="list-disc pl-4 text-sm text-purple-800 space-y-1">
                            <li>Show completion status and goals clearly</li>
                            <li>Include both visual and numerical indicators</li>
                            <li>Use color coding for different performance levels</li>
                            <li>Provide context about what the progress represents</li>
                          </ul>
                        </div>
                        
                        <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                          <h4 className="font-medium text-orange-900 mb-2">Status & Badges</h4>
                          <ul className="list-disc pl-4 text-sm text-orange-800 space-y-1">
                            <li>Use consistent colors for status meanings</li>
                            <li>Keep badge text concise and clear</li>
                            <li>Position badges for maximum visibility</li>
                            <li>Include tooltips for status definitions</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Implementation */}
              <section id="implementation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Implementation Guide</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Technical implementation details and patterns for data display components.</p>
                  </div>

                  <PreviewCard title="Responsive Data Tables">
                    <CodeBlock
                      code={`import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { useState, useMemo } from 'react';

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  performance: number;
  status: 'Active' | 'On Leave' | 'Inactive';
}

const EmployeeTable = ({ data }: { data: Employee[] }) => {
  const [sortField, setSortField] = useState<keyof Employee>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState('');

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(employee =>
      employee.name.toLowerCase().includes(filter.toLowerCase()) ||
      employee.role.toLowerCase().includes(filter.toLowerCase()) ||
      employee.department.toLowerCase().includes(filter.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }, [data, sortField, sortDirection, filter]);

  const handleSort = (field: keyof Employee) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search employees..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-sm"
      />
      
      {/* Mobile Card View */}
      <div className="md:hidden space-y-2">
        {filteredAndSortedData.map((employee) => (
          <Card key={employee.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{employee.name}</h3>
              <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>
                {employee.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{employee.role}</p>
            <p className="text-sm text-muted-foreground">{employee.department}</p>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={employee.performance} className="flex-1" />
              <span className="text-sm">{employee.performance}%</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted"
                onClick={() => handleSort('name')}
              >
                Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted"
                onClick={() => handleSort('role')}
              >
                Role {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              {/* More sortable headers */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.role}</TableCell>
                {/* More cells */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};`}
                      language="tsx"
                      id="responsive-tables"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>

                  <PreviewCard title="Data Loading States">
                    <CodeBlock
                      code={`import { Skeleton } from './components/ui/skeleton';
import { useState, useEffect } from 'react';

const useDataFetching = <T,>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await fetchFn();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, loading, error };
};

// Component with loading states
const EmployeeDashboard = () => {
  const { data: employees, loading, error } = useDataFetching(
    () => fetch('/api/employees').then(res => res.json())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        {/* Cards skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-2 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actual content */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employee Directory</h1>
        <Button>Add Employee</Button>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees?.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
    </div>
  );
};`}
                      language="tsx"
                      id="data-loading"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>

                  <PreviewCard title="Performance Optimization">
                    <CodeBlock
                      code={`import { memo, useMemo, useCallback, useState } from 'react';
import { FixedSizeList as List } from 'react-window';

// Memoized table row for performance
const EmployeeRow = memo(({ employee, onSelect }: {
  employee: Employee;
  onSelect: (id: string) => void;
}) => {
  const handleClick = useCallback(() => {
    onSelect(employee.id);
  }, [employee.id, onSelect]);

  return (
    <TableRow onClick={handleClick} className="cursor-pointer hover:bg-muted">
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{employee.initials}</AvatarFallback>
          </Avatar>
          {employee.name}
        </div>
      </TableCell>
      <TableCell>{employee.role}</TableCell>
      <TableCell>{employee.department}</TableCell>
      <TableCell>
        <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>
          {employee.status}
        </Badge>
      </TableCell>
    </TableRow>
  );
});

// Virtualized list for large datasets
const VirtualizedEmployeeList = ({ employees }: { employees: Employee[] }) => {
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());

  const handleEmployeeSelect = useCallback((employeeId: string) => {
    setSelectedEmployees(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  }, []);

  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const employee = employees[index];
    return (
      <div style={style} className="border-b border-border">
        <EmployeeRow
          employee={employee}
          onSelect={handleEmployeeSelect}
        />
      </div>
    );
  }, [employees, handleEmployeeSelect]);

  return (
    <div className="h-96 w-full">
      <List
        height={384}
        itemCount={employees.length}
        itemSize={60}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
};

// Optimized filtering and sorting
const useOptimizedEmployeeData = (employees: Employee[]) => {
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    status: ''
  });
  
  const [sort, setSort] = useState({
    field: 'name' as keyof Employee,
    direction: 'asc' as 'asc' | 'desc'
  });

  const filteredAndSortedEmployees = useMemo(() => {
    let result = [...employees];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(emp => 
        emp.name.toLowerCase().includes(searchLower) ||
        emp.role.toLowerCase().includes(searchLower)
      );
    }

    if (filters.department) {
      result = result.filter(emp => emp.department === filters.department);
    }

    if (filters.status) {
      result = result.filter(emp => emp.status === filters.status);
    }

    // Apply sorting
    result.sort((a, b) => {
      const aVal = a[sort.field];
      const bVal = b[sort.field];
      
      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      else if (aVal > bVal) comparison = 1;
      
      return sort.direction === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [employees, filters, sort]);

  return {
    employees: filteredAndSortedEmployees,
    filters,
    setFilters,
    sort,
    setSort
  };
};`}
                      language="tsx"
                      id="performance-optimization"
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