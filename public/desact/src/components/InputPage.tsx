import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Upload, Image, Calendar, Clock, Plus, Minus, Search, ChevronDown, Menu, ChevronRight, Layers, Zap, Star, FileText, Mouse, Square, AlignLeft, CheckSquare, Layout, Grid3X3, Settings, List, PieChart, Hash, AlertTriangle, Award, Gauge, ArrowUpDown, Palette as PaletteIcon, Command, Edit, Activity, Package, ArrowRight, Navigation, PanelLeftOpen, Megaphone, Timer, Shield, CheckCircle, XCircle, AlertCircle, Info, Code2, Eye, Paintbrush, Type, MessageSquare, StarIcon, Tag, Bold, Italic, Underline, Filter, X } from 'lucide-react';
import { DesactLogo } from './shared/DesactLogo';
import TimePicker from 'react-time-picker';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { CodeBlock } from './shared/CodeBlock';
import { categoryIcons, componentIcons } from './constants/iconMappings';

interface InputPageProps {
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

export const InputPage: React.FC<InputPageProps> = ({ 
  onBack, 
  components, 
  onComponentClick, 
  currentComponent 
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  
  // Form states for demonstrations
  const [checkboxStates, setCheckboxStates] = useState({
    includeResigned: false,
    showActiveJobs: true,
    includeContractors: false
  });
  const [radioValue, setRadioValue] = useState('full-time');
  const [switchStates, setSwitchStates] = useState({
    enableAlerts: true,
    subscribe: false
  });
  const [sliderValue, setSliderValue] = useState([25000, 75000]);
  const [stepperValue, setStepperValue] = useState(3);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [tags, setTags] = useState(['JavaScript', 'React', 'TypeScript']);
  const [newTag, setNewTag] = useState('');
  const [segmentedValue, setSegmentedValue] = useState('grid');
  const [fileUploaded, setFileUploaded] = useState<File | null>(null);
  
  // Interactive slider state variables for all sliders
  const [basicSlider, setBasicSlider] = useState([50]);
  const [rangeSlider, setRangeSlider] = useState([25, 75]);
  const [stepSlider, setStepSlider] = useState([25]);
  const [minMaxSlider, setMinMaxSlider] = useState([150]);
  const [disabledSlider, setDisabledSlider] = useState([40]);
  const [volumeSlider, setVolumeSlider] = useState([70]);
  const [temperatureSlider, setTemperatureSlider] = useState([22]);
  const [brightnessSlider, setBrightnessSlider] = useState([80]);
  const [priceSlider, setPriceSlider] = useState([500, 2000]);
  const [ageSlider, setAgeSlider] = useState([25, 45]);
  const [speedSlider, setSpeedSlider] = useState([60]);
  const [qualitySlider, setQualitySlider] = useState([85]);

  // Time picker state
  const [selectedTime, setSelectedTime] = useState('14:30');

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
      const sections = ['overview', 'boolean', 'datetime', 'numeric', 'file-media', 'action', 'advanced', 'examples'];
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

  // Custom styled time picker wrapper
  const CustomTimePicker: React.FC<{
    value: string;
    onChange: (value: string) => void;
  }> = ({ value, onChange }) => {
    return (
      <div className="custom-time-picker">
        <TimePicker
          onChange={onChange}
          value={value}
          disableClock={true}
          clearIcon={null}
          clockIcon={<Clock className="h-4 w-4" />}
          format="HH:mm"
          className="w-full"
        />
      </div>
    );
  };

  const sidebarSections = [
    { id: 'overview', label: 'Overview', icon: MessageSquare },
    { id: 'boolean', label: 'Boolean Inputs', icon: CheckSquare },
    { id: 'datetime', label: 'Date & Time', icon: Calendar },
    { id: 'numeric', label: 'Numeric Inputs', icon: Hash },
    { id: 'file-media', label: 'File & Media', icon: Upload },
    { id: 'action', label: 'Action Inputs', icon: Mouse },
    { id: 'advanced', label: 'Advanced Controls', icon: Settings },
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



  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileUploaded(file);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
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
                  <h1 className="text-xl font-semibold">Input Controls</h1>
                  <Badge variant="secondary" className="bg-brown-100 text-brown-700 border-brown-200">
                    Interactive Components
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Comprehensive input controls for every user interaction
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
                      Input Controls Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      A comprehensive collection of input controls designed for modern applications. 
                      From simple checkboxes to advanced condition builders, each component provides 
                      excellent user experience and accessibility.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6 border-brown-200">
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <CheckSquare className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Boolean Inputs</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Checkboxes, radio buttons, and toggle switches for binary choices.</p>
                    </Card>
                    
                    <Card className="p-6 border-brown-200">
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Calendar className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Date & Time</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Date pickers, time selectors, and range components.</p>
                    </Card>
                    
                    <Card className="p-6 border-brown-200">
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Hash className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Numeric Inputs</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Number fields, sliders, and stepper controls.</p>
                    </Card>

                    <Card className="p-6 border-brown-200">
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Settings className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Advanced Controls</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Rich text editors, tag inputs, and condition builders.</p>
                    </Card>
                  </div>
                </div>
              </section>

              {/* Date & Time Section */}
              <section id="datetime" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.2 }}>
                      Date & Time Inputs
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Date and time picker components for handling temporal data input with intuitive interfaces.
                    </p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                    <PreviewBox title="Date Picker">
                      <div className="space-y-4">
                        <div>
                          <Label className="mb-2">Meeting Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <Calendar className="mr-2 h-4 w-4" />
                                {selectedDate ? selectedDate.toLocaleDateString() : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </PreviewBox>

                    <PreviewBox title="Time Picker">
                      <div className="space-y-4">
                        <div>
                          <Label className="mb-2">Meeting Time</Label>
                          <CustomTimePicker
                            value={selectedTime}
                            onChange={setSelectedTime}
                          />
                        </div>
                      </div>
                    </PreviewBox>
                  </div>

                  <CodeBlock
                    id="datetime-code"
                    language="tsx"
                    title="React Code"
                    code={`import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Label } from './ui/label';
import TimePicker from 'react-time-picker';

const DateTimePicker = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('14:30');

  return (
    <div className="space-y-4">
      {/* Date Picker */}
      <div>
        <Label>Meeting Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              {selectedDate ? selectedDate.toLocaleDateString() : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Picker */}
      <div>
        <Label>Meeting Time</Label>
        <div className="custom-time-picker">
          <TimePicker
            onChange={setSelectedTime}
            value={selectedTime}
            disableClock={true}
            clearIcon={null}
            format="HH:mm"
          />
        </div>
      </div>
    </div>
  );
};`}
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />

                  <CodeBlock
                    id="datetime-css-code"
                    language="css"
                    title="CSS Code"
                    code={`/* Time Picker Styling with Brown Theme */
.custom-time-picker .react-time-picker__wrapper {
  display: flex;
  flex-grow: 1;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius);
  background-color: var(--color-bg-primary);
  padding: 0.5rem 0.75rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.custom-time-picker .react-time-picker__wrapper:hover {
  border-color: var(--brown-500);
}

.custom-time-picker .react-time-picker__wrapper:focus-within {
  border-color: var(--brown-600);
  box-shadow: 0 0 0 2px var(--brown-600) / 0.2;
  outline: none;
}

.custom-time-picker .react-time-picker__inputGroup__input {
  min-width: 0.54em;
  height: calc(100% - 2px);
  padding: 0 0.125rem;
  border: 0;
  background: none;
  color: var(--color-text-primary);
  font: inherit;
  -webkit-appearance: textfield;
  -moz-appearance: textfield;
  appearance: textfield;
}

.custom-time-picker .react-time-picker__inputGroup__divider {
  padding: 0 0.125rem;
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
}

.custom-time-picker .react-time-picker__button {
  border: 0;
  background: transparent;
  padding: 0.125rem;
  color: var(--color-text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-time-picker .react-time-picker__button:enabled:hover svg,
.custom-time-picker .react-time-picker__button:enabled:focus svg {
  stroke: var(--brown-600);
}

/* Disabled State */
.custom-time-picker .react-time-picker--disabled {
  background-color: var(--color-bg-disabled);
  color: var(--color-text-disabled);
}

/* Clock Dropdown Styling */
.custom-time-picker .react-time-picker__clock {
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius);
  background: var(--color-bg-primary);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}`}
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </div>
              </section>

              {/* Boolean Inputs Section */}
              <section id="boolean" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.2 }}>
                      Boolean Inputs
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Input controls for binary choices including checkboxes, radio buttons, and toggle switches.
                    </p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                    <PreviewBox title="Checkboxes">
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 h-5">
                            <Checkbox 
                              id="checkbox-1"
                              checked={checkboxStates.includeResigned}
                              onCheckedChange={(checked) => 
                                setCheckboxStates({...checkboxStates, includeResigned: checked as boolean})
                              }
                              className="flex-shrink-0"
                            />
                            <Label htmlFor="checkbox-1" className="text-sm leading-5 flex items-center mb-0">Include resigned employees</Label>
                          </div>
                          
                          <div className="flex items-center space-x-3 h-5">
                            <Checkbox 
                              id="checkbox-2"
                              checked={checkboxStates.showActiveJobs}
                              onCheckedChange={(checked) => 
                                setCheckboxStates({...checkboxStates, showActiveJobs: checked as boolean})
                              }
                              className="flex-shrink-0"
                            />
                            <Label htmlFor="checkbox-2" className="text-sm leading-5 flex items-center mb-0">Show only active jobs</Label>
                          </div>
                        </div>
                      </div>
                    </PreviewBox>

                    <PreviewBox title="Radio Buttons">
                      <div className="space-y-4">
                        <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                          <div className="flex items-center space-x-3 h-5">
                            <RadioGroupItem value="full-time" id="radio-1" className="flex-shrink-0" />
                            <Label htmlFor="radio-1" className="text-sm leading-5 flex items-center mb-0">Full-time</Label>
                          </div>
                          <div className="flex items-center space-x-3 h-5">
                            <RadioGroupItem value="part-time" id="radio-2" className="flex-shrink-0" />
                            <Label htmlFor="radio-2" className="text-sm leading-5 flex items-center mb-0">Part-time</Label>
                          </div>
                          <div className="flex items-center space-x-3 h-5">
                            <RadioGroupItem value="contractor" id="radio-3" className="flex-shrink-0" />
                            <Label htmlFor="contractor" className="text-sm leading-5 flex items-center mb-0">Contractor</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </PreviewBox>
                  </div>

                  <PreviewBox title="Toggle Switches">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="switch-1">Email Alerts</Label>
                          <p className="text-sm text-muted-foreground">Receive email notifications for important updates</p>
                        </div>
                        <Switch 
                          id="switch-1" 
                          checked={switchStates.enableAlerts}
                          onCheckedChange={(checked) => setSwitchStates({...switchStates, enableAlerts: checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="switch-2">Newsletter Subscription</Label>
                          <p className="text-sm text-muted-foreground">Subscribe to our weekly newsletter</p>
                        </div>
                        <Switch 
                          id="switch-2" 
                          checked={switchStates.subscribe}
                          onCheckedChange={(checked) => setSwitchStates({...switchStates, subscribe: checked})}
                        />
                      </div>
                    </div>
                  </PreviewBox>

                  <CodeBlock
                    id="boolean-react-code"
                    language="tsx"
                    title="React Code"
                    code={`import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

const BooleanInputs = () => {
  const [checkboxStates, setCheckboxStates] = useState({
    includeResigned: false,
    showActiveJobs: true,
  });
  const [radioValue, setRadioValue] = useState('full-time');
  const [switchStates, setSwitchStates] = useState({
    enableAlerts: true,
    subscribe: false
  });

  return (
    <div className="space-y-8">
      {/* Checkboxes */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3 h-5">
          <Checkbox 
            id="checkbox-1"
            checked={checkboxStates.includeResigned}
            onCheckedChange={(checked) => 
              setCheckboxStates({...checkboxStates, includeResigned: checked})
            }
          />
          <Label htmlFor="checkbox-1">Include resigned employees</Label>
        </div>
        
        <div className="flex items-center space-x-3 h-5">
          <Checkbox 
            id="checkbox-2"
            checked={checkboxStates.showActiveJobs}
            onCheckedChange={(checked) => 
              setCheckboxStates({...checkboxStates, showActiveJobs: checked})
            }
          />
          <Label htmlFor="checkbox-2">Show only active jobs</Label>
        </div>
      </div>

      {/* Radio Buttons */}
      <RadioGroup value={radioValue} onValueChange={setRadioValue}>
        <div className="flex items-center space-x-3 h-5">
          <RadioGroupItem value="full-time" id="radio-1" />
          <Label htmlFor="radio-1">Full-time</Label>
        </div>
        <div className="flex items-center space-x-3 h-5">
          <RadioGroupItem value="part-time" id="radio-2" />
          <Label htmlFor="radio-2">Part-time</Label>
        </div>
        <div className="flex items-center space-x-3 h-5">
          <RadioGroupItem value="contractor" id="radio-3" />
          <Label htmlFor="contractor">Contractor</Label>
        </div>
      </RadioGroup>

      {/* Toggle Switches */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="switch-1">Email Alerts</Label>
            <p className="text-sm text-muted-foreground">
              Receive email notifications for important updates
            </p>
          </div>
          <Switch 
            id="switch-1" 
            checked={switchStates.enableAlerts}
            onCheckedChange={(checked) => 
              setSwitchStates({...switchStates, enableAlerts: checked})
            }
          />
        </div>
      </div>
    </div>
  );
};`}
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />

                  <CodeBlock
                    id="boolean-css-code"
                    language="css"
                    title="CSS Code"
                    code={`/* Checkbox Styles */
.checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  border: 1px solid var(--color-border-primary);
  border-radius: 4px;
  background-color: var(--color-bg-primary);
  transition: all 0.2s ease;
  cursor: pointer;
}

.checkbox:hover {
  border-color: var(--brown-500);
  background-color: var(--brown-50);
}

.checkbox:checked {
  background-color: var(--brown-600);
  border-color: var(--brown-600);
  color: white;
}

.checkbox:focus {
  outline: 2px solid var(--brown-600);
  outline-offset: 2px;
}

/* Radio Button Styles */
.radio {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  border: 1px solid var(--color-border-primary);
  border-radius: 50%;
  background-color: var(--color-bg-primary);
  transition: all 0.2s ease;
  cursor: pointer;
}

.radio:hover {
  border-color: var(--brown-500);
  background-color: var(--brown-50);
}

.radio:checked {
  border-color: var(--brown-600);
  background-color: var(--color-bg-primary);
}

.radio:checked::after {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--brown-600);
}

.radio:focus {
  outline: 2px solid var(--brown-600);
  outline-offset: 2px;
}

/* Toggle Switch Styles */
.switch {
  position: relative;
  display: inline-flex;
  width: 2.75rem;
  height: 1.5rem;
  border: 1px solid var(--color-border-secondary);
  border-radius: 9999px;
  background-color: var(--color-bg-secondary);
  transition: all 0.2s ease;
  cursor: pointer;
}

.switch:hover {
  background-color: var(--brown-100);
}

.switch:checked {
  background-color: var(--brown-600);
  border-color: var(--brown-600);
}

.switch-thumb {
  position: absolute;
  top: 1px;
  left: 1px;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.switch:checked .switch-thumb {
  transform: translateX(1.25rem);
}

.switch:focus {
  outline: 2px solid var(--brown-600);
  outline-offset: 2px;
}

/* Label Styles */
.input-label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--text-sm--line-height);
  color: var(--color-text-primary);
  cursor: pointer;
}

.input-label:hover {
  color: var(--brown-700);
}

/* Input Container Styles */
.input-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  height: 1.25rem;
}

.input-container .input-label {
  margin-bottom: 0;
  line-height: 1.25rem;
  display: flex;
  align-items: center;
}

/* Disabled States */
.checkbox:disabled,
.radio:disabled,
.switch:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.checkbox:disabled:hover,
.radio:disabled:hover,
.switch:disabled:hover {
  border-color: var(--color-border-primary);
  background-color: var(--color-bg-primary);
}`}
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </div>
              </section>

              {/* Numeric Inputs Section */}
              <section id="numeric" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.2 }}>
                      Numeric Inputs
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Controls for numeric input including sliders, steppers, and number fields with validation.
                    </p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                    <PreviewBox title="Range Slider">
                      <div className="space-y-4">
                        <div>
                          <Label className="mb-3">Price Range</Label>
                          <div className="px-2">
                            <Slider
                              value={priceSlider}
                              onValueChange={setPriceSlider}
                              max={5000}
                              min={0}
                              step={100}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                              <span>${priceSlider[0]}</span>
                              <span>${priceSlider[1]}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </PreviewBox>

                    <PreviewBox title="Single Value Slider">
                      <div className="space-y-4">
                        <div>
                          <Label className="mb-3">Volume Level: {volumeSlider[0]}%</Label>
                          <div className="px-2">
                            <Slider
                              value={volumeSlider}
                              onValueChange={setVolumeSlider}
                              max={100}
                              min={0}
                              step={1}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </PreviewBox>
                  </div>

                  <PreviewBox title="Number Stepper">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Label>Quantity</Label>
                        <div className="flex items-center border border-brown-300 rounded-lg">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setStepperValue(Math.max(1, stepperValue - 1))}
                            className="h-8 w-8 p-0 hover:bg-brown-50"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="px-4 py-1 min-w-[3rem] text-center">{stepperValue}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setStepperValue(stepperValue + 1)}
                            className="h-8 w-8 p-0 hover:bg-brown-50"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </PreviewBox>
                </div>
              </section>

              {/* Examples Section */}
              <section id="examples" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.2 }}>
                      Examples
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Real-world examples showing how to combine different input controls for complex user interfaces.
                    </p>
                  </div>

                  <PreviewBox title="Event Creation Form">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="mb-2">Event Name</Label>
                          <Input placeholder="Enter event name" />
                        </div>
                        
                        <div>
                          <Label className="mb-2">Event Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <Calendar className="mr-2 h-4 w-4" />
                                {selectedDate ? selectedDate.toLocaleDateString() : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div>
                          <Label className="mb-2">Start Time</Label>
                          <CustomTimePicker
                            value={selectedTime}
                            onChange={setSelectedTime}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="mb-2">Event Type</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="meeting">Meeting</SelectItem>
                              <SelectItem value="workshop">Workshop</SelectItem>
                              <SelectItem value="conference">Conference</SelectItem>
                              <SelectItem value="webinar">Webinar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="mb-3">Expected Attendees</Label>
                          <div className="px-2">
                            <Slider
                              value={[50]}
                              onValueChange={() => {}}
                              max={500}
                              min={1}
                              step={5}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                              <span>1</span>
                              <span>50</span>
                              <span>500</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 h-5">
                            <Checkbox id="public-event" className="flex-shrink-0" />
                            <Label htmlFor="public-event" className="text-sm leading-5 flex items-center mb-0">Public event</Label>
                          </div>
                          
                          <div className="flex items-center space-x-3 h-5">
                            <Checkbox id="recording" className="flex-shrink-0" />
                            <Label htmlFor="recording" className="text-sm leading-5 flex items-center mb-0">Enable recording</Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-brown-200">
                      <div className="flex gap-3">
                        <Button className="bg-brown-600 hover:bg-brown-700">Create Event</Button>
                        <Button variant="outline">Save as Draft</Button>
                      </div>
                    </div>
                  </PreviewBox>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};