import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Copy, Check, Search, ChevronRight, Menu, X, Users, FileText, Settings, User, Mail, Phone, Globe, Calendar, Building2, Award, Briefcase, Plus, Edit, Trash2, Eye, Download, Upload, Clock, Target, TrendingUp, Package, Layers, Grid3X3, List, Code2, PanelRightOpen, PanelLeftOpen, PanelTopOpen, PanelBottomOpen, Filter, SortAsc, MoreHorizontal, BookOpen, MessageSquare, Bell, Zap, Star } from 'lucide-react';
import { DesactLogo } from './shared/DesactLogo';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from './ui/drawer';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from './ui/sheet';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Avatar } from './ui/avatar';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
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
  'Drawer': PanelLeftOpen,
  'Default': Package
};

interface DrawerPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const DrawerPage: React.FC<DrawerPageProps> = ({ 
  onBack, 
  components, 
  onComponentClick, 
  currentComponent 
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  // Prevent drawer from closing when date picker is open
  const handleStartDateOpenChange = (open: boolean) => {
    setStartDateOpen(open);
  };
  
  const handleEndDateOpenChange = (open: boolean) => {
    setEndDateOpen(open);
  };

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
      const sections = ['overview', 'bottom-drawers', 'side-sheets', 'drawer-forms', 'content-viewers', 'hr-workflows', 'implementation'];
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
    { id: 'bottom-drawers', label: 'Bottom Drawers', icon: PanelBottomOpen },
    { id: 'side-sheets', label: 'Side Sheets', icon: PanelRightOpen },
    { id: 'drawer-forms', label: 'Drawer Forms', icon: FileText },
    { id: 'content-viewers', label: 'Content Viewers', icon: Eye },
    { id: 'hr-workflows', label: 'HR Workflows', icon: Users },
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
                  <h1 className="text-xl font-semibold">Drawers & Sheets</h1>
                  <Badge variant="secondary" className="bg-brown-100 text-brown-700 border-brown-200">
                    Overlays
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Slide-out panels and drawer components for HR applications and workflows
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
                      Drawer & Sheet Components
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Slide-out panels and drawer overlays for HR applications. Includes bottom drawers, side sheets, 
                      form containers, and content viewers with smooth animations and responsive design.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <PanelBottomOpen className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Bottom Drawers</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                        Mobile-friendly bottom slide panels for quick actions and forms.
                      </p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <PanelRightOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Side Sheets</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                        Desktop-optimized side panels for detailed content and navigation.
                      </p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Form Drawers</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                        Complex forms and data entry interfaces within drawer containers.
                      </p>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Drawer Features">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Animation & Interaction</h4>
                        <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li>• Smooth slide animations with easing</li>
                          <li>• Swipe gestures on mobile devices</li>
                          <li>• Backdrop click and escape key support</li>
                          <li>• Customizable positioning and sizing</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">HR Use Cases</h4>
                        <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li>• Employee profile editing panels</li>
                          <li>• Document preview and management</li>
                          <li>• Quick task creation and updates</li>
                          <li>• Filter and search interfaces</li>
                        </ul>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Bottom Drawers */}
              <section id="bottom-drawers" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Bottom Drawers</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Mobile-optimized bottom slide panels for quick actions and information.</p>
                  </div>

                  <PreviewCard title="Employee Quick Actions">
                    <div className="flex flex-wrap gap-3">
                      <Drawer>
                        <DrawerTrigger asChild>
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Employee
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                          <DrawerHeader>
                            <DrawerTitle className="flex items-center gap-2">
                              <User className="w-5 h-5 text-brown-600" />
                              Add New Employee
                            </DrawerTitle>
                            <DrawerDescription>
                              Enter basic employee information to get started
                            </DrawerDescription>
                          </DrawerHeader>
                          <div className="px-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" placeholder="John" />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" placeholder="Doe" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input id="email" type="email" placeholder="john.doe@company.com" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="department">Department</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="hr">Human Resources</SelectItem>
                                  <SelectItem value="engineering">Engineering</SelectItem>
                                  <SelectItem value="marketing">Marketing</SelectItem>
                                  <SelectItem value="finance">Finance</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DrawerFooter>
                            <Button type="button">Create Employee</Button>
                            <DrawerClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </DrawerContent>
                      </Drawer>

                      <Drawer>
                        <DrawerTrigger asChild>
                          <Button variant="outline">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter Employees
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                          <DrawerHeader>
                            <DrawerTitle className="flex items-center gap-2">
                              <Filter className="w-5 h-5 text-blue-600" />
                              Filter & Sort Options
                            </DrawerTitle>
                            <DrawerDescription>
                              Customize your employee list view
                            </DrawerDescription>
                          </DrawerHeader>
                          <div className="px-4 space-y-6">
                            <div className="space-y-4">
                              <h4 className="font-medium">Department</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {['All Departments', 'Engineering', 'Human Resources', 'Marketing', 'Finance', 'Sales'].map((dept) => (
                                  <Button key={dept} variant="outline" size="sm" className="justify-start">
                                    {dept}
                                  </Button>
                                ))}
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-4">
                              <h4 className="font-medium">Employment Status</h4>
                              <div className="flex flex-wrap gap-2">
                                {['Active', 'On Leave', 'Pending', 'Terminated'].map((status) => (
                                  <Button key={status} variant="outline" size="sm">
                                    {status}
                                  </Button>
                                ))}
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-4">
                              <h4 className="font-medium">Sort By</h4>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose sort option" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="name">Name (A-Z)</SelectItem>
                                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                                  <SelectItem value="date-hired">Date Hired (Newest)</SelectItem>
                                  <SelectItem value="date-hired-desc">Date Hired (Oldest)</SelectItem>
                                  <SelectItem value="department">Department</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DrawerFooter>
                            <Button type="button">Apply Filters</Button>
                            <DrawerClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </DrawerContent>
                      </Drawer>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from './ui/drawer';

const AddEmployeeDrawer = () => (
  <Drawer>
    <DrawerTrigger asChild>
      <Button>
        <Plus className="w-4 h-4 mr-2" />
        Add Employee
      </Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-brown-600" />
          Add New Employee
        </DrawerTitle>
        <DrawerDescription>
          Enter basic employee information to get started
        </DrawerDescription>
      </DrawerHeader>
      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" placeholder="John" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" placeholder="Doe" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="john.doe@company.com" />
        </div>
      </div>
      <DrawerFooter>
        <Button>Create Employee</Button>
        <DrawerClose asChild>
          <Button variant="outline">Cancel</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
);`}
                      language="tsx"
                      id="bottom-drawers"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Side Sheets */}
              <section id="side-sheets" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Side Sheets</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Desktop-optimized side panels for detailed content and navigation.</p>
                  </div>

                  <PreviewCard title="Employee Detail Panels">
                    <div className="flex flex-wrap gap-3">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="outline">
                            <User className="w-4 h-4 mr-2" />
                            Employee Profile
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[500px] sm:w-[600px] lg:w-[700px] xl:w-[800px] px-6">
                          <SheetHeader>
                            <SheetTitle className="flex items-center gap-2">
                              <User className="w-5 h-5 text-brown-600" />
                              Employee Profile
                            </SheetTitle>
                            <SheetDescription>
                              Complete employee information and management
                            </SheetDescription>
                          </SheetHeader>
                          <div className="py-6 space-y-6">
                            <div className="flex items-center gap-4">
                              <div className="w-20 h-20 bg-brown-100 rounded-full flex items-center justify-center">
                                <User className="w-10 h-10 text-brown-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold">Sarah Johnson</h3>
                                <p className="text-sm text-gray-600">Senior HR Specialist</p>
                                <Badge className="bg-green-100 text-green-700 text-xs mt-1">Active</Badge>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-4">
                              <h4 className="font-medium">Contact Information</h4>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <Mail className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm">sarah.johnson@company.com</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Phone className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm">+1 (555) 123-4567</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Building2 className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm">San Francisco Office</span>
                                </div>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-4">
                              <h4 className="font-medium">Employment Details</h4>
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
                                <div>
                                  <span className="text-gray-600">Job Level:</span>
                                  <p className="font-medium">Senior</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Employment Type:</span>
                                  <p className="font-medium">Full-time</p>
                                </div>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-4">
                              <h4 className="font-medium">Recent Activity</h4>
                              <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                  <div>
                                    <p className="text-sm">Completed Q4 Performance Review</p>
                                    <p className="text-xs text-gray-500">2 days ago</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                  <div>
                                    <p className="text-sm">Updated emergency contact information</p>
                                    <p className="text-xs text-gray-500">1 week ago</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3">
                                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                  <div>
                                    <p className="text-sm">Completed compliance training</p>
                                    <p className="text-xs text-gray-500">2 weeks ago</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <SheetFooter>
                            <SheetClose asChild>
                              <Button variant="outline">Close</Button>
                            </SheetClose>
                            <Button type="button">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Profile
                            </Button>
                          </SheetFooter>
                        </SheetContent>
                      </Sheet>

                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            Document Viewer
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[600px] sm:w-[700px] lg:w-[800px] xl:w-[900px] px-6">
                          <SheetHeader>
                            <SheetTitle className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-blue-600" />
                              Document Viewer
                            </SheetTitle>
                            <SheetDescription>
                              Preview and manage employee documents
                            </SheetDescription>
                          </SheetHeader>
                          <div className="py-6 space-y-6">
                            <div className="bg-gray-50 border rounded-lg p-6 text-center">
                              <FileText className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                              <h3 className="font-medium mb-2">Employee Handbook 2024</h3>
                              <p className="text-sm text-gray-600 mb-4">PDF • 2.4 MB • 45 pages</p>
                              <p className="text-xs text-gray-500 mb-4">
                                Last updated: December 15, 2024
                              </p>
                              <div className="flex gap-2 justify-center">
                                <Button size="sm">
                                  <Eye className="w-4 h-4 mr-2" />
                                  Preview
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h4 className="font-medium">Related Documents</h4>
                              <div className="space-y-3">
                                {[
                                  { name: 'Code of Conduct', type: 'PDF', size: '1.2 MB' },
                                  { name: 'Benefits Overview', type: 'PDF', size: '890 KB' },
                                  { name: 'Emergency Procedures', type: 'PDF', size: '650 KB' },
                                  { name: 'IT Security Policy', type: 'PDF', size: '1.1 MB' }
                                ].map((doc, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <FileText className="w-4 h-4 text-gray-500" />
                                      <div>
                                        <p className="text-sm font-medium">{doc.name}</p>
                                        <p className="text-xs text-gray-500">{doc.type} • {doc.size}</p>
                                      </div>
                                    </div>
                                    <Button size="sm" variant="ghost">
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <SheetFooter>
                            <SheetClose asChild>
                              <Button variant="outline">Close</Button>
                            </SheetClose>
                          </SheetFooter>
                        </SheetContent>
                      </Sheet>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from './ui/sheet';

const EmployeeProfileSheet = () => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline">
        <User className="w-4 h-4 mr-2" />
        Employee Profile
      </Button>
    </SheetTrigger>
    <SheetContent side="right" className="w-[400px] sm:w-[540px]">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-brown-600" />
          Employee Profile
        </SheetTitle>
        <SheetDescription>
          Complete employee information and management
        </SheetDescription>
      </SheetHeader>
      <div className="py-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-brown-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-brown-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Sarah Johnson</h3>
            <p className="text-sm text-gray-600">Senior HR Specialist</p>
            <Badge className="bg-green-100 text-green-700 text-xs mt-1">Active</Badge>
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-medium">Contact Information</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm">sarah.johnson@company.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm">+1 (555) 123-4567</span>
            </div>
          </div>
        </div>
      </div>
      <SheetFooter>
        <SheetClose asChild>
          <Button variant="outline">Close</Button>
        </SheetClose>
        <Button>
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
);`}
                      language="tsx"
                      id="side-sheets"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Drawer Forms */}
              <section id="drawer-forms" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Drawer Forms</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Complex forms and data entry interfaces within drawer containers.</p>
                  </div>

                  <PreviewCard title="HR Form Drawers">
                    <div className="flex flex-wrap gap-3">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Performance Review
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[500px] sm:w-[600px] lg:w-[700px] px-6">
                          <SheetHeader>
                            <SheetTitle className="flex items-center gap-2">
                              <Award className="w-5 h-5 text-brown-600" />
                              Performance Review Form
                            </SheetTitle>
                            <SheetDescription>
                              Conduct employee performance evaluation
                            </SheetDescription>
                          </SheetHeader>
                          <div className="py-6 space-y-6">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="reviewPeriod">Review Period</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select review period" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="q4-2024">Q4 2024</SelectItem>
                                    <SelectItem value="q3-2024">Q3 2024</SelectItem>
                                    <SelectItem value="q2-2024">Q2 2024</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="overallRating">Overall Rating</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select rating" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="exceeds">Exceeds Expectations</SelectItem>
                                    <SelectItem value="meets">Meets Expectations</SelectItem>
                                    <SelectItem value="below">Below Expectations</SelectItem>
                                    <SelectItem value="improvement">Needs Improvement</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="achievements">Key Achievements</Label>
                                <Textarea 
                                  id="achievements"
                                  placeholder="List the employee's key achievements and contributions..."
                                  rows={4}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="improvements">Areas for Improvement</Label>
                                <Textarea 
                                  id="improvements"
                                  placeholder="Describe areas where the employee can improve..."
                                  rows={3}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="goals">Goals for Next Period</Label>
                                <Textarea 
                                  id="goals"
                                  placeholder="Set goals and objectives for the upcoming period..."
                                  rows={3}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="developmentPlan">Development Plan</Label>
                                <Textarea 
                                  id="developmentPlan"
                                  placeholder="Outline training and development opportunities..."
                                  rows={3}
                                />
                              </div>
                            </div>
                          </div>
                          <SheetFooter>
                            <SheetClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </SheetClose>
                            <Button type="button">
                              <Award className="w-4 h-4 mr-2" />
                              Save Review
                            </Button>
                          </SheetFooter>
                        </SheetContent>
                      </Sheet>

                      <Sheet open={sheetOpen} onOpenChange={setSheetOpen} modal={false}>
                        <SheetTrigger asChild>
                          <Button variant="outline" type="button" onClick={() => setSheetOpen(true)}>
                            <Calendar className="w-4 h-4 mr-2" />
                            Time Off Request
                          </Button>
                        </SheetTrigger>
                        <SheetContent 
                          side="right" 
                          className="w-[450px] sm:w-[500px] lg:w-[550px] px-6"
                          onPointerDownOutside={(e) => {
                            e.preventDefault();
                          }}
                          onInteractOutside={(e) => {
                            e.preventDefault();
                          }}
                        >
                          <SheetHeader>
                            <SheetTitle className="flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-blue-600" />
                              Time Off Request
                            </SheetTitle>
                            <SheetDescription>
                              Submit a new time off request
                            </SheetDescription>
                          </SheetHeader>
                          <div 
                            className="py-6 space-y-6"
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="requestType">Request Type</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select request type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="vacation">Vacation</SelectItem>
                                    <SelectItem value="sick">Sick Leave</SelectItem>
                                    <SelectItem value="personal">Personal Day</SelectItem>
                                    <SelectItem value="bereavement">Bereavement</SelectItem>
                                    <SelectItem value="maternity">Maternity/Paternity</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Start Date</Label>
                                  <div className="relative">
                                    <Button 
                                      variant="outline" 
                                      className="w-full justify-start text-left font-normal border-brown-200 hover:border-brown-300 focus:border-brown-500 focus:ring-1 focus:ring-brown-500/20"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setStartDateOpen(!startDateOpen);
                                      }}
                                      type="button"
                                    >
                                      <Calendar className="mr-2 h-4 w-4 text-brown-500" />
                                      <span style={{ color: startDate ? 'var(--color-text-primary)' : 'var(--color-text-placeholder)' }}>
                                        {startDate ? startDate.toLocaleDateString() : "Pick a date"}
                                      </span>
                                    </Button>
                                    {startDateOpen && createPortal(
                                      <div 
                                        className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm"
                                        onClick={() => setStartDateOpen(false)}
                                      >
                                        <div 
                                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg border border-brown-200 shadow-2xl p-6 max-w-sm w-full mx-4"
                                          onClick={(e) => e.stopPropagation()}
                                          style={{
                                            background: 'var(--color-bg-primary)',
                                            borderColor: 'var(--color-brown-200)'
                                          }}
                                        >
                                          <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                              Select Start Date
                                            </h3>
                                            <Button 
                                              size="sm" 
                                              variant="ghost"
                                              onClick={() => setStartDateOpen(false)}
                                              className="hover:bg-brown-50"
                                            >
                                              <X className="w-4 h-4" />
                                            </Button>
                                          </div>
                                          <div className="themed-calendar">
                                            <CalendarComponent
                                              mode="single"
                                              selected={startDate}
                                              onSelect={(date) => {
                                                setStartDate(date);
                                                setStartDateOpen(false);
                                              }}
                                              initialFocus
                                              className="p-0 border-0"
                                              classNames={{
                                                day_selected: "bg-brown-600 text-white hover:bg-brown-700 hover:text-white focus:bg-brown-700 focus:text-white",
                                                day_today: "bg-brown-50 text-brown-700 font-medium",
                                                nav_button: "border-brown-200 hover:bg-brown-50 hover:border-brown-300",
                                                caption_label: "text-brown-900 font-medium"
                                              }}
                                            />
                                          </div>
                                        </div>
                                      </div>,
                                      document.body
                                    )}
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>End Date</Label>
                                  <div className="relative">
                                    <Button 
                                      variant="outline" 
                                      className="w-full justify-start text-left font-normal border-brown-200 hover:border-brown-300 focus:border-brown-500 focus:ring-1 focus:ring-brown-500/20"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setEndDateOpen(!endDateOpen);
                                      }}
                                      type="button"
                                    >
                                      <Calendar className="mr-2 h-4 w-4 text-brown-500" />
                                      <span style={{ color: endDate ? 'var(--color-text-primary)' : 'var(--color-text-placeholder)' }}>
                                        {endDate ? endDate.toLocaleDateString() : "Pick a date"}
                                      </span>
                                    </Button>
                                    {endDateOpen && createPortal(
                                      <div 
                                        className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm"
                                        onClick={() => setEndDateOpen(false)}
                                      >
                                        <div 
                                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg border border-brown-200 shadow-2xl p-6 max-w-sm w-full mx-4"
                                          onClick={(e) => e.stopPropagation()}
                                          style={{
                                            background: 'var(--color-bg-primary)',
                                            borderColor: 'var(--color-brown-200)'
                                          }}
                                        >
                                          <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                              Select End Date
                                            </h3>
                                            <Button 
                                              size="sm" 
                                              variant="ghost"
                                              onClick={() => setEndDateOpen(false)}
                                              className="hover:bg-brown-50"
                                            >
                                              <X className="w-4 h-4" />
                                            </Button>
                                          </div>
                                          <div className="themed-calendar">
                                            <CalendarComponent
                                              mode="single"
                                              selected={endDate}
                                              onSelect={(date) => {
                                                setEndDate(date);
                                                setEndDateOpen(false);
                                              }}
                                              initialFocus
                                              className="p-0 border-0"
                                              classNames={{
                                                day_selected: "bg-brown-600 text-white hover:bg-brown-700 hover:text-white focus:bg-brown-700 focus:text-white",
                                                day_today: "bg-brown-50 text-brown-700 font-medium",
                                                nav_button: "border-brown-200 hover:bg-brown-50 hover:border-brown-300",
                                                caption_label: "text-brown-900 font-medium"
                                              }}
                                            />
                                          </div>
                                        </div>
                                      </div>,
                                      document.body
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="reason">Reason (Optional)</Label>
                                <Textarea 
                                  id="reason"
                                  placeholder="Provide additional details about your request..."
                                  rows={3}
                                />
                              </div>
                              
                              <div className="p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">Available Balance</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-blue-700">Vacation Days:</span>
                                    <p className="font-medium">15 days remaining</p>
                                  </div>
                                  <div>
                                    <span className="text-blue-700">Sick Days:</span>
                                    <p className="font-medium">8 days remaining</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <SheetFooter>
                            <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancel</Button>
                            <Button type="button" onClick={() => {
                              // Handle form submission here
                              setSheetOpen(false);
                            }}>
                              <Calendar className="w-4 h-4 mr-2" />
                              Submit Request
                            </Button>
                          </SheetFooter>
                        </SheetContent>
                      </Sheet>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Content Viewers */}
              <section id="content-viewers" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Content Viewers</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Document preview and content display within drawer interfaces.</p>
                  </div>

                  <PreviewCard title="Document & Content Viewers">
                    <div className="flex flex-wrap gap-3">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="outline">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Training Materials
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[600px] sm:w-[700px] lg:w-[800px] px-6">
                          <SheetHeader>
                            <SheetTitle className="flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-green-600" />
                              Training Materials Library
                            </SheetTitle>
                            <SheetDescription>
                              Browse and access training resources
                            </SheetDescription>
                          </SheetHeader>
                          <div className="py-6 space-y-6">
                            <div className="space-y-4">
                              <h4 className="font-medium">Featured Training Modules</h4>
                              <div className="space-y-3">
                                {[
                                  { 
                                    title: 'Cybersecurity Awareness', 
                                    duration: '45 min', 
                                    completion: 85,
                                    mandatory: true 
                                  },
                                  { 
                                    title: 'Diversity & Inclusion', 
                                    duration: '30 min', 
                                    completion: 92,
                                    mandatory: true 
                                  },
                                  { 
                                    title: 'Leadership Skills', 
                                    duration: '60 min', 
                                    completion: 67,
                                    mandatory: false 
                                  },
                                  { 
                                    title: 'Communication Fundamentals', 
                                    duration: '40 min', 
                                    completion: 78,
                                    mandatory: false 
                                  }
                                ].map((course, index) => (
                                  <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <h5 className="font-medium">{course.title}</h5>
                                        <p className="text-sm text-gray-600">{course.duration}</p>
                                        {course.mandatory && (
                                          <Badge className="bg-red-100 text-red-700 text-xs mt-1">
                                            Mandatory
                                          </Badge>
                                        )}
                                      </div>
                                      <Button size="sm">
                                        <Eye className="w-4 h-4 mr-2" />
                                        View
                                      </Button>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-green-600 h-2 rounded-full" 
                                        style={{ width: `${course.completion}%` }}
                                      ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {course.completion}% completion rate
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-4">
                              <h4 className="font-medium">Recent Announcements</h4>
                              <div className="space-y-3">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                  <div className="flex items-start gap-3">
                                    <Bell className="w-4 h-4 text-blue-600 mt-0.5" />
                                    <div>
                                      <h5 className="font-medium text-blue-900">New Training Module Available</h5>
                                      <p className="text-sm text-blue-800">
                                        Remote Work Best Practices module is now available for all employees.
                                      </p>
                                      <p className="text-xs text-blue-600 mt-1">2 hours ago</p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="p-3 bg-yellow-50 rounded-lg">
                                  <div className="flex items-start gap-3">
                                    <Clock className="w-4 h-4 text-yellow-600 mt-0.5" />
                                    <div>
                                      <h5 className="font-medium text-yellow-900">Training Deadline Reminder</h5>
                                      <p className="text-sm text-yellow-800">
                                        Complete mandatory compliance training by December 31st.
                                      </p>
                                      <p className="text-xs text-yellow-600 mt-1">1 day ago</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <SheetFooter>
                            <SheetClose asChild>
                              <Button variant="outline">Close</Button>
                            </SheetClose>
                          </SheetFooter>
                        </SheetContent>
                      </Sheet>

                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="outline">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Employee Feedback
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[500px] sm:w-[600px] lg:w-[650px] px-6">
                          <SheetHeader>
                            <SheetTitle className="flex items-center gap-2">
                              <MessageSquare className="w-5 h-5 text-purple-600" />
                              Employee Feedback Center
                            </SheetTitle>
                            <SheetDescription>
                              View and respond to employee feedback
                            </SheetDescription>
                          </SheetHeader>
                          <div className="py-6 space-y-6">
                            <div className="space-y-4">
                              <h4 className="font-medium">Recent Feedback</h4>
                              <div className="space-y-4">
                                <div className="p-4 border rounded-lg">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-purple-600" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm">John Smith</p>
                                        <p className="text-xs text-gray-500">Engineering</p>
                                      </div>
                                    </div>
                                    <Badge className="bg-green-100 text-green-700 text-xs">
                                      Positive
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-700 mb-3">
                                    "The new onboarding process has been fantastic. The digital resources 
                                    and mentorship program really helped me get up to speed quickly."
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-500">2 days ago</p>
                                    <Button size="sm" variant="outline">
                                      Respond
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="p-4 border rounded-lg">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-purple-600" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm">Maria Garcia</p>
                                        <p className="text-xs text-gray-500">Marketing</p>
                                      </div>
                                    </div>
                                    <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                                      Suggestion
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-700 mb-3">
                                    "Could we consider flexible work hours? Many team members would 
                                    benefit from being able to adjust their schedule for better work-life balance."
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-500">5 days ago</p>
                                    <Button size="sm" variant="outline">
                                      Respond
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="p-4 border rounded-lg">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-purple-600" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm">Anonymous</p>
                                        <p className="text-xs text-gray-500">Sales</p>
                                      </div>
                                    </div>
                                    <Badge className="bg-red-100 text-red-700 text-xs">
                                      Concern
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-700 mb-3">
                                    "The current expense reporting system is quite cumbersome. 
                                    It would be great to have a more streamlined mobile-friendly solution."
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-500">1 week ago</p>
                                    <Button size="sm" variant="outline">
                                      Respond
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <SheetFooter>
                            <SheetClose asChild>
                              <Button variant="outline">Close</Button>
                            </SheetClose>
                            <Button>
                              <Plus className="w-4 h-4 mr-2" />
                              Add Response
                            </Button>
                          </SheetFooter>
                        </SheetContent>
                      </Sheet>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* HR Workflows */}
              <section id="hr-workflows" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>HR Workflows</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Specialized drawer components for common HR processes and workflows.</p>
                  </div>

                  <PreviewCard title="HR Process Drawers">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Employee Management</h4>
                        <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li>• Profile editing and information updates</li>
                          <li>• Performance review workflows</li>
                          <li>• Goal setting and tracking interfaces</li>
                          <li>• Training assignment and progress</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Administrative Tasks</h4>
                        <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li>• Time off request and approval</li>
                          <li>• Document management and preview</li>
                          <li>• Feedback collection and responses</li>
                          <li>• Compliance tracking and reporting</li>
                        </ul>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Implementation */}
              <section id="implementation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Implementation</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Code examples and best practices for drawer and sheet components.</p>
                  </div>

                  <PreviewCard title="Basic Drawer Setup">
                    <CodeBlock
                      code={`import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from './ui/drawer';

const BasicDrawer = () => (
  <Drawer>
    <DrawerTrigger asChild>
      <Button>Open Drawer</Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Drawer Title</DrawerTitle>
        <DrawerDescription>
          Drawer description and context information
        </DrawerDescription>
      </DrawerHeader>
      <div className="px-4 space-y-4">
        {/* Drawer content */}
      </div>
      <DrawerFooter>
        <Button>Primary Action</Button>
        <DrawerClose asChild>
          <Button variant="outline">Cancel</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
);`}
                      language="tsx"
                      id="basic-drawer"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>

                  <PreviewCard title="Side Sheet Setup">
                    <CodeBlock
                      code={`import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from './ui/sheet';

const SideSheet = () => (
  <Sheet>
    <SheetTrigger asChild>
      <Button>Open Sheet</Button>
    </SheetTrigger>
    <SheetContent side="right" className="w-[400px] sm:w-[540px]">
      <SheetHeader>
        <SheetTitle>Sheet Title</SheetTitle>
        <SheetDescription>
          Sheet description and context information
        </SheetDescription>
      </SheetHeader>
      <div className="py-6 space-y-6">
        {/* Sheet content */}
      </div>
      <SheetFooter>
        <SheetClose asChild>
          <Button variant="outline">Close</Button>
        </SheetClose>
        <Button>Primary Action</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
);

// Available sides: "top" | "right" | "bottom" | "left"
// Custom widths: className="w-[400px] sm:w-[540px]"`}
                      language="tsx"
                      id="side-sheet"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>

                  <PreviewCard title="Form Integration">
                    <CodeBlock
                      code={`import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from './ui/sheet';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

const FormSheet = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [startDateOpen, setStartDateOpen] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Handle form submission
    setIsSubmitting(false);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Time Off Request</Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[500px]">
        <SheetHeader>
          <SheetTitle>Time Off Request</SheetTitle>
          <SheetDescription>
            Submit a new time off request
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label>Request Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="personal">Personal Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen} modal={true}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? startDate.toLocaleDateString() : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0" 
                  align="start"
                  onPointerDownOutside={(e) => e.preventDefault()}
                  onInteractOutside={(e) => e.preventDefault()}
                >
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setStartDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Reason (Optional)</Label>
              <Textarea placeholder="Provide additional details..." rows={3} />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};`}
                      language="tsx"
                      id="form-integration"
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