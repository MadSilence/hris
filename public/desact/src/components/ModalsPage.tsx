import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Search, ChevronRight, Menu, X, AlertTriangle, CheckCircle, Info, Users, FileText, Shield, Heart, DollarSign, Clock, Calendar, Building2, Award, Briefcase, Plus, Edit, Trash2, Eye, Download, Upload, Settings, User, Mail, Phone, Globe, Key, Lock, AlertCircle, HelpCircle, Star, Target, TrendingUp, Package, Layers, Grid3X3, List, Code2 } from 'lucide-react';
import { DesactLogo } from './shared/DesactLogo';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { DialogClose } from './ui/dialog';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
import { categoryIcons, componentIcons } from './constants/iconMappings';

interface ModalsPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const ModalsPage: React.FC<ModalsPageProps> = ({ 
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
      const sections = ['overview', 'basic-modals', 'confirmation-dialogs', 'form-modals', 'content-modals', 'hr-workflows', 'best-practices'];
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
    { id: 'basic-modals', label: 'Basic Modals', icon: Package },
    { id: 'confirmation-dialogs', label: 'Confirmation Dialogs', icon: AlertTriangle },
    { id: 'form-modals', label: 'Form Modals', icon: FileText },
    { id: 'content-modals', label: 'Content Modals', icon: Eye },
    { id: 'hr-workflows', label: 'HR Workflows', icon: Users },
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
                  <h1 className="text-xl font-semibold">Modals & Dialogs</h1>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                    Overlays
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Interactive modal dialogs and overlay components for HR workflows
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
                      Modal & Dialog Components
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Interactive modal dialogs and overlays for HR applications. Includes confirmation dialogs, 
                      form modals, content viewers, and specialized HR workflow components with accessibility support.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Package className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Basic Modals</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                        Simple dialog boxes for information display and basic interactions.
                      </p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Confirmation Dialogs</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                        Confirmation and alert dialogs for critical actions and warnings.
                      </p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Form Modals</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                        Complex forms and data entry interfaces within modal containers.
                      </p>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Modal Features">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Accessibility Features</h4>
                        <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li>• Focus management and keyboard navigation</li>
                          <li>• ARIA labels and screen reader support</li>
                          <li>• Escape key and overlay click to close</li>
                          <li>• Focus trap within modal content</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">HR Applications</h4>
                        <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li>• Employee profile editing and management</li>
                          <li>• Performance review workflows</li>
                          <li>• Document upload and approval processes</li>
                          <li>• Quick actions and bulk operations</li>
                        </ul>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Basic Modals */}
              <section id="basic-modals" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Basic Modals</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Simple dialog components for information display and basic user interactions.</p>
                  </div>

                  <PreviewCard title="Employee Profile Modal">
                    <div className="flex flex-wrap gap-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>View Profile</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <User className="w-5 h-5 text-brown-600" />
                              Employee Profile
                            </DialogTitle>
                            <DialogDescription>
                              View and manage employee information
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-brown-100 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 text-brown-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold">Sarah Johnson</h3>
                                <p className="text-sm text-gray-600">Senior HR Specialist</p>
                                <Badge className="bg-green-100 text-green-700 text-xs mt-1">Active</Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Employee ID:</span>
                                <p className="font-medium">EMP-2024-001</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Department:</span>
                                <p className="font-medium">Human Resources</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Start Date:</span>
                                <p className="font-medium">March 1, 2024</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Manager:</span>
                                <p className="font-medium">Michael Chen</p>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Close</Button>
                            </DialogClose>
                            <Button>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Profile
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            Document Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-blue-600" />
                              Employee Handbook
                            </DialogTitle>
                            <DialogDescription>
                              Document preview and download options
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="bg-gray-50 border rounded-lg p-6 text-center">
                              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                              <h3 className="font-medium mb-2">Employee Handbook 2024</h3>
                              <p className="text-sm text-gray-600 mb-4">PDF • 2.4 MB • 45 pages</p>
                              <p className="text-xs text-gray-500">
                                Last updated: December 15, 2024
                              </p>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Info className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-blue-800">This document contains important company policies</span>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Close</Button>
                            </DialogClose>
                            <Button>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from './ui/dialog';

const EmployeeProfileModal = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button>View Profile</Button>
    </DialogTrigger>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-brown-600" />
          Employee Profile
        </DialogTitle>
        <DialogDescription>
          View and manage employee information
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-brown-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-brown-600" />
          </div>
          <div>
            <h3 className="font-semibold">Sarah Johnson</h3>
            <p className="text-sm text-gray-600">Senior HR Specialist</p>
            <Badge className="bg-green-100 text-green-700 text-xs mt-1">Active</Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Employee ID:</span>
            <p className="font-medium">EMP-2024-001</p>
          </div>
          <div>
            <span className="text-gray-600">Department:</span>
            <p className="font-medium">Human Resources</p>
          </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose>
        <Button>
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);`}
                      language="tsx"
                      id="basic-modals"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Confirmation Dialogs */}
              <section id="confirmation-dialogs" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Confirmation Dialogs</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Alert and confirmation dialogs for critical actions and important decisions.</p>
                  </div>

                  <PreviewCard title="HR Action Confirmations">
                    <div className="flex flex-wrap gap-3">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Employee
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                              <AlertTriangle className="w-5 h-5" />
                              Delete Employee Record
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the employee record 
                              for <strong>Sarah Johnson (EMP-2024-001)</strong> and remove all associated data 
                              from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-red-800 mb-1">Warning</h4>
                                <p className="text-sm text-red-700">
                                  This will also delete all performance reviews, time-off records, 
                                  and other related HR data.
                                </p>
                              </div>
                            </div>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                              Delete Employee
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve Request
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="w-5 h-5" />
                              Approve Time-Off Request
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              You are about to approve the time-off request for <strong>Sarah Johnson</strong>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <h4 className="font-medium text-green-800 mb-3">Request Details</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-green-700">Dates:</span>
                                  <p className="font-medium text-green-800">Dec 23 - Dec 27, 2024</p>
                                </div>
                                <div>
                                  <span className="text-green-700">Duration:</span>
                                  <p className="font-medium text-green-800">5 business days</p>
                                </div>
                                <div>
                                  <span className="text-green-700">Type:</span>
                                  <p className="font-medium text-green-800">Vacation</p>
                                </div>
                                <div>
                                  <span className="text-green-700">Remaining PTO:</span>
                                  <p className="font-medium text-green-800">15 days</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-green-600 hover:bg-green-700">
                              Approve Request
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Security Alert
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
                              <AlertCircle className="w-5 h-5" />
                              Security Alert
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Multiple failed login attempts detected for your account.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="space-y-4">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                                <div>
                                  <h4 className="font-medium text-orange-800 mb-2">Suspicious Activity Detected</h4>
                                  <div className="space-y-2 text-sm text-orange-700">
                                    <p><strong>Time:</strong> Today at 2:45 PM</p>
                                    <p><strong>Location:</strong> Unknown location (IP: 192.168.1.***)</p>
                                    <p><strong>Attempts:</strong> 5 failed login attempts</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-sm text-blue-800">
                                <strong>Recommended:</strong> Change your password and enable two-factor authentication.
                              </p>
                            </div>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Dismiss</AlertDialogCancel>
                            <AlertDialogAction>
                              <Lock className="w-4 h-4 mr-2" />
                              Change Password
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

const ConfirmationDialog = () => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="destructive">
        <Trash2 className="w-4 h-4 mr-2" />
        Delete Employee
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          Delete Employee Record
        </AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete the employee record 
          for <strong>Sarah Johnson (EMP-2024-001)</strong> and remove all associated data 
          from our servers.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-800 mb-1">Warning</h4>
            <p className="text-sm text-red-700">
              This will also delete all performance reviews, time-off records, 
              and other related HR data.
            </p>
          </div>
        </div>
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction className="bg-red-600 hover:bg-red-700">
          Delete Employee
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);`}
                      language="tsx"
                      id="confirmation-dialogs"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Form Modals */}
              <section id="form-modals" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Form Modals</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Complex forms and data entry interfaces within modal containers.</p>
                  </div>

                  <PreviewCard title="HR Form Modals">
                    <div className="flex flex-wrap gap-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Employee
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Users className="w-5 h-5 text-brown-600" />
                              Add New Employee
                            </DialogTitle>
                            <DialogDescription>
                              Enter the employee information to create a new record
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">First Name</label>
                                <Input placeholder="Enter first name" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Last Name</label>
                                <Input placeholder="Enter last name" />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input type="email" placeholder="Enter email address" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Phone</label>
                                <Input placeholder="Enter phone number" />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Department</label>
                                <Input placeholder="Select department" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Job Title</label>
                                <Input placeholder="Enter job title" />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Start Date</label>
                                <Input type="date" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Salary</label>
                                <Input placeholder="Enter annual salary" />
                              </div>
                            </div>
                            
                            <div className="p-4 bg-brown-50 rounded-lg">
                              <h4 className="font-medium mb-3">Additional Information</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Employee ID</label>
                                  <Input placeholder="Auto-generated" disabled />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Manager</label>
                                  <Input placeholder="Select manager" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Create Employee
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Document
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-blue-600" />
                              Upload Employee Document
                            </DialogTitle>
                            <DialogDescription>
                              Upload and categorize employee documents
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Employee</label>
                              <Input placeholder="Search employee..." />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Document Type</label>
                              <Input placeholder="Select document type..." />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Document Title</label>
                              <Input placeholder="Enter document title" />
                            </div>
                            
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <h3 className="font-medium text-gray-900 mb-2">Upload File</h3>
                              <p className="text-sm text-gray-600 mb-4">
                                Drag and drop your file here, or click to browse
                              </p>
                              <Button variant="outline" size="sm">
                                Choose File
                              </Button>
                              <p className="text-xs text-gray-500 mt-2">
                                Supports: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Notes (Optional)</label>
                              <Input placeholder="Add notes about this document..." />
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Document
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from './ui/dialog';

const AddEmployeeModal = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button>
        <Plus className="w-4 h-4 mr-2" />
        Add Employee
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-brown-600" />
          Add New Employee
        </DialogTitle>
        <DialogDescription>
          Enter the employee information to create a new record
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">First Name</label>
            <Input placeholder="Enter first name" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Last Name</label>
            <Input placeholder="Enter last name" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input type="email" placeholder="Enter email address" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <Input placeholder="Enter phone number" />
          </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button>
          <CheckCircle className="w-4 h-4 mr-2" />
          Create Employee
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);`}
                      language="tsx"
                      id="form-modals"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Content Modals */}
              <section id="content-modals" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Content Modals</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Rich content display and media viewers within modal interfaces.</p>
                  </div>

                  <PreviewCard title="Content Viewers">
                    <div className="flex flex-wrap gap-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Star className="w-4 h-4 mr-2" />
                            Performance Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Star className="w-5 h-5 text-yellow-600" />
                              Q4 2024 Performance Review
                            </DialogTitle>
                            <DialogDescription>
                              Performance evaluation for Sarah Johnson
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">4.2</div>
                                <div className="text-sm text-green-700">Overall Rating</div>
                              </div>
                              <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">95%</div>
                                <div className="text-sm text-blue-700">Goal Achievement</div>
                              </div>
                              <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">Q1</div>
                                <div className="text-sm text-purple-700">Performance Rank</div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h4 className="font-medium">Key Achievements</h4>
                              <div className="space-y-3">
                                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                  <div>
                                    <p className="font-medium text-green-800">Led successful onboarding program</p>
                                    <p className="text-sm text-green-700">Improved new hire satisfaction by 25%</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                  <div>
                                    <p className="font-medium text-green-800">Streamlined HR processes</p>
                                    <p className="text-sm text-green-700">Reduced processing time by 30%</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h4 className="font-medium">Development Areas</h4>
                              <div className="space-y-3">
                                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                                  <Target className="w-5 h-5 text-yellow-600 mt-0.5" />
                                  <div>
                                    <p className="font-medium text-yellow-800">Advanced analytics skills</p>
                                    <p className="text-sm text-yellow-700">Recommended: Data analysis certification</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h4 className="font-medium">Manager Comments</h4>
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                  "Sarah has consistently demonstrated exceptional performance and leadership qualities. 
                                  Her initiative in improving our onboarding process has had a significant positive impact 
                                  on the team and new hires. I recommend her for promotion consideration."
                                </p>
                                <div className="flex items-center gap-2 mt-3">
                                  <div className="w-8 h-8 bg-brown-100 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-brown-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Michael Chen</p>
                                    <p className="text-xs text-gray-500">HR Director</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Close</Button>
                            </DialogClose>
                            <Button>
                              <Download className="w-4 h-4 mr-2" />
                              Export PDF
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <HelpCircle className="w-4 h-4 mr-2" />
                            Help Center
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <HelpCircle className="w-5 h-5 text-blue-600" />
                              HR Help Center
                            </DialogTitle>
                            <DialogDescription>
                              Find answers to common questions and get support
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <Input 
                                placeholder="Search help articles..." 
                                className="pl-10"
                              />
                            </div>
                            
                            <div className="space-y-4">
                              <h4 className="font-medium">Popular Topics</h4>
                              <div className="grid grid-cols-2 gap-3">
                                <button className="p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="w-4 h-4 text-blue-600" />
                                    <span className="font-medium text-blue-900">Time Off Requests</span>
                                  </div>
                                  <p className="text-sm text-blue-700">How to submit and manage PTO</p>
                                </button>
                                
                                <button className="p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                                  <div className="flex items-center gap-2 mb-1">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                    <span className="font-medium text-green-900">Payroll & Benefits</span>
                                  </div>
                                  <p className="text-sm text-green-700">Understanding your compensation</p>
                                </button>
                                
                                <button className="p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                                  <div className="flex items-center gap-2 mb-1">
                                    <User className="w-4 h-4 text-purple-600" />
                                    <span className="font-medium text-purple-900">Profile Management</span>
                                  </div>
                                  <p className="text-sm text-purple-700">Update your information</p>
                                </button>
                                
                                <button className="p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Lock className="w-4 h-4 text-orange-600" />
                                    <span className="font-medium text-orange-900">Account Security</span>
                                  </div>
                                  <p className="text-sm text-orange-700">Password and security settings</p>
                                </button>
                              </div>
                            </div>
                            
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-medium mb-2">Need More Help?</h4>
                              <p className="text-sm text-gray-600 mb-3">
                                Can't find what you're looking for? Contact our HR support team.
                              </p>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Mail className="w-4 h-4 mr-1" />
                                  Email Support
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Phone className="w-4 h-4 mr-1" />
                                  Call Support
                                </Button>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Close</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`const PerformanceReviewModal = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline">
        <Star className="w-4 h-4 mr-2" />
        Performance Review
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-600" />
          Q4 2024 Performance Review
        </DialogTitle>
        <DialogDescription>
          Performance evaluation for Sarah Johnson
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">4.2</div>
            <div className="text-sm text-green-700">Overall Rating</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">95%</div>
            <div className="text-sm text-blue-700">Goal Achievement</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">Q1</div>
            <div className="text-sm text-purple-700">Performance Rank</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-medium">Key Achievements</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Led successful onboarding program</p>
                <p className="text-sm text-green-700">Improved new hire satisfaction by 25%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);`}
                      language="tsx"
                      id="content-modals"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* HR Workflows */}
              <section id="hr-workflows" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>HR Workflows</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Specialized modal workflows for common HR processes and tasks.</p>
                  </div>

                  <PreviewCard title="Workflow Examples">
                    <p className="text-sm text-gray-600 mb-4">
                      These examples demonstrate specialized modal workflows for HR operations including 
                      employee onboarding, performance reviews, and benefits enrollment.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Employee Onboarding</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Multi-step modal for collecting new hire information
                        </p>
                        <Button size="sm" variant="outline">View Workflow</Button>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Benefits Enrollment</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Guided process for selecting health and retirement benefits
                        </p>
                        <Button size="sm" variant="outline">View Workflow</Button>
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
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Guidelines for implementing accessible and user-friendly modal dialogs.</p>
                  </div>

                  <PreviewCard title="Modal Design Guidelines">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3 text-green-700">Do's</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            Use clear, descriptive titles and descriptions
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            Provide obvious close buttons and escape routes
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            Keep content focused and relevant
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            Use appropriate modal sizes for content
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3 text-red-700">Don'ts</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            Stack modals on top of each other
                          </li>
                          <li className="flex items-start gap-2">
                            <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            Use modals for complex multi-page workflows
                          </li>
                          <li className="flex items-start gap-2">
                            <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            Open modals automatically without user action
                          </li>
                          <li className="flex items-start gap-2">
                            <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            Make modals too large or too small for content
                          </li>
                        </ul>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Accessibility Checklist">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">Focus Management</h4>
                          <p className="text-sm text-blue-800">
                            Focus should move to the modal when opened and return to the trigger when closed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">Keyboard Navigation</h4>
                          <p className="text-sm text-blue-800">
                            Tab navigation should be trapped within the modal, and Escape should close it
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">ARIA Labels</h4>
                          <p className="text-sm text-blue-800">
                            Use proper ARIA attributes for screen reader compatibility
                          </p>
                        </div>
                      </div>
                    </div>
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