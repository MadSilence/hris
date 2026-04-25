import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Users, FileText, Shield, Heart, DollarSign, Clock, BookOpen, CheckCircle, AlertCircle, HelpCircle, Calendar, Building2, Award, Briefcase, GraduationCap, Coffee, Plane, Settings, User, Mail, Phone, MapPin, Target, TrendingUp, Search, ChevronRight, Menu, Layers, Zap, Star, Mouse, Square, AlignLeft, CheckSquare, Layout, Grid3X3, List, PieChart, Hash, AlertTriangle, Upload, Gauge, ArrowUpDown, Palette as PaletteIcon, Command, Edit, Activity, Package, ArrowRight, Navigation, PanelLeftOpen, Megaphone, Timer, XCircle, Info, Code2, Eye, Paintbrush, Type, Home, ChevronDown, MoreHorizontal, Bell, Plus, Filter, Download, ChevronLeft, Database, Monitor, UserPlus, FileBarChart, Clipboard, MessageSquare, UserCheck, RefreshCw, Smartphone } from 'lucide-react';
import { DesactLogo } from './shared/DesactLogo';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from './ui/navigation-menu';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { categoryIcons, componentIcons } from './constants/iconMappings';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';

interface NavigationPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const NavigationPage: React.FC<NavigationPageProps> = ({ 
  onBack, 
  components, 
  onComponentClick, 
  currentComponent 
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

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
      const sections = ['overview', 'main-navigation', 'breadcrumb-navigation', 'tab-navigation', 'sidebar-navigation', 'mobile-navigation', 'pagination'];
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
    { id: 'overview', label: 'Overview', icon: Navigation },
    { id: 'main-navigation', label: 'Main Navigation', icon: Menu },
    { id: 'breadcrumb-navigation', label: 'Breadcrumbs', icon: ArrowRight },
    { id: 'tab-navigation', label: 'Tab Navigation', icon: Layers },
    { id: 'sidebar-navigation', label: 'Sidebar Navigation', icon: PanelLeftOpen },
    { id: 'mobile-navigation', label: 'Mobile Navigation', icon: Smartphone },
    { id: 'pagination', label: 'Pagination', icon: ArrowUpDown },
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
              const IconComponent = categoryIcons[category] || Layers;
              
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
                        const ComponentIcon = componentIcons[component.name] || Package;
                        
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
                  <h1 className="text-xl font-semibold">Navigation</h1>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                    Components
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Comprehensive navigation patterns for HR applications
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
                      Navigation Components Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Our navigation system provides comprehensive patterns for HR applications, from main navigation 
                      menus to breadcrumbs, tabs, and mobile-responsive designs. Each pattern is designed for clarity 
                      and consistency across all HR workflows.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Navigation className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Multiple Patterns</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Header navigation, breadcrumbs, tabs, sidebar navigation, and mobile patterns for all use cases.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Smartphone className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Mobile Ready</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Responsive designs that work seamlessly across desktop, tablet, and mobile devices.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-2">HR Focused</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>All examples tailored specifically for HR workflows, employee management, and recruitment processes.</p>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Navigation Hierarchy Guide">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Navigation className="w-5 h-5 text-brown-600" />
                        <span className="text-sm font-medium">Main Navigation</span>
                        <span className="text-sm text-gray-600">→ Primary app navigation with dropdown menus</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <ArrowRight className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium">Breadcrumbs</span>
                        <span className="text-sm text-gray-600">→ Show current location in hierarchy</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Layers className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium">Tabs</span>
                        <span className="text-sm text-gray-600">→ Organize content within a single page</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <PanelLeftOpen className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium">Sidebar</span>
                        <span className="text-sm text-gray-600">→ Persistent navigation for complex applications</span>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Main Navigation */}
              <section id="main-navigation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Main Navigation</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Primary navigation menus for HR applications with dropdown functionality</p>
                  </div>

                  <PreviewCard title="HR Application Header Navigation">
                    <div className="border border-brown-200 rounded-lg bg-white">
                      <div className="flex h-16 items-center px-6">
                        <div className="flex items-center space-x-4">
                          <DesactLogo animated={false} className="h-5 w-auto" />
                        </div>
                        
                        <NavigationMenu className="ml-8">
                          <NavigationMenuList>
                            <NavigationMenuItem>
                              <NavigationMenuTrigger className="text-sm gap-2">
                                <Users className="w-4 h-4" />
                                Employees
                              </NavigationMenuTrigger>
                              <NavigationMenuContent>
                                <div className="grid gap-2 p-2 w-80">
                                  <NavigationMenuLink href="#" className="block p-2 rounded-xl hover:bg-brown-50 no-underline">
                                    <div className="flex items-center gap-2 font-medium">
                                      <Users className="w-4 h-4 text-brown-600" />
                                      Employee Directory
                                    </div>
                                    <p className="text-sm text-gray-600">View and manage all employees</p>
                                  </NavigationMenuLink>
                                  <NavigationMenuLink href="#" className="block p-2 rounded-xl hover:bg-brown-50 no-underline">
                                    <div className="flex items-center gap-2 font-medium">
                                      <UserPlus className="w-4 h-4 text-brown-600" />
                                      Onboarding
                                    </div>
                                    <p className="text-sm text-gray-600">New hire processes and tasks</p>
                                  </NavigationMenuLink>
                                </div>
                              </NavigationMenuContent>
                            </NavigationMenuItem>
                            
                            <NavigationMenuItem>
                              <NavigationMenuTrigger className="text-sm gap-2">
                                <Briefcase className="w-4 h-4" />
                                Recruitment
                              </NavigationMenuTrigger>
                              <NavigationMenuContent>
                                <div className="grid gap-2 p-2 w-80">
                                  <NavigationMenuLink href="#" className="block p-2 rounded-xl hover:bg-brown-50 no-underline">
                                    <div className="flex items-center gap-2 font-medium">
                                      <Briefcase className="w-4 h-4 text-brown-600" />
                                      Job Postings
                                    </div>
                                    <p className="text-sm text-gray-600">Manage open positions</p>
                                  </NavigationMenuLink>
                                  <NavigationMenuLink href="#" className="block p-2 rounded-xl hover:bg-brown-50 no-underline">
                                    <div className="flex items-center gap-2 font-medium">
                                      <Users className="w-4 h-4 text-brown-600" />
                                      Candidates
                                    </div>
                                    <p className="text-sm text-gray-600">Review and track applicants</p>
                                  </NavigationMenuLink>
                                </div>
                              </NavigationMenuContent>
                            </NavigationMenuItem>
                          </NavigationMenuList>
                        </NavigationMenu>
                        
                        <div className="ml-auto flex items-center space-x-4">
                          <Button variant="ghost" size="sm">
                            <Bell className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>JS</AvatarFallback>
                                </Avatar>
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>John Smith</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Profile</DropdownMenuItem>
                              <DropdownMenuItem>Settings</DropdownMenuItem>
                              <DropdownMenuItem>Sign out</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from './ui/navigation-menu';

<div className="bg-white">
  <div className="flex h-16 items-center px-6">
    <div className="flex items-center space-x-4">
      <img src={logo} alt="HR Portal" className="h-5 w-auto" />
    </div>
    
    <NavigationMenu className="ml-8">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-sm gap-2">
            <Users className="w-4 h-4" />
            Employees
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-2 p-2 w-80">
              <NavigationMenuLink href="/employees" className="block p-2 rounded-xl hover:bg-brown-50 no-underline">
                <div className="flex items-center gap-2 font-medium">
                  <Users className="w-4 h-4 text-brown-600" />
                  Employee Directory
                </div>
                <p className="text-sm text-gray-600">View and manage all employees</p>
              </NavigationMenuLink>
              <NavigationMenuLink href="/onboarding" className="block p-2 rounded-xl hover:bg-brown-50 no-underline">
                <div className="flex items-center gap-2 font-medium">
                  <UserPlus className="w-4 h-4 text-brown-600" />
                  Onboarding
                </div>
                <p className="text-sm text-gray-600">New hire processes and tasks</p>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  </div>
</div>`}
                      language="tsx"
                      id="main-navigation"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Continue with other sections... */}
              <section id="breadcrumb-navigation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Breadcrumb Navigation</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Hierarchical navigation for HR workflows</p>
                  </div>

                  <PreviewCard title="HR Workflow Breadcrumbs">
                    <div className="space-y-6">
                      <div className="p-4 bg-brown-50 rounded-lg">
                        <Breadcrumb>
                          <BreadcrumbList>
                            <BreadcrumbItem>
                              <BreadcrumbLink href="#" className="flex items-center no-underline">
                                <Home className="w-4 h-4 mr-1" />
                                Dashboard
                              </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              <BreadcrumbLink href="#" className="no-underline">Employees</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              <BreadcrumbLink href="#" className="no-underline">John Smith</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              <BreadcrumbPage>Performance Review</BreadcrumbPage>
                            </BreadcrumbItem>
                          </BreadcrumbList>
                        </Breadcrumb>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb';

<div className="p-4 bg-brown-50 rounded-lg">
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/dashboard" className="flex items-center">
          <Home className="w-4 h-4 mr-1" />
          Dashboard
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink href="/employees">Employees</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>Performance Review</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
</div>`}
                      language="tsx"
                      id="breadcrumb-navigation"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Tab Navigation */}
              <section id="tab-navigation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Tab Navigation</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Organize HR information with tabbed interfaces</p>
                  </div>

                  <PreviewCard title="Employee Profile Tabs">
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid grid-cols-5 w-full bg-brown-50">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Overview
                        </TabsTrigger>
                        <TabsTrigger value="performance" className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Performance
                        </TabsTrigger>
                        <TabsTrigger value="benefits" className="flex items-center gap-2">
                          <Heart className="w-4 h-4" />
                          Benefits
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Documents
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          History
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="overview" className="mt-6">
                        <div className="grid grid-cols-2 gap-6">
                          <Card className="p-4">
                            <h3 className="font-medium mb-3">Personal Information</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Employee ID:</span>
                                <span>EMP-2024-001</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Department:</span>
                                <span>Engineering</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Position:</span>
                                <span>Senior Developer</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Start Date:</span>
                                <span>Jan 15, 2024</span>
                              </div>
                            </div>
                          </Card>
                          
                          <Card className="p-4">
                            <h3 className="font-medium mb-3">Contact Information</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span>john.smith@company.com</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <span>(555) 123-4567</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span>New York, NY</span>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="performance" className="mt-6">
                        <Card className="p-4">
                          <h3 className="font-medium mb-4">Performance Metrics</h3>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">4.2</div>
                              <div className="text-sm text-gray-600">Overall Rating</div>
                            </div>
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-2xl font-bold text-blue-600">95%</div>
                              <div className="text-sm text-gray-600">Goal Achievement</div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <div className="text-2xl font-bold text-purple-600">12</div>
                              <div className="text-sm text-gray-600">Completed Projects</div>
                            </div>
                          </div>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

<Tabs defaultValue="overview" className="w-full">
  <TabsList className="grid grid-cols-5 w-full bg-brown-50">
    <TabsTrigger value="overview" className="flex items-center gap-2">
      <User className="w-4 h-4" />
      Overview
    </TabsTrigger>
    <TabsTrigger value="performance" className="flex items-center gap-2">
      <TrendingUp className="w-4 h-4" />
      Performance
    </TabsTrigger>
    <TabsTrigger value="benefits" className="flex items-center gap-2">
      <Heart className="w-4 h-4" />
      Benefits
    </TabsTrigger>
  </TabsList>
  
  <TabsContent value="overview" className="mt-6">
    <div className="grid grid-cols-2 gap-6">
      <Card className="p-4">
        <h3 className="font-medium mb-3">Personal Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Employee ID:</span>
            <span>EMP-2024-001</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Department:</span>
            <span>Engineering</span>
          </div>
        </div>
      </Card>
    </div>
  </TabsContent>
</Tabs>`}
                      language="tsx"
                      id="tab-navigation"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Sidebar Navigation */}
              <section id="sidebar-navigation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Sidebar Navigation</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Persistent side navigation for HR dashboards</p>
                  </div>

                  <PreviewCard title="HR Dashboard Sidebar">
                    <div className="border border-brown-200 rounded-lg bg-gray-50 h-96">
                      <div className="flex h-full">
                        <aside className="w-64 bg-white border-r border-brown-200 overflow-y-auto">
                          <div className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-brown-600 rounded-lg flex items-center justify-center">
                                <Users className="w-4 h-4 text-white" />
                              </div>
                              <span className="font-semibold">HR Dashboard</span>
                            </div>
                          </div>
                          
                          <nav className="px-4 pb-4">
                            <div className="space-y-4">
                              <div>
                                <h3 className="px-2 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                  Overview
                                </h3>
                                <div className="space-y-1">
                                  <a href="#" className="flex items-center px-2 py-2 text-sm rounded-lg bg-brown-100 text-brown-700 no-underline">
                                    <Home className="w-4 h-4 mr-3" />
                                    Dashboard
                                  </a>
                                  <a href="#" className="flex items-center px-2 py-2 text-sm text-gray-700 rounded-lg hover:bg-brown-50 no-underline">
                                    <FileBarChart className="w-4 h-4 mr-3" />
                                    Analytics
                                  </a>
                                </div>
                              </div>
                              
                              <div>
                                <h3 className="px-2 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                  Employee Management
                                </h3>
                                <div className="space-y-1">
                                  <a href="#" className="flex items-center px-2 py-2 text-sm text-gray-700 rounded-lg hover:bg-brown-50 no-underline">
                                    <Users className="w-4 h-4 mr-3" />
                                    All Employees
                                    <Badge className="ml-auto bg-brown-100 text-brown-700 text-xs">248</Badge>
                                  </a>
                                  <a href="#" className="flex items-center px-2 py-2 text-sm text-gray-700 rounded-lg hover:bg-brown-50 no-underline">
                                    <UserPlus className="w-4 h-4 mr-3" />
                                    Onboarding
                                    <Badge className="ml-auto bg-blue-100 text-blue-700 text-xs">12</Badge>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </nav>
                        </aside>
                        
                        <main className="flex-1 p-6">
                          <h1 className="text-xl font-bold mb-2">Dashboard</h1>
                          <p className="text-gray-600">Welcome to your HR dashboard.</p>
                        </main>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`<div className="flex h-screen bg-gray-50">
  <aside className="w-64 bg-white border-r border-brown-200 overflow-y-auto">
    <div className="p-6">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-brown-600 rounded-lg flex items-center justify-center">
          <Users className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold">HR Dashboard</span>
      </div>
    </div>
    
    <nav className="px-4 pb-4">
      <div className="space-y-6">
        <div>
          <h3 className="px-2 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Overview
          </h3>
          <div className="space-y-1">
            <a href="#" className="flex items-center px-2 py-2 text-sm rounded-lg bg-brown-100 text-brown-700">
              <Home className="w-4 h-4 mr-3" />
              Dashboard
            </a>
            <a href="#" className="flex items-center px-2 py-2 text-sm text-gray-700 rounded-lg hover:bg-brown-50">
              <Users className="w-4 h-4 mr-3" />
              All Employees
              <Badge className="ml-auto bg-brown-100 text-brown-700 text-xs">248</Badge>
            </a>
          </div>
        </div>
      </div>
    </nav>
  </aside>
  
  <main className="flex-1 overflow-y-auto">
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600">Welcome to your HR dashboard.</p>
    </div>
  </main>
</div>`}
                      language="tsx"
                      id="sidebar-navigation"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Mobile Navigation */}
              <section id="mobile-navigation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Mobile Navigation</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Responsive navigation patterns for mobile HR apps</p>
                  </div>

                  <PreviewCard title="Mobile HR App Navigation">
                    <div className="space-y-6">
                      {/* Mobile Device Mock */}
                      <div className="max-w-sm mx-auto">
                        <div className="border border-brown-200 rounded-2xl bg-white overflow-hidden">
                          {/* Mobile Header */}
                          <div className="flex items-center justify-between p-4 border-b border-brown-200 bg-white">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                              className="hover:bg-brown-50 transition-all duration-200 hover:scale-110"
                            >
                              <Menu 
                                className="w-5 h-5 transition-all duration-300 ease-in-out transform"
                                style={{
                                  transform: mobileMenuOpen ? 'rotate(90deg) scale(1.1)' : 'rotate(0deg) scale(1)',
                                  color: mobileMenuOpen ? '#8B4513' : 'currentColor'
                                }}
                              />
                            </Button>
                            
                            <div className="flex items-center">
                              <DesactLogo animated={false} className="h-6 w-auto" />
                            </div>
                            
                            <Button variant="ghost" size="sm" className="hover:bg-brown-50 transition-all duration-200 hover:scale-110">
                              <Bell className="w-5 h-5 transition-all duration-200 hover:rotate-12" />
                            </Button>
                          </div>

                          {/* Mobile Side Menu (with working animation) */}
                          <div 
                            className="bg-white border-b border-brown-200 overflow-hidden transition-all duration-300 ease-out"
                            style={{
                              height: mobileMenuOpen ? '192px' : '0px',
                              opacity: mobileMenuOpen ? 1 : 0,
                              transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(-10px)'
                            }}
                          >
                            <div className="px-4 py-3 space-y-3">
                              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-brown-50 transition-all duration-200 cursor-pointer hover:scale-105 transform">
                                <Users className="w-5 h-5 text-brown-600" />
                                <span className="text-sm font-medium">Employees</span>
                              </div>
                              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-brown-50 transition-all duration-200 cursor-pointer hover:scale-105 transform">
                                <Briefcase className="w-5 h-5 text-brown-600" />
                                <span className="text-sm font-medium">Recruitment</span>
                              </div>
                              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-brown-50 transition-all duration-200 cursor-pointer hover:scale-105 transform">
                                <FileBarChart className="w-5 h-5 text-brown-600" />
                                <span className="text-sm font-medium">Analytics</span>
                              </div>
                              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-brown-50 transition-all duration-200 cursor-pointer hover:scale-105 transform">
                                <Settings className="w-5 h-5 text-brown-600" />
                                <span className="text-sm font-medium">Settings</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Content Area */}
                          <div className="p-4 h-32 bg-brown-50/30">
                            <h3 className="font-medium mb-2">Dashboard</h3>
                            <p className="text-sm text-gray-600">Welcome back! Here's your overview.</p>
                          </div>
                          
                          {/* Mobile Bottom Navigation */}
                          <div className="border-t border-brown-200 bg-white">
                            <div className="grid grid-cols-5 gap-1">
                              <button 
                                onClick={() => setActiveTab('home')}
                                className={`flex flex-col items-center py-3 px-1 transition-all duration-300 ease-in-out transform hover:scale-105 ${
                                  activeTab === 'home' 
                                    ? 'text-brown-600 bg-brown-50 scale-105' 
                                    : 'text-gray-500 hover:text-brown-500 hover:bg-brown-100'
                                }`}
                              >
                                <Home className={`w-4 h-4 mb-1 transition-all duration-200 ${
                                  activeTab === 'home' ? 'scale-110' : ''
                                }`} />
                                <span className="text-xs">Home</span>
                              </button>
                              
                              <button 
                                onClick={() => setActiveTab('team')}
                                className={`flex flex-col items-center py-3 px-1 transition-all duration-300 ease-in-out transform hover:scale-105 ${
                                  activeTab === 'team' 
                                    ? 'text-brown-600 bg-brown-50 scale-105' 
                                    : 'text-gray-500 hover:text-brown-500 hover:bg-brown-100'
                                }`}
                              >
                                <Users className={`w-4 h-4 mb-1 transition-all duration-200 ${
                                  activeTab === 'team' ? 'scale-110' : ''
                                }`} />
                                <span className="text-xs">Team</span>
                              </button>
                              
                              <button 
                                onClick={() => setActiveTab('add')}
                                className={`flex flex-col items-center py-3 px-1 transition-all duration-300 ease-in-out transform hover:scale-105 relative ${
                                  activeTab === 'add' 
                                    ? 'text-brown-600 bg-brown-50 scale-105' 
                                    : 'text-gray-500 hover:text-brown-500 hover:bg-brown-100'
                                }`}
                              >
                                <Plus className={`w-4 h-4 mb-1 transition-all duration-200 ${
                                  activeTab === 'add' ? 'scale-110 rotate-90' : ''
                                }`} />
                                <span className="text-xs">Add</span>
                              </button>
                              
                              <button 
                                onClick={() => setActiveTab('calendar')}
                                className={`flex flex-col items-center py-3 px-1 transition-all duration-300 ease-in-out transform hover:scale-105 relative ${
                                  activeTab === 'calendar' 
                                    ? 'text-brown-600 bg-brown-50 scale-105' 
                                    : 'text-gray-500 hover:text-brown-500 hover:bg-brown-100'
                                }`}
                              >
                                <Calendar className={`w-4 h-4 mb-1 transition-all duration-200 ${
                                  activeTab === 'calendar' ? 'scale-110' : ''
                                }`} />
                                <span className="text-xs">Calendar</span>
                                <div className={`absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full transition-all duration-200 ${
                                  activeTab === 'calendar' ? 'animate-pulse' : ''
                                }`}></div>
                              </button>
                              
                              <button 
                                onClick={() => setActiveTab('profile')}
                                className={`flex flex-col items-center py-3 px-1 transition-all duration-300 ease-in-out transform hover:scale-105 ${
                                  activeTab === 'profile' 
                                    ? 'text-brown-600 bg-brown-50 scale-105' 
                                    : 'text-gray-500 hover:text-brown-500 hover:bg-brown-100'
                                }`}
                              >
                                <User className={`w-4 h-4 mb-1 transition-all duration-200 ${
                                  activeTab === 'profile' ? 'scale-110' : ''
                                }`} />
                                <span className="text-xs">Profile</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Toggle Button */}
                        <div className="mt-4 text-center">
                          <Button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            {mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [activeTab, setActiveTab] = useState('home');

{/* Mobile Header with Working Animations */}
<div className="lg:hidden border-b border-brown-200 bg-white">
  <div className="flex items-center justify-between p-4">
    <Button 
      variant="ghost" 
      size="sm"
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      className="hover:bg-brown-50 transition-all duration-200 hover:scale-110"
    >
      <Menu 
        className="w-5 h-5 transition-all duration-300 ease-in-out transform"
        style={{
          transform: mobileMenuOpen ? 'rotate(90deg) scale(1.1)' : 'rotate(0deg) scale(1)',
          color: mobileMenuOpen ? '#8B4513' : 'currentColor'
        }}
      />
    </Button>
    
    <div className="flex items-center">
      <img src={logo} alt="HR" className="h-6 w-auto" />
    </div>
    
    <Button variant="ghost" size="sm" className="hover:bg-brown-50 transition-all duration-200 hover:scale-110">
      <Bell className="w-5 h-5 transition-all duration-200 hover:rotate-12" />
    </Button>
  </div>

  {/* Smooth Slide-Down Menu with Inline Styles */}
  <div 
    className="bg-white border-b border-brown-200 overflow-hidden transition-all duration-300 ease-out"
    style={{
      height: mobileMenuOpen ? '192px' : '0px',
      opacity: mobileMenuOpen ? 1 : 0,
      transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(-10px)'
    }}
  >
    <div className="px-4 py-3 space-y-3">
      <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-brown-50 transition-all duration-200 cursor-pointer hover:scale-105 transform">
        <Users className="w-5 h-5 text-brown-600" />
        <span className="text-sm font-medium">Employees</span>
      </div>
      <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-brown-50 transition-all duration-200 cursor-pointer hover:scale-105 transform">
        <Briefcase className="w-5 h-5 text-brown-600" />
        <span className="text-sm font-medium">Recruitment</span>
      </div>
    </div>
  </div>
</div>

{/* Interactive Bottom Navigation with Enhanced Animations */}
<div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brown-200">
  <div className="grid grid-cols-5 gap-1">
    <button 
      onClick={() => setActiveTab('home')}
      className={\`flex flex-col items-center py-3 px-1 transition-all duration-300 ease-in-out transform hover:scale-105 \${
        activeTab === 'home' 
          ? 'text-brown-600 bg-brown-50 scale-105' 
          : 'text-gray-500 hover:text-brown-500 hover:bg-brown-100'
      }\`}
    >
      <Home className={\`w-4 h-4 mb-1 transition-all duration-200 \${
        activeTab === 'home' ? 'scale-110' : ''
      }\`} />
      <span className="text-xs">Home</span>
    </button>
    
    <button 
      onClick={() => setActiveTab('add')}
      className={\`flex flex-col items-center py-3 px-1 transition-all duration-300 ease-in-out transform hover:scale-105 relative \${
        activeTab === 'add' 
          ? 'text-brown-600 bg-brown-50 scale-105' 
          : 'text-gray-500 hover:text-brown-500 hover:bg-brown-100'
      }\`}
    >
      <Plus className={\`w-4 h-4 mb-1 transition-all duration-200 \${
        activeTab === 'add' ? 'scale-110 rotate-90' : ''
      }\`} />
      <span className="text-xs">Add</span>
    </button>
    
    <button 
      onClick={() => setActiveTab('calendar')}
      className={\`flex flex-col items-center py-3 px-1 transition-all duration-300 ease-in-out transform hover:scale-105 relative \${
        activeTab === 'calendar' 
          ? 'text-brown-600 bg-brown-50 scale-105' 
          : 'text-gray-500 hover:text-brown-500 hover:bg-brown-100'
      }\`}
    >
      <Calendar className={\`w-4 h-4 mb-1 transition-all duration-200 \${
        activeTab === 'calendar' ? 'scale-110' : ''
      }\`} />
      <span className="text-xs">Calendar</span>
      <div className={\`absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full transition-all duration-200 \${
        activeTab === 'calendar' ? 'animate-pulse' : ''
      }\`}></div>
    </button>
  </div>
</div>`}
                      language="tsx"
                      id="mobile-navigation"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Pagination */}
              <section id="pagination" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Pagination</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Navigate through large datasets in HR applications</p>
                  </div>

                  <PreviewCard title="Employee List Pagination">
                    <div className="space-y-6">
                      <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="font-semibold">Employee Directory</h3>
                            <p className="text-sm text-gray-600">Showing 1-10 of 248 employees</p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
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
                        
                        <div className="space-y-3 mb-6">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 border border-brown-200 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback>JS</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">John Smith</div>
                                  <div className="text-sm text-gray-600">Senior Developer • Engineering</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-green-100 text-green-700">Active</Badge>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Rows per page:</span>
                            <select className="border border-brown-200 rounded px-2 py-1 text-sm bg-white">
                              <option>10</option>
                              <option>25</option>
                              <option>50</option>
                            </select>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" disabled>
                              <ChevronLeft className="w-4 h-4" />
                              Previous
                            </Button>
                            
                            <div className="flex items-center space-x-1">
                              <Button variant="default" size="sm" className="w-8 h-8 p-0">1</Button>
                              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">2</Button>
                              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">3</Button>
                              <span className="px-2 text-sm text-gray-500">...</span>
                              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">25</Button>
                            </div>
                            
                            <Button variant="outline" size="sm">
                              Next
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`<div className="flex items-center justify-between mb-6">
  <div>
    <h3 className="font-semibold">Employee Directory</h3>
    <p className="text-sm text-gray-600">Showing 1-10 of 248 employees</p>
  </div>
  
  <div className="flex items-center space-x-2">
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

{/* Pagination Controls */}
<div className="flex items-center justify-between">
  <div className="flex items-center space-x-2">
    <span className="text-sm text-gray-600">Rows per page:</span>
    <select className="border border-brown-200 rounded px-2 py-1 text-sm">
      <option>10</option>
      <option>25</option>
      <option>50</option>
      <option>100</option>
    </select>
  </div>
  
  <div className="flex items-center space-x-2">
    <Button variant="outline" size="sm" disabled>
      <ChevronLeft className="w-4 h-4" />
      Previous
    </Button>
    
    <div className="flex items-center space-x-1">
      <Button variant="default" size="sm" className="w-8 h-8 p-0">1</Button>
      <Button variant="ghost" size="sm" className="w-8 h-8 p-0">2</Button>
      <Button variant="ghost" size="sm" className="w-8 h-8 p-0">3</Button>
      <span className="px-2 text-sm text-gray-500">...</span>
      <Button variant="ghost" size="sm" className="w-8 h-8 p-0">25</Button>
    </div>
    
    <Button variant="outline" size="sm">
      Next
      <ChevronRight className="w-4 h-4" />
    </Button>
  </div>
</div>`}
                      language="tsx"
                      id="pagination"
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