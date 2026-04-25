import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Menu, Layout, Navigation, Settings, Code2, Eye, Mouse, Plus, Download, Bell, Home, Users, Building, Briefcase, Filter, MoreHorizontal, Edit, Mail, Share, CheckCircle, Info, Calendar, Clock, TrendingUp, BarChart3, FileBarChart, UserCheck, Shield, HelpCircle, LogOut, Globe, Bookmark, Heart, MessageSquare, Camera, Printer, Save, Archive, Trash2, AlertTriangle, Gauge } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
import { MainSidebar } from './shared/MainSidebar';

interface PageHeadersPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const PageHeadersPage: React.FC<PageHeadersPageProps> = ({ 
  onBack, 
  components, 
  onComponentClick, 
  currentComponent 
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

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
      const sections = ['overview', 'basic-headers', 'navigation-headers', 'search-headers', 'dashboard-headers', 'breadcrumb-headers', 'action-headers', 'responsive-headers', 'implementation'];
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
    { id: 'overview', label: 'Overview', icon: Mouse },
    { id: 'basic-headers', label: 'Basic Headers', icon: Layout },
    { id: 'navigation-headers', label: 'Navigation Headers', icon: Navigation },
    { id: 'search-headers', label: 'Search Headers', icon: Search },
    { id: 'dashboard-headers', label: 'Dashboard Headers', icon: Gauge },
    { id: 'breadcrumb-headers', label: 'Breadcrumb Headers', icon: ArrowLeft },
    { id: 'action-headers', label: 'Action Headers', icon: Settings },
    { id: 'responsive-headers', label: 'Responsive Headers', icon: Layout },
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
                  <h1 className="text-xl font-semibold">Page Headers</h1>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                    Components
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Header patterns using semantic HTML elements for better accessibility and structure
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
                      Page Headers Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Page headers using semantic HTML elements provide better accessibility, SEO, and structure. 
                      These examples demonstrate proper use of header, nav, main, and other semantic elements.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <Layout className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Semantic Structure</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Using proper HTML5 semantic elements for better accessibility and SEO.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Navigation className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Navigation Patterns</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Different navigation layouts for various application needs.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Eye className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Responsive Design</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Headers that adapt to different screen sizes and devices.</p>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Basic Headers Section */}
              <section id="basic-headers" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Basic Headers
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Simple page headers with proper semantic structure.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Basic Page Header">
                      <div className="border border-brown-200 rounded-lg overflow-hidden">
                        <div className="bg-brown-50 border-b border-brown-200 px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h1 className="text-xl font-semibold text-brown-900">Employee Dashboard</h1>
                              <p className="text-sm text-brown-600 mt-1">Manage your team and track performance</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                              </Button>
                              <Button size="sm" className="bg-brown-600 hover:bg-brown-700 text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Employee
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 bg-white">
                          <p className="text-sm text-brown-600">Main content area...</p>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Header with Badge">
                      <div className="border border-brown-200 rounded-lg overflow-hidden">
                        <div className="bg-brown-50 border-b border-brown-200 px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <h1 className="text-xl font-semibold text-brown-900">Project Alpha</h1>
                              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                                Active
                              </Badge>
                            </div>
                            <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                              <Settings className="h-4 w-4 mr-2" />
                              Settings
                            </Button>
                          </div>
                        </div>
                        <div className="p-6 bg-white">
                          <p className="text-sm text-brown-600">Project details and content...</p>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`<header className="bg-brown-50 border-b border-brown-200 px-6 py-4">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-xl font-semibold text-brown-900">Employee Dashboard</h1>
      <p className="text-sm text-brown-600 mt-1">
        Manage your team and track performance
      </p>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
      <Button size="sm" className="bg-brown-600 hover:bg-brown-700 text-white">
        <Plus className="h-4 w-4 mr-2" />
        Add Employee
      </Button>
    </div>
  </div>
</header>

<main className="p-6 bg-white">
  {/* Main content */}
</main>`}
                      language="tsx"
                      id="basic-headers-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Navigation Headers Section */}
              <section id="navigation-headers" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Navigation Headers
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Headers with integrated navigation using semantic nav elements.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Header with Navigation">
                      <div className="border border-brown-200 rounded-lg overflow-hidden">
                        <div className="bg-brown-50 border-b border-brown-200">
                          <div className="px-6 py-4 border-b border-brown-200">
                            <div className="flex items-center justify-between">
                              <h1 className="text-xl font-semibold text-brown-900">HR Portal</h1>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="px-3 text-brown-600 hover:bg-brown-100">
                                  <Bell className="h-4 w-4" />
                                </Button>
                                <Avatar className="h-8 w-8 bg-brown-200">
                                  <AvatarFallback className="bg-brown-200 text-brown-800">JD</AvatarFallback>
                                </Avatar>
                              </div>
                            </div>
                          </div>
                          <div className="px-6">
                            <div className="flex space-x-8">
                              {[
                                { id: 'dashboard', label: 'Dashboard', icon: Home },
                                { id: 'employees', label: 'Employees', icon: Users },
                                { id: 'departments', label: 'Departments', icon: Building },
                                { id: 'payroll', label: 'Payroll', icon: Briefcase }
                              ].map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => setActiveTab(item.id)}
                                  className={`flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === item.id
                                      ? 'border-brown-600 text-brown-700'
                                      : 'border-transparent text-brown-500 hover:text-brown-700'
                                  }`}
                                >
                                  <item.icon className="h-4 w-4" />
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="p-6 bg-white">
                          <p className="text-sm text-brown-600">
                            Content for {activeTab} section...
                          </p>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Horizontal Navigation">
                      <div className="border border-brown-200 rounded-lg overflow-hidden">
                        <div className="bg-brown-50 border-b border-brown-200 px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <h1 className="text-xl font-semibold text-brown-900">Company Portal</h1>
                              <nav>
                                <ul className="flex items-center gap-6">
                                  <li>
                                    <a href="#" className="text-sm font-medium text-brown-700 hover:text-brown-900">
                                      Home
                                    </a>
                                  </li>
                                  <li>
                                    <a href="#" className="text-sm font-medium text-brown-500 hover:text-brown-700">
                                      About
                                    </a>
                                  </li>
                                  <li>
                                    <a href="#" className="text-sm font-medium text-brown-500 hover:text-brown-700">
                                      Services
                                    </a>
                                  </li>
                                  <li>
                                    <a href="#" className="text-sm font-medium text-brown-500 hover:text-brown-700">
                                      Contact
                                    </a>
                                  </li>
                                </ul>
                              </nav>
                            </div>
                            <Button size="sm" className="bg-brown-600 hover:bg-brown-700 text-white">Get Started</Button>
                          </div>
                        </div>
                        <div className="p-6 bg-white">
                          <p className="text-sm text-brown-600">Page content...</p>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`<header className="bg-brown-50 border-b border-brown-200">
  <div className="px-6 py-4 border-b border-brown-200">
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold text-brown-900">HR Portal</h1>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="px-3 text-brown-600 hover:bg-brown-100">
          <Bell className="h-4 w-4" />
        </Button>
        <Avatar className="h-8 w-8 bg-brown-200">
          <AvatarFallback className="bg-brown-200 text-brown-800">JD</AvatarFallback>
        </Avatar>
      </div>
    </div>
  </div>
  <nav className="px-6">
    <div className="flex space-x-8">
      <button className="flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 border-brown-600 text-brown-700">
        <Home className="h-4 w-4" />
        Dashboard
      </button>
      <button className="flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 border-transparent text-brown-500 hover:text-brown-700">
        <Users className="h-4 w-4" />
        Employees
      </button>
    </div>
  </nav>
</header>

<main className="p-6 bg-white">
  {/* Main content */}
</main>`}
                      language="tsx"
                      id="navigation-headers-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Search Headers Section */}
              <section id="search-headers" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Search Headers
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Headers with integrated search functionality.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Header with Search">
                      <div className="border border-brown-200 rounded-lg overflow-hidden">
                        <div className="bg-brown-50 border-b border-brown-200 px-6 py-4">
                          <div className="flex items-center justify-between">
                            <h1 className="text-xl font-semibold text-brown-900">Employee Directory</h1>
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 w-4 h-4" />
                                <Input
                                  type="text"
                                  placeholder="Search employees..."
                                  className="pl-10 pr-4 w-64 border-brown-300 bg-white focus:border-brown-500"
                                  value={searchValue}
                                  onChange={(e) => setSearchValue(e.target.value)}
                                />
                              </div>
                              <Button size="sm" className="bg-brown-600 hover:bg-brown-700 text-white">
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 bg-white">
                          <p className="text-sm text-brown-600">
                            {searchValue ? `Searching for: "${searchValue}"` : 'Enter search terms above...'}
                          </p>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Full Width Search">
                      <div className="border border-brown-200 rounded-lg overflow-hidden">
                        <div className="bg-brown-50 border-b border-brown-200 px-6 py-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h1 className="text-xl font-semibold text-brown-900">Knowledge Base</h1>
                              <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                <HelpCircle className="h-4 w-4 mr-2" />
                                Help
                              </Button>
                            </div>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 w-5 h-5" />
                              <Input
                                type="text"
                                placeholder="Search articles, documents, and resources..."
                                className="pl-12 pr-4 w-full text-lg py-3 border-brown-300 bg-white focus:border-brown-500"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="p-6 bg-white">
                          <p className="text-sm text-brown-600">Search results will appear here...</p>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`<header className="bg-brown-50 border-b border-brown-200 px-6 py-4">
  <div className="flex items-center justify-between">
    <h1 className="text-xl font-semibold text-brown-900">Employee Directory</h1>
    <div className="flex items-center gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search employees..."
          className="pl-10 pr-4 w-64 border-brown-300 bg-white focus:border-brown-500"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>
      <Button size="sm" className="bg-brown-600 hover:bg-brown-700 text-white">
        <Filter className="h-4 w-4 mr-2" />
        Filter
      </Button>
    </div>
  </div>
</header>

<main className="p-6 bg-white">
  {/* Search results */}
</main>`}
                      language="tsx"
                      id="search-headers-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Dashboard Headers Section */}
              <section id="dashboard-headers" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Dashboard Headers
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Headers designed for dashboard and admin interfaces with metrics and controls.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Dashboard Header with Stats">
                      <div className="border border-brown-200 rounded-lg overflow-hidden">
                        <div className="bg-brown-50 border-b border-brown-200 px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h1 className="text-xl font-semibold text-brown-900">Analytics Dashboard</h1>
                              <p className="text-sm text-brown-600 mt-1">
                                Last updated: {new Date().toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-brown-700">1,234</div>
                                <div className="text-xs text-brown-500">Active Users</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-brown-700">$45.2K</div>
                                <div className="text-xs text-brown-500">Revenue</div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Data
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Settings className="h-4 w-4 mr-2" />
                                    Settings
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 bg-white">
                          <p className="text-sm text-brown-600">Dashboard content and charts...</p>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Performance Dashboard Header">
                      <div className="border border-brown-200 rounded-lg overflow-hidden">
                        <div className="bg-brown-50 border-b border-brown-200 px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <h1 className="text-xl font-semibold text-brown-900">Performance Overview</h1>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                                Live
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 text-sm text-brown-600">
                                <Clock className="h-4 w-4" />
                                <span>Last 7 days</span>
                              </div>
                              <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                <Calendar className="h-4 w-4 mr-2" />
                                Date Range
                              </Button>
                              <Button size="sm" className="bg-brown-600 hover:bg-brown-700 text-white">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Export Report
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 bg-white">
                          <div className="grid grid-cols-4 gap-4 mb-4">
                            <div className="text-center p-3 bg-brown-50 rounded-lg border border-brown-200">
                              <div className="text-lg font-bold text-brown-700">98.5%</div>
                              <div className="text-xs text-brown-500">Uptime</div>
                            </div>
                            <div className="text-center p-3 bg-brown-50 rounded-lg border border-brown-200">
                              <div className="text-lg font-bold text-brown-700">2.3s</div>
                              <div className="text-xs text-brown-500">Load Time</div>
                            </div>
                            <div className="text-center p-3 bg-brown-50 rounded-lg border border-brown-200">
                              <div className="text-lg font-bold text-brown-700">8,942</div>
                              <div className="text-xs text-brown-500">Page Views</div>
                            </div>
                            <div className="text-center p-3 bg-brown-50 rounded-lg border border-brown-200">
                              <div className="text-lg font-bold text-brown-700">94.2%</div>
                              <div className="text-xs text-brown-500">Success Rate</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`<header className="bg-brown-50 border-b border-brown-200 px-6 py-4">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-xl font-semibold text-brown-900">Analytics Dashboard</h1>
      <p className="text-sm text-brown-600 mt-1">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </div>
    <div className="flex items-center gap-6">
      <div className="text-center">
        <div className="text-2xl font-bold text-brown-700">1,234</div>
        <div className="text-xs text-brown-500">Active Users</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-brown-700">$45.2K</div>
        <div className="text-xs text-brown-500">Revenue</div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</header>

<main className="p-6 bg-white">
  {/* Dashboard content */}
</main>`}
                      language="tsx"
                      id="dashboard-headers-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Breadcrumb Headers Section */}
              <section id="breadcrumb-headers" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Breadcrumb Headers
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Headers with breadcrumb navigation for deep page hierarchies and employee profiles.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Header with Breadcrumbs">
                      <div className="border border-brown-200 rounded-lg overflow-hidden">
                        <div className="bg-brown-50 border-b border-brown-200 px-6 py-4">
                          <div className="space-y-3">
                            <Breadcrumb>
                              <BreadcrumbList>
                                <BreadcrumbItem>
                                  <BreadcrumbLink href="#" className="flex items-center gap-2 text-brown-600 hover:text-brown-800">
                                    <Home className="h-4 w-4" />
                                    Home
                                  </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="text-brown-400" />
                                <BreadcrumbItem>
                                  <BreadcrumbLink href="#" className="text-brown-600 hover:text-brown-800">Employees</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="text-brown-400" />
                                <BreadcrumbItem>
                                  <BreadcrumbLink href="#" className="text-brown-600 hover:text-brown-800">Engineering</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="text-brown-400" />
                                <BreadcrumbItem>
                                  <BreadcrumbPage className="text-brown-900">John Doe</BreadcrumbPage>
                                </BreadcrumbItem>
                              </BreadcrumbList>
                            </Breadcrumb>
                            <div className="flex items-center justify-between">
                              <div>
                                <h1 className="text-xl font-semibold text-brown-900">John Doe</h1>
                                <p className="text-sm text-brown-600 mt-1">Senior Software Engineer</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                  <Mail className="h-4 w-4 mr-2" />
                                  Message
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 bg-white">
                          <p className="text-sm text-brown-600">Employee profile content...</p>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`<header className="bg-brown-50 border-b border-brown-200 px-6 py-4">
  <div className="space-y-3">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#" className="flex items-center gap-2 text-brown-600 hover:text-brown-800">
            <Home className="h-4 w-4" />
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="text-brown-400" />
        <BreadcrumbItem>
          <BreadcrumbLink href="#" className="text-brown-600 hover:text-brown-800">Employees</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="text-brown-400" />
        <BreadcrumbItem>
          <BreadcrumbPage className="text-brown-900">John Doe</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-brown-900">John Doe</h1>
        <p className="text-sm text-brown-600 mt-1">Senior Software Engineer</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>
    </div>
  </div>
</header>

<main className="p-6 bg-white">
  {/* Page content */}
</main>`}
                      language="tsx"
                      id="breadcrumb-headers-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Action Headers Section */}
              <section id="action-headers" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Action Headers
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Headers with prominent action buttons and workflow controls.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Document Management Header">
                      <div className="border border-brown-200 rounded-lg overflow-hidden">
                        <div className="bg-brown-50 border-b border-brown-200 px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h1 className="text-xl font-semibold text-brown-900">Project Documents</h1>
                              <p className="text-sm text-brown-600 mt-1">24 files • Last updated 2 hours ago</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                <Download className="h-4 w-4 mr-2" />
                                Download All
                              </Button>
                              <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                <Share className="h-4 w-4 mr-2" />
                                Share
                              </Button>
                              <Button size="sm" className="bg-brown-600 hover:bg-brown-700 text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Upload
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 bg-white">
                          <p className="text-sm text-brown-600">Document list and previews...</p>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="HR Management Header">
                      <div className="border border-brown-200 rounded-lg overflow-hidden">
                        <div className="bg-brown-50 border-b border-brown-200 px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <h1 className="text-xl font-semibold text-brown-900">Employee Onboarding</h1>
                              <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                                3 Pending
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                <FileBarChart className="h-4 w-4 mr-2" />
                                Reports
                              </Button>
                              <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                <UserCheck className="h-4 w-4 mr-2" />
                                Review
                              </Button>
                              <Button size="sm" className="bg-brown-600 hover:bg-brown-700 text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                New Hire
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 bg-white">
                          <p className="text-sm text-brown-600">Onboarding workflow and checklist...</p>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`<header className="bg-brown-50 border-b border-brown-200 px-6 py-4">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-xl font-semibold text-brown-900">Project Documents</h1>
      <p className="text-sm text-brown-600 mt-1">
        24 files • Last updated 2 hours ago
      </p>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
        <Download className="h-4 w-4 mr-2" />
        Download All
      </Button>
      <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
        <Share className="h-4 w-4 mr-2" />
        Share
      </Button>
      <Button size="sm" className="bg-brown-600 hover:bg-brown-700 text-white">
        <Plus className="h-4 w-4 mr-2" />
        Upload
      </Button>
    </div>
  </div>
</header>

<main className="p-6 bg-white">
  {/* Content */}
</main>`}
                      language="tsx"
                      id="action-headers-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Responsive Headers Section */}
              <section id="responsive-headers" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Responsive Headers
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Headers that adapt to different screen sizes with proper mobile considerations.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Mobile-First Header">
                      <div className="border border-brown-200 rounded-lg overflow-hidden">
                        <div className="bg-brown-50 border-b border-brown-200 px-4 sm:px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Button variant="ghost" size="sm" className="md:hidden px-2 text-brown-600 hover:bg-brown-100">
                                <Menu className="h-4 w-4" />
                              </Button>
                              <div>
                                <h1 className="text-lg sm:text-xl font-semibold text-brown-900">HR Mobile</h1>
                                <p className="text-xs sm:text-sm text-brown-600 mt-1 hidden sm:block">
                                  Responsive HR management
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="px-2 sm:px-3 text-brown-600 hover:bg-brown-100">
                                <Search className="h-4 w-4" />
                                <span className="hidden sm:inline ml-2">Search</span>
                              </Button>
                              <Button size="sm" className="hidden sm:inline-flex bg-brown-600 hover:bg-brown-700 text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Add
                              </Button>
                              <Button size="sm" className="sm:hidden px-2 bg-brown-600 hover:bg-brown-700 text-white">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 sm:p-6 bg-white">
                          <p className="text-sm text-brown-600">Responsive content area...</p>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Tablet Layout">
                      <div className="border border-brown-200 rounded-lg overflow-hidden">
                        <div className="bg-brown-50 border-b border-brown-200 px-6 py-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h1 className="text-xl font-semibold text-brown-900">Employee Records</h1>
                              <p className="text-sm text-brown-600 mt-1">Manage employee information and documents</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button variant="outline" size="sm" className="flex-1 sm:flex-none border-brown-300 text-brown-700 hover:bg-brown-100">
                                  <Filter className="h-4 w-4 mr-2" />
                                  Filter
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1 sm:flex-none border-brown-300 text-brown-700 hover:bg-brown-100">
                                  <Download className="h-4 w-4 mr-2" />
                                  Export
                                </Button>
                              </div>
                              <Button size="sm" className="w-full sm:w-auto bg-brown-600 hover:bg-brown-700 text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Employee
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 bg-white">
                          <p className="text-sm text-brown-600">Responsive tablet layout content...</p>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`<header className="bg-brown-50 border-b border-brown-200 px-4 sm:px-6 py-4">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="sm" className="md:hidden px-2 text-brown-600 hover:bg-brown-100">
        <Menu className="h-4 w-4" />
      </Button>
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-brown-900">HR Mobile</h1>
        <p className="text-xs sm:text-sm text-brown-600 mt-1 hidden sm:block">
          Responsive HR management
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="px-2 sm:px-3 text-brown-600 hover:bg-brown-100">
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline ml-2">Search</span>
      </Button>
      <Button size="sm" className="hidden sm:inline-flex bg-brown-600 hover:bg-brown-700 text-white">
        <Plus className="h-4 w-4 mr-2" />
        Add
      </Button>
      <Button size="sm" className="sm:hidden px-2 bg-brown-600 hover:bg-brown-700 text-white">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  </div>
</header>

<main className="p-4 sm:p-6 bg-white">
  {/* Responsive content */}
</main>`}
                      language="tsx"
                      id="responsive-headers-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
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
                      Best practices for implementing semantic page headers.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Semantic Structure">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Use Header Element</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                              Always wrap page headers in header elements
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Navigation in Nav</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                              Use nav elements for navigation sections
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Proper Heading Hierarchy</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                              Use h1, h2, h3 in proper order
                            </p>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Accessibility Notes">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">ARIA Labels</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                              Add aria-label for complex navigation
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Keyboard Navigation</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                              Ensure all interactive elements are keyboard accessible
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Focus Management</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                              Proper focus indicators and skip links
                            </p>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Basic Template">
                    <CodeBlock
                      code={`import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { Search, Plus, Settings } from 'lucide-react';

function PageWithHeader() {
  return (
    <div className="min-h-screen bg-brown-50/30">
      <header className="bg-brown-50 border-b border-brown-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-brown-900">Page Title</h1>
            <p className="text-sm text-brown-600 mt-1">
              Page description or subtitle
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button size="sm" className="bg-brown-600 hover:bg-brown-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 bg-white">
        <section aria-labelledby="content-heading">
          <h2 id="content-heading" className="text-lg font-semibold text-brown-900 mb-4">
            Main Content
          </h2>
          {/* Content here */}
        </section>
      </main>
    </div>
  );
}`}
                      language="tsx"
                      id="implementation-code"
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