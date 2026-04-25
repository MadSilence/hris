import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Layout as LayoutIcon, Grid3X3, Columns, Rows, Menu, Search, ChevronRight, Layers, Zap, Star, FileText, Mouse, Square, AlignLeft, CheckSquare, CreditCard, Settings, List, PieChart, Hash, AlertTriangle, Award, Upload, Gauge, ArrowUpDown, Palette as PaletteIcon, Command, Edit, Activity, Package, ArrowRight, Navigation, PanelLeftOpen, Calendar, Megaphone, Timer, Shield, CheckCircle, XCircle, AlertCircle, Info, Code2, Eye, Paintbrush, Type, MessageSquare, StarIcon, Sidebar, Monitor, Smartphone, Tablet, Maximize2, Split, Users, UserPlus, DollarSign, BarChart3, Briefcase, Clock, HelpCircle, Bell, LogOut, Home, Building2, BookOpen, TrendingUp, Workflow, MapPin, Heart, Gift, Phone, Mail, MoreHorizontal, Calendar as CalendarIcon, Target, ChevronDown, Download, ExternalLink, BadgeCheck, Zap as ZapIcon, BookMarked, GraduationCap, Coffee, Plane, Thermometer, Sun, CloudRain, Laptop } from 'lucide-react';
import { DesactLogo } from './shared/DesactLogo';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { categoryIcons, componentIcons } from './constants/iconMappings';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';

interface HRCardsPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const HRCardsPage: React.FC<HRCardsPageProps> = ({
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
    onFocus: () => {
      console.log('Sidebar search focused');
    },
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
      const sections = ['overview', 'employee-profiles', 'job-postings', 'performance', 'attendance', 'payroll', 'benefits', 'recruitment', 'training', 'leave-management', 'implementation'];
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
    { id: 'overview', label: 'Overview', icon: CreditCard },
    { id: 'employee-profiles', label: 'Employee Profiles', icon: Users },
    { id: 'job-postings', label: 'Job Postings', icon: Briefcase },
    { id: 'performance', label: 'Performance Cards', icon: TrendingUp },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'payroll', label: 'Payroll', icon: DollarSign },
    { id: 'benefits', label: 'Benefits', icon: Heart },
    { id: 'recruitment', label: 'Recruitment', icon: UserPlus },
    { id: 'training', label: 'Training', icon: BookOpen },
    { id: 'leave-management', label: 'Leave Management', icon: CalendarIcon },
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

  const CardDemo: React.FC<{ children: React.ReactNode; title: string; description: string }> = ({ 
    children, 
    title,
    description 
  }) => (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-tertiary)' }}>{description}</p>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
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
                  <h1 className="text-xl font-semibold">HR Cards</h1>
                  <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
                    HR Specific
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Professional card layouts designed specifically for HR applications
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
                      HR Cards Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      A comprehensive collection of card layouts specifically designed for HR applications. 
                      From employee profiles to performance reviews, these cards provide the perfect 
                      foundation for any human resources interface.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Employee Management</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Profile cards, team overviews, and organizational charts.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Performance Tracking</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Review cards, goal tracking, and performance metrics.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Briefcase className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Recruitment</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Job posting cards, candidate profiles, and application tracking.</p>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Employee Profiles */}
              <section id="employee-profiles" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.2 }}>
                      Employee Profile Cards
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Comprehensive employee profile cards for displaying personal information, contact details, and key metrics.
                    </p>
                  </div>

                  <div className="space-y-8">
                    <CardDemo
                      title="Basic Employee Card"
                      description="Standard employee profile with photo, contact info, and role details"
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        {[
                          { 
                            name: "Sarah Johnson", 
                            role: "Senior Software Engineer", 
                            department: "Engineering", 
                            email: "sarah.johnson@company.com",
                            avatar: "SJ",
                            status: "Active",
                            joining: "Jan 2022"
                          },
                          { 
                            name: "Michael Chen", 
                            role: "Product Manager", 
                            department: "Product", 
                            email: "michael.chen@company.com",
                            avatar: "MC",
                            status: "Active",
                            joining: "Mar 2021"
                          },
                          { 
                            name: "Emily Rodriguez", 
                            role: "UX Designer", 
                            department: "Design", 
                            email: "emily.rodriguez@company.com",
                            avatar: "ER",
                            status: "On Leave",
                            joining: "Aug 2023"
                          }
                        ].map((employee, index) => (
                          <Card key={index} className="border-brown-200 overflow-hidden">
                            <div className="p-6">
                              <div className="flex items-start gap-4 mb-4">
                                <Avatar className="w-12 h-12">
                                  <AvatarFallback className="bg-brown-100 text-brown-700 font-medium">
                                    {employee.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-sm mb-1">{employee.name}</h3>
                                  <p className="text-xs text-brown-600 mb-1">{employee.role}</p>
                                  <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                    {employee.department}
                                  </p>
                                </div>
                                <Badge 
                                  variant={employee.status === "Active" ? "default" : "secondary"}
                                  className={employee.status === "Active" 
                                    ? "bg-green-100 text-green-700 text-xs" 
                                    : "bg-orange-100 text-orange-700 text-xs"
                                  }
                                >
                                  {employee.status}
                                </Badge>
                              </div>
                              
                              <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-3 h-3" style={{ color: 'var(--color-text-tertiary)' }} />
                                  <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                    {employee.email}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CalendarIcon className="w-3 h-3" style={{ color: 'var(--color-text-tertiary)' }} />
                                  <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                    Joined {employee.joining}
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="flex-1 text-xs h-8">
                                  View Profile
                                </Button>
                                <Button size="sm" variant="ghost" className="px-2 h-8">
                                  <MoreHorizontal className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </CardDemo>

                    <CardDemo
                      title="Employee Card with Performance Metrics"
                      description="Enhanced employee cards showing performance indicators and key metrics"
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        {[
                          { 
                            name: "David Kim", 
                            role: "Marketing Director", 
                            avatar: "DK",
                            performance: 92,
                            goals: "8/10",
                            projects: 3,
                            team: 12
                          },
                          { 
                            name: "Lisa Wang", 
                            role: "HR Business Partner", 
                            avatar: "LW",
                            performance: 88,
                            goals: "7/9",
                            projects: 5,
                            team: 8
                          }
                        ].map((employee, index) => (
                          <Card key={index} className="border-brown-200">
                            <div className="p-6">
                              <div className="flex items-center gap-4 mb-6">
                                <Avatar className="w-14 h-14">
                                  <AvatarFallback className="bg-brown-100 text-brown-700 font-medium text-lg">
                                    {employee.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h3 className="font-semibold mb-1">{employee.name}</h3>
                                  <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                                    {employee.role}
                                  </p>
                                </div>
                                <Button size="sm" variant="ghost" className="px-2">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">Performance Score</span>
                                    <span className="text-sm font-medium text-green-600">{employee.performance}%</span>
                                  </div>
                                  <Progress value={employee.performance} className="h-2" />
                                </div>

                                <div className="grid grid-cols-3 gap-4 pt-2">
                                  <div className="text-center">
                                    <div className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                      {employee.goals}
                                    </div>
                                    <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                      Goals
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                      {employee.projects}
                                    </div>
                                    <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                      Projects
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                      {employee.team}
                                    </div>
                                    <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                      Team Size
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <Separator className="my-4" />

                              <div className="flex gap-2">
                                <Button size="sm" className="flex-1">
                                  <MessageSquare className="w-3 h-3 mr-2" />
                                  Message
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3 mr-2" />
                                  View
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </CardDemo>

                    <CodeBlock
                      code={`// Employee Profile Card Component
const EmployeeCard = ({ employee }) => {
  return (
    <Card className="border-brown-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-brown-100 text-brown-700 font-medium">
              {employee.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">{employee.name}</h3>
            <p className="text-xs text-brown-600 mb-1">{employee.role}</p>
            <p className="text-xs text-muted-foreground">{employee.department}</p>
          </div>
          <Badge 
            variant={employee.status === "Active" ? "default" : "secondary"}
            className={employee.status === "Active" 
              ? "bg-green-100 text-green-700 text-xs" 
              : "bg-orange-100 text-orange-700 text-xs"
            }
          >
            {employee.status}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{employee.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Joined {employee.joining}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 text-xs h-8">
            View Profile
          </Button>
          <Button size="sm" variant="ghost" className="px-2 h-8">
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
};`}
                      language="tsx"
                      id="employee-profile-card"
                    />
                  </div>
                </div>
              </section>

              {/* Job Postings */}
              <section id="job-postings" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.2 }}>
                      Job Posting Cards
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Professional job posting cards for recruitment platforms and career pages.
                    </p>
                  </div>

                  <div className="space-y-8">
                    <CardDemo
                      title="Job Listing Cards"
                      description="Standard job posting cards with key details and application actions"
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        {[
                          {
                            title: "Senior React Developer",
                            company: "TechCorp Inc.",
                            location: "San Francisco, CA",
                            type: "Full-time",
                            salary: "$120k - $160k",
                            posted: "2 days ago",
                            applicants: 24,
                            tags: ["React", "TypeScript", "Node.js"]
                          },
                          {
                            title: "Product Manager",
                            company: "StartupXYZ",
                            location: "Remote",
                            type: "Full-time",
                            salary: "$110k - $140k",
                            posted: "1 week ago",
                            applicants: 12,
                            tags: ["Product Strategy", "Analytics", "Agile"]
                          },
                          {
                            title: "UX Designer",
                            company: "Design Studio",
                            location: "New York, NY",
                            type: "Contract",
                            salary: "$90k - $110k",
                            posted: "3 days ago",
                            applicants: 8,
                            tags: ["Figma", "User Research", "Prototyping"]
                          },
                          {
                            title: "Data Scientist",
                            company: "Analytics Pro",
                            location: "Boston, MA",
                            type: "Full-time",
                            salary: "$130k - $170k",
                            posted: "5 days ago",
                            applicants: 18,
                            tags: ["Python", "ML", "SQL"]
                          }
                        ].map((job, index) => (
                          <Card key={index} className="border-brown-200 hover:shadow-md transition-shadow">
                            <div className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                  <h3 className="font-semibold mb-1">{job.title}</h3>
                                  <p className="text-sm text-brown-600 mb-2">{job.company}</p>
                                  <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {job.location}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {job.type}
                                    </div>
                                  </div>
                                </div>
                                <Button size="sm" variant="ghost" className="px-2">
                                  <Heart className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="mb-4">
                                <div className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                  {job.salary}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {job.tags.map((tag, tagIndex) => (
                                    <Badge key={tagIndex} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center justify-between mb-4 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                <span>Posted {job.posted}</span>
                                <span>{job.applicants} applicants</span>
                              </div>

                              <div className="flex gap-2">
                                <Button size="sm" className="flex-1">
                                  Apply Now
                                </Button>
                                <Button size="sm" variant="outline">
                                  <ExternalLink className="w-3 h-3 mr-2" />
                                  View
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </CardDemo>
                  </div>
                </div>
              </section>

              {/* Performance Cards */}
              <section id="performance" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.2 }}>
                      Performance Review Cards
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Performance tracking cards for reviews, goals, and employee development.
                    </p>
                  </div>

                  <div className="space-y-8">
                    <CardDemo
                      title="Performance Summary Cards"
                      description="Overview cards showing key performance metrics and review status"
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        {[
                          {
                            employee: "Alex Thompson",
                            role: "Software Engineer",
                            period: "Q4 2024",
                            overall: 4.2,
                            goals: 85,
                            feedback: 12,
                            status: "Completed"
                          },
                          {
                            employee: "Maria Garcia",
                            role: "Marketing Manager",
                            period: "Q4 2024",
                            overall: 4.6,
                            goals: 92,
                            feedback: 8,
                            status: "In Progress"
                          }
                        ].map((review, index) => (
                          <Card key={index} className="border-brown-200">
                            <div className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h3 className="font-semibold">{review.employee}</h3>
                                  <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                                    {review.role}
                                  </p>
                                </div>
                                <Badge 
                                  variant={review.status === "Completed" ? "default" : "secondary"}
                                  className={review.status === "Completed" 
                                    ? "bg-green-100 text-green-700" 
                                    : "bg-blue-100 text-blue-700"
                                  }
                                >
                                  {review.status}
                                </Badge>
                              </div>

                              <div className="text-sm mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
                                Review Period: {review.period}
                              </div>

                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm font-medium">Overall Rating</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="font-semibold">{review.overall}</span>
                                    <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>/ 5.0</span>
                                  </div>
                                </div>

                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm">Goal Achievement</span>
                                    <span className="text-sm font-medium">{review.goals}%</span>
                                  </div>
                                  <Progress value={review.goals} className="h-2" />
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm">Feedback Items</span>
                                  </div>
                                  <span className="font-medium">{review.feedback}</span>
                                </div>
                              </div>

                              <Separator className="my-4" />

                              <Button className="w-full" size="sm">
                                View Full Review
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </CardDemo>
                  </div>
                </div>
              </section>

              {/* Attendance Cards */}
              <section id="attendance" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.2 }}>
                      Attendance & Time Tracking
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Cards for tracking employee attendance, time logs, and work schedules.
                    </p>
                  </div>

                  <div className="space-y-8">
                    <CardDemo
                      title="Daily Attendance Cards"
                      description="Employee daily check-in status and time tracking"
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        {[
                          {
                            name: "John Smith",
                            avatar: "JS",
                            checkin: "9:15 AM",
                            checkout: "6:30 PM",
                            hours: "9h 15m",
                            status: "Present",
                            location: "Office"
                          },
                          {
                            name: "Emma Wilson",
                            avatar: "EW",
                            checkin: "8:45 AM",
                            checkout: "5:45 PM",
                            hours: "9h 00m",
                            status: "Present",
                            location: "Remote"
                          },
                          {
                            name: "James Brown",
                            avatar: "JB",
                            checkin: "-",
                            checkout: "-",
                            hours: "0h 00m",
                            status: "Absent",
                            location: "-"
                          }
                        ].map((attendance, index) => (
                          <Card key={index} className="border-brown-200">
                            <div className="p-4">
                              <div className="flex items-center gap-3 mb-4">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback className="bg-brown-100 text-brown-700 font-medium text-sm">
                                    {attendance.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-sm">{attendance.name}</h3>
                                  <div className="flex items-center gap-1 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${
                                      attendance.status === "Present" ? "bg-green-500" : "bg-red-500"
                                    }`}></div>
                                    <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                      {attendance.status}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span style={{ color: 'var(--color-text-tertiary)' }}>Check In</span>
                                  <span className="font-medium">{attendance.checkin}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span style={{ color: 'var(--color-text-tertiary)' }}>Check Out</span>
                                  <span className="font-medium">{attendance.checkout}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span style={{ color: 'var(--color-text-tertiary)' }}>Total Hours</span>
                                  <span className="font-medium">{attendance.hours}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span style={{ color: 'var(--color-text-tertiary)' }}>Location</span>
                                  <span className="font-medium">{attendance.location}</span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </CardDemo>
                  </div>
                </div>
              </section>

              {/* Leave Management */}
              <section id="leave-management" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.2 }}>
                      Leave Management Cards
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Cards for managing leave requests, vacation days, and time-off tracking.
                    </p>
                  </div>

                  <div className="space-y-8">
                    <CardDemo
                      title="Leave Request Cards"
                      description="Employee leave requests with approval workflow"
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        {[
                          {
                            employee: "Rachel Green",
                            avatar: "RG",
                            type: "Vacation",
                            dates: "Dec 20 - Dec 24, 2024",
                            days: 5,
                            reason: "Holiday vacation with family",
                            status: "Pending",
                            submitted: "2 days ago"
                          },
                          {
                            employee: "Ross Geller",
                            avatar: "RG",
                            type: "Sick Leave",
                            dates: "Dec 18, 2024",
                            days: 1,
                            reason: "Medical appointment",
                            status: "Approved",
                            submitted: "1 week ago"
                          },
                          {
                            employee: "Monica Bing",
                            avatar: "MB",
                            type: "Personal",
                            dates: "Jan 5 - Jan 7, 2025",
                            days: 3,
                            reason: "Moving to new apartment",
                            status: "Rejected",
                            submitted: "3 days ago"
                          }
                        ].map((leave, index) => (
                          <Card key={index} className="border-brown-200">
                            <div className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-10 h-10">
                                    <AvatarFallback className="bg-brown-100 text-brown-700 font-medium">
                                      {leave.avatar}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="font-medium">{leave.employee}</h3>
                                    <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                                      {leave.type}
                                    </p>
                                  </div>
                                </div>
                                <Badge 
                                  variant="secondary"
                                  className={
                                    leave.status === "Approved" ? "bg-green-100 text-green-700" :
                                    leave.status === "Rejected" ? "bg-red-100 text-red-700" :
                                    "bg-yellow-100 text-yellow-700"
                                  }
                                >
                                  {leave.status}
                                </Badge>
                              </div>

                              <div className="space-y-3 mb-4">
                                <div className="flex items-center gap-2">
                                  <CalendarIcon className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                                  <span className="text-sm">{leave.dates}</span>
                                  <Badge variant="outline" className="ml-auto text-xs">
                                    {leave.days} day{leave.days > 1 ? 's' : ''}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="w-4 h-4 mt-0.5" style={{ color: 'var(--color-text-tertiary)' }} />
                                  <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                                    {leave.reason}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                                  <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                    Submitted {leave.submitted}
                                  </span>
                                </div>
                              </div>

                              {leave.status === "Pending" && (
                                <div className="flex gap-2">
                                  <Button size="sm" className="flex-1">
                                    <CheckCircle className="w-3 h-3 mr-2" />
                                    Approve
                                  </Button>
                                  <Button size="sm" variant="outline" className="flex-1">
                                    <XCircle className="w-3 h-3 mr-2" />
                                    Reject
                                  </Button>
                                </div>
                              )}

                              {leave.status !== "Pending" && (
                                <Button size="sm" variant="outline" className="w-full">
                                  View Details
                                </Button>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </CardDemo>
                  </div>
                </div>
              </section>

              {/* Implementation */}
              <section id="implementation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.2 }}>
                      Implementation Guide
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Best practices and implementation details for using HR card components effectively.
                    </p>
                  </div>

                  <PreviewCard title="Complete HR Card Implementation">
                    <CodeBlock
                      code={`import React from 'react';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { 
  Mail, Calendar, MoreHorizontal, Star, 
  MessageSquare, Eye, Clock, MapPin 
} from 'lucide-react';

// Employee Profile Card
export const EmployeeProfileCard = ({ employee }) => {
  return (
    <Card className="border-brown-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-brown-100 text-brown-700 font-medium">
              {employee.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">{employee.name}</h3>
            <p className="text-xs text-brown-600 mb-1">{employee.role}</p>
            <p className="text-xs text-muted-foreground">{employee.department}</p>
          </div>
          <Badge 
            variant={employee.status === "Active" ? "default" : "secondary"}
            className={employee.status === "Active" 
              ? "bg-green-100 text-green-700 text-xs" 
              : "bg-orange-100 text-orange-700 text-xs"
            }
          >
            {employee.status}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{employee.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Joined {employee.joining}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 text-xs h-8">
            View Profile
          </Button>
          <Button size="sm" variant="ghost" className="px-2 h-8">
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Job Posting Card
export const JobPostingCard = ({ job }) => {
  return (
    <Card className="border-brown-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold mb-1">{job.title}</h3>
            <p className="text-sm text-brown-600 mb-2">{job.company}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {job.location}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {job.type}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm font-medium mb-2">{job.salary}</div>
          <div className="flex flex-wrap gap-1">
            {job.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
          <span>Posted {job.posted}</span>
          <span>{job.applicants} applicants</span>
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1">Apply Now</Button>
          <Button size="sm" variant="outline">View</Button>
        </div>
      </div>
    </Card>
  );
};

// Performance Review Card
export const PerformanceCard = ({ review }) => {
  return (
    <Card className="border-brown-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">{review.employee}</h3>
            <p className="text-sm text-muted-foreground">{review.role}</p>
          </div>
          <Badge 
            variant={review.status === "Completed" ? "default" : "secondary"}
            className={review.status === "Completed" 
              ? "bg-green-100 text-green-700" 
              : "bg-blue-100 text-blue-700"
            }
          >
            {review.status}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Overall Rating</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold">{review.overall}</span>
              <span className="text-sm text-muted-foreground">/ 5.0</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Goal Achievement</span>
              <span className="text-sm font-medium">{review.goals}%</span>
            </div>
            <Progress value={review.goals} className="h-2" />
          </div>
        </div>

        <Separator className="my-4" />
        
        <Button className="w-full" size="sm">
          View Full Review
        </Button>
      </div>
    </Card>
  );
};`}
                      language="tsx"
                      id="hr-cards-implementation"
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