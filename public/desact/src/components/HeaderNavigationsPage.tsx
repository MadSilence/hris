import React, { useState, useEffect } from 'react';
import { ArrowLeft, Menu, Search, Bell, User, Settings, ChevronDown, Home, Building, Users, Calendar, FileText, BarChart3, LogOut, Plus, Filter, Download, Share, MoreHorizontal, X, MapPin, Phone, Mail, Globe, Shield, Zap, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
import { MainSidebar } from './shared/MainSidebar';

interface HeaderNavigationsPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const HeaderNavigationsPage: React.FC<HeaderNavigationsPageProps> = ({ 
  onBack, 
  components, 
  onComponentClick, 
  currentComponent 
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  
  // Interactive states
  const [searchTerm, setSearchTerm] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications] = useState(3);
  
  // Additional interactive states for all components
  const [activeTab, setActiveTab] = useState('active-employees');
  const [activeFilter, setActiveFilter] = useState('all-reviews');
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // Filter states
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [filterOptions, setFilterOptions] = useState({
    fullTime: true,
    partTime: false,
    contractor: false,
    remote: true,
    office: false
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
      const sections = ['overview', 'main-navigation', 'secondary-navigation', 'breadcrumb-headers', 'action-headers', 'search-headers', 'mobile-navigation', 'implementation'];
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
    { id: 'main-navigation', label: 'Main Navigation', icon: Menu },
    { id: 'secondary-navigation', label: 'Secondary Navigation', icon: Settings },
    { id: 'breadcrumb-headers', label: 'Breadcrumb Headers', icon: Home },
    { id: 'action-headers', label: 'Action Headers', icon: Plus },
    { id: 'search-headers', label: 'Search Headers', icon: Search },
    { id: 'mobile-navigation', label: 'Mobile Navigation', icon: Menu },
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Close dropdowns only if clicking outside their containers
      if (!target.closest('[data-dropdown="profile"]')) {
        setIsProfileOpen(false);
      }
      if (!target.closest('[data-dropdown="department"]')) {
        setIsDepartmentDropdownOpen(false);
      }
      if (!target.closest('[data-dropdown="filter"]')) {
        setIsFilterDropdownOpen(false);
      }
      if (!target.closest('[data-dropdown="more"]')) {
        setIsMoreMenuOpen(false);
      }
      if (!target.closest('[data-dropdown="user-profile"]')) {
        setIsUserProfileOpen(false);
      }
      if (!target.closest('[data-dropdown="notifications"]')) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
                  <h1 className="text-xl font-semibold">Header Navigations</h1>
                  <Badge variant="secondary" className="bg-brown-100 text-brown-700 border-brown-200">
                    Components
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Navigation header patterns with proper semantic structure and brand consistency
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
                      Header Navigations Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Header navigation components provide consistent, accessible navigation patterns for HR applications. 
                      These examples showcase different header types with proper semantic structure and brand consistency.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Menu className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Main Navigation</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Primary navigation headers with brand identity and main menu items.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Search className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Search Headers</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Headers with integrated search functionality and filtering options.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Plus className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Action Headers</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Headers with primary actions, buttons, and contextual controls.</p>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Main Navigation Section */}
              <section id="main-navigation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Main Navigation Headers
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Primary navigation headers that establish brand identity and provide access to main application areas.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Primary Navigation Header">
                      <div className="border border-brown-200 rounded-xl overflow-visible">
                        <header className="bg-white border-b border-brown-200">
                          <div className="px-6 py-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-8">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-brown-700 rounded-lg flex items-center justify-center">
                                    <Building className="w-5 h-5 text-white" />
                                  </div>
                                  <span className="font-semibold text-brown-900">Desact HR</span>
                                </div>
                                <nav className="hidden md:flex items-center gap-6">
                                  <Button variant="ghost" className="text-brown-700 hover:bg-brown-50">
                                    <Home className="w-4 h-4 mr-2" />
                                    Dashboard
                                  </Button>
                                  <Button variant="ghost" className="text-brown-600 hover:bg-brown-50 hover:text-brown-700">
                                    <Users className="w-4 h-4 mr-2" />
                                    Employees
                                  </Button>
                                  <Button variant="ghost" className="text-brown-600 hover:bg-brown-50 hover:text-brown-700">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Time & Attendance
                                  </Button>
                                  <Button variant="ghost" className="text-brown-600 hover:bg-brown-50 hover:text-brown-700">
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Reports
                                  </Button>
                                </nav>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="relative" data-dropdown="notifications">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="relative text-brown-600 hover:bg-brown-50"
                                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                  >
                                    <Bell className="w-4 h-4" />
                                    {notifications > 0 && (
                                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-brown-700 text-white text-xs rounded-full flex items-center justify-center">
                                        {notifications}
                                      </span>
                                    )}
                                  </Button>
                                  {isNotificationOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-brown-200 rounded-lg shadow-lg py-3 z-[100]">
                                      <div className="px-4 py-2 border-b border-brown-100">
                                        <h4 className="font-medium text-brown-900">Notifications</h4>
                                      </div>
                                      <div className="max-h-64 overflow-y-auto">
                                        <div className="px-4 py-3 hover:bg-brown-50 cursor-pointer border-b border-brown-100">
                                          <p className="text-sm text-brown-900 font-medium">New employee onboarding</p>
                                          <p className="text-xs text-brown-600 mt-1">Sarah Johnson started today</p>
                                        </div>
                                        <div className="px-4 py-3 hover:bg-brown-50 cursor-pointer border-b border-brown-100">
                                          <p className="text-sm text-brown-900 font-medium">Performance review due</p>
                                          <p className="text-xs text-brown-600 mt-1">3 reviews need completion</p>
                                        </div>
                                        <div className="px-4 py-3 hover:bg-brown-50 cursor-pointer">
                                          <p className="text-sm text-brown-900 font-medium">Time-off request</p>
                                          <p className="text-xs text-brown-600 mt-1">2 requests pending approval</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="relative" data-dropdown="user-profile">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-brown-600 hover:bg-brown-50"
                                    onClick={() => setIsUserProfileOpen(!isUserProfileOpen)}
                                  >
                                    <Avatar className="w-7 h-7">
                                      <AvatarFallback className="bg-brown-200 text-brown-700 text-xs">JD</AvatarFallback>
                                    </Avatar>
                                  </Button>
                                  {isUserProfileOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-brown-200 rounded-lg shadow-lg py-2 z-[100]">
                                      <button className="w-full text-left px-4 py-2 text-sm text-brown-700 hover:bg-brown-50 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Profile
                                      </button>
                                      <button className="w-full text-left px-4 py-2 text-sm text-brown-700 hover:bg-brown-50 flex items-center gap-2">
                                        <Settings className="w-4 h-4" />
                                        Settings
                                      </button>
                                      <Separator className="my-2" />
                                      <button className="w-full text-left px-4 py-2 text-sm text-brown-700 hover:bg-brown-50 flex items-center gap-2">
                                        <LogOut className="w-4 h-4" />
                                        Sign out
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </header>
                        <div className="p-6 bg-brown-50/30">
                          <p className="text-sm text-brown-600">Main content area</p>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Navigation with Dropdown">
                      <div className="border border-brown-200 rounded-xl overflow-visible">
                        <header className="bg-white border-b border-brown-200">
                          <div className="px-6 py-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-8">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-brown-700 rounded-lg flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-white" />
                                  </div>
                                  <span className="font-semibold text-brown-900">HR Platform</span>
                                </div>
                                <nav className="hidden md:flex items-center gap-1">
                                  <Button variant="ghost" className="text-brown-700 hover:bg-brown-50">
                                    Dashboard
                                  </Button>
                                  <div className="relative" data-dropdown="profile">
                                    <Button 
                                      variant="ghost" 
                                      className={`text-brown-600 hover:bg-brown-50 hover:text-brown-700 ${isProfileOpen ? 'bg-brown-50 text-brown-700' : ''}`}
                                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    >
                                      Employee Management
                                      <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                    </Button>
                                    {isProfileOpen && (
                                      <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-brown-200 rounded-lg shadow-lg py-2 z-[100]">
                                        <button className="w-full text-left px-4 py-2 text-sm text-brown-700 hover:bg-brown-50 flex items-center gap-3">
                                          <Users className="w-4 h-4" />
                                          Employee Directory
                                        </button>
                                        <button className="w-full text-left px-4 py-2 text-sm text-brown-700 hover:bg-brown-50 flex items-center gap-3">
                                          <Zap className="w-4 h-4" />
                                          Onboarding
                                        </button>
                                        <button className="w-full text-left px-4 py-2 text-sm text-brown-700 hover:bg-brown-50 flex items-center gap-3">
                                          <BarChart3 className="w-4 h-4" />
                                          Performance Reviews
                                        </button>
                                        <Separator className="my-2" />
                                        <button className="w-full text-left px-4 py-2 text-sm text-brown-700 hover:bg-brown-50 flex items-center gap-3">
                                          <Plus className="w-4 h-4" />
                                          Add New Employee
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  <Button variant="ghost" className="text-brown-600 hover:bg-brown-50 hover:text-brown-700">
                                    Reports
                                  </Button>
                                  <Button variant="ghost" className="text-brown-600 hover:bg-brown-50 hover:text-brown-700">
                                    Settings
                                  </Button>
                                </nav>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button size="sm" className="bg-brown-700 text-white hover:bg-brown-800">
                                  Add Employee
                                </Button>
                                <Button variant="ghost" size="sm" className="text-brown-600 hover:bg-brown-50">
                                  <User className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </header>
                        <div className="p-6 bg-brown-50/30">
                          <p className="text-sm text-brown-600">Main content area</p>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Secondary Navigation Section */}
              <section id="secondary-navigation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Secondary Navigation
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Secondary navigation headers for subsections, tabs, and contextual navigation within specific areas.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Tab Navigation Header">
                      <div className="border border-brown-200 rounded-xl overflow-visible">
                        <header className="bg-white">
                          <div className="px-6 py-4 border-b border-brown-200">
                            <div className="flex items-center justify-between">
                              <h2 className="text-lg font-semibold text-brown-900">Employee Management</h2>
                              <Button size="sm" className="bg-brown-700 text-white hover:bg-brown-800">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Employee
                              </Button>
                            </div>
                          </div>
                          <div className="px-6">
                            <nav className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                className={`rounded-none hover:bg-brown-50 ${
                                  activeTab === 'active-employees' 
                                    ? 'border-b-2 border-brown-700 text-brown-700' 
                                    : 'text-brown-600 hover:text-brown-700'
                                }`}
                                onClick={() => setActiveTab('active-employees')}
                              >
                                Active Employees
                              </Button>
                              <Button 
                                variant="ghost" 
                                className={`rounded-none hover:bg-brown-50 ${
                                  activeTab === 'pending-onboarding' 
                                    ? 'border-b-2 border-brown-700 text-brown-700' 
                                    : 'text-brown-600 hover:text-brown-700'
                                }`}
                                onClick={() => setActiveTab('pending-onboarding')}
                              >
                                Pending Onboarding
                              </Button>
                              <Button 
                                variant="ghost" 
                                className={`rounded-none hover:bg-brown-50 ${
                                  activeTab === 'former-employees' 
                                    ? 'border-b-2 border-brown-700 text-brown-700' 
                                    : 'text-brown-600 hover:text-brown-700'
                                }`}
                                onClick={() => setActiveTab('former-employees')}
                              >
                                Former Employees
                              </Button>
                              <Button 
                                variant="ghost" 
                                className={`rounded-none hover:bg-brown-50 ${
                                  activeTab === 'contractors' 
                                    ? 'border-b-2 border-brown-700 text-brown-700' 
                                    : 'text-brown-600 hover:text-brown-700'
                                }`}
                                onClick={() => setActiveTab('contractors')}
                              >
                                Contractors
                              </Button>
                            </nav>
                          </div>
                        </header>
                        <div className="p-6 bg-brown-50/30">
                          <p className="text-sm text-brown-600">
                            {activeTab === 'active-employees' && 'Showing 247 active employees'}
                            {activeTab === 'pending-onboarding' && 'Showing 12 employees pending onboarding'}
                            {activeTab === 'former-employees' && 'Showing 89 former employees'}
                            {activeTab === 'contractors' && 'Showing 15 contractors'}
                          </p>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Filter Navigation Header">
                      <div className="border border-brown-200 rounded-xl overflow-visible">
                        <header className="bg-white border-b border-brown-200">
                          <div className="px-6 py-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <h2 className="text-lg font-semibold text-brown-900">Performance Reviews</h2>
                                <Badge variant="secondary" className="bg-brown-100 text-brown-700 border-brown-200">
                                  24 Reviews
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3">
                                <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                  <Filter className="w-4 h-4 mr-2" />
                                  Filter
                                </Button>
                                <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                  <Download className="w-4 h-4 mr-2" />
                                  Export
                                </Button>
                                <Button size="sm" className="bg-brown-700 text-white hover:bg-brown-800">
                                  <Plus className="w-4 h-4 mr-2" />
                                  New Review
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-4">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className={`${
                                  activeFilter === 'all-reviews' 
                                    ? 'bg-brown-700 text-white border-brown-700' 
                                    : 'border-brown-300 text-brown-700 hover:bg-brown-100'
                                }`}
                                onClick={() => setActiveFilter('all-reviews')}
                              >
                                All Reviews
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className={`${
                                  activeFilter === 'in-progress' 
                                    ? 'bg-brown-700 text-white border-brown-700' 
                                    : 'border-brown-300 text-brown-700 hover:bg-brown-100'
                                }`}
                                onClick={() => setActiveFilter('in-progress')}
                              >
                                In Progress
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className={`${
                                  activeFilter === 'completed' 
                                    ? 'bg-brown-700 text-white border-brown-700' 
                                    : 'border-brown-300 text-brown-700 hover:bg-brown-100'
                                }`}
                                onClick={() => setActiveFilter('completed')}
                              >
                                Completed
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className={`${
                                  activeFilter === 'overdue' 
                                    ? 'bg-brown-700 text-white border-brown-700' 
                                    : 'border-brown-300 text-brown-700 hover:bg-brown-100'
                                }`}
                                onClick={() => setActiveFilter('overdue')}
                              >
                                Overdue
                              </Button>
                            </div>
                          </div>
                        </header>
                        <div className="p-6 bg-brown-50/30">
                          <p className="text-sm text-brown-600">
                            {activeFilter === 'all-reviews' && 'Showing all 24 performance reviews'}
                            {activeFilter === 'in-progress' && 'Showing 8 reviews in progress'}
                            {activeFilter === 'completed' && 'Showing 12 completed reviews'}
                            {activeFilter === 'overdue' && 'Showing 4 overdue reviews'}
                          </p>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>
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
                      Headers with breadcrumb navigation to show hierarchy and allow easy navigation back to parent pages.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Employee Detail Header">
                      <div className="border border-brown-200 rounded-xl overflow-visible">
                        <header className="bg-white border-b border-brown-200">
                          <div className="px-6 py-4">
                            <nav className="flex items-center gap-2 text-sm mb-4">
                              <Button variant="ghost" size="sm" className="text-brown-600 hover:bg-brown-50 hover:text-brown-700 p-1">
                                <Home className="w-4 h-4" />
                              </Button>
                              <span className="text-brown-400">/</span>
                              <Button variant="ghost" size="sm" className="text-brown-600 hover:bg-brown-50 hover:text-brown-700 p-1 h-auto">
                                Employees
                              </Button>
                              <span className="text-brown-400">/</span>
                              <Button variant="ghost" size="sm" className="text-brown-600 hover:bg-brown-50 hover:text-brown-700 p-1 h-auto">
                                Engineering
                              </Button>
                              <span className="text-brown-400">/</span>
                              <span className="text-brown-900 font-medium">John Doe</span>
                            </nav>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <Avatar className="w-12 h-12">
                                  <AvatarFallback className="bg-brown-200 text-brown-700">JD</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h1 className="text-xl font-semibold text-brown-900">John Doe</h1>
                                  <p className="text-sm text-brown-600">Senior Software Engineer • Engineering</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                  <Mail className="w-4 h-4 mr-2" />
                                  Email
                                </Button>
                                <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                  <Settings className="w-4 h-4 mr-2" />
                                  Edit
                                </Button>
                                <Button size="sm" className="bg-brown-700 text-white hover:bg-brown-800">
                                  <FileText className="w-4 h-4 mr-2" />
                                  Performance Review
                                </Button>
                              </div>
                            </div>
                          </div>
                        </header>
                        <div className="p-6 bg-brown-50/30">
                          <p className="text-sm text-brown-600">Employee details content</p>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>
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
                      Headers with prominent action buttons and contextual controls for task-focused interfaces.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Dashboard Action Header">
                      <div className="border border-brown-200 rounded-xl overflow-visible">
                        <header className="bg-white border-b border-brown-200">
                          <div className="px-6 py-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h1 className="text-xl font-semibold text-brown-900">HR Dashboard</h1>
                                <p className="text-sm text-brown-600 mt-1">Welcome back, Sarah. Here's what's happening with your team today.</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                  <Download className="w-4 h-4 mr-2" />
                                  Export Report
                                </Button>
                                <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                  <Share className="w-4 h-4 mr-2" />
                                  Share
                                </Button>
                                <Button size="sm" className="bg-brown-700 text-white hover:bg-brown-800">
                                  <Plus className="w-4 h-4 mr-2" />
                                  Quick Add
                                </Button>
                                <div className="relative" data-dropdown="more">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-brown-600 hover:bg-brown-50"
                                    onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                  {isMoreMenuOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-brown-200 rounded-lg shadow-lg py-2 z-[100]">
                                      <button className="w-full text-left px-4 py-2 text-sm text-brown-700 hover:bg-brown-50 flex items-center gap-3">
                                        <Settings className="w-4 h-4" />
                                        Dashboard Settings
                                      </button>
                                      <button className="w-full text-left px-4 py-2 text-sm text-brown-700 hover:bg-brown-50 flex items-center gap-3">
                                        <Download className="w-4 h-4" />
                                        Export Data
                                      </button>
                                      <button className="w-full text-left px-4 py-2 text-sm text-brown-700 hover:bg-brown-50 flex items-center gap-3">
                                        <HelpCircle className="w-4 h-4" />
                                        Help & Support
                                      </button>
                                      <Separator className="my-2" />
                                      <button className="w-full text-left px-4 py-2 text-sm text-brown-700 hover:bg-brown-50 flex items-center gap-3">
                                        <Share className="w-4 h-4" />
                                        Share Dashboard
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </header>
                        <div className="p-6 bg-brown-50/30">
                          <p className="text-sm text-brown-600">Dashboard content area</p>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>
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
                      Headers with integrated search functionality for filtering and finding content quickly.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Employee Search Header" className="overflow-visible">
                      <div className="border border-brown-200 rounded-xl overflow-visible">
                        <header className="bg-white border-b border-brown-200 overflow-visible">
                          <div className="px-6 py-4 overflow-visible">
                            <div className="flex items-center justify-between mb-4">
                              <h2 className="text-lg font-semibold text-brown-900">Employee Directory</h2>
                              <Button size="sm" className="bg-brown-700 text-white hover:bg-brown-800">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Employee
                              </Button>
                            </div>
                            <div className="flex items-center gap-4 overflow-visible">
                              <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brown-400" />
                                <Input
                                  type="text"
                                  placeholder="Search employees..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="pl-10 border-brown-300 focus:border-brown-500 focus:ring-brown-500"
                                />
                                {searchTerm && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 p-0 text-brown-400 hover:text-brown-600"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                              <div className="relative" data-dropdown="filter">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-brown-300 text-brown-700 hover:bg-brown-100"
                                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                                >
                                  <Filter className="w-4 h-4 mr-2" />
                                  Filters
                                </Button>
                                {isFilterDropdownOpen && (
                                  <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-brown-200 rounded-lg shadow-lg p-4 z-[100]">
                                    <div className="space-y-4">
                                      <div>
                                        <Label className="text-sm font-medium text-brown-900 block mb-3">Role</Label>
                                        <div className="space-y-3">
                                          <div className="flex items-center space-x-3">
                                            <Checkbox 
                                              id="full-time"
                                              checked={filterOptions.fullTime}
                                              onCheckedChange={(checked) => 
                                                setFilterOptions(prev => ({ ...prev, fullTime: checked as boolean }))
                                              }
                                              className="border-brown-300 data-[state=checked]:bg-brown-700 data-[state=checked]:border-brown-700"
                                            />
                                            <Label 
                                              htmlFor="full-time" 
                                              className="text-sm text-brown-700 cursor-pointer mb-0"
                                            >
                                              Full-time
                                            </Label>
                                          </div>
                                          <div className="flex items-center space-x-3">
                                            <Checkbox 
                                              id="part-time"
                                              checked={filterOptions.partTime}
                                              onCheckedChange={(checked) => 
                                                setFilterOptions(prev => ({ ...prev, partTime: checked as boolean }))
                                              }
                                              className="border-brown-300 data-[state=checked]:bg-brown-700 data-[state=checked]:border-brown-700"
                                            />
                                            <Label 
                                              htmlFor="part-time" 
                                              className="text-sm text-brown-700 cursor-pointer mb-0"
                                            >
                                              Part-time
                                            </Label>
                                          </div>
                                          <div className="flex items-center space-x-3">
                                            <Checkbox 
                                              id="contractor"
                                              checked={filterOptions.contractor}
                                              onCheckedChange={(checked) => 
                                                setFilterOptions(prev => ({ ...prev, contractor: checked as boolean }))
                                              }
                                              className="border-brown-300 data-[state=checked]:bg-brown-700 data-[state=checked]:border-brown-700"
                                            />
                                            <Label 
                                              htmlFor="contractor" 
                                              className="text-sm text-brown-700 cursor-pointer mb-0"
                                            >
                                              Contractor
                                            </Label>
                                          </div>
                                        </div>
                                      </div>
                                      <Separator className="bg-brown-200" />
                                      <div>
                                        <Label className="text-sm font-medium text-brown-900 block mb-3">Location</Label>
                                        <div className="space-y-3">
                                          <div className="flex items-center space-x-3">
                                            <Checkbox 
                                              id="remote"
                                              checked={filterOptions.remote}
                                              onCheckedChange={(checked) => 
                                                setFilterOptions(prev => ({ ...prev, remote: checked as boolean }))
                                              }
                                              className="border-brown-300 data-[state=checked]:bg-brown-700 data-[state=checked]:border-brown-700"
                                            />
                                            <Label 
                                              htmlFor="remote" 
                                              className="text-sm text-brown-700 cursor-pointer mb-0"
                                            >
                                              Remote
                                            </Label>
                                          </div>
                                          <div className="flex items-center space-x-3">
                                            <Checkbox 
                                              id="office"
                                              checked={filterOptions.office}
                                              onCheckedChange={(checked) => 
                                                setFilterOptions(prev => ({ ...prev, office: checked as boolean }))
                                              }
                                              className="border-brown-300 data-[state=checked]:bg-brown-700 data-[state=checked]:border-brown-700"
                                            />
                                            <Label 
                                              htmlFor="office" 
                                              className="text-sm text-brown-700 cursor-pointer mb-0"
                                            >
                                              Office
                                            </Label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex justify-between pt-3 border-t border-brown-200">
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="border-brown-300 text-brown-700 hover:bg-brown-50"
                                          onClick={() => {
                                            setFilterOptions({
                                              fullTime: false,
                                              partTime: false,
                                              contractor: false,
                                              remote: false,
                                              office: false
                                            });
                                          }}
                                        >
                                          Clear All
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          className="bg-brown-700 text-white hover:bg-brown-800"
                                          onClick={() => setIsFilterDropdownOpen(false)}
                                        >
                                          Apply Filters
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="relative" data-dropdown="department">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-brown-300 text-brown-700 hover:bg-brown-100"
                                  onClick={() => setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)}
                                >
                                  {selectedDepartment}
                                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isDepartmentDropdownOpen ? 'rotate-180' : ''}`} />
                                </Button>
                                {isDepartmentDropdownOpen && (
                                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-brown-200 rounded-lg shadow-lg py-2 z-[100]">
                                    {['All Departments', 'Engineering', 'Human Resources', 'Marketing', 'Sales', 'Finance'].map((dept) => (
                                      <button 
                                        key={dept}
                                        onClick={() => {
                                          setSelectedDepartment(dept);
                                          setIsDepartmentDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-brown-50 ${
                                          selectedDepartment === dept 
                                            ? 'text-brown-900 bg-brown-50 font-medium' 
                                            : 'text-brown-700'
                                        }`}
                                      >
                                        {dept}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </header>
                        <div className="p-6 bg-brown-50/30">
                          <div className="space-y-2">
                            <p className="text-sm text-brown-600">
                              {searchTerm ? `Search results for "${searchTerm}"` : `All employees • ${selectedDepartment}`}
                            </p>
                            {(filterOptions.fullTime || filterOptions.partTime || filterOptions.contractor || filterOptions.remote || filterOptions.office) && (
                              <div className="flex flex-wrap gap-2">
                                <span className="text-xs text-brown-500">Active filters:</span>
                                {filterOptions.fullTime && <Badge variant="secondary" className="bg-brown-100 text-brown-700 text-xs">Full-time</Badge>}
                                {filterOptions.partTime && <Badge variant="secondary" className="bg-brown-100 text-brown-700 text-xs">Part-time</Badge>}
                                {filterOptions.contractor && <Badge variant="secondary" className="bg-brown-100 text-brown-700 text-xs">Contractor</Badge>}
                                {filterOptions.remote && <Badge variant="secondary" className="bg-brown-100 text-brown-700 text-xs">Remote</Badge>}
                                {filterOptions.office && <Badge variant="secondary" className="bg-brown-100 text-brown-700 text-xs">Office</Badge>}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Mobile Navigation Section */}
              <section id="mobile-navigation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Mobile Navigation
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Responsive navigation headers optimized for mobile devices with collapsible menus and touch-friendly interactions.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Mobile Header with Menu">
                      <div className="border border-brown-200 rounded-xl overflow-visible max-w-sm mx-auto">
                        <header className="bg-white border-b border-brown-200">
                          <div className="px-4 py-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                  className="text-brown-600 hover:bg-brown-50 p-2"
                                >
                                  <Menu className="w-5 h-5" />
                                </Button>
                                <span className="font-semibold text-brown-900">HR Portal</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="relative text-brown-600 hover:bg-brown-50 p-2">
                                  <Bell className="w-4 h-4" />
                                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brown-700 text-white text-xs rounded-full flex items-center justify-center">
                                    2
                                  </span>
                                </Button>
                                <Avatar className="w-7 h-7">
                                  <AvatarFallback className="bg-brown-200 text-brown-700 text-xs">SD</AvatarFallback>
                                </Avatar>
                              </div>
                            </div>
                            {isMobileMenuOpen && (
                              <nav className="mt-4 pt-4 border-t border-brown-200 space-y-2">
                                <Button variant="ghost" className="w-full justify-start text-brown-700 hover:bg-brown-50">
                                  <Home className="w-4 h-4 mr-3" />
                                  Dashboard
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-brown-600 hover:bg-brown-50 hover:text-brown-700">
                                  <Users className="w-4 h-4 mr-3" />
                                  Employees
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-brown-600 hover:bg-brown-50 hover:text-brown-700">
                                  <Calendar className="w-4 h-4 mr-3" />
                                  Time & Attendance
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-brown-600 hover:bg-brown-50 hover:text-brown-700">
                                  <BarChart3 className="w-4 h-4 mr-3" />
                                  Reports
                                </Button>
                                <Separator className="my-3" />
                                <Button variant="ghost" className="w-full justify-start text-brown-600 hover:bg-brown-50 hover:text-brown-700">
                                  <Settings className="w-4 h-4 mr-3" />
                                  Settings
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-brown-600 hover:bg-brown-50 hover:text-brown-700">
                                  <LogOut className="w-4 h-4 mr-3" />
                                  Sign Out
                                </Button>
                              </nav>
                            )}
                          </div>
                        </header>
                        <div className="p-4 bg-brown-50/30">
                          <p className="text-sm text-brown-600">Mobile content area</p>
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
                      Best practices and guidelines for implementing accessible and consistent header navigation patterns.
                    </p>
                  </div>

                  <PreviewCard title="Complete Header Implementation">
                    <CodeBlock
                      code={`const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-brown-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brown-700 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-brown-900">Desact HR</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Button variant="ghost" className="text-brown-700 hover:bg-brown-50">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};`}
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