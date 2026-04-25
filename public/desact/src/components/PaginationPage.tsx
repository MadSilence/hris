import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Home, ChevronRight, Menu, Search, Layers, Package, Users, Building2, UserCheck, FileText, Settings, Calendar, Briefcase, Award, Shield, Clock, MapPin, Target, TrendingUp, Navigation, ArrowRight, ChevronDown, MoreHorizontal, User, Mail, Phone, Database, Monitor, FileBarChart, Clipboard, MessageSquare, UserPlus, Activity, DollarSign, BookOpen, CheckCircle, AlertCircle, HelpCircle, Coffee, Plane, GraduationCap, Heart, Gift, Workflow, Timer, Info, Code2, Eye, Paintbrush, Type, PanelLeftOpen, Megaphone, XCircle, Command, Edit, PaletteIcon, Hash, AlertTriangle, Upload, Gauge, ArrowUpDown, RefreshCw, Smartphone, Filter, Download, Plus, Bell, LogOut, Grid3X3, List, PieChart, ChevronLeft, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { DesactLogo } from './shared/DesactLogo';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
import { categoryIcons, componentIcons } from './constants/iconMappings';

interface PaginationPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const PaginationPage: React.FC<PaginationPageProps> = ({
  onBack,
  components,
  onComponentClick,
  currentComponent
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageLarge, setCurrentPageLarge] = useState(1);
  const [currentPageEmployees, setCurrentPageEmployees] = useState(1);

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
      const sections = ['overview', 'basic-pagination', 'page-sizes', 'with-info', 'hr-examples', 'accessibility', 'best-practices'];
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
    { id: 'basic-pagination', label: 'Basic Pagination', icon: List },
    { id: 'page-sizes', label: 'Page Sizes', icon: Grid3X3 },
    { id: 'with-info', label: 'With Information', icon: Info },
    { id: 'hr-examples', label: 'HR Examples', icon: Users },
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
                  <h1 className="text-xl font-semibold">Pagination</h1>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                    Navigation
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Split large datasets into manageable pages for better user experience
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
                      Pagination Navigation
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Pagination components help users navigate through large datasets by breaking them into smaller, 
                      manageable chunks. Essential for HR applications dealing with employee lists, job postings, 
                      performance records, and other extensive data collections.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <List className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Data Organization</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Break large datasets into digestible pages, improving load times and user experience.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">HR Optimized</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Designed for employee directories, applicant tracking, and performance management systems.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <Shield className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Accessible</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Built with ARIA labels and keyboard navigation support for all users.</p>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="When to Use Pagination">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Large Datasets</span>
                          <p className="text-sm text-gray-600">When displaying 20+ items that would create long scroll areas</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Performance Optimization</span>
                          <p className="text-sm text-gray-600">When loading all data at once would impact application performance</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Data Tables</span>
                          <p className="text-sm text-gray-600">Essential for employee lists, reports, and administrative interfaces</p>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Basic Pagination */}
              <section id="basic-pagination" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Basic Pagination</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Simple pagination with previous/next navigation and page numbers</p>
                  </div>

                  <PreviewCard title="Standard Pagination">
                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                href="#" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                                }}
                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                              />
                            </PaginationItem>
                            
                            {[1, 2, 3, 4, 5].map((page) => (
                              <PaginationItem key={page}>
                                <PaginationLink 
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(page);
                                  }}
                                  isActive={currentPage === page}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                            
                            <PaginationItem>
                              <PaginationNext 
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (currentPage < 5) setCurrentPage(currentPage + 1);
                                }}
                                className={currentPage === 5 ? 'pointer-events-none opacity-50' : ''}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                      
                      <div className="text-center text-sm text-gray-600">
                        Page {currentPage} of 5 (120 employees)
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';

const [currentPage, setCurrentPage] = useState(1);
const totalPages = 5;

<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious 
        href="#" 
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
      />
    </PaginationItem>
    
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <PaginationItem key={page}>
        <PaginationLink 
          href="#"
          onClick={() => setCurrentPage(page)}
          isActive={currentPage === page}
        >
          {page}
        </PaginationLink>
      </PaginationItem>
    ))}
    
    <PaginationItem>
      <PaginationNext 
        href="#"
        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
      />
    </PaginationItem>
  </PaginationContent>
</Pagination>`}
                      language="tsx"
                      id="basic-pagination"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Page Sizes */}
              <section id="page-sizes" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Large Dataset Pagination</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Pagination with ellipsis for handling large numbers of pages</p>
                  </div>

                  <PreviewCard title="Pagination with Ellipsis">
                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                href="#" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (currentPageLarge > 1) setCurrentPageLarge(currentPageLarge - 1);
                                }}
                                className={currentPageLarge === 1 ? 'pointer-events-none opacity-50' : ''}
                              />
                            </PaginationItem>
                            
                            <PaginationItem>
                              <PaginationLink 
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPageLarge(1);
                                }}
                                isActive={currentPageLarge === 1}
                              >
                                1
                              </PaginationLink>
                            </PaginationItem>
                            
                            {currentPageLarge > 3 && (
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )}
                            
                            {currentPageLarge > 2 && currentPageLarge < 49 && (
                              <PaginationItem>
                                <PaginationLink 
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPageLarge(currentPageLarge - 1);
                                  }}
                                >
                                  {currentPageLarge - 1}
                                </PaginationLink>
                              </PaginationItem>
                            )}
                            
                            {currentPageLarge !== 1 && currentPageLarge !== 50 && (
                              <PaginationItem>
                                <PaginationLink href="#" isActive>
                                  {currentPageLarge}
                                </PaginationLink>
                              </PaginationItem>
                            )}
                            
                            {currentPageLarge < 49 && currentPageLarge > 1 && (
                              <PaginationItem>
                                <PaginationLink 
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPageLarge(currentPageLarge + 1);
                                  }}
                                >
                                  {currentPageLarge + 1}
                                </PaginationLink>
                              </PaginationItem>
                            )}
                            
                            {currentPageLarge < 48 && (
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )}
                            
                            <PaginationItem>
                              <PaginationLink 
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPageLarge(50);
                                }}
                                isActive={currentPageLarge === 50}
                              >
                                50
                              </PaginationLink>
                            </PaginationItem>
                            
                            <PaginationItem>
                              <PaginationNext 
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (currentPageLarge < 50) setCurrentPageLarge(currentPageLarge + 1);
                                }}
                                className={currentPageLarge === 50 ? 'pointer-events-none opacity-50' : ''}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                      
                      <div className="text-center text-sm text-gray-600">
                        Page {currentPageLarge} of 50 (2,500 total records)
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* With Information */}
              <section id="with-info" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Pagination with Information</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Enhanced pagination showing record counts and page information</p>
                  </div>

                  <PreviewCard title="Detailed Pagination">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Showing 1-25 of 250 employees
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Page size:</span>
                          <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex justify-center">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious href="#" />
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink href="#" isActive>1</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink href="#">2</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink href="#">3</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink href="#">10</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationNext href="#" />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                      
                      <div className="text-center text-sm text-gray-600">
                        Navigate to specific page: 
                        <input 
                          type="number" 
                          min="1" 
                          max="10" 
                          className="ml-2 w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                          placeholder="1"
                        />
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* HR Examples */}
              <section id="hr-examples" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>HR-Specific Examples</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Real-world pagination examples for common HR workflows</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Employee Directory">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">1,247 active employees</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            25 per page
                          </span>
                        </div>
                        
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                href="#" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (currentPageEmployees > 1) setCurrentPageEmployees(currentPageEmployees - 1);
                                }}
                                className={currentPageEmployees === 1 ? 'pointer-events-none opacity-50' : ''}
                              />
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink 
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPageEmployees(1);
                                }}
                                isActive={currentPageEmployees === 1}
                              >
                                1
                              </PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink 
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPageEmployees(2);
                                }}
                                isActive={currentPageEmployees === 2}
                              >
                                2
                              </PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink 
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPageEmployees(3);
                                }}
                                isActive={currentPageEmployees === 3}
                              >
                                3
                              </PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink href="#">50</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationNext 
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (currentPageEmployees < 50) setCurrentPageEmployees(currentPageEmployees + 1);
                                }}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Job Applications">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">158 applications</span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            10 per page
                          </span>
                        </div>
                        
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious href="#" />
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink href="#" isActive>1</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink href="#">2</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink href="#">3</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink href="#">16</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationNext href="#" />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
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
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Making pagination accessible to all users</p>
                  </div>

                  <PreviewCard title="Accessibility Features">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">ARIA Labels</span>
                          <p className="text-sm text-gray-600">Navigation landmark with descriptive labels for screen readers</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Current Page Indication</span>
                          <p className="text-sm text-gray-600">Active page clearly marked with aria-current="page"</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Keyboard Navigation</span>
                          <p className="text-sm text-gray-600">All pagination controls accessible via Tab and Enter keys</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Focus Management</span>
                          <p className="text-sm text-gray-600">Clear focus indicators and logical tab order</p>
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
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Guidelines for effective pagination implementation</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Do's">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Show total count</span>
                            <p className="text-sm text-gray-600">Display total number of items and current range</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Use appropriate page sizes</span>
                            <p className="text-sm text-gray-600">25-50 items per page for most datasets</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Provide jump to page</span>
                            <p className="text-sm text-gray-600">Allow direct navigation for large datasets</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Remember page state</span>
                            <p className="text-sm text-gray-600">Maintain pagination when user returns</p>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Don'ts">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Don't use on small datasets</span>
                            <p className="text-sm text-gray-600">Less than 20 items don't need pagination</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Don't show too many pages</span>
                            <p className="text-sm text-gray-600">Use ellipsis for more than 7 pages</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Don't break the back button</span>
                            <p className="text-sm text-gray-600">Update URL to support browser navigation</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Don't forget loading states</span>
                            <p className="text-sm text-gray-600">Show loading indicators during page changes</p>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Performance Considerations">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Server-side pagination</span>
                          <p className="text-sm text-gray-600">For large datasets, implement pagination on the server to reduce payload size</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Preload adjacent pages</span>
                          <p className="text-sm text-gray-600">Cache next/previous page data for faster navigation</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Consider infinite scroll</span>
                          <p className="text-sm text-gray-600">For mobile experiences or continuous browsing scenarios</p>
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