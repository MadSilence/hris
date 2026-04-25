import React, { useState, useEffect } from 'react';
import { ArrowLeft, Menu, Settings, Filter, ShoppingCart, User, FileText, Search, Bell, ChevronRight, X, Home, Users, BarChart3, Calendar, MessageSquare, Briefcase, Clock, CheckCircle, Star, Download, Plus, MoreHorizontal, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { Avatar } from './ui/avatar';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
import { MainSidebar } from './shared/MainSidebar';

interface SlideoutMenusPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const SlideoutMenusPage: React.FC<SlideoutMenusPageProps> = ({ 
  onBack, 
  components, 
  onComponentClick, 
  currentComponent 
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  
  // Interactive states for slideouts
  const [isBasicOpen, setIsBasicOpen] = useState(false);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Filter states for checkbox examples
  const [filterStates, setFilterStates] = useState({
    fullTime: true,
    partTime: false,
    contractor: false,
    remote: true,
    onsite: false,
    hybrid: true,
    active: true,
    inactive: false,
    engineering: true,
    design: false,
    marketing: false,
    sales: true,
    support: false
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
      const sections = ['overview', 'basic-slideout', 'navigation-menu', 'settings-panel', 'filter-sidebar', 'user-profile'];
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
    { id: 'basic-slideout', label: 'Basic Slideout', icon: ChevronRight },
    { id: 'navigation-menu', label: 'Navigation Menu', icon: Menu },
    { id: 'settings-panel', label: 'Settings Panel', icon: Settings },
    { id: 'filter-sidebar', label: 'Filter Sidebar', icon: Filter },
    { id: 'user-profile', label: 'User Profile', icon: User },
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

  // Slideout Overlay Component with animations
  const SlideoutOverlay: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    children: React.ReactNode; 
    title: string;
    width?: string;
  }> = ({ isOpen, onClose, children, title, width = "w-80" }) => {
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex">
            <motion.div 
              className="flex-1 bg-black/50 backdrop-blur-sm" 
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div 
              className={`${width} bg-white shadow-xl border-l border-brown-200 flex flex-col max-h-full overflow-hidden`}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.3
              }}
            >
              <div className="flex items-center justify-between p-4 border-b border-brown-200">
                <h3 className="font-semibold text-brown-900">{title}</h3>
                <Button variant="ghost" size="sm" onClick={onClose} className="p-2 hover:bg-brown-50">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <motion.div 
                className="flex-1 overflow-y-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                {children}
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
                  <h1 className="text-xl font-semibold">Slideout Menus</h1>
                  <Badge variant="secondary" className="bg-brown-100 text-brown-700 border-brown-200">
                    Components
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Sliding panels and drawers for navigation, settings, and contextual actions
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
                      Slideout Menus Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Sliding panels and drawers provide contextual navigation, settings panels, and quick access to 
                      important functions without leaving the current page context.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Menu className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Navigation Menus</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Primary and secondary navigation panels for HR system navigation.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Settings className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Settings Panels</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Configuration and preference panels for user and system settings.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Filter className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Filter Sidebars</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Advanced filtering and search options for data tables and lists.</p>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Basic Slideout Section */}
              <section id="basic-slideout" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Basic Slideout Panel
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Simple sliding panels for displaying additional content or quick actions.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Basic Slideout Example">
                      <div className="space-y-4">
                        <Button 
                          onClick={() => setIsBasicOpen(true)}
                          className="bg-brown-700 hover:bg-brown-800"
                        >
                          <ChevronRight className="w-4 h-4 mr-2" />
                          Open Slideout
                        </Button>
                        
                        <div className="bg-brown-50 rounded-lg p-4">
                          <p className="text-sm text-brown-600">
                            Click the button above to see the basic slideout panel in action. This demonstrates the overlay and sliding animation.
                          </p>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Code Example">
                      <CodeBlock
                        code={`// Basic Slideout Component with Animation
const BasicSlideout = ({ isOpen, onClose, children, title }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <motion.div 
            className="flex-1 bg-black/50 backdrop-blur-sm" 
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div 
            className="w-80 bg-white shadow-xl border-l border-brown-200"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30
            }}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">{title}</h3>
              <Button variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <motion.div 
              className="p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.2 }}
            >
              {children}
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};`}
                        language="tsx"
                        onCopy={(code) => copyToClipboard(code, 'basic-slideout')}
                        copiedId={copiedCode}
                        id="basic-slideout"
                      />
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Navigation Menu Section */}
              <section id="navigation-menu" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Navigation Menu
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Comprehensive navigation panels for HR system features and modules.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="HR Navigation Menu">
                      <div className="space-y-4">
                        <Button 
                          onClick={() => setIsNavigationOpen(true)}
                          className="bg-brown-700 hover:bg-brown-800"
                        >
                          <Menu className="w-4 h-4 mr-2" />
                          Open Navigation
                        </Button>
                        
                        <div className="bg-brown-50 rounded-lg p-4">
                          <p className="text-sm text-brown-600">
                            Full-featured navigation menu with sections for all HR modules including employee management, 
                            payroll, benefits, and reporting.
                          </p>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Settings Panel Section */}
              <section id="settings-panel" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Settings Panel
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Configuration panels for user preferences, system settings, and application customization.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="User Settings Panel">
                      <div className="space-y-4">
                        <Button 
                          onClick={() => setIsSettingsOpen(true)}
                          className="bg-brown-700 hover:bg-brown-800"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Open Settings
                        </Button>
                        
                        <div className="bg-brown-50 rounded-lg p-4">
                          <p className="text-sm text-brown-600">
                            Comprehensive settings panel with user preferences, notification settings, privacy controls, 
                            and application configuration options.
                          </p>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Filter Sidebar Section */}
              <section id="filter-sidebar" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Filter Sidebar
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Advanced filtering interfaces for employee data, reports, and search functionality.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Employee Filter Panel">
                      <div className="space-y-4">
                        <Button 
                          onClick={() => setIsFilterOpen(true)}
                          className="bg-brown-700 hover:bg-brown-800"
                        >
                          <Filter className="w-4 h-4 mr-2" />
                          Open Filters
                        </Button>
                        
                        <div className="bg-brown-50 rounded-lg p-4">
                          <p className="text-sm text-brown-600">
                            Advanced filtering panel with multiple filter categories, date ranges, status filters, 
                            and search functionality for employee data.
                          </p>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* User Profile Section */}
              <section id="user-profile" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      User Profile Panel
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Quick access panels for user profiles, account information, and personal settings.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="User Profile Slideout">
                      <div className="space-y-4">
                        <Button 
                          onClick={() => setIsProfileOpen(true)}
                          className="bg-brown-700 hover:bg-brown-800"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Open Profile
                        </Button>
                        
                        <div className="bg-brown-50 rounded-lg p-4">
                          <p className="text-sm text-brown-600">
                            User profile panel with personal information, recent activity, quick actions, 
                            and account management options.
                          </p>
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

      {/* Slideout Overlays */}
      <SlideoutOverlay
        isOpen={isBasicOpen}
        onClose={() => setIsBasicOpen(false)}
        title="Basic Information"
      >
        <div className="p-4 space-y-4">
          <div className="text-center">
            <FileText className="w-12 h-12 text-brown-600 mx-auto mb-3" />
            <h4 className="font-semibold text-brown-900">Employee Document Center</h4>
            <p className="text-sm text-brown-600 mt-2">Access and manage employee documents</p>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-brown-50 rounded-lg">
              <FileText className="w-5 h-5 text-brown-600" />
              <div>
                <div className="font-medium text-brown-900">Employment Contract</div>
                <div className="text-sm text-brown-600">Updated 2 days ago</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-brown-50 rounded-lg">
              <FileText className="w-5 h-5 text-brown-600" />
              <div>
                <div className="font-medium text-brown-900">Performance Review</div>
                <div className="text-sm text-brown-600">Q4 2024</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-brown-50 rounded-lg">
              <FileText className="w-5 h-5 text-brown-600" />
              <div>
                <div className="font-medium text-brown-900">Training Certificates</div>
                <div className="text-sm text-brown-600">3 documents</div>
              </div>
            </div>
          </div>
          
          <Button className="w-full bg-brown-700 hover:bg-brown-800">
            <Plus className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </SlideoutOverlay>

      <SlideoutOverlay
        isOpen={isNavigationOpen}
        onClose={() => setIsNavigationOpen(false)}
        title="HR Navigation"
        width="w-72"
      >
        <div className="p-4 space-y-2">
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-medium text-brown-600 uppercase tracking-wider">Main</div>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-brown-900 hover:bg-brown-50 rounded-lg transition-colors">
              <Home className="w-4 h-4" />
              Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-brown-700 bg-brown-50 rounded-lg">
              <Users className="w-4 h-4" />
              Employees
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-brown-900 hover:bg-brown-50 rounded-lg transition-colors">
              <Calendar className="w-4 h-4" />
              Time & Attendance
            </button>
          </div>
          
          <Separator />
          
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-medium text-brown-600 uppercase tracking-wider">HR Management</div>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-brown-900 hover:bg-brown-50 rounded-lg transition-colors">
              <Briefcase className="w-4 h-4" />
              Recruitment
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-brown-900 hover:bg-brown-50 rounded-lg transition-colors">
              <BarChart3 className="w-4 h-4" />
              Performance
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-brown-900 hover:bg-brown-50 rounded-lg transition-colors">
              <Star className="w-4 h-4" />
              Benefits
            </button>
          </div>
          
          <Separator />
          
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-medium text-brown-600 uppercase tracking-wider">Reports</div>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-brown-900 hover:bg-brown-50 rounded-lg transition-colors">
              <FileText className="w-4 h-4" />
              Employee Reports
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-brown-900 hover:bg-brown-50 rounded-lg transition-colors">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
          </div>
        </div>
      </SlideoutOverlay>

      <SlideoutOverlay
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Settings"
        width="w-80"
      >
        <div className="p-4 space-y-6">
          <div className="space-y-4">
            <h5 className="font-medium text-brown-900">Preferences</h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-brown-900">Email Notifications</div>
                  <div className="text-sm text-brown-600">Receive email updates</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-brown-900">Push Notifications</div>
                  <div className="text-sm text-brown-600">Browser notifications</div>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-brown-900">Auto-save</div>
                  <div className="text-sm text-brown-600">Automatically save changes</div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h5 className="font-medium text-brown-900">Appearance</h5>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-brown-900 mb-2">Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  <button className="p-3 border-2 border-brown-500 bg-brown-50 rounded-lg text-xs font-medium transition-colors hover:bg-brown-100">Light</button>
                  <button className="p-3 border border-brown-300 bg-white rounded-lg text-xs font-medium transition-colors hover:bg-brown-50">Dark</button>
                  <button className="p-3 border border-brown-300 bg-white rounded-lg text-xs font-medium transition-colors hover:bg-brown-50">Auto</button>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h5 className="font-medium text-brown-900">Privacy</h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-brown-900">Profile Visibility</div>
                  <div className="text-sm text-brown-600">Show profile to colleagues</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-brown-900">Activity Status</div>
                  <div className="text-sm text-brown-600">Show when you're online</div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </div>
      </SlideoutOverlay>

      <SlideoutOverlay
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Employee Filters"
        width="w-80"
      >
        <div className="p-4 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-brown-400" />
              <Input 
                placeholder="Search employees..." 
                className="pl-10 border-brown-200 focus:border-brown-500"
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h5 className="font-medium text-brown-900">Employment Type</h5>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="full-time" 
                  checked={filterStates.fullTime}
                  onCheckedChange={(checked) => setFilterStates(prev => ({ ...prev, fullTime: !!checked }))}
                />
                <label htmlFor="full-time" className="text-sm text-brown-900 cursor-pointer">Full-time</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="part-time" 
                  checked={filterStates.partTime}
                  onCheckedChange={(checked) => setFilterStates(prev => ({ ...prev, partTime: !!checked }))}
                />
                <label htmlFor="part-time" className="text-sm text-brown-900 cursor-pointer">Part-time</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="contractor" 
                  checked={filterStates.contractor}
                  onCheckedChange={(checked) => setFilterStates(prev => ({ ...prev, contractor: !!checked }))}
                />
                <label htmlFor="contractor" className="text-sm text-brown-900 cursor-pointer">Contractor</label>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h5 className="font-medium text-brown-900">Work Location</h5>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remote" 
                  checked={filterStates.remote}
                  onCheckedChange={(checked) => setFilterStates(prev => ({ ...prev, remote: !!checked }))}
                />
                <label htmlFor="remote" className="text-sm text-brown-900 cursor-pointer">Remote</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="onsite" 
                  checked={filterStates.onsite}
                  onCheckedChange={(checked) => setFilterStates(prev => ({ ...prev, onsite: !!checked }))}
                />
                <label htmlFor="onsite" className="text-sm text-brown-900 cursor-pointer">On-site</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hybrid" 
                  checked={filterStates.hybrid}
                  onCheckedChange={(checked) => setFilterStates(prev => ({ ...prev, hybrid: !!checked }))}
                />
                <label htmlFor="hybrid" className="text-sm text-brown-900 cursor-pointer">Hybrid</label>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h5 className="font-medium text-brown-900">Status</h5>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="active" 
                  checked={filterStates.active}
                  onCheckedChange={(checked) => setFilterStates(prev => ({ ...prev, active: !!checked }))}
                />
                <label htmlFor="active" className="text-sm text-brown-900 cursor-pointer">Active</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="inactive" 
                  checked={filterStates.inactive}
                  onCheckedChange={(checked) => setFilterStates(prev => ({ ...prev, inactive: !!checked }))}
                />
                <label htmlFor="inactive" className="text-sm text-brown-900 cursor-pointer">Inactive</label>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h5 className="font-medium text-brown-900">Department</h5>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="engineering" 
                  checked={filterStates.engineering}
                  onCheckedChange={(checked) => setFilterStates(prev => ({ ...prev, engineering: !!checked }))}
                />
                <label htmlFor="engineering" className="text-sm text-brown-900 cursor-pointer">Engineering</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="design" 
                  checked={filterStates.design}
                  onCheckedChange={(checked) => setFilterStates(prev => ({ ...prev, design: !!checked }))}
                />
                <label htmlFor="design" className="text-sm text-brown-900 cursor-pointer">Design</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="marketing" 
                  checked={filterStates.marketing}
                  onCheckedChange={(checked) => setFilterStates(prev => ({ ...prev, marketing: !!checked }))}
                />
                <label htmlFor="marketing" className="text-sm text-brown-900 cursor-pointer">Marketing</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="sales" 
                  checked={filterStates.sales}
                  onCheckedChange={(checked) => setFilterStates(prev => ({ ...prev, sales: !!checked }))}
                />
                <label htmlFor="sales" className="text-sm text-brown-900 cursor-pointer">Sales</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="support" 
                  checked={filterStates.support}
                  onCheckedChange={(checked) => setFilterStates(prev => ({ ...prev, support: !!checked }))}
                />
                <label htmlFor="support" className="text-sm text-brown-900 cursor-pointer">Support</label>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 border-brown-300 text-brown-700 hover:bg-brown-50"
              onClick={() => setFilterStates({
                fullTime: false,
                partTime: false,
                contractor: false,
                remote: false,
                onsite: false,
                hybrid: false,
                active: false,
                inactive: false,
                engineering: false,
                design: false,
                marketing: false,
                sales: false,
                support: false
              })}
            >
              Clear All
            </Button>
            <Button className="flex-1 bg-brown-700 hover:bg-brown-800">
              Apply Filters
            </Button>
          </div>
        </div>
      </SlideoutOverlay>

      <SlideoutOverlay
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title="Profile"
        width="w-80"
      >
        <div className="p-4 space-y-6">
          <div className="text-center">
            <Avatar className="w-16 h-16 mx-auto mb-3 bg-brown-100">
              <div className="w-full h-full bg-brown-600 rounded-full flex items-center justify-center text-white font-semibold">
                SJ
              </div>
            </Avatar>
            <h4 className="font-semibold text-brown-900">Sarah Johnson</h4>
            <p className="text-sm text-brown-600">Senior HR Manager</p>
            <Badge className="mt-2 bg-green-100 text-green-800 border-green-200">Active</Badge>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-brown-50 rounded-lg">
              <Mail className="w-5 h-5 text-brown-600" />
              <div>
                <div className="font-medium text-brown-900">sarah.johnson@company.com</div>
                <div className="text-sm text-brown-600">Work Email</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-brown-50 rounded-lg">
              <Calendar className="w-5 h-5 text-brown-600" />
              <div>
                <div className="font-medium text-brown-900">March 15, 2020</div>
                <div className="text-sm text-brown-600">Start Date</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-brown-50 rounded-lg">
              <Users className="w-5 h-5 text-brown-600" />
              <div>
                <div className="font-medium text-brown-900">Human Resources</div>
                <div className="text-sm text-brown-600">Department</div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h5 className="font-medium text-brown-900">Quick Actions</h5>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="justify-start hover:bg-brown-50">
                <FileText className="w-4 h-4 mr-2" />
                View Profile
              </Button>
              <Button variant="outline" size="sm" className="justify-start hover:bg-brown-50">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
              <Button variant="outline" size="sm" className="justify-start hover:bg-brown-50">
                <Clock className="w-4 h-4 mr-2" />
                Time Off
              </Button>
              <Button variant="outline" size="sm" className="justify-start hover:bg-brown-50">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <h5 className="font-medium text-brown-900">Recent Activity</h5>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-brown-600">Approved time off request</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brown-600" />
                <span className="text-brown-600">Updated employee handbook</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brown-600" />
                <span className="text-brown-600">Completed team review</span>
              </div>
            </div>
          </div>
        </div>
      </SlideoutOverlay>
    </div>
  );
};