import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Home, ChevronRight, Menu, Search, Layers, Package, Users, Building2, UserCheck, FileText, Settings, Calendar, Briefcase, Award, Shield, Clock, MapPin, Target, TrendingUp, Navigation, ArrowRight, ChevronDown, MoreHorizontal, User, Mail, Phone, Database, Monitor, FileBarChart, Clipboard, MessageSquare, UserPlus, Activity, DollarSign, BookOpen, CheckCircle, AlertCircle, HelpCircle, Coffee, Plane, GraduationCap, Heart, Gift, Workflow, Timer, Info, Code2, Eye, Paintbrush, Type, PanelLeftOpen, Megaphone, XCircle, Command, Edit, PaletteIcon, Hash, AlertTriangle, Upload, Gauge, ArrowUpDown, RefreshCw, Smartphone, Filter, Download, Plus, Bell, LogOut, Grid3X3, List, PieChart } from 'lucide-react';
import { DesactLogo } from './shared/DesactLogo';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
import { categoryIcons, componentIcons } from './constants/iconMappings';

interface BreadcrumbsPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const BreadcrumbsPage: React.FC<BreadcrumbsPageProps> = ({
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
      const sections = ['overview', 'basic-breadcrumbs', 'with-icons', 'dropdown-breadcrumbs', 'hr-workflows', 'accessibility', 'best-practices'];
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
    { id: 'overview', label: 'Overview', icon: ArrowRight },
    { id: 'basic-breadcrumbs', label: 'Basic Breadcrumbs', icon: Home },
    { id: 'with-icons', label: 'With Icons', icon: Navigation },
    { id: 'dropdown-breadcrumbs', label: 'Dropdown Breadcrumbs', icon: ChevronDown },
    { id: 'hr-workflows', label: 'HR Workflows', icon: Users },
    { id: 'accessibility', label: 'Accessibility', icon: Shield },
    { id: 'best-practices', label: 'Best Practices', icon: CheckCircle },
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
              className="transition-transform duration-200 hover:scale-105"
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
              const IconComponent = categoryIcons[category] || componentIcons['Default'];
              
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
                  <h1 className="text-xl font-semibold">Breadcrumbs</h1>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                    Navigation
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Hierarchical navigation breadcrumbs for HR application workflows
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
                      Breadcrumb Navigation
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Breadcrumbs provide users with a way to keep track of their location within an application. 
                      Essential for complex HR workflows where users navigate through multiple levels of hierarchy 
                      such as departments, teams, and individual employee records.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <ArrowRight className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Hierarchical Navigation</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Clear path showing user's location in the application structure and easy way to navigate back.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">HR Workflows</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Optimized for employee management, department navigation, and complex HR process flows.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <Shield className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Accessible</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Built with accessibility in mind, supporting screen readers and keyboard navigation.</p>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="When to Use Breadcrumbs">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Deep Navigation Structures</span>
                          <p className="text-sm text-gray-600">When your application has 3+ levels of hierarchy</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Complex Workflows</span>
                          <p className="text-sm text-gray-600">Multi-step processes like employee onboarding or performance reviews</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Data Drill-Down</span>
                          <p className="text-sm text-gray-600">When users navigate from overview to detailed views</p>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Basic Breadcrumbs */}
              <section id="basic-breadcrumbs" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Basic Breadcrumbs</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Simple breadcrumb navigation for basic hierarchical structures</p>
                  </div>

                  <PreviewCard title="Simple Employee Navigation">
                    <div className="space-y-6">
                      <div className="p-4 bg-brown-50 rounded-lg">
                        <Breadcrumb>
                          <BreadcrumbList>
                            <BreadcrumbItem>
                              <BreadcrumbLink href="#" className="no-underline">Dashboard</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              <BreadcrumbLink href="#" className="no-underline">Employees</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              <BreadcrumbPage>John Smith</BreadcrumbPage>
                            </BreadcrumbItem>
                          </BreadcrumbList>
                        </Breadcrumb>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb';

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/employees">Employees</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>John Smith</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`}
                      language="tsx"
                      id="basic-breadcrumbs"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* With Icons */}
              <section id="with-icons" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Breadcrumbs with Icons</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Enhanced breadcrumbs with icons for better visual recognition</p>
                  </div>

                  <PreviewCard title="HR Workflow with Icons">
                    <div className="space-y-6">
                      <div className="p-4 bg-brown-50 rounded-lg">
                        <Breadcrumb>
                          <BreadcrumbList>
                            <BreadcrumbItem>
                              <BreadcrumbLink href="#" className="flex items-center gap-2 no-underline">
                                <Home className="w-4 h-4" />
                                Dashboard
                              </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              <BreadcrumbLink href="#" className="flex items-center gap-2 no-underline">
                                <Users className="w-4 h-4" />
                                Employees
                              </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              <BreadcrumbPage className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Performance Review
                              </BreadcrumbPage>
                            </BreadcrumbItem>
                          </BreadcrumbList>
                        </Breadcrumb>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Dropdown Breadcrumbs */}
              <section id="dropdown-breadcrumbs" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Dropdown Breadcrumbs</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Breadcrumbs with dropdown menus for complex navigation structures</p>
                  </div>

                  <PreviewCard title="Department Navigation with Dropdown">
                    <div className="space-y-6">
                      <div className="p-4 bg-brown-50 rounded-lg">
                        <Breadcrumb>
                          <BreadcrumbList>
                            <BreadcrumbItem>
                              <BreadcrumbLink href="#" className="flex items-center gap-2 no-underline">
                                <Home className="w-4 h-4" />
                                Dashboard
                              </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-1 hover:bg-brown-100 px-2 py-1 rounded">
                                  <Building2 className="w-4 h-4" />
                                  Departments
                                  <ChevronDown className="w-3 h-3" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem>
                                    <Users className="w-4 h-4 mr-2" />
                                    Human Resources
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Code2 className="w-4 h-4 mr-2" />
                                    Engineering
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              <BreadcrumbPage className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Team Members
                              </BreadcrumbPage>
                            </BreadcrumbItem>
                          </BreadcrumbList>
                        </Breadcrumb>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* HR Workflows */}
              <section id="hr-workflows" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>HR-Specific Workflows</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Real-world breadcrumb examples for common HR processes</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Employee Onboarding">
                      <div className="p-4 bg-brown-50 rounded-lg">
                        <Breadcrumb>
                          <BreadcrumbList>
                            <BreadcrumbItem>
                              <BreadcrumbLink href="#" className="flex items-center gap-2 no-underline">
                                <Home className="w-4 h-4" />
                                HR Dashboard
                              </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              <BreadcrumbPage className="flex items-center gap-2">
                                <UserPlus className="w-4 h-4" />
                                Onboarding
                              </BreadcrumbPage>
                            </BreadcrumbItem>
                          </BreadcrumbList>
                        </Breadcrumb>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Performance Management">
                      <div className="p-4 bg-brown-50 rounded-lg">
                        <Breadcrumb>
                          <BreadcrumbList>
                            <BreadcrumbItem>
                              <BreadcrumbLink href="#" className="flex items-center gap-2 no-underline">
                                <Building2 className="w-4 h-4" />
                                Organization
                              </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              <BreadcrumbPage className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Performance
                              </BreadcrumbPage>
                            </BreadcrumbItem>
                          </BreadcrumbList>
                        </Breadcrumb>
                      </div>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Accessibility */}
              <section id="accessibility" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Accessibility</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Making breadcrumbs accessible to all users</p>
                  </div>

                  <PreviewCard title="Accessibility Features">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">ARIA Navigation Landmark</span>
                          <p className="text-sm text-gray-600">Wrapped in nav with aria-label for screen readers</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Current Page Indication</span>
                          <p className="text-sm text-gray-600">Final breadcrumb uses aria-current attribute</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Keyboard Navigation</span>
                          <p className="text-sm text-gray-600">All links are focusable and operable with keyboard</p>
                        </div>
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
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Guidelines for effective breadcrumb implementation</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Do's">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Use for deep hierarchies</span>
                            <p className="text-sm text-gray-600">3+ levels of navigation depth</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Keep labels concise</span>
                            <p className="text-sm text-gray-600">Use clear, short page titles</p>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Don'ts">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Don't duplicate main nav</span>
                            <p className="text-sm text-gray-600">Avoid showing same info twice</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Don't use for single level</span>
                            <p className="text-sm text-gray-600">Not needed for flat structures</p>
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
    </div>
  );
};