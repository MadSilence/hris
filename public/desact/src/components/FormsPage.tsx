import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Mail, Lock, Phone, DollarSign, User, Link, CreditCard, ExternalLink, ChevronDown, Menu, Search, ChevronRight, Layers, Zap, Star, FileText, Mouse, Square, AlignLeft, CheckSquare, Layout, Grid3X3, Settings, List, PieChart, Hash, AlertTriangle, Award, Upload, Gauge, ArrowUpDown, Palette as PaletteIcon, Command, Edit, Activity, Package, ArrowRight, Navigation, PanelLeftOpen, Calendar, Megaphone, Timer, Shield, CheckCircle, XCircle, AlertCircle, Info, Code2, Eye, Paintbrush, Type, MessageSquare, StarIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Switch } from './ui/switch';
import { CodeBlock } from './shared/CodeBlock';
import { categoryIcons, componentIcons } from './constants/iconMappings';
import { DesactLogo } from './shared/DesactLogo';

interface FormsPageProps {
  onBack: () => void;
  components: Array<{
    name: string;
    blockCount: number;
    thumbnail: React.ReactNode;
    category: string;
  }>;
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const FormsPage: React.FC<FormsPageProps> = ({ 
  onBack, 
  components, 
  onComponentClick, 
  currentComponent 
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
    phone: '',
    currency: '',
    users: [] as string[],
    link: '',
    creditCard: '',
    website: '',
    dropdown: '',
    multiSelect: [] as string[],
    textarea: '',
    rating: 0,
    rememberPassword: false
  });
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  
  // Additional form states for comprehensive examples
  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    company: '',
    jobTitle: '',
    email: '',
    phone: '',
    country: '',
    website: '',
    message: '',
    budget: '',
    timeline: '',
    services: [] as string[],
    newsletter: false,
    privacy: false
  });
  
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    username: '',
    bio: '',
    location: '',
    website: '',
    twitter: '',
    github: '',
    visibility: 'public',
    notifications: {
      email: true,
      push: false,
      sms: false
    }
  });
  
  const [checkoutForm, setCheckoutForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    saveCard: false,
    sameAsBilling: true,
    newsletter: false
  });

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
      const sections = ['overview', 'text-inputs', 'dropdowns', 'textareas', 'rating', 'states', 'examples'];
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



  const PreviewBox: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = "", title }) => (
    <div className={`bg-white border border-brown-200 rounded-lg p-6 ${className}`}>
      {title && <h4 className="font-medium mb-4">{title}</h4>}
      {children}
    </div>
  );

  const sidebarSections = [
    { id: 'overview', label: 'Overview', icon: MessageSquare },
    { id: 'text-inputs', label: 'Text Inputs', icon: AlignLeft },
    { id: 'dropdowns', label: 'Dropdowns', icon: ChevronDown },
    { id: 'textareas', label: 'Text Areas', icon: MessageSquare },
    { id: 'rating', label: 'Rating Input', icon: StarIcon },
    { id: 'states', label: 'Input States', icon: CheckCircle },
    { id: 'examples', label: 'Examples', icon: Eye },
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



  const copyWebsiteUrl = (url: string) => {
    copyToClipboard(url, 'website-copy');
  };

  const RatingStars: React.FC<{ 
    value: number; 
    onChange?: (value: number) => void; 
    disabled?: boolean;
    error?: boolean;
    size?: 'sm' | 'md' | 'lg';
  }> = ({ value, onChange, disabled = false, error = false, size = 'md' }) => {
    const [hover, setHover] = useState(0);
    
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5', 
      lg: 'h-6 w-6'
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onMouseEnter={() => !disabled && setHover(star)}
            onMouseLeave={() => !disabled && setHover(0)}
            onClick={() => !disabled && onChange?.(star)}
            className={`${sizeClasses[size]} transition-colors ${
              disabled 
                ? 'cursor-not-allowed opacity-50' 
                : 'cursor-pointer hover:scale-110'
            } ${error ? 'text-red-500' : ''}`}
          >
            <StarIcon
              className={`w-full h-full ${
                star <= (hover || value)
                  ? error 
                    ? 'fill-red-500 text-red-500'
                    : 'fill-yellow-400 text-yellow-400'
                  : 'fill-transparent text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
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
                  <h1 className="text-xl font-semibold">Forms</h1>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                    Input Components
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Comprehensive form components with all states and variations
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
                      Forms Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Comprehensive form components designed for accessibility, usability, and visual consistency. 
                      Each input type supports multiple states and provides clear visual feedback to users.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="p-6 border-brown-200">
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <AlignLeft className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Text Inputs</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Email, password, phone, currency, and specialized input types with validation.</p>
                    </Card>
                    
                    <Card className="p-6 border-brown-200">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <ChevronDown className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Dropdowns & Selects</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Single and multi-select dropdowns with search and filtering capabilities.</p>
                    </Card>
                    
                    <Card className="p-6 border-brown-200">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <StarIcon className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Interactive Elements</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Rating inputs, text areas, and complex form interactions.</p>
                    </Card>
                  </div>

                  <PreviewBox title="Basic Form Example">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="demo-email" className="mb-2">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="demo-email"
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10"
                            value={formValues.email}
                            onChange={(e) => setFormValues({...formValues, email: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="demo-password" className="mb-2">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="demo-password"
                            type="password"
                            placeholder="Enter your password"
                            className="pl-10"
                            value={formValues.password}
                            onChange={(e) => setFormValues({...formValues, password: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="remember-password"
                            checked={formValues.rememberPassword}
                            onCheckedChange={(checked) => setFormValues({...formValues, rememberPassword: checked as boolean})}
                          />
                          <Label htmlFor="remember-password" className="text-sm mb-0">
                            Remember password
                          </Label>
                        </div>
                        <Button variant="link" size="sm" className="text-brown-600 hover:text-brown-800 p-0">
                          Forgot Password?
                        </Button>
                      </div>
                      <Button size="lg" className="w-full">Submit</Button>
                    </div>
                  </PreviewBox>
                </div>
              </section>

              {/* Text Inputs Section */}
              <section id="text-inputs" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Text Input Types
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Specialized text inputs for different data types with built-in validation and formatting.
                    </p>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Email Input</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <PreviewBox title="Email States">
                        <div className="space-y-4">
                          <div>
                            <Label>Default</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input type="email" placeholder="Enter your email" className="pl-10" />
                            </div>
                          </div>
                          <div>
                            <Label>Filled</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input type="email" value="user@example.com" className="pl-10" readOnly />
                            </div>
                          </div>
                          <div>
                            <Label>Error</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 h-4 w-4" />
                              <Input type="email" value="invalid-email" className="pl-10 border-red-500 focus:ring-red-500" readOnly />
                            </div>
                            <p className="text-xs text-red-600 mt-1">Please enter a valid email address</p>
                          </div>
                          <div>
                            <Label className="text-gray-400">Disabled</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 h-4 w-4" />
                              <Input type="email" placeholder="Enter your email" className="pl-10" disabled />
                            </div>
                          </div>
                        </div>
                      </PreviewBox>
                      <div className="space-y-4">
                        <CodeBlock
                          code={`import { Mail } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';

function EmailInput() {
  return (
    <div>
      <Label htmlFor="email">Email</Label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          className="pl-10"
        />
      </div>
    </div>
  );
}`}
                          language="tsx"
                          id="email-input"
                          title="Email Input Component"
                          copiedCode={copiedCode}
                          onCopy={copyToClipboard}
                        />
                        <CodeBlock
                          code={`/* Error state styling */
.input-error {
  border-color: var(--color-danger-500);
}

.input-error:focus {
  ring-color: var(--color-danger-500);
  border-color: var(--color-danger-500);
}

.input-error + .error-message {
  color: var(--color-danger-700);
  font-size: var(--text-xs);
  margin-top: 4px;
}`}
                          language="css"
                          id="email-error-styles"
                          title="Error State Styles"
                          copiedCode={copiedCode}
                          onCopy={copyToClipboard}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Password Input</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <PreviewBox title="Password States">
                        <div className="space-y-4">
                          <div>
                            <Label>Default</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input type="password" placeholder="Enter password" className="pl-10" />
                            </div>
                          </div>
                          <div>
                            <Label>Filled</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input type="password" value="password123" className="pl-10" readOnly />
                            </div>
                          </div>
                          <div>
                            <Label>Error</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 h-4 w-4" />
                              <Input type="password" value="123" className="pl-10 border-red-500 focus:ring-red-500" readOnly />
                            </div>
                            <p className="text-xs text-red-600 mt-1">Password must be at least 8 characters</p>
                          </div>
                        </div>
                      </PreviewBox>
                      <CodeBlock
                        code={`import { Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

function PasswordInput() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <Label htmlFor="password">Password</Label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter password"
          className="pl-10 pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}`}
                        language="tsx"
                        id="password-input"
                        title="Password Input with Toggle"
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Phone Number Input</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <PreviewBox title="Phone Input States">
                        <div className="space-y-4">
                          <div>
                            <Label>Default</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input type="tel" placeholder="+1 (555) 000-0000" className="pl-10" />
                            </div>
                          </div>
                          <div>
                            <Label>Filled</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input type="tel" value="+1 (555) 123-4567" className="pl-10" readOnly />
                            </div>
                          </div>
                        </div>
                      </PreviewBox>
                      <CodeBlock
                        code={`import { Phone } from 'lucide-react';

function PhoneInput() {
  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return \`(\${phoneNumber.slice(0, 3)}) \${phoneNumber.slice(3)}\`;
    }
    return \`(\${phoneNumber.slice(0, 3)}) \${phoneNumber.slice(3, 6)}-\${phoneNumber.slice(6, 10)}\`;
  };

  return (
    <div>
      <Label htmlFor="phone">Phone Number</Label>
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          className="pl-10"
          onChange={(e) => {
            e.target.value = formatPhoneNumber(e.target.value);
          }}
        />
      </div>
    </div>
  );
}`}
                        language="tsx"
                        id="phone-input"
                        title="Phone Input with Formatting"
                      />
                    </div>
                  </div>

                  {/* Currency Input */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Currency Input</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <PreviewBox title="Currency Input States">
                        <div className="space-y-4">
                          <div>
                            <Label>Default</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input type="text" placeholder="0.00" className="pl-10" />
                            </div>
                          </div>
                          <div>
                            <Label>Filled</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input type="text" value="1,234.56" className="pl-10" readOnly />
                            </div>
                          </div>
                        </div>
                      </PreviewBox>
                      <CodeBlock
                        code={`import { DollarSign } from 'lucide-react';

function CurrencyInput() {
  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length > 1 ? \`\${parts[0]}.\${parts[1].slice(0, 2)}\` : parts[0];
  };

  return (
    <div>
      <Label htmlFor="amount">Amount</Label>
      <div className="relative">
        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          id="amount"
          type="text"
          placeholder="0.00"
          className="pl-10"
          onChange={(e) => {
            e.target.value = formatCurrency(e.target.value);
          }}
        />
      </div>
    </div>
  );
}`}
                        language="tsx"
                        id="currency-input"
                        title="Currency Input with Formatting"
                      />
                    </div>
                  </div>

                  {/* Credit Card Input */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Credit Card Input</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <PreviewBox title="Credit Card Input">
                        <div className="space-y-4">
                          <div>
                            <Label>Card Number</Label>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input type="text" placeholder="1234 5678 9012 3456" className="pl-10" maxLength={19} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Expiry</Label>
                              <Input type="text" placeholder="MM/YY" maxLength={5} />
                            </div>
                            <div>
                              <Label>CVV</Label>
                              <Input type="text" placeholder="123" maxLength={4} />
                            </div>
                          </div>
                        </div>
                      </PreviewBox>
                      <CodeBlock
                        code={`import { CreditCard } from 'lucide-react';

function CreditCardInput() {
  const formatCardNumber = (value: string) => {
    const cardNumber = value.replace(/[^\d]/g, '');
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value: string) => {
    const expiry = value.replace(/[^\d]/g, '');
    if (expiry.length >= 2) {
      return \`\${expiry.slice(0, 2)}/\${expiry.slice(2, 4)}\`;
    }
    return expiry;
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="cardNumber">Card Number</Label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="cardNumber"
            type="text"
            placeholder="1234 5678 9012 3456"
            className="pl-10"
            maxLength={19}
            onChange={(e) => {
              e.target.value = formatCardNumber(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="expiry">Expiry</Label>
          <Input
            id="expiry"
            type="text"
            placeholder="MM/YY"
            maxLength={5}
            onChange={(e) => {
              e.target.value = formatExpiry(e.target.value);
            }}
          />
        </div>
        <div>
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            type="text"
            placeholder="123"
            maxLength={4}
          />
        </div>
      </div>
    </div>
  );
}`}
                        language="tsx"
                        id="credit-card-input"
                        title="Credit Card Input with Validation"
                      />
                    </div>
                  </div>

                  {/* Website URL Input */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Website URL Input</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <PreviewBox title="URL Input with Copy Action">
                        <div className="space-y-4">
                          <div>
                            <Label>Website URL</Label>
                            <div className="relative">
                              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input 
                                type="url" 
                                placeholder="https://example.com" 
                                className="pl-10 pr-10"
                                value="https://example.com"
                                readOnly
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyWebsiteUrl('https://example.com')}
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                              >
                                {copiedCode === 'website-copy' ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label>With External Link</Label>
                            <div className="relative">
                              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input 
                                type="url" 
                                placeholder="https://example.com" 
                                className="pl-10 pr-10"
                                value="https://example.com"
                                readOnly
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open('https://example.com', '_blank')}
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </PreviewBox>
                      <CodeBlock
                        code={`import { Link, Copy, ExternalLink, Check } from 'lucide-react';
import { useState } from 'react';

function WebsiteInput() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL');
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div>
      <Label htmlFor="website">Website URL</Label>
      <div className="relative">
        <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          id="website"
          type="url"
          placeholder="https://example.com"
          className="pl-10 pr-20"
          value="https://example.com"
        />
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard('https://example.com')}
            className="h-8 w-8 p-0"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openInNewTab('https://example.com')}
            className="h-8 w-8 p-0"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}`}
                        language="tsx"
                        id="website-input"
                        title="Website URL Input with Actions"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Dropdowns Section */}
              <section id="dropdowns" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Dropdown Components
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Single and multi-select dropdown components with various states and customization options.
                    </p>
                  </div>

                  {/* Single Select Dropdown */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Single Select Dropdown</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <PreviewBox title="Dropdown States">
                        <div className="space-y-4">
                          <div>
                            <Label>Default</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="option1">Option 1</SelectItem>
                                <SelectItem value="option2">Option 2</SelectItem>
                                <SelectItem value="option3">Option 3</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Selected</Label>
                            <Select value="option2">
                              <SelectTrigger>
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="option1">Option 1</SelectItem>
                                <SelectItem value="option2">Option 2</SelectItem>
                                <SelectItem value="option3">Option 3</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Error</Label>
                            <Select>
                              <SelectTrigger className="border-red-500 focus:ring-red-500">
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="option1">Option 1</SelectItem>
                                <SelectItem value="option2">Option 2</SelectItem>
                                <SelectItem value="option3">Option 3</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-red-600 mt-1">Please select an option</p>
                          </div>
                          <div>
                            <Label className="text-gray-400">Disabled</Label>
                            <Select disabled>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                            </Select>
                          </div>
                        </div>
                      </PreviewBox>
                      <CodeBlock
                        code={`import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

function SingleSelectDropdown() {
  const [value, setValue] = useState('');

  return (
    <div>
      <Label htmlFor="select-option">Choose Option</Label>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
          <SelectItem value="option4">Option 4</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}`}
                        language="tsx"
                        id="single-select"
                        title="Single Select Dropdown"
                      />
                    </div>
                  </div>

                  {/* Multi-Select Dropdown */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Multi-Select Dropdown</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <PreviewBox title="Multi-Select Example">
                        <div className="space-y-4">
                          <div>
                            <Label>Multiple Selection</Label>
                            <div className="border border-gray-300 rounded-md p-3 min-h-[40px] flex flex-wrap gap-2">
                              <Badge variant="secondary" className="bg-brown-100 text-brown-700">
                                JavaScript
                                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </Badge>
                              <Badge variant="secondary" className="bg-brown-100 text-brown-700">
                                React
                                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </Badge>
                              <Badge variant="secondary" className="bg-brown-100 text-brown-700">
                                TypeScript
                                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label>With Search</Label>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input 
                                type="text" 
                                placeholder="Search and select skills..." 
                                className="pl-10"
                              />
                            </div>
                          </div>
                        </div>
                      </PreviewBox>
                      <CodeBlock
                        code={`import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { XCircle, Search } from 'lucide-react';

function MultiSelectDropdown() {
  const [selectedItems, setSelectedItems] = useState<string[]>(['JavaScript', 'React']);
  const [searchTerm, setSearchTerm] = useState('');
  
  const allOptions = [
    'JavaScript', 'React', 'TypeScript', 'Node.js', 
    'Python', 'Java', 'C++', 'Go', 'Rust'
  ];

  const filteredOptions = allOptions.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedItems.includes(option)
  );

  const removeItem = (item: string) => {
    setSelectedItems(prev => prev.filter(i => i !== item));
  };

  const addItem = (item: string) => {
    setSelectedItems(prev => [...prev, item]);
    setSearchTerm('');
  };

  return (
    <div>
      <Label>Skills</Label>
      <div className="border border-gray-300 rounded-md p-3 min-h-[40px] flex flex-wrap gap-2 mb-2">
        {selectedItems.map(item => (
          <Badge key={item} variant="secondary" className="bg-brown-100 text-brown-700">
            {item}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem(item)}
              className="h-4 w-4 p-0 ml-1"
            >
              <XCircle className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search and select skills..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && filteredOptions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 shadow-lg z-10">
            {filteredOptions.slice(0, 5).map(option => (
              <button
                key={option}
                onClick={() => addItem(option)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}`}
                        language="tsx"
                        id="multi-select"
                        title="Multi-Select with Search"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Text Areas Section */}
              <section id="textareas" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Text Area Components
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Multi-line text input areas with various states and auto-resizing capabilities.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewBox title="Text Area States">
                      <div className="space-y-4">
                        <div>
                          <Label>Default</Label>
                          <Textarea placeholder="Enter your message..." rows={3} />
                        </div>
                        <div>
                          <Label>Filled</Label>
                          <Textarea 
                            value="This is a sample text area with some content already filled in. It demonstrates how the component looks when it contains text."
                            rows={3}
                            readOnly
                          />
                        </div>
                        <div>
                          <Label>Error</Label>
                          <Textarea 
                            placeholder="Enter your message..." 
                            rows={3}
                            className="border-red-500 focus:ring-red-500"
                          />
                          <p className="text-xs text-red-600 mt-1">Message is required</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Disabled</Label>
                          <Textarea placeholder="Enter your message..." rows={3} disabled />
                        </div>
                      </div>
                    </PreviewBox>
                    <div className="space-y-4">
                      <CodeBlock
                        code={`import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

function TextAreaExample() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (error && e.target.value) {
      setError('');
    }
  };

  const handleBlur = () => {
    if (!value.trim()) {
      setError('Message is required');
    }
  };

  return (
    <div>
      <Label htmlFor="message">Message</Label>
      <Textarea
        id="message"
        placeholder="Enter your message..."
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={error ? 'border-red-500 focus:ring-red-500' : ''}
        rows={4}
      />
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}`}
                        language="tsx"
                        id="textarea-basic"
                        title="Basic Text Area with Validation"
                      />
                      <CodeBlock
                        code={`/* Auto-resizing textarea */
function AutoResizeTextarea() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = \`\${textarea.scrollHeight}px\`;
    }
  };

  return (
    <Textarea
      ref={textareaRef}
      placeholder="Type here... (auto-resizes)"
      className="resize-none overflow-hidden"
      rows={1}
      onChange={(e) => {
        adjustHeight();
        // Handle value change
      }}
    />
  );
}`}
                        language="tsx"
                        id="textarea-auto-resize"
                        title="Auto-Resizing Text Area"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Rating Input Section */}
              <section id="rating" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Rating Input Components
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Interactive star rating components with hover effects and various states.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewBox title="Rating States">
                      <div className="space-y-6">
                        <div>
                          <Label>Default (Interactive)</Label>
                          <RatingStars value={rating} onChange={setRating} />
                          <p className="text-xs text-gray-600 mt-1">Current rating: {rating}/5</p>
                        </div>
                        <div>
                          <Label>Filled</Label>
                          <RatingStars value={4} />
                          <p className="text-xs text-gray-600 mt-1">4 out of 5 stars</p>
                        </div>
                        <div>
                          <Label>Error State</Label>
                          <RatingStars value={0} error />
                          <p className="text-xs text-red-600 mt-1">Please provide a rating</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Disabled</Label>
                          <RatingStars value={3} disabled />
                          <p className="text-xs text-gray-400 mt-1">Rating disabled</p>
                        </div>
                        <div>
                          <Label>Small Size</Label>
                          <RatingStars value={5} size="sm" />
                        </div>
                        <div>
                          <Label>Large Size</Label>
                          <RatingStars value={2} size="lg" />
                        </div>
                      </div>
                    </PreviewBox>
                    <div className="space-y-4">
                      <CodeBlock
                        code={`import { Star } from 'lucide-react';
import { useState } from 'react';

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

function RatingStars({ 
  value, 
  onChange, 
  disabled = false, 
  error = false, 
  size = 'md' 
}: RatingStarsProps) {
  const [hover, setHover] = useState(0);
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5', 
    lg: 'h-6 w-6'
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => !disabled && setHover(0)}
          onClick={() => !disabled && onChange?.(star)}
          className={\`\${sizeClasses[size]} transition-colors \${
            disabled 
              ? 'cursor-not-allowed opacity-50' 
              : 'cursor-pointer hover:scale-110'
          } \${error ? 'text-red-500' : ''}\`}
        >
          <Star
            className={\`w-full h-full \${
              star <= (hover || value)
                ? error 
                  ? 'fill-red-500 text-red-500'
                  : 'fill-yellow-400 text-yellow-400'
                : 'fill-transparent text-gray-300'
            }\`}
          />
        </button>
      ))}
    </div>
  );
}`}
                        language="tsx"
                        id="rating-stars"
                        title="Rating Stars Component"
                      />
                      <CodeBlock
                        code={`/* Usage Example */
function RatingForm() {
  const [rating, setRating] = useState(0);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }
    setError('');
    // Submit rating
  };

  return (
    <div>
      <Label>Rate this product</Label>
      <RatingStars 
        value={rating} 
        onChange={(value) => {
          setRating(value);
          setError('');
        }}
        error={!!error}
      />
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
      <Button size="lg" onClick={handleSubmit} className="mt-4">
        Submit Rating
      </Button>
    </div>
  );
}`}
                        language="tsx"
                        id="rating-form"
                        title="Rating Form Example"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Input States Section */}
              <section id="states" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Input States Guide
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Comprehensive guide to all input states and their visual representations.
                    </p>
                  </div>

                  <PreviewBox title="Complete State Examples">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="font-semibold">Text Input States</h4>
                        <div className="space-y-3">
                          <div>
                            <Label>Default</Label>
                            <Input placeholder="Default state" />
                          </div>
                          <div>
                            <Label>Hover (hover to see)</Label>
                            <Input placeholder="Hover state" className="hover:border-brown-400" />
                          </div>
                          <div>
                            <Label>Focus</Label>
                            <Input placeholder="Focus state" className="ring-2 ring-brown-500 border-brown-500" />
                          </div>
                          <div>
                            <Label>Filled</Label>
                            <Input value="Filled with content" readOnly />
                          </div>
                          <div>
                            <Label>Error</Label>
                            <Input value="Invalid input" className="border-red-500 ring-2 ring-red-500" readOnly />
                            <p className="text-xs text-red-600 mt-1">This field has an error</p>
                          </div>
                          <div>
                            <Label className="text-gray-400">Disabled</Label>
                            <Input placeholder="Disabled state" disabled />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-semibold">Select States</h4>
                        <div className="space-y-3">
                          <div>
                            <Label>Default</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose option" />
                              </SelectTrigger>
                            </Select>
                          </div>
                          <div>
                            <Label>Selected</Label>
                            <Select value="selected">
                              <SelectTrigger>
                                <SelectValue placeholder="Choose option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="selected">Selected Option</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Error</Label>
                            <Select>
                              <SelectTrigger className="border-red-500 focus:ring-red-500">
                                <SelectValue placeholder="Choose option" />
                              </SelectTrigger>
                            </Select>
                            <p className="text-xs text-red-600 mt-1">Selection required</p>
                          </div>
                          <div>
                            <Label className="text-gray-400">Disabled</Label>
                            <Select disabled>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose option" />
                              </SelectTrigger>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PreviewBox>

                  <CodeBlock
                    code={`/* CSS for consistent form states */
.form-input {
  @apply border border-gray-300 rounded-md px-3 py-2;
  @apply focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-brown-500;
  @apply disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed;
  @apply transition-colors duration-200;
}

.form-input:hover:not(:disabled) {
  @apply border-brown-400;
}

.form-input.error {
  @apply border-red-500 focus:ring-red-500 focus:border-red-500;
}

.form-input.filled {
  @apply bg-gray-50;
}

/* Label states */
.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.form-label.disabled {
  @apply text-gray-400;
}

/* Error message styling */
.form-error {
  @apply text-xs text-red-600 mt-1;
}

/* Success state */
.form-input.success {
  @apply border-green-500 focus:ring-green-500 focus:border-green-500;
}

.form-success {
  @apply text-xs text-green-600 mt-1;
}`}
                    language="css"
                    id="form-states-css"
                    title="Form States CSS Classes"
                  />
                </div>
              </section>

              {/* Examples Section */}
              <section id="examples" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Complete Form Examples
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Real-world form examples combining multiple input types and validation patterns.
                    </p>
                  </div>

                  <PreviewBox title="Contact Form Example">
                    <form className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input id="firstName" placeholder="John" />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input id="lastName" placeholder="Doe" />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="contactEmail">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input id="contactEmail" type="email" placeholder="john@example.com" className="pl-10" />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="contactPhone">Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input id="contactPhone" type="tel" placeholder="+1 (555) 000-0000" className="pl-10" />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="startup">Startup (1-10)</SelectItem>
                            <SelectItem value="small">Small (11-50)</SelectItem>
                            <SelectItem value="medium">Medium (51-200)</SelectItem>
                            <SelectItem value="large">Large (200+)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" placeholder="Tell us about your project..." rows={4} />
                      </div>

                      <div>
                        <Label>Rate our service</Label>
                        <RatingStars value={0} onChange={(value) => console.log('Rating:', value)} />
                      </div>

                      <Button size="lg" type="submit" className="w-full">Send Message</Button>
                    </form>
                  </PreviewBox>

                  <CodeBlock
                    code={`import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Mail, Phone } from 'lucide-react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  rating: number;
}

function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    rating: 0
  });
  
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    if (formData.rating === 0) {
      newErrors.rating = 'Please provide a rating';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Form submitted:', formData);
      // Handle form submission
    }
  };

  const updateField = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            className={errors.firstName ? 'border-red-500 focus:ring-red-500' : ''}
          />
          {errors.firstName && (
            <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>
          )}
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            className={\`pl-10 \${errors.email ? 'border-red-500 focus:ring-red-500' : ''}\`}
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-600 mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Tell us about your project..."
          rows={4}
          value={formData.message}
          onChange={(e) => updateField('message', e.target.value)}
          className={errors.message ? 'border-red-500 focus:ring-red-500' : ''}
        />
        {errors.message && (
          <p className="text-xs text-red-600 mt-1">{errors.message}</p>
        )}
      </div>

      <div>
        <Label>Rate our service</Label>
        <RatingStars
          value={formData.rating}
          onChange={(value) => updateField('rating', value)}
          error={!!errors.rating}
        />
        {errors.rating && (
          <p className="text-xs text-red-600 mt-1">{errors.rating}</p>
        )}
      </div>

      <Button size="lg" type="submit" className="w-full">
        Send Message
      </Button>
    </form>
  );
}`}
                    language="tsx"
                    id="complete-form"
                    title="Complete Contact Form with Validation"
                  />
                </div>
              </section>

              {/* Enhanced Examples Section */}
              <section className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Comprehensive Form Examples
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Real-world form examples demonstrating complex layouts, validation, and user interactions.
                    </p>
                  </div>

                  {/* Contact Form */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Contact Form</h3>
                    <PreviewBox title="Business Contact Form">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="mb-2">First Name</Label>
                              <Input 
                                placeholder="John"
                                value={contactForm.firstName}
                                onChange={(e) => setContactForm({...contactForm, firstName: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label className="mb-2">Last Name</Label>
                              <Input 
                                placeholder="Doe"
                                value={contactForm.lastName}
                                onChange={(e) => setContactForm({...contactForm, lastName: e.target.value})}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label className="mb-2">Company</Label>
                            <Input 
                              placeholder="Your company name"
                              value={contactForm.company}
                              onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                            />
                          </div>
                          
                          <div>
                            <Label className="mb-2">Job Title</Label>
                            <Input 
                              placeholder="Your role"
                              value={contactForm.jobTitle}
                              onChange={(e) => setContactForm({...contactForm, jobTitle: e.target.value})}
                            />
                          </div>
                          
                          <div>
                            <Label className="mb-2">Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input 
                                type="email" 
                                placeholder="your@email.com"
                                className="pl-10"
                                value={contactForm.email}
                                onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="mb-2">Phone</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input 
                                type="tel" 
                                placeholder="+1 (555) 123-4567"
                                className="pl-10"
                                value={contactForm.phone}
                                onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label className="mb-2">Country</Label>
                            <Select value={contactForm.country} onValueChange={(value) => setContactForm({...contactForm, country: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your country" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="us">United States</SelectItem>
                                <SelectItem value="ca">Canada</SelectItem>
                                <SelectItem value="uk">United Kingdom</SelectItem>
                                <SelectItem value="au">Australia</SelectItem>
                                <SelectItem value="de">Germany</SelectItem>
                                <SelectItem value="fr">France</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="mb-2">Budget Range</Label>
                            <Select value={contactForm.budget} onValueChange={(value) => setContactForm({...contactForm, budget: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select budget range" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                                <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                                <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                                <SelectItem value="50k+">$50,000+</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="mb-2">Project Timeline</Label>
                            <Select value={contactForm.timeline} onValueChange={(value) => setContactForm({...contactForm, timeline: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="When do you need this completed?" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="asap">ASAP</SelectItem>
                                <SelectItem value="1-month">Within 1 month</SelectItem>
                                <SelectItem value="2-3-months">2-3 months</SelectItem>
                                <SelectItem value="6-months">Within 6 months</SelectItem>
                                <SelectItem value="planning">Just planning ahead</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="mb-2">Message</Label>
                            <Textarea 
                              placeholder="Tell us about your project..."
                              rows={6}
                              value={contactForm.message}
                              onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                            />
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="newsletter"
                                checked={contactForm.newsletter}
                                onCheckedChange={(checked) => setContactForm({...contactForm, newsletter: checked as boolean})}
                              />
                              <Label htmlFor="newsletter" className="mb-0">Subscribe to our newsletter</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="privacy"
                                checked={contactForm.privacy}
                                onCheckedChange={(checked) => setContactForm({...contactForm, privacy: checked as boolean})}
                              />
                              <Label htmlFor="privacy" className="mb-0">I agree to the privacy policy</Label>
                            </div>
                          </div>

                          <Button size="lg" className="w-full">Send Message</Button>
                        </div>
                      </div>
                    </PreviewBox>
                  </div>

                  {/* User Profile Form */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">User Profile Form</h3>
                    <PreviewBox title="Profile Settings">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <Label className="mb-2">Profile Picture</Label>
                            <div className="flex items-center gap-4">
                              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="w-10 h-10 text-gray-400" />
                              </div>
                              <div>
                                <Button variant="outline" size="sm">
                                  <Upload className="w-4 h-4 mr-2" />
                                  Change Photo
                                </Button>
                                <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 2MB</p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label className="mb-2">Full Name</Label>
                            <Input 
                              placeholder="Enter your full name"
                              value={profileForm.fullName}
                              onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                            />
                          </div>

                          <div>
                            <Label className="mb-2">Username</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</span>
                              <Input 
                                placeholder="username"
                                className="pl-8"
                                value={profileForm.username}
                                onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="mb-2">Bio</Label>
                            <Textarea 
                              placeholder="Tell us about yourself..."
                              rows={4}
                              value={profileForm.bio}
                              onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                            />
                          </div>

                          <div>
                            <Label className="mb-2">Location</Label>
                            <Input 
                              placeholder="City, Country"
                              value={profileForm.location}
                              onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <Label className="mb-2">Website</Label>
                            <div className="relative">
                              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input 
                                placeholder="https://yourwebsite.com"
                                className="pl-10"
                                value={profileForm.website}
                                onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="mb-2">Twitter</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</span>
                              <Input 
                                placeholder="username"
                                className="pl-8"
                                value={profileForm.twitter}
                                onChange={(e) => setProfileForm({...profileForm, twitter: e.target.value})}
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="mb-2">GitHub</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</span>
                              <Input 
                                placeholder="username"
                                className="pl-8"
                                value={profileForm.github}
                                onChange={(e) => setProfileForm({...profileForm, github: e.target.value})}
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="mb-3">Profile Visibility</Label>
                            <RadioGroup value={profileForm.visibility} onValueChange={(value) => setProfileForm({...profileForm, visibility: value})}>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="public" id="public" />
                                <Label htmlFor="public" className="mb-0">Public - Anyone can see your profile</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="private" id="private" />
                                <Label htmlFor="private" className="mb-0">Private - Only you can see your profile</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="friends" id="friends" />
                                <Label htmlFor="friends" className="mb-0">Friends only - Only your connections</Label>
                              </div>
                            </RadioGroup>
                          </div>

                          <div>
                            <Label className="mb-3">Notification Preferences</Label>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="email-notif">Email notifications</Label>
                                <Switch
                                  id="email-notif"
                                  checked={profileForm.notifications.email}
                                  onCheckedChange={(checked) => 
                                    setProfileForm({
                                      ...profileForm, 
                                      notifications: {...profileForm.notifications, email: checked}
                                    })
                                  }
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label htmlFor="push-notif">Push notifications</Label>
                                <Switch
                                  id="push-notif"
                                  checked={profileForm.notifications.push}
                                  onCheckedChange={(checked) => 
                                    setProfileForm({
                                      ...profileForm, 
                                      notifications: {...profileForm.notifications, push: checked}
                                    })
                                  }
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label htmlFor="sms-notif">SMS notifications</Label>
                                <Switch
                                  id="sms-notif"
                                  checked={profileForm.notifications.sms}
                                  onCheckedChange={(checked) => 
                                    setProfileForm({
                                      ...profileForm, 
                                      notifications: {...profileForm.notifications, sms: checked}
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button size="lg" className="flex-1">Save Changes</Button>
                            <Button size="lg" variant="outline">Cancel</Button>
                          </div>
                        </div>
                      </div>
                    </PreviewBox>
                  </div>

                  {/* Checkout Form */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Checkout Form</h3>
                    <PreviewBox title="Payment & Shipping Information">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-semibold mb-4">Contact Information</h4>
                            <div className="space-y-4">
                              <div>
                                <Label className="mb-2">Email Address</Label>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                  <Input 
                                    type="email" 
                                    placeholder="your@email.com"
                                    className="pl-10"
                                    value={checkoutForm.email}
                                    onChange={(e) => setCheckoutForm({...checkoutForm, email: e.target.value})}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-4">Shipping Address</h4>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="mb-2">First Name</Label>
                                  <Input 
                                    placeholder="John"
                                    value={checkoutForm.firstName}
                                    onChange={(e) => setCheckoutForm({...checkoutForm, firstName: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label className="mb-2">Last Name</Label>
                                  <Input 
                                    placeholder="Doe"
                                    value={checkoutForm.lastName}
                                    onChange={(e) => setCheckoutForm({...checkoutForm, lastName: e.target.value})}
                                  />
                                </div>
                              </div>

                              <div>
                                <Label className="mb-2">Address</Label>
                                <Input 
                                  placeholder="123 Main Street"
                                  value={checkoutForm.address}
                                  onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="mb-2">City</Label>
                                  <Input 
                                    placeholder="New York"
                                    value={checkoutForm.city}
                                    onChange={(e) => setCheckoutForm({...checkoutForm, city: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label className="mb-2">State</Label>
                                  <Select value={checkoutForm.state} onValueChange={(value) => setCheckoutForm({...checkoutForm, state: value})}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select state" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="ny">New York</SelectItem>
                                      <SelectItem value="ca">California</SelectItem>
                                      <SelectItem value="tx">Texas</SelectItem>
                                      <SelectItem value="fl">Florida</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="mb-2">ZIP Code</Label>
                                  <Input 
                                    placeholder="10001"
                                    value={checkoutForm.zipCode}
                                    onChange={(e) => setCheckoutForm({...checkoutForm, zipCode: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label className="mb-2">Country</Label>
                                  <Select value={checkoutForm.country} onValueChange={(value) => setCheckoutForm({...checkoutForm, country: value})}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="us">United States</SelectItem>
                                      <SelectItem value="ca">Canada</SelectItem>
                                      <SelectItem value="uk">United Kingdom</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <h4 className="font-semibold mb-4">Payment Information</h4>
                            <div className="space-y-4">
                              <div>
                                <Label className="mb-2">Card Number</Label>
                                <div className="relative">
                                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                  <Input 
                                    placeholder="1234 5678 9012 3456"
                                    className="pl-10"
                                    value={checkoutForm.cardNumber}
                                    onChange={(e) => setCheckoutForm({...checkoutForm, cardNumber: e.target.value})}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="mb-2">Expiry Date</Label>
                                  <Input 
                                    placeholder="MM/YY"
                                    value={checkoutForm.expiryDate}
                                    onChange={(e) => setCheckoutForm({...checkoutForm, expiryDate: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label className="mb-2">CVV</Label>
                                  <Input 
                                    placeholder="123"
                                    value={checkoutForm.cvv}
                                    onChange={(e) => setCheckoutForm({...checkoutForm, cvv: e.target.value})}
                                  />
                                </div>
                              </div>

                              <div>
                                <Label className="mb-2">Cardholder Name</Label>
                                <Input 
                                  placeholder="John Doe"
                                  value={checkoutForm.cardName}
                                  onChange={(e) => setCheckoutForm({...checkoutForm, cardName: e.target.value})}
                                />
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id="save-card"
                                  checked={checkoutForm.saveCard}
                                  onCheckedChange={(checked) => setCheckoutForm({...checkoutForm, saveCard: checked as boolean})}
                                />
                                <Label htmlFor="save-card" className="mb-0">Save this card for future purchases</Label>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold mb-3">Order Summary</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>$129.99</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>$9.99</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tax</span>
                                <span>$11.20</span>
                              </div>
                              <div className="border-t pt-2 flex justify-between font-semibold">
                                <span>Total</span>
                                <span>$151.18</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="billing-same"
                                checked={checkoutForm.sameAsBilling}
                                onCheckedChange={(checked) => setCheckoutForm({...checkoutForm, sameAsBilling: checked as boolean})}
                              />
                              <Label htmlFor="billing-same" className="mb-0">Billing address same as shipping</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="checkout-newsletter"
                                checked={checkoutForm.newsletter}
                                onCheckedChange={(checked) => setCheckoutForm({...checkoutForm, newsletter: checked as boolean})}
                              />
                              <Label htmlFor="checkout-newsletter" className="mb-0">Subscribe to our newsletter</Label>
                            </div>
                          </div>

                          <Button size="lg" className="w-full">Complete Purchase</Button>
                        </div>
                      </div>
                    </PreviewBox>
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