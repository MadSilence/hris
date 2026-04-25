import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Search, ChevronRight, Menu, List, ListChecks, ListOrdered, Users, Building2, Bell, Calendar, Clock, Star, CheckCircle, XCircle, AlertTriangle, Info, MoreHorizontal, Plus, Edit, Trash2, Eye, Download, Upload, Filter, Grid3X3, Package, Award, Code2, ChevronDown, ChevronUp, DotIcon, Circle, Hash, Target, Activity, TrendingUp, Briefcase, UserCheck, Settings, Mail, Phone, MapPin, ExternalLink, FileText, Bookmark, Flag, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
import { categoryIcons, componentIcons } from './constants/iconMappings';

import { DesactLogo } from './shared/DesactLogo';

interface ListsPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const ListsPage: React.FC<ListsPageProps> = ({ 
  onBack, 
  components, 
  onComponentClick, 
  currentComponent 
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [checkedTasks, setCheckedTasks] = useState<Set<number>>(new Set([1, 3]));
  const [quickActionChecklist, setQuickActionChecklist] = useState<Set<number>>(new Set([1, 2]));
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

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

  const toggleTask = (taskId: number) => {
    const newChecked = new Set(checkedTasks);
    if (newChecked.has(taskId)) {
      newChecked.delete(taskId);
    } else {
      newChecked.add(taskId);
    }
    setCheckedTasks(newChecked);
  };

  const toggleQuickAction = (actionId: number) => {
    const newChecked = new Set(quickActionChecklist);
    if (newChecked.has(actionId)) {
      newChecked.delete(actionId);
    } else {
      newChecked.add(actionId);
    }
    setQuickActionChecklist(newChecked);
  };

  const toggleExpanded = (itemId: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'simple-lists', 'ordered-lists', 'definition-lists', 'interactive-lists', 'task-lists', 'employee-lists', 'notification-lists', 'hr-examples', 'best-practices', 'implementation'];
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
    { id: 'simple-lists', label: 'Simple Lists', icon: List },
    { id: 'ordered-lists', label: 'Ordered Lists', icon: ListOrdered },
    { id: 'definition-lists', label: 'Definition Lists', icon: Hash },
    { id: 'interactive-lists', label: 'Interactive Lists', icon: Target },
    { id: 'task-lists', label: 'Task Lists', icon: ListChecks },
    { id: 'employee-lists', label: 'Employee Lists', icon: Users },
    { id: 'notification-lists', label: 'Notifications', icon: Bell },
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
    { id: 1, name: "Sarah Johnson", role: "Senior Developer", department: "Engineering", avatar: "", email: "sarah.johnson@company.com", status: "Online" },
    { id: 2, name: "Michael Chen", role: "Product Manager", department: "Product", avatar: "", email: "michael.chen@company.com", status: "Away" },
    { id: 3, name: "Emily Davis", role: "UX Designer", department: "Design", avatar: "", email: "emily.davis@company.com", status: "Online" },
    { id: 4, name: "David Wilson", role: "Data Analyst", department: "Analytics", avatar: "", email: "david.wilson@company.com", status: "Offline" },
    { id: 5, name: "Lisa Rodriguez", role: "HR Manager", department: "Human Resources", avatar: "", email: "lisa.rodriguez@company.com", status: "Busy" }
  ];

  const sampleTasks = [
    { id: 1, title: "Complete Q4 performance reviews", priority: "High", dueDate: "Dec 15, 2024", assignee: "Lisa Rodriguez" },
    { id: 2, title: "Update employee handbook", priority: "Medium", dueDate: "Dec 20, 2024", assignee: "Michael Chen" },
    { id: 3, title: "Organize team building event", priority: "Low", dueDate: "Jan 10, 2025", assignee: "Sarah Johnson" },
    { id: 4, title: "Review salary adjustments", priority: "High", dueDate: "Dec 18, 2024", assignee: "Lisa Rodriguez" },
    { id: 5, title: "Conduct exit interviews", priority: "Medium", dueDate: "Dec 22, 2024", assignee: "Emily Davis" }
  ];

  const sampleNotifications = [
    { id: 1, type: "info", title: "New employee onboarding", message: "John Smith will start on Monday", time: "2 hours ago", read: false },
    { id: 2, type: "warning", title: "Performance review deadline", message: "3 reviews pending completion", time: "4 hours ago", read: false },
    { id: 3, type: "success", title: "Budget approval received", message: "Q1 2025 budget has been approved", time: "1 day ago", read: true },
    { id: 4, type: "error", title: "System maintenance", message: "HR system will be offline tonight", time: "2 days ago", read: true },
    { id: 5, type: "info", title: "Training session scheduled", message: "Leadership workshop on Friday", time: "3 days ago", read: true }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online': return 'bg-green-500';
      case 'Away': return 'bg-yellow-500';
      case 'Busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

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
              const IconComponent = categoryIcons[category] || Menu;
              
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
                        const ComponentIcon = componentIcons[component.name] || Menu;
                        
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
                  <h1 className="text-xl font-semibold">Lists & Collections</h1>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                    Organization
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Organized collections of data for employees, tasks, and content management
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
                      Lists & Collections Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Comprehensive list components for organizing employees, tasks, notifications, and content in HR applications. 
                      From simple lists to interactive task management systems.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <List className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Simple Lists</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Basic and styled lists for displaying information in organized collections.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <ListChecks className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Interactive Lists</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Task lists, checklists, and interactive collections with actions and states.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Employee Lists</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Specialized lists for employee directories, teams, and organizational structures.</p>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="List Types & Applications">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Basic List Types</h4>
                        <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li>• Simple unordered lists for information display</li>
                          <li>• Ordered lists for step-by-step processes</li>
                          <li>• Definition lists for term-description pairs</li>
                          <li>• Nested lists for hierarchical content</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Interactive Features</h4>
                        <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li>• Task lists with checkboxes and completion</li>
                          <li>• Employee lists with status indicators</li>
                          <li>• Notification lists with read/unread states</li>
                          <li>• Expandable lists with nested content</li>
                        </ul>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Simple Lists */}
              <section id="simple-lists" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Simple Lists</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Basic unordered and styled lists for displaying information collections.</p>
                  </div>

                  <PreviewCard title="Basic Unordered List">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <Circle className="w-2 h-2 fill-brown-600 text-brown-600" />
                        Employee handbook updates completed
                      </li>
                      <li className="flex items-center gap-2">
                        <Circle className="w-2 h-2 fill-brown-600 text-brown-600" />
                        New office safety protocols implemented
                      </li>
                      <li className="flex items-center gap-2">
                        <Circle className="w-2 h-2 fill-brown-600 text-brown-600" />
                        Q4 performance review cycle launched
                      </li>
                      <li className="flex items-center gap-2">
                        <Circle className="w-2 h-2 fill-brown-600 text-brown-600" />
                        Team building events scheduled
                      </li>
                    </ul>
                  </PreviewCard>

                  <PreviewCard title="Styled Department List">
                    <div className="space-y-3">
                      {[
                        { name: 'Engineering', count: 45, description: 'Software development and technical infrastructure' },
                        { name: 'Product Management', count: 12, description: 'Product strategy and roadmap planning' },
                        { name: 'Design', count: 8, description: 'User experience and interface design' },
                        { name: 'Human Resources', count: 4, description: 'Employee relations and organizational development' }
                      ].map((dept, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <Building2 className="w-5 h-5 text-gray-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{dept.name}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {dept.count} employees
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{dept.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Nested List Structure">
                    <ul className="space-y-2">
                      <li>
                        <div className="flex items-center gap-2 font-medium">
                          <Circle className="w-2 h-2 fill-brown-600 text-brown-600" />
                          Organizational Structure
                        </div>
                        <ul className="ml-4 mt-2 space-y-1">
                          <li className="flex items-center gap-2 text-sm text-gray-600">
                            <Circle className="w-1.5 h-1.5 fill-gray-400 text-gray-400" />
                            Executive Team (5 members)
                          </li>
                          <li className="flex items-center gap-2 text-sm text-gray-600">
                            <Circle className="w-1.5 h-1.5 fill-gray-400 text-gray-400" />
                            Department Heads (8 members)
                          </li>
                          <li className="flex items-center gap-2 text-sm text-gray-600">
                            <Circle className="w-1.5 h-1.5 fill-gray-400 text-gray-400" />
                            Team Leads (15 members)
                          </li>
                        </ul>
                      </li>
                      <li>
                        <div className="flex items-center gap-2 font-medium">
                          <Circle className="w-2 h-2 fill-brown-600 text-brown-600" />
                          Employee Benefits
                        </div>
                        <ul className="ml-4 mt-2 space-y-1">
                          <li className="flex items-center gap-2 text-sm text-gray-600">
                            <Circle className="w-1.5 h-1.5 fill-gray-400 text-gray-400" />
                            Health insurance and dental coverage
                          </li>
                          <li className="flex items-center gap-2 text-sm text-gray-600">
                            <Circle className="w-1.5 h-1.5 fill-gray-400 text-gray-400" />
                            401(k) retirement plan with matching
                          </li>
                          <li className="flex items-center gap-2 text-sm text-gray-600">
                            <Circle className="w-1.5 h-1.5 fill-gray-400 text-gray-400" />
                            Flexible work arrangements
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`// Basic styled list
<ul className="space-y-2">
  <li className="flex items-center gap-2">
    <Circle className="w-2 h-2 fill-brown-600 text-brown-600" />
    Employee handbook updates completed
  </li>
  <li className="flex items-center gap-2">
    <Circle className="w-2 h-2 fill-brown-600 text-brown-600" />
    New office safety protocols implemented
  </li>
</ul>

// Enhanced department list with descriptions
<div className="space-y-3">
  {departments.map((dept, index) => (
    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
      <Building2 className="w-5 h-5 text-gray-600 mt-0.5" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium">{dept.name}</h4>
          <Badge variant="secondary" className="text-xs">
            {dept.count} employees
          </Badge>
        </div>
        <p className="text-sm text-gray-600">{dept.description}</p>
      </div>
    </div>
  ))}
</div>`}
                      language="tsx"
                      id="simple-lists"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Ordered Lists */}
              <section id="ordered-lists" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Ordered Lists</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Sequential lists for processes, procedures, and step-by-step instructions.</p>
                  </div>

                  <PreviewCard title="Employee Onboarding Process">
                    <ol className="space-y-3">
                      {[
                        { title: 'Complete pre-boarding paperwork', description: 'Fill out tax forms, emergency contacts, and benefits enrollment' },
                        { title: 'IT setup and equipment assignment', description: 'Receive laptop, access credentials, and software licenses' },
                        { title: 'Orientation session attendance', description: 'Company overview, culture, policies, and safety training' },
                        { title: 'Department introduction meeting', description: 'Meet team members, review role expectations, and project assignments' },
                        { title: '30-day check-in with manager', description: 'Review progress, address questions, and set initial goals' }
                      ].map((step, index) => (
                        <li key={index} className="flex gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-medium text-sm flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{step.title}</h4>
                            <p className="text-sm text-gray-600">{step.description}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </PreviewCard>

                  <PreviewCard title="Performance Review Steps">
                    <ol className="space-y-4">
                      {[
                        { step: 'Self-Assessment', status: 'completed', description: 'Employee completes self-evaluation form' },
                        { step: 'Manager Review', status: 'in-progress', description: 'Manager evaluates performance and provides feedback' },
                        { step: 'Peer Feedback', status: 'pending', description: 'Collect input from colleagues and team members' },
                        { step: 'Goal Setting', status: 'pending', description: 'Establish objectives for the next review period' },
                        { step: 'Final Meeting', status: 'pending', description: 'Discussion of results and career development' }
                      ].map((step, index) => (
                        <li key={index} className="flex gap-4">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium flex-shrink-0 ${
                            step.status === 'completed' ? 'bg-green-100 text-green-700' :
                            step.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {step.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{step.step}</h4>
                              <Badge 
                                variant="secondary"
                                className={`text-xs ${
                                  step.status === 'completed' ? 'bg-green-100 text-green-700' :
                                  step.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {step.status.replace('-', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{step.description}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`// Step-by-step process with status indicators
<ol className="space-y-4">
  {steps.map((step, index) => (
    <li key={index} className="flex gap-4">
      <div className={\`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium flex-shrink-0 \${
        step.status === 'completed' ? 'bg-green-100 text-green-700' :
        step.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
        'bg-gray-100 text-gray-500'
      }\`}>
        {step.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : index + 1}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium">{step.title}</h4>
          <Badge 
            variant="secondary"
            className={\`text-xs \${getStatusColor(step.status)}\`}
          >
            {step.status.replace('-', ' ')}
          </Badge>
        </div>
        <p className="text-sm text-gray-600">{step.description}</p>
      </div>
    </li>
  ))}
</ol>`}
                      language="tsx"
                      id="ordered-lists"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Definition Lists */}
              <section id="definition-lists" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Definition Lists</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Term-definition pairs for employee information, policies, and HR terminology.</p>
                  </div>

                  <PreviewCard title="Employee Information">
                    <dl className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:gap-4">
                        <dt className="font-medium text-gray-900 sm:w-32">Employee ID</dt>
                        <dd className="text-gray-600">EMP-2024-1156</dd>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:gap-4">
                        <dt className="font-medium text-gray-900 sm:w-32">Department</dt>
                        <dd className="text-gray-600">Engineering - Frontend Team</dd>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:gap-4">
                        <dt className="font-medium text-gray-900 sm:w-32">Start Date</dt>
                        <dd className="text-gray-600">March 15, 2022</dd>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:gap-4">
                        <dt className="font-medium text-gray-900 sm:w-32">Manager</dt>
                        <dd className="text-gray-600">Sarah Johnson (sarah.johnson@company.com)</dd>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:gap-4">
                        <dt className="font-medium text-gray-900 sm:w-32">Location</dt>
                        <dd className="text-gray-600">New York Office - Floor 12, Desk 45</dd>
                      </div>
                    </dl>
                  </PreviewCard>

                  <PreviewCard title="HR Policy Definitions">
                    <dl className="space-y-6">
                      <div>
                        <dt className="font-medium text-gray-900 mb-2">Remote Work Policy</dt>
                        <dd className="text-gray-600 text-sm leading-relaxed">
                          Employees may work remotely up to 3 days per week with manager approval. 
                          Remote work agreements must be renewed quarterly and include specific 
                          performance metrics and communication requirements.
                        </dd>
                      </div>
                      <Separator />
                      <div>
                        <dt className="font-medium text-gray-900 mb-2">Professional Development Budget</dt>
                        <dd className="text-gray-600 text-sm leading-relaxed">
                          Each employee is allocated $2,500 annually for professional development 
                          activities including conferences, courses, certifications, and training materials.
                          Budget resets on January 1st and unused funds do not roll over.
                        </dd>
                      </div>
                      <Separator />
                      <div>
                        <dt className="font-medium text-gray-900 mb-2">Performance Improvement Plan (PIP)</dt>
                        <dd className="text-gray-600 text-sm leading-relaxed">
                          A structured 90-day program designed to help employees meet performance 
                          expectations. Includes specific goals, regular check-ins, and additional 
                          support resources to ensure success.
                        </dd>
                      </div>
                    </dl>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`// Basic definition list layout
<dl className="space-y-4">
  <div className="flex flex-col sm:flex-row sm:gap-4">
    <dt className="font-medium text-gray-900 sm:w-32">Employee ID</dt>
    <dd className="text-gray-600">EMP-2024-1156</dd>
  </div>
  <div className="flex flex-col sm:flex-row sm:gap-4">
    <dt className="font-medium text-gray-900 sm:w-32">Department</dt>
    <dd className="text-gray-600">Engineering - Frontend Team</dd>
  </div>
</dl>

// Enhanced definition list with descriptions
<dl className="space-y-6">
  <div>
    <dt className="font-medium text-gray-900 mb-2">Remote Work Policy</dt>
    <dd className="text-gray-600 text-sm leading-relaxed">
      Employees may work remotely up to 3 days per week with manager approval.
      Remote work agreements must be renewed quarterly and include specific
      performance metrics and communication requirements.
    </dd>
  </div>
  <Separator />
  <div>
    <dt className="font-medium text-gray-900 mb-2">Professional Development Budget</dt>
    <dd className="text-gray-600 text-sm leading-relaxed">
      Each employee is allocated $2,500 annually for professional development
      activities including conferences, courses, and certifications.
    </dd>
  </div>
</dl>`}
                      language="tsx"
                      id="definition-lists"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Task Lists */}
              <section id="task-lists" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Task Lists</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Interactive task management with checkboxes, priorities, and completion tracking.</p>
                  </div>

                  <PreviewCard title="HR Task Management">
                    <div className="space-y-3">
                      {sampleTasks.map((task) => (
                        <div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          checkedTasks.has(task.id) 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}>
                          <Checkbox 
                            checked={checkedTasks.has(task.id)}
                            onCheckedChange={() => toggleTask(task.id)}
                            className="flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className={`font-medium ${checkedTasks.has(task.id) ? 'line-through text-gray-500' : ''}`}>
                                  {task.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant="secondary" 
                                    className={`text-xs ${getPriorityColor(task.priority)}`}
                                  >
                                    {task.priority}
                                  </Badge>
                                  <span className="text-xs text-gray-500">Due: {task.dueDate}</span>
                                  <span className="text-xs text-gray-500">Assigned to: {task.assignee}</span>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="flex-shrink-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                      <span>{checkedTasks.size} of {sampleTasks.length} tasks completed</span>
                      <span>{Math.round((checkedTasks.size / sampleTasks.length) * 100)}% complete</span>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Quick Action Checklist">
                    <div className="space-y-2">
                      {[
                        { id: 1, text: "Review new employee applications" },
                        { id: 2, text: "Send weekly team update email" },
                        { id: 3, text: "Schedule quarterly all-hands meeting" },
                        { id: 4, text: "Update company benefits documentation" },
                        { id: 5, text: "Prepare monthly HR metrics report" }
                      ].map((item) => (
                        <div key={item.id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
                          <Checkbox 
                            checked={quickActionChecklist.has(item.id)}
                            onCheckedChange={() => toggleQuickAction(item.id)}
                            className="flex-shrink-0"
                          />
                          <span className={`text-sm ${quickActionChecklist.has(item.id) ? 'line-through text-gray-500' : ''}`}>
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MoreHorizontal } from 'lucide-react';

// Task list with priorities and actions
const TaskList = ({ tasks, checkedTasks, onToggle }) => (
  <div className="space-y-3">
    {tasks.map((task) => (
      <div 
        key={task.id} 
        className={\`flex items-center gap-3 p-3 rounded-lg border transition-colors \${
          checkedTasks.has(task.id) 
            ? 'bg-green-50 border-green-200' 
            : 'bg-white border-gray-200 hover:bg-gray-50'
        }\`}
      >
        <Checkbox 
          checked={checkedTasks.has(task.id)}
          onCheckedChange={() => onToggle(task.id)}
          className="flex-shrink-0"
        />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className={\`font-medium \${
                checkedTasks.has(task.id) ? 'line-through text-gray-500' : ''
              }\`}>
                {task.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={\`text-xs \${getPriorityColor(task.priority)}\`}>
                  {task.priority}
                </Badge>
                <span className="text-xs text-gray-500">Due: {task.dueDate}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    ))}
  </div>
);`}
                      language="tsx"
                      id="task-lists"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Employee Lists */}
              <section id="employee-lists" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Employee Lists</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Employee directories with avatars, status indicators, and contact information.</p>
                  </div>

                  <PreviewCard title="Team Directory">
                    <div className="space-y-3">
                      {sampleEmployees.map((employee) => (
                        <div key={employee.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={employee.avatar} />
                              <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(employee.status)}`}></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium truncate">{employee.name}</h4>
                                <p className="text-sm text-gray-600 truncate">{employee.role}</p>
                                <p className="text-xs text-gray-500">{employee.department}</p>
                              </div>
                              <div className="flex items-center gap-2 ml-2">
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${
                                    employee.status === 'Online' ? 'bg-green-100 text-green-700' :
                                    employee.status === 'Away' ? 'bg-yellow-100 text-yellow-700' :
                                    employee.status === 'Busy' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {employee.status}
                                </Badge>
                                <Button variant="ghost" size="sm">
                                  <Mail className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Expandable Employee Cards">
                    <div className="space-y-3">
                      {sampleEmployees.slice(0, 3).map((employee) => (
                        <div key={employee.id} className="border rounded-lg">
                          <div 
                            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleExpanded(employee.id)}
                          >
                            <Avatar className="h-12 w-12 flex-shrink-0">
                              <AvatarImage src={employee.avatar} />
                              <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">{employee.name}</h4>
                                  <p className="text-sm text-gray-600">{employee.role}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {employee.department}
                                  </Badge>
                                  {expandedItems.has(employee.id) ? 
                                    <ChevronUp className="w-4 h-4 text-gray-400" /> : 
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                          {expandedItems.has(employee.id) && (
                            <div className="px-4 pb-4 border-t bg-gray-50">
                              <div className="pt-3 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="w-4 h-4 text-gray-400" />
                                  <span>{employee.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Building2 className="w-4 h-4 text-gray-400" />
                                  <span>{employee.department}</span>
                                </div>
                                <div className="flex gap-2 mt-3">
                                  <Button size="sm" variant="outline">
                                    <MessageCircle className="w-3 h-3 mr-1" />
                                    Message
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Schedule
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Mail, ChevronDown, ChevronUp } from 'lucide-react';

// Employee list with status indicators
const EmployeeList = ({ employees, expandedItems, onToggleExpanded }) => (
  <div className="space-y-3">
    {employees.map((employee) => (
      <div key={employee.id} className="border rounded-lg">
        <div 
          className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => onToggleExpanded(employee.id)}
        >
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={employee.avatar} />
              <AvatarFallback>{employee.initials}</AvatarFallback>
            </Avatar>
            <div className={\`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white \${getStatusColor(employee.status)}\`}></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{employee.name}</h4>
                <p className="text-sm text-gray-600">{employee.role}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {employee.status}
                </Badge>
                <Button variant="ghost" size="sm">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        {expandedItems.has(employee.id) && (
          <div className="px-4 pb-4 border-t bg-gray-50">
            {/* Expanded content */}
          </div>
        )}
      </div>
    ))}
  </div>
);`}
                      language="tsx"
                      id="employee-lists"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Notification Lists */}
              <section id="notification-lists" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Notification Lists</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Notification feeds with read/unread states, types, and timestamps.</p>
                  </div>

                  <PreviewCard title="HR Notifications">
                    <div className="space-y-1">
                      {sampleNotifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                            notification.read 
                              ? 'bg-white hover:bg-gray-50' 
                              : 'bg-brown-50 hover:bg-brown-100 border-l-4 border-brown-500'
                          }`}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className={`font-medium text-sm ${notification.read ? 'text-gray-900' : 'text-gray-900'}`}>
                                  {notification.title}
                                </h4>
                                <p className={`text-sm mt-1 ${notification.read ? 'text-gray-600' : 'text-gray-700'}`}>
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-brown-600 rounded-full flex-shrink-0 mt-2"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {sampleNotifications.filter(n => !n.read).length} unread notifications
                        </span>
                        <Button variant="ghost" size="sm">
                          Mark all as read
                        </Button>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Activity Feed">
                    <div className="space-y-4">
                      {[
                        { type: 'user-joined', user: 'Sarah Johnson', action: 'joined the Engineering team', time: '2 hours ago', avatar: '' },
                        { type: 'task-completed', user: 'Michael Chen', action: 'completed Q4 budget review', time: '4 hours ago', avatar: '' },
                        { type: 'document-updated', user: 'Lisa Rodriguez', action: 'updated Employee Handbook v2.1', time: '1 day ago', avatar: '' },
                        { type: 'meeting-scheduled', user: 'Emily Davis', action: 'scheduled All-Hands Meeting for Dec 20', time: '2 days ago', avatar: '' }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={activity.avatar} />
                            <AvatarFallback className="text-xs">{activity.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">
                              <span className="font-medium">{activity.user}</span>
                              {' '}
                              <span className="text-gray-600">{activity.action}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`// Notification list with read/unread states
const NotificationList = ({ notifications }) => (
  <div className="space-y-1">
    {notifications.map((notification) => (
      <div 
        key={notification.id} 
        className={\`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer \${
          notification.read 
            ? 'bg-white hover:bg-gray-50' 
            : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500'
        }\`}
      >
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-sm">
                {notification.title}
              </h4>
              <p className="text-sm mt-1 text-gray-600">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
            </div>
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Helper function for notification icons
const getNotificationIcon = (type) => {
  switch (type) {
    case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
    default: return <Info className="w-4 h-4 text-blue-600" />;
  }
};`}
                      language="tsx"
                      id="notification-lists"
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
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Complete examples for common HR list patterns and use cases.</p>
                  </div>

                  <PreviewCard title="Employee Dashboard - My Team">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Direct Reports (8)</h4>
                        <Button size="sm" variant="outline">
                          <Plus className="w-4 h-4 mr-1" />
                          Add Member
                        </Button>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        {sampleEmployees.slice(0, 4).map((employee) => (
                          <div key={employee.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={employee.avatar} />
                                <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h5 className="font-medium">{employee.name}</h5>
                                <p className="text-sm text-gray-600">{employee.role}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Last Review:</span>
                                <span>Q3 2024</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Next 1:1:</span>
                                <span>Dec 18</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <Badge variant="secondary" className={`text-xs ${
                                  employee.status === 'Online' ? 'bg-green-100 text-green-700' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {employee.status}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 mt-4">
                              <Button size="sm" variant="outline" className="flex-1">
                                <Calendar className="w-3 h-3 mr-1" />
                                Schedule
                              </Button>
                              <Button size="sm" variant="outline">
                                <Eye className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Recruitment Pipeline">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Open Positions</h4>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          New Position
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {[
                          { position: 'Senior Frontend Developer', applicants: 24, interviews: 8, offers: 2, status: 'Active' },
                          { position: 'Product Manager', applicants: 31, interviews: 12, offers: 1, status: 'Active' },
                          { position: 'UX Designer', applicants: 18, interviews: 6, offers: 3, status: 'On Hold' },
                          { position: 'Data Scientist', applicants: 42, interviews: 15, offers: 0, status: 'Active' }
                        ].map((position, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h5 className="font-medium">{position.position}</h5>
                                <p className="text-sm text-gray-600">Engineering Department</p>
                              </div>
                              <Badge 
                                variant="secondary"
                                className={`${
                                  position.status === 'Active' ? 'bg-green-100 text-green-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {position.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 mb-3">
                              <div className="text-center">
                                <p className="text-lg font-semibold">{position.applicants}</p>
                                <p className="text-xs text-gray-600">Applications</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-semibold">{position.interviews}</p>
                                <p className="text-xs text-gray-600">Interviews</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-semibold">{position.offers}</p>
                                <p className="text-xs text-gray-600">Offers</p>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex-1">
                                View Candidates
                              </Button>
                              <Button size="sm" variant="outline">
                                <Settings className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example - HR Dashboard">
                    <CodeBlock
                      code={`// Employee team dashboard component
const TeamDashboard = ({ employees, onSchedule, onView }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h4 className="font-medium">Direct Reports ({employees.length})</h4>
      <Button size="sm" variant="outline">
        <Plus className="w-4 h-4 mr-1" />
        Add Member
      </Button>
    </div>
    
    <div className="grid md:grid-cols-2 gap-4">
      {employees.map((employee) => (
        <div key={employee.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={employee.avatar} />
              <AvatarFallback>{employee.initials}</AvatarFallback>
            </Avatar>
            <div>
              <h5 className="font-medium">{employee.name}</h5>
              <p className="text-sm text-gray-600">{employee.role}</p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Last Review:</span>
              <span>Q3 2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <Badge variant="secondary" className={\`text-xs \${getStatusColor(employee.status)}\`}>
                {employee.status}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => onSchedule(employee.id)}>
              <Calendar className="w-3 h-3 mr-1" />
              Schedule
            </Button>
            <Button size="sm" variant="outline" onClick={() => onView(employee.id)}>
              <Eye className="w-3 h-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  </div>
);`}
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
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Guidelines for creating effective and user-friendly list components.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Visual Hierarchy">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Use consistent spacing</span>
                            <p className="text-sm text-gray-600">Maintain uniform gaps between list items for better scanning.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Establish clear hierarchy</span>
                            <p className="text-sm text-gray-600">Use typography and color to distinguish between primary and secondary information.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Group related items</span>
                            <p className="text-sm text-gray-600">Use separators and white space to organize content logically.</p>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Interaction Design">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Provide visual feedback</span>
                            <p className="text-sm text-gray-600">Use hover states and selection indicators for interactive elements.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Include status indicators</span>
                            <p className="text-sm text-gray-600">Show completion states, read/unread status, and other relevant information.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Enable batch actions</span>
                            <p className="text-sm text-gray-600">Allow users to select multiple items for bulk operations.</p>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="List Type Selection Guide">
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                          <h4 className="font-medium text-blue-900 mb-2">Simple Lists</h4>
                          <ul className="list-disc pl-4 text-sm text-blue-800 space-y-1">
                            <li>Basic information display</li>
                            <li>Feature lists and benefits</li>
                            <li>Department or team listings</li>
                            <li>Static content organization</li>
                          </ul>
                        </div>
                        
                        <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                          <h4 className="font-medium text-green-900 mb-2">Task Lists</h4>
                          <ul className="list-disc pl-4 text-sm text-green-800 space-y-1">
                            <li>To-do items and action items</li>
                            <li>Project milestones</li>
                            <li>Checklist workflows</li>
                            <li>Progress tracking</li>
                          </ul>
                        </div>
                        
                        <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                          <h4 className="font-medium text-purple-900 mb-2">Employee Lists</h4>
                          <ul className="list-disc pl-4 text-sm text-purple-800 space-y-1">
                            <li>Team directories</li>
                            <li>Contact information</li>
                            <li>Organizational charts</li>
                            <li>Role-based groupings</li>
                          </ul>
                        </div>
                        
                        <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                          <h4 className="font-medium text-orange-900 mb-2">Notifications</h4>
                          <ul className="list-disc pl-4 text-sm text-orange-800 space-y-1">
                            <li>Activity feeds</li>
                            <li>Alert systems</li>
                            <li>Status updates</li>
                            <li>Communication threads</li>
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
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Technical implementation patterns and reusable components for list interfaces.</p>
                  </div>

                  <PreviewCard title="Reusable List Component">
                    <CodeBlock
                      code={`import React from 'react';
import { cn } from './lib/utils';

interface ListItemProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

const ListItem: React.FC<ListItemProps> = ({ 
  children, 
  className, 
  hover = true, 
  selected = false, 
  onClick 
}) => (
  <div
    className={cn(
      "p-3 rounded-lg transition-colors",
      hover && "hover:bg-gray-50",
      selected && "bg-blue-50 border-blue-200",
      onClick && "cursor-pointer",
      className
    )}
    onClick={onClick}
  >
    {children}
  </div>
);

interface ListProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'compact' | 'comfortable' | 'spacious';
}

const List: React.FC<ListProps> = ({ children, className, spacing = 'comfortable' }) => (
  <div
    className={cn(
      spacing === 'compact' && "space-y-1",
      spacing === 'comfortable' && "space-y-2", 
      spacing === 'spacious' && "space-y-4",
      className
    )}
  >
    {children}
  </div>
);

// Usage example
const EmployeeList = ({ employees, selectedId, onSelect }) => (
  <List spacing="comfortable">
    {employees.map((employee) => (
      <ListItem
        key={employee.id}
        selected={selectedId === employee.id}
        onClick={() => onSelect(employee.id)}
      >
        <div className="flex items-center gap-3">
          <Avatar src={employee.avatar} />
          <div>
            <h4 className="font-medium">{employee.name}</h4>
            <p className="text-sm text-gray-600">{employee.role}</p>
          </div>
        </div>
      </ListItem>
    ))}
  </List>
);`}
                      language="tsx"
                      id="reusable-components"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>

                  <PreviewCard title="Interactive List with State Management">
                    <CodeBlock
                      code={`import React, { useState, useCallback } from 'react';
import { Checkbox } from './ui/checkbox';

interface UseListSelectionProps {
  items: any[];
  multiSelect?: boolean;
}

const useListSelection = ({ items, multiSelect = false }: UseListSelectionProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  const toggleSelection = useCallback((id: string | number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (multiSelect) {
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
      } else {
        newSet.clear();
        newSet.add(id);
      }
      return newSet;
    });
  }, [multiSelect]);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map(item => item.id)));
  }, [items]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback((id: string | number) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  const selectedItems = items.filter(item => selectedIds.has(item.id));

  return {
    selectedIds,
    selectedItems,
    isSelected,
    toggleSelection,
    selectAll,
    deselectAll,
    hasSelection: selectedIds.size > 0,
    selectionCount: selectedIds.size
  };
};

// Interactive task list with bulk actions
const TaskList = ({ tasks, onUpdate, onDelete }) => {
  const {
    selectedIds,
    selectedItems,
    isSelected,
    toggleSelection,
    selectAll,
    deselectAll,
    hasSelection,
    selectionCount
  } = useListSelection({ items: tasks, multiSelect: true });

  const handleBulkComplete = () => {
    selectedItems.forEach(task => {
      onUpdate(task.id, { completed: true });
    });
    deselectAll();
  };

  const handleBulkDelete = () => {
    selectedItems.forEach(task => {
      onDelete(task.id);
    });
    deselectAll();
  };

  return (
    <div className="space-y-4">
      {/* Bulk actions */}
      {hasSelection && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <span className="text-sm font-medium">
            {selectionCount} task{selectionCount > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleBulkComplete}>
              Mark Complete
            </Button>
            <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
              Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={deselectAll}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Task list */}
      <List>
        {tasks.map((task) => (
          <ListItem
            key={task.id}
            selected={isSelected(task.id)}
            className="border"
          >
            <div className="flex items-center gap-3">
              <Checkbox
                checked={isSelected(task.id)}
                onCheckedChange={() => toggleSelection(task.id)}
              />
              <div className="flex-1">
                <h4 className="font-medium">{task.title}</h4>
                <p className="text-sm text-gray-600">{task.description}</p>
              </div>
              <Badge variant="secondary">{task.priority}</Badge>
            </div>
          </ListItem>
        ))}
      </List>
    </div>
  );
};`}
                      language="tsx"
                      id="interactive-lists"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>

                  <PreviewCard title="Virtualized List for Large Datasets">
                    <CodeBlock
                      code={`import React from 'react';
import { FixedSizeList as List } from 'react-window';

interface VirtualizedListProps {
  items: any[];
  height: number;
  itemHeight: number;
  renderItem: (props: { index: number; style: React.CSSProperties }) => React.ReactNode;
}

const VirtualizedList: React.FC<VirtualizedListProps> = ({
  items,
  height,
  itemHeight,
  renderItem
}) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      {renderItem({ index, style })}
    </div>
  );

  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      width="100%"
    >
      {Row}
    </List>
  );
};

// Large employee list with virtualization
const LargeEmployeeList = ({ employees }) => {
  const renderEmployeeItem = ({ index }) => {
    const employee = employees[index];
    return (
      <div className="flex items-center gap-3 p-4 border-b">
        <Avatar src={employee.avatar} />
        <div>
          <h4 className="font-medium">{employee.name}</h4>
          <p className="text-sm text-gray-600">{employee.role}</p>
        </div>
      </div>
    );
  };

  return (
    <VirtualizedList
      items={employees}
      height={400}
      itemHeight={64}
      renderItem={renderEmployeeItem}
    />
  );
};`}
                      language="tsx"
                      id="virtualized-lists"
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