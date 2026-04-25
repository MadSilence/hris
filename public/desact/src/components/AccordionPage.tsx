import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Users, FileText, Shield, Heart, DollarSign, Clock, BookOpen, CheckCircle, AlertCircle, HelpCircle, Calendar, Building2, Award, Briefcase, GraduationCap, Coffee, Plane, Settings, User, Mail, Phone, MapPin, Target, TrendingUp, Search, ChevronRight, ChevronDown, Menu, Layers, Zap, Star, Mouse, Square, AlignLeft, CheckSquare, Layout, Grid3X3, List, PieChart, Hash, AlertTriangle, Upload, Gauge, ArrowUpDown, Palette as PaletteIcon, Command, Edit, Activity, Package, ArrowRight, Navigation, PanelLeftOpen, Megaphone, Timer, XCircle, Info, Code2, Eye, Paintbrush, Type, CreditCard, Lock, RefreshCw, Package2, UserCheck, Database, Monitor, Key, Smartphone, Globe, FileCheck, Banknote, MoreHorizontal } from 'lucide-react';
import { DesactLogo } from './shared/DesactLogo';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
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
  'Buttons': Square,
  'Forms': Edit,
  'Input': Layout,
  'Layout': Layout,
  'HR Cards': CreditCard,
  'Accordion': List,
  'Navigation': Navigation,
  'Breadcrumbs': ArrowRight,
  'Pagination': ArrowUpDown,
  'Interaction': Award,
  'Badges': Award,
  'Alerts': AlertTriangle,
  'Data Display': Grid3X3,
  'Charts': PieChart,
  'Lists': List,
  'Skeletons': Package,
  'Modals': Square,
  'Drawer': PanelLeftOpen,
  'Avatars': User,
  'File Upload': Upload,
  'Dashboard': Gauge,
  'Simple Insight': TrendingUp,
  'Color Picker': Paintbrush,
  'Command Menu': Command,
  'Text Editor': Edit,
  'Status': Activity,
  'Typography': Type,
  'System Colors': PaletteIcon,
  'Icons': Hash,
  'Miscellaneous': Settings,
  'Default': Package
};

interface AccordionPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const AccordionPage: React.FC<AccordionPageProps> = ({ 
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
      const sections = ['overview', 'employee-policies', 'benefits-information', 'department-faqs', 'onboarding-checklist', 'profile-stepper', 'account-management', 'account-setup', 'hr-system-onboarding'];
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
    { id: 'overview', label: 'Overview', icon: List },
    { id: 'employee-policies', label: 'Employee Policies', icon: Shield },
    { id: 'benefits-information', label: 'Benefits Information', icon: Heart },
    { id: 'department-faqs', label: 'Department FAQs', icon: HelpCircle },
    { id: 'onboarding-checklist', label: 'Onboarding Checklist', icon: CheckCircle },
    { id: 'profile-stepper', label: 'Profile Stepper', icon: User },
    { id: 'account-management', label: 'Account Management', icon: Database },
    { id: 'account-setup', label: 'Account Setup', icon: UserCheck },
    { id: 'hr-system-onboarding', label: 'System Onboarding', icon: Monitor },
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



  const accordionData = components.find(comp => comp.name === 'Accordion');



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

  const sections = [
    {
      id: 'employee-policies',
      title: 'Employee Policies',
      description: 'Comprehensive company policies and guidelines',
      examples: [
        {
          title: 'Company Policies Accordion',
          description: 'Essential HR policies and procedures',
          code: `<Accordion type="single" collapsible className="w-full">
  <AccordionItem value="code-of-conduct">
    <AccordionTrigger className="text-left">
      <div className="flex items-center gap-3">
        <Shield className="w-4 h-4 text-brown-600" />
        Code of Conduct
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Our code of conduct outlines the ethical standards and behavioral expectations for all employees.
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            Treat all colleagues with respect and professionalism
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            Maintain confidentiality of sensitive information
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            Report any violations or concerns to HR immediately
          </li>
        </ul>
      </div>
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="attendance-policy">
    <AccordionTrigger className="text-left">
      <div className="flex items-center gap-3">
        <Clock className="w-4 h-4 text-brown-600" />
        Attendance & Time Off Policy
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-brown-50 rounded-lg">
            <h4 className="font-medium mb-2">Working Hours</h4>
            <p className="text-sm text-gray-600">Standard: 9:00 AM - 6:00 PM</p>
            <p className="text-sm text-gray-600">Flexible hours available</p>
          </div>
          <div className="p-4 bg-brown-50 rounded-lg">
            <h4 className="font-medium mb-2">PTO Allowance</h4>
            <p className="text-sm text-gray-600">20 days annual leave</p>
            <p className="text-sm text-gray-600">10 sick days per year</p>
          </div>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="remote-work">
    <AccordionTrigger className="text-left">
      <div className="flex items-center gap-3">
        <Building2 className="w-4 h-4 text-brown-600" />
        Remote Work Guidelines
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          Guidelines for maintaining productivity and communication while working remotely.
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Required</Badge>
            <span className="text-sm">Daily check-in with team lead</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Required</Badge>
            <span className="text-sm">Maintain regular communication hours</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">Recommended</Badge>
            <span className="text-sm">Use company VPN for secure access</span>
          </div>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
</Accordion>`
        }
      ]
    },
    {
      id: 'benefits-information',
      title: 'Benefits Information',
      description: 'Employee benefits and compensation details',
      examples: [
        {
          title: 'Employee Benefits Accordion',
          description: 'Comprehensive benefits package information',
          code: `<Accordion type="multiple" className="w-full">
  <AccordionItem value="health-insurance">
    <AccordionTrigger className="text-left">
      <div className="flex items-center gap-3">
        <Heart className="w-4 h-4 text-red-500" />
        Health Insurance
        <Badge className="ml-auto mr-4 bg-green-100 text-green-700">
          100% Covered
        </Badge>
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-brown-200">
            <h4 className="font-medium mb-2">Medical</h4>
            <p className="text-sm text-gray-600 mb-2">
              Comprehensive coverage including preventive care
            </p>
            <ul className="text-xs space-y-1">
              <li>• Annual checkups</li>
              <li>• Specialist visits</li>
              <li>• Emergency care</li>
            </ul>
          </Card>
          <Card className="p-4 border-brown-200">
            <h4 className="font-medium mb-2">Dental</h4>
            <p className="text-sm text-gray-600 mb-2">
              Full dental coverage with orthodontics
            </p>
            <ul className="text-xs space-y-1">
              <li>• Cleanings & exams</li>
              <li>• Fillings & crowns</li>
              <li>• Orthodontic care</li>
            </ul>
          </Card>
          <Card className="p-4 border-brown-200">
            <h4 className="font-medium mb-2">Vision</h4>
            <p className="text-sm text-gray-600 mb-2">
              Eye care and prescription coverage
            </p>
            <ul className="text-xs space-y-1">
              <li>• Eye exams</li>
              <li>• Prescription glasses</li>
              <li>• Contact lenses</li>
            </ul>
          </Card>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="retirement-401k">
    <AccordionTrigger className="text-left">
      <div className="flex items-center gap-3">
        <DollarSign className="w-4 h-4 text-green-600" />
        401(k) Retirement Plan
        <Badge className="ml-auto mr-4 bg-blue-100 text-blue-700">
          6% Match
        </Badge>
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-brown-50 to-orange-50 rounded-lg">
          <h4 className="font-medium mb-2">Company Matching</h4>
          <p className="text-sm text-gray-600 mb-3">
            We match 100% of your contributions up to 6% of your salary.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Vesting Schedule:</span>
              <p className="text-gray-600">Immediate vesting</p>
            </div>
            <div>
              <span className="font-medium">Enrollment:</span>
              <p className="text-gray-600">Available after 90 days</p>
            </div>
          </div>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="professional-development">
    <AccordionTrigger className="text-left">
      <div className="flex items-center gap-3">
        <GraduationCap className="w-4 h-4 text-blue-600" />
        Professional Development
        <Badge className="ml-auto mr-4 bg-purple-100 text-purple-700">
          $2,000 Annual
        </Badge>
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Invest in your career growth with our comprehensive development programs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium">Learning Opportunities</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <BookOpen className="w-3 h-3 text-brown-600" />
                Online courses & certifications
              </li>
              <li className="flex items-center gap-2">
                <Users className="w-3 h-3 text-brown-600" />
                Conference attendance
              </li>
              <li className="flex items-center gap-2">
                <Award className="w-3 h-3 text-brown-600" />
                Internal mentorship program
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium">Reimbursement Process</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-brown-100 text-brown-700 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                Submit pre-approval request
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-brown-100 text-brown-700 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                Complete the program
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-brown-100 text-brown-700 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                Submit receipts for reimbursement
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
</Accordion>`
        }
      ]
    },
    {
      id: 'department-faqs',
      title: 'Department FAQs',
      description: 'Frequently asked questions by department',
      examples: [
        {
          title: 'HR Department FAQ',
          description: 'Common questions and answers for HR department',
          code: `<Accordion type="single" collapsible className="w-full">
  <AccordionItem value="payroll-questions">
    <AccordionTrigger className="text-left">
      <div className="flex items-center gap-3">
        <HelpCircle className="w-4 h-4 text-brown-600" />
        Payroll & Compensation Questions
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="p-3 border-l-4 border-brown-200 bg-brown-50">
            <h5 className="font-medium text-sm mb-1">When is payday?</h5>
            <p className="text-sm text-gray-600">
              Payroll is processed bi-weekly on Fridays. Direct deposit typically 
              arrives by end of business day.
            </p>
          </div>
          <div className="p-3 border-l-4 border-brown-200 bg-brown-50">
            <h5 className="font-medium text-sm mb-1">How do I update my tax withholdings?</h5>
            <p className="text-sm text-gray-600">
              Log into the employee portal and navigate to "Tax Information" 
              or contact HR directly for assistance.
            </p>
          </div>
          <div className="p-3 border-l-4 border-brown-200 bg-brown-50">
            <h5 className="font-medium text-sm mb-1">Can I get an advance on my salary?</h5>
            <p className="text-sm text-gray-600">
              Salary advances are available in emergency situations. 
              Please speak with HR to discuss your specific circumstances.
            </p>
          </div>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="time-off-questions">
    <AccordionTrigger className="text-left">
      <div className="flex items-center gap-3">
        <Calendar className="w-4 h-4 text-brown-600" />
        Time Off & Leave Questions
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="space-y-3">
        <div className="p-3 border-l-4 border-blue-200 bg-blue-50">
          <h5 className="font-medium text-sm mb-1">How do I request time off?</h5>
          <p className="text-sm text-gray-600">
            Submit requests through the employee portal at least 2 weeks in advance. 
            Emergency requests should be called in directly.
          </p>
        </div>
        <div className="p-3 border-l-4 border-blue-200 bg-blue-50">
          <h5 className="font-medium text-sm mb-1">What's the policy for sick days?</h5>
          <p className="text-sm text-gray-600">
            You have 10 sick days per year. No doctor's note required for 
            single-day absences. Extended illness requires medical documentation.
          </p>
        </div>
        <div className="p-3 border-l-4 border-blue-200 bg-blue-50">
          <h5 className="font-medium text-sm mb-1">Can I carry over unused vacation days?</h5>
          <p className="text-sm text-gray-600">
            Up to 5 vacation days can be carried over to the following year. 
            Unused days beyond this are forfeited.
          </p>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="benefits-questions">
    <AccordionTrigger className="text-left">
      <div className="flex items-center gap-3">
        <Heart className="w-4 h-4 text-brown-600" />
        Benefits & Insurance Questions
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="space-y-3">
        <div className="p-3 border-l-4 border-green-200 bg-green-50">
          <h5 className="font-medium text-sm mb-1">When does my health insurance start?</h5>
          <p className="text-sm text-gray-600">
            Health insurance begins on the first day of the month following 
            your start date. You'll receive enrollment materials during onboarding.
          </p>
        </div>
        <div className="p-3 border-l-4 border-green-200 bg-green-50">
          <h5 className="font-medium text-sm mb-1">Can I add family members to my plan?</h5>
          <p className="text-sm text-gray-600">
            Yes, you can add eligible dependents during open enrollment or 
            within 30 days of qualifying life events.
          </p>
        </div>
        <div className="p-3 border-l-4 border-green-200 bg-green-50">
          <h5 className="font-medium text-sm mb-1">How do I file an insurance claim?</h5>
          <p className="text-sm text-gray-600">
            Most claims are filed automatically by your healthcare provider. 
            For manual claims, use the insurance company's mobile app or website.
          </p>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
</Accordion>`
        }
      ]
    },
    {
      id: 'onboarding-checklist',
      title: 'Onboarding Checklist',
      description: 'New employee onboarding process and requirements',
      examples: [
        {
          title: 'New Employee Onboarding',
          description: 'Step-by-step onboarding checklist',
          code: `<Accordion type="single" collapsible defaultValue="week-1" className="w-full">
  <AccordionItem value="week-1">
    <AccordionTrigger className="text-left">
      <div className="flex items-center gap-3">
        <Calendar className="w-4 h-4 text-brown-600" />
        Week 1: Getting Started
        <Badge className="ml-auto mr-4 bg-orange-100 text-orange-700">
          Critical
        </Badge>
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium">Documentation</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Complete I-9 verification</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Submit tax withholding forms</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Emergency contact information</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Direct deposit setup</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium">IT Setup</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Receive laptop and equipment</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Set up email and accounts</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Install required software</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Security training completion</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="week-2">
    <AccordionTrigger className="text-left">
      <div className="flex items-center gap-3">
        <Users className="w-4 h-4 text-brown-600" />
        Week 2: Team Integration
        <Badge className="ml-auto mr-4 bg-blue-100 text-blue-700">
          Important
        </Badge>
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-3">Team Meetings & Introductions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Meet your direct team members</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Attend department overview session</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Review role expectations</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Schedule coffee chats with peers</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Access training materials</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Learn team tools and processes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="month-1">
    <AccordionTrigger className="text-left">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-4 h-4 text-brown-600" />
        Month 1: Performance Goals
        <Badge className="ml-auto mr-4 bg-purple-100 text-purple-700">
          Ongoing
        </Badge>
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="space-y-4">
        <div className="p-4 bg-purple-50 rounded-lg">
          <h4 className="font-medium mb-3">30-Day Objectives</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded border">
              <Target className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-sm mb-1">Complete all required training modules</h5>
                <p className="text-xs text-gray-600">
                  Finish compliance training, role-specific learning paths, and company culture sessions.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded border">
              <Award className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-sm mb-1">Establish working relationships</h5>
                <p className="text-xs text-gray-600">
                  Build rapport with team members, understand communication preferences, and collaboration style.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded border">
              <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-sm mb-1">Complete first project milestone</h5>
                <p className="text-xs text-gray-600">
                  Successfully deliver your first assigned task or project component with mentor guidance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
</Accordion>`
        }
      ]
    },
    {
      id: 'profile-stepper',
      title: 'Employee Profile Stepper',
      description: 'Step-by-step employee profile building process',
      examples: [
        {
          title: 'Employee Profile Setup',
          description: 'Multi-step accordion for building comprehensive employee profiles',
          code: `<Accordion type=\"single\" collapsible defaultValue=\"personal-info\" className=\"w-full\">\n  <AccordionItem value=\"personal-info\">\n    <AccordionTrigger className=\"text-left\">\n      <div className=\"flex items-center gap-3\">\n        <div className=\"flex items-center gap-2\">\n          <div className=\"w-6 h-6 bg-brown-600 text-white rounded-full flex items-center justify-center text-xs font-medium\">\n            1\n          </div>\n          <User className=\"w-4 h-4 text-brown-600\" />\n        </div>\n        Personal Information\n        <Badge className=\"ml-auto mr-4 bg-green-100 text-green-700\">\n          <CheckCircle className=\"w-3 h-3 mr-1\" />\n          Complete\n        </Badge>\n      </div>\n    </AccordionTrigger>\n    <AccordionContent>\n      <div className=\"space-y-6\">\n        <div className=\"p-4 bg-green-50 border border-green-200 rounded-lg\">\n          <div className=\"flex items-center gap-2 mb-2\">\n            <CheckCircle className=\"w-4 h-4 text-green-600\" />\n            <span className=\"font-medium text-green-800\">Section Complete</span>\n          </div>\n          <p className=\"text-sm text-green-700\">\n            All required personal information has been provided and verified.\n          </p>\n        </div>\n        \n        <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n          <div className=\"space-y-3\">\n            <h4 className=\"font-medium\">Basic Information</h4>\n            <div className=\"space-y-2 text-sm\">\n              <div className=\"flex justify-between\">\n                <span className=\"text-gray-600\">Full Name:</span>\n                <span className=\"font-medium\">Sarah Johnson</span>\n              </div>\n              <div className=\"flex justify-between\">\n                <span className=\"text-gray-600\">Employee ID:</span>\n                <span className=\"font-medium\">EMP-2024-001</span>\n              </div>\n              <div className=\"flex justify-between\">\n                <span className=\"text-gray-600\">Date of Birth:</span>\n                <span className=\"font-medium\">January 15, 1990</span>\n              </div>\n              <div className=\"flex justify-between\">\n                <span className=\"text-gray-600\">Phone:</span>\n                <span className=\"font-medium\">(555) 123-4567</span>\n              </div>\n            </div>\n          </div>\n          \n          <div className=\"space-y-3\">\n            <h4 className=\"font-medium\">Contact Details</h4>\n            <div className=\"space-y-2 text-sm\">\n              <div className=\"flex justify-between\">\n                <span className=\"text-gray-600\">Email:</span>\n                <span className=\"font-medium\">sarah.johnson@company.com</span>\n              </div>\n              <div className=\"flex justify-between\">\n                <span className=\"text-gray-600\">Address:</span>\n                <span className=\"font-medium\">123 Main St, City, ST</span>\n              </div>\n              <div className=\"flex justify-between\">\n                <span className=\"text-gray-600\">Emergency Contact:</span>\n                <span className=\"font-medium\">John Johnson (Spouse)</span>\n              </div>\n              <div className=\"flex justify-between\">\n                <span className=\"text-gray-600\">Emergency Phone:</span>\n                <span className=\"font-medium\">(555) 987-6543</span>\n              </div>\n            </div>\n          </div>\n        </div>\n        \n        <div className=\"flex justify-end\">\n          <Button variant=\"outline\" size=\"sm\">\n            <Edit className=\"w-3 h-3 mr-1\" />\n            Edit Information\n          </Button>\n        </div>\n      </div>\n    </AccordionContent>\n  </AccordionItem>\n  \n  <AccordionItem value=\"employment-details\">\n    <AccordionTrigger className=\"text-left\">\n      <div className=\"flex items-center gap-3\">\n        <div className=\"flex items-center gap-2\">\n          <div className=\"w-6 h-6 bg-brown-600 text-white rounded-full flex items-center justify-center text-xs font-medium\">\n            2\n          </div>\n          <Briefcase className=\"w-4 h-4 text-brown-600\" />\n        </div>\n        Employment Details\n        <Badge className=\"ml-auto mr-4 bg-green-100 text-green-700\">\n          <CheckCircle className=\"w-3 h-3 mr-1\" />\n          Complete\n        </Badge>\n      </div>\n    </AccordionTrigger>\n    <AccordionContent>\n      <div className=\"space-y-6\">\n        <div className=\"p-4 bg-green-50 border border-green-200 rounded-lg\">\n          <div className=\"flex items-center gap-2 mb-2\">\n            <CheckCircle className=\"w-4 h-4 text-green-600\" />\n            <span className=\"font-medium text-green-800\">Employment Setup Complete</span>\n          </div>\n          <p className=\"text-sm text-green-700\">\n            Job role, department, and reporting structure have been configured.\n          </p>\n        </div>\n        \n        <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">\n          <div className=\"space-y-4\">\n            <h4 className=\"font-medium\">Position Information</h4>\n            <div className=\"space-y-3\">\n              <div className=\"p-3 bg-brown-50 rounded-lg\">\n                <div className=\"flex items-center gap-2 mb-2\">\n                  <Building2 className=\"w-4 h-4 text-brown-600\" />\n                  <span className=\"font-medium\">Department</span>\n                </div>\n                <p className=\"text-sm text-gray-600\">Human Resources</p>\n              </div>\n              \n              <div className=\"p-3 bg-brown-50 rounded-lg\">\n                <div className=\"flex items-center gap-2 mb-2\">\n                  <Award className=\"w-4 h-4 text-brown-600\" />\n                  <span className=\"font-medium\">Job Title</span>\n                </div>\n                <p className=\"text-sm text-gray-600\">Senior HR Specialist</p>\n              </div>\n              \n              <div className=\"p-3 bg-brown-50 rounded-lg\">\n                <div className=\"flex items-center gap-2 mb-2\">\n                  <Calendar className=\"w-4 h-4 text-brown-600\" />\n                  <span className=\"font-medium\">Start Date</span>\n                </div>\n                <p className=\"text-sm text-gray-600\">March 1, 2024</p>\n              </div>\n            </div>\n          </div>\n          \n          <div className=\"space-y-4\">\n            <h4 className=\"font-medium\">Reporting Structure</h4>\n            <div className=\"space-y-3\">\n              <div className=\"p-3 bg-blue-50 rounded-lg\">\n                <div className=\"flex items-center gap-2 mb-2\">\n                  <User className=\"w-4 h-4 text-blue-600\" />\n                  <span className=\"font-medium\">Direct Manager</span>\n                </div>\n                <p className=\"text-sm text-gray-600\">Michael Chen - HR Director</p>\n              </div>\n              \n              <div className=\"p-3 bg-blue-50 rounded-lg\">\n                <div className=\"flex items-center gap-2 mb-2\">\n                  <Users className=\"w-4 h-4 text-blue-600\" />\n                  <span className=\"font-medium\">Team</span>\n                </div>\n                <p className=\"text-sm text-gray-600\">HR Operations Team (5 members)</p>\n              </div>\n              \n              <div className=\"p-3 bg-blue-50 rounded-lg\">\n                <div className=\"flex items-center gap-2 mb-2\">\n                  <MapPin className=\"w-4 h-4 text-blue-600\" />\n                  <span className=\"font-medium\">Work Location</span>\n                </div>\n                <p className=\"text-sm text-gray-600\">Hybrid - Office/Remote</p>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </AccordionContent>\n  </AccordionItem>\n  \n  <AccordionItem value=\"system-access\">\n    <AccordionTrigger className=\"text-left\">\n      <div className=\"flex items-center gap-3\">\n        <div className=\"flex items-center gap-2\">\n          <div className=\"w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-medium\">\n            3\n          </div>\n          <Key className=\"w-4 h-4 text-orange-600\" />\n        </div>\n        System Access & Security\n        <Badge className=\"ml-auto mr-4 bg-orange-100 text-orange-700\">\n          <Clock className=\"w-3 h-3 mr-1\" />\n          In Progress\n        </Badge>\n      </div>\n    </AccordionTrigger>\n    <AccordionContent>\n      <div className=\"space-y-6\">\n        <div className=\"p-4 bg-orange-50 border border-orange-200 rounded-lg\">\n          <div className=\"flex items-center gap-2 mb-2\">\n            <Clock className=\"w-4 h-4 text-orange-600\" />\n            <span className=\"font-medium text-orange-800\">Security Setup in Progress</span>\n          </div>\n          <p className=\"text-sm text-orange-700\">\n            IT team is currently setting up system access and security credentials.\n          </p>\n        </div>\n        \n        <div className=\"space-y-4\">\n          <h4 className=\"font-medium\">Access Requirements</h4>\n          \n          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n            <div className=\"space-y-3\">\n              <div className=\"flex items-center gap-2 p-3 bg-green-50 rounded-lg\">\n                <CheckCircle className=\"w-4 h-4 text-green-600\" />\n                <div>\n                  <span className=\"font-medium text-sm\">Email Account</span>\n                  <p className=\"text-xs text-gray-600\">Office 365 access configured</p>\n                </div>\n              </div>\n              \n              <div className=\"flex items-center gap-2 p-3 bg-green-50 rounded-lg\">\n                <CheckCircle className=\"w-4 h-4 text-green-600\" />\n                <div>\n                  <span className=\"font-medium text-sm\">HRIS System</span>\n                  <p className=\"text-xs text-gray-600\">Workday access granted</p>\n                </div>\n              </div>\n              \n              <div className=\"flex items-center gap-2 p-3 bg-orange-50 rounded-lg\">\n                <Clock className=\"w-4 h-4 text-orange-500\" />\n                <div>\n                  <span className=\"font-medium text-sm\">VPN Access</span>\n                  <p className=\"text-xs text-gray-600\">Pending IT setup</p>\n                </div>\n              </div>\n            </div>\n            \n            <div className=\"space-y-3\">\n              <div className=\"flex items-center gap-2 p-3 bg-orange-50 rounded-lg\">\n                <Clock className=\"w-4 h-4 text-orange-500\" />\n                <div>\n                  <span className=\"font-medium text-sm\">Security Badge</span>\n                  <p className=\"text-xs text-gray-600\">Physical access card pending</p>\n                </div>\n              </div>\n              \n              <div className=\"flex items-center gap-2 p-3 bg-gray-50 rounded-lg\">\n                <AlertCircle className=\"w-4 h-4 text-gray-500\" />\n                <div>\n                  <span className=\"font-medium text-sm\">MFA Setup</span>\n                  <p className=\"text-xs text-gray-600\">Requires employee action</p>\n                </div>\n              </div>\n              \n              <div className=\"flex items-center gap-2 p-3 bg-gray-50 rounded-lg\">\n                <AlertCircle className=\"w-4 h-4 text-gray-500\" />\n                <div>\n                  <span className=\"font-medium text-sm\">Security Training</span>\n                  <p className=\"text-xs text-gray-600\">Scheduled for next week</p>\n                </div>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </AccordionContent>\n  </AccordionItem>\n  \n  <AccordionItem value=\"preferences\">\n    <AccordionTrigger className=\"text-left\">\n      <div className=\"flex items-center gap-3\">\n        <div className=\"flex items-center gap-2\">\n          <div className=\"w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs font-medium\">\n            4\n          </div>\n          <Settings className=\"w-4 h-4 text-gray-500\" />\n        </div>\n        Preferences & Settings\n        <Badge className=\"ml-auto mr-4 bg-gray-100 text-gray-600\">\n          <AlertCircle className=\"w-3 h-3 mr-1\" />\n          Not Started\n        </Badge>\n      </div>\n    </AccordionTrigger>\n    <AccordionContent>\n      <div className=\"space-y-6\">\n        <div className=\"p-4 bg-gray-50 border border-gray-200 rounded-lg\">\n          <div className=\"flex items-center gap-2 mb-2\">\n            <AlertCircle className=\"w-4 h-4 text-gray-500\" />\n            <span className=\"font-medium text-gray-700\">Setup Pending</span>\n          </div>\n          <p className=\"text-sm text-gray-600\">\n            Complete previous steps before configuring preferences and settings.\n          </p>\n        </div>\n        \n        <div className=\"space-y-4 opacity-50\">\n          <h4 className=\"font-medium\">Available Preferences</h4>\n          \n          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n            <div className=\"space-y-3\">\n              <h5 className=\"text-sm font-medium text-gray-700\">Communication</h5>\n              <div className=\"space-y-2 text-sm\">\n                <div className=\"flex items-center gap-2\">\n                  <Mail className=\"w-3 h-3 text-gray-400\" />\n                  <span>Email notifications</span>\n                </div>\n                <div className=\"flex items-center gap-2\">\n                  <Smartphone className=\"w-3 h-3 text-gray-400\" />\n                  <span>SMS alerts</span>\n                </div>\n                <div className=\"flex items-center gap-2\">\n                  <Calendar className=\"w-3 h-3 text-gray-400\" />\n                  <span>Calendar sync preferences</span>\n                </div>\n              </div>\n            </div>\n            \n            <div className=\"space-y-3\">\n              <h5 className=\"text-sm font-medium text-gray-700\">Work Preferences</h5>\n              <div className=\"space-y-2 text-sm\">\n                <div className=\"flex items-center gap-2\">\n                  <Clock className=\"w-3 h-3 text-gray-400\" />\n                  <span>Working hours</span>\n                </div>\n                <div className=\"flex items-center gap-2\">\n                  <Globe className=\"w-3 h-3 text-gray-400\" />\n                  <span>Time zone</span>\n                </div>\n                <div className=\"flex items-center gap-2\">\n                  <Monitor className=\"w-3 h-3 text-gray-400\" />\n                  <span>System theme</span>\n                </div>\n              </div>\n            </div>\n          </div>\n        </div>\n        \n        <div className=\"text-center\">\n          <Button disabled variant=\"outline\">\n            Configure Preferences\n          </Button>\n        </div>\n      </div>\n    </AccordionContent>\n  </AccordionItem>\n</Accordion>`
        }
      ]
    },
    {
      id: 'account-management',
      title: 'Account Management',
      description: 'Comprehensive account management and data organization',
      examples: [
        {
          title: 'HR Account Management Dashboard',
          description: 'Hierarchical data organization with expandable sections',
          code: `<div className="space-y-4">
  <div className="text-sm font-medium text-gray-600 mb-4">Account (2)</div>
  
  <Accordion type="multiple" className="w-full">
    <AccordionItem value="corporate-accounts">
      <AccordionTrigger className="text-left">
        <div className="flex items-center gap-3">
          <Building2 className="w-4 h-4 text-brown-600" />
          Corporate Accounts
          <Badge variant="secondary" className="ml-auto mr-4 bg-gray-100 text-gray-600">
            156 Customers
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg text-sm font-medium">
            <div>Company Name</div>
            <div>Contract Value</div>
            <div>Start Date</div>
            <div>Employees</div>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg text-sm">
              <div className="font-medium">TechCorp Solutions</div>
              <div className="text-green-600 font-medium">$850,000</div>
              <div>2024-01-15</div>
              <div>250</div>
            </div>
            <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg text-sm">
              <div className="font-medium">Global Industries</div>
              <div className="text-green-600 font-medium">$1,200,000</div>
              <div>2023-11-08</div>
              <div>485</div>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
    
    <AccordionItem value="individual-accounts" defaultValue="individual-accounts">
      <AccordionTrigger className="text-left">
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-brown-600" />
          Individual Accounts
          <Badge variant="secondary" className="ml-auto mr-4 bg-gray-100 text-gray-600">
            1,243 Accounts
          </Badge>
          <Badge variant="outline" className="mr-4 bg-orange-50 text-orange-600 border-orange-200">
            Draft
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4 p-4 bg-brown-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600 mb-1">Account Manager</div>
              <div className="font-medium">James Brown</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Contract Value</div>
              <div className="font-medium text-green-600">$250,000</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Start Date</div>
              <div className="font-medium">2024-01-15</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Member</div>
              <div className="font-medium">45</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Recent services</h4>
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  Date
                </div>
                <div>Type</div>
                <div>Cost</div>
                <div></div>
              </div>
              <div className="divide-y">
                <div className="grid grid-cols-4 gap-4 p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    2024-01-15
                  </div>
                  <div>Fleet Maintance</div>
                  <div className="font-medium">$12,000</div>
                  <div className="text-right">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    2024-02-28
                  </div>
                  <div>Emergency Repair</div>
                  <div className="font-medium">$3,500</div>
                  <div className="text-right">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    2024-01-15
                  </div>
                  <div>Fleet Maintance</div>
                  <div className="font-medium">$12,000</div>
                  <div className="text-right">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
  
  <div className="text-sm font-medium text-gray-600 mb-4 mt-8">Recruitment Processes (2)</div>
  
  <Accordion type="single" collapsible className="w-full">
    <AccordionItem value="active-positions">
      <AccordionTrigger className="text-left">
        <div className="flex items-center gap-3">
          <Briefcase className="w-4 h-4 text-brown-600" />
          Active Positions
          <Badge variant="secondary" className="ml-auto mr-4 bg-blue-100 text-blue-600">
            12 Positions
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4 p-3 border rounded-lg">
            <div>
              <div className="font-medium">Senior Software Engineer</div>
              <div className="text-sm text-gray-600">Engineering Department</div>
            </div>
            <div className="text-sm">
              <div>Posted: 2024-03-01</div>
              <div>Applications: 45</div>
            </div>
            <div className="text-right">
              <Badge className="bg-green-100 text-green-700">Active</Badge>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 p-3 border rounded-lg">
            <div>
              <div className="font-medium">HR Business Partner</div>
              <div className="text-sm text-gray-600">Human Resources</div>
            </div>
            <div className="text-sm">
              <div>Posted: 2024-02-28</div>
              <div>Applications: 28</div>
            </div>
            <div className="text-right">
              <Badge className="bg-yellow-100 text-yellow-700">Review</Badge>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
    
    <AccordionItem value="talent-pipeline">
      <AccordionTrigger className="text-left">
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-brown-600" />
          Talent Pipeline
          <Badge variant="secondary" className="ml-auto mr-4 bg-purple-100 text-purple-600">
            186 Candidates
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 border-brown-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">62</div>
                <div className="text-sm text-gray-600">Screening</div>
              </div>
            </Card>
            <Card className="p-4 border-brown-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">34</div>
                <div className="text-sm text-gray-600">Interviewing</div>
              </div>
            </Card>
            <Card className="p-4 border-brown-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">90</div>
                <div className="text-sm text-gray-600">Qualified</div>
              </div>
            </Card>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</div>`
        }
      ]
    },
    {
      id: 'account-setup',
      title: 'Account Setup Process',
      description: 'FAQ-style accordion for HR account setup and configuration',
      examples: [
        {
          title: 'HR Account Setup FAQ',
          description: 'Common questions and answers for setting up HR accounts',
          code: `<Accordion type="single" collapsible className="w-full">
  <AccordionItem value="update-account">
    <AccordionTrigger className="text-left">
      <div className="flex items-center gap-3">
        <User className="w-4 h-4 text-brown-600" />
        How do I update my account information?
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          You can update your account information through the HR portal or by contacting the HR department directly.
        </p>
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-sm mb-2">Online Portal Steps:</h5>
            <ol className="text-sm space-y-1 ml-4">
              <li>1. Log into the employee portal</li>
              <li>2. Navigate to "Profile Settings"</li>
              <li>3. Update your information</li>
              <li>4. Click "Save Changes"</li>
            </ol>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <h5 className="font-medium text-sm mb-2">Required Documentation:</h5>
            <ul className="text-sm space-y-1">
              <li>• Government-issued ID for name changes</li>
              <li>• Proof of address for address updates</li>
              <li>• Marriage certificate for marital status changes</li>
            </ul>
          </div>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="payment-methods" defaultValue="payment-methods">
    <AccordionTrigger className="text-left">
      <div className="flex items-center gap-3">
        <CreditCard className="w-4 h-4 text-brown-600" />
        What payment methods are accepted for payroll?
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          We support multiple payroll delivery methods to ensure you receive your compensation conveniently and securely.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 border-brown-200">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-green-600" />
              Direct Deposit
            </h4>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Most common and secure method</li>
              <li>• Funds available on payday</li>
              <li>• Requires bank account verification</li>
              <li>• Can split between multiple accounts</li>
            </ul>
          </Card>
          <Card className="p-4 border-brown-200">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              Paper Check
            </h4>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Physical check delivery</li>
              <li>• Available for pickup or mail</li>
              <li>• Processing may take 1-2 business days</li>
              <li>• Backup option if direct deposit fails</li>
            </ul>
          </Card>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h5 className="font-medium text-sm mb-2 text-yellow-800">Setup Requirements:</h5>
          <p className="text-sm text-yellow-700">
            To set up direct deposit, you'll need your bank routing number and account number. 
            Contact HR to complete the setup process or update your payment preferences.
          </p>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="password-reset">
    <AccordionTrigger className="text-left">
      <div className="flex items-center gap-3">
        <Lock className="w-4 h-4 text-brown-600" />
        How do I reset my password?
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Follow these steps to reset your password securely and regain access to your account.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium">Self-Service Reset</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                <span className="text-sm">Visit the login page</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                <span className="text-sm">Click "Forgot Password"</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                <span className="text-sm">Enter your email address</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                <span className="text-sm">Check email for reset link</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium">IT Support Reset</h4>
            <div className="p-3 border rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                Contact IT support if you can't access your email or need immediate assistance:
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-brown-600" />
                  <span>Extension: 1234</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 text-brown-600" />
                  <span>support@company.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-brown-600" />
                  <span>Available: Mon-Fri 8AM-6PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="access-permissions">
    <AccordionTrigger className="text-left">
      <div className="flex items-center gap-3">
        <Key className="w-4 h-4 text-brown-600" />
        How do I request additional system access?
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Access permissions are granted based on job responsibilities and security requirements.
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium mb-3">Request Process</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                <span>Submit access request form through HR portal</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                <span>Manager approval required for all requests</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                <span>IT security review for sensitive systems</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                <span>Approval notification within 2-3 business days</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Standard Access</h5>
              <p className="text-xs text-gray-600">Email, intranet, basic HR systems</p>
              <Badge className="mt-2 bg-green-100 text-green-700 text-xs">Auto-Approved</Badge>
            </div>
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Elevated Access</h5>
              <p className="text-xs text-gray-600">Financial systems, admin tools</p>
              <Badge className="mt-2 bg-yellow-100 text-yellow-700 text-xs">Requires Approval</Badge>
            </div>
          </div>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
</Accordion>`
        }
      ]
    },
    {
      id: 'hr-system-onboarding',
      title: 'HR System Onboarding',
      description: 'Step-by-step system setup and configuration process',
      examples: [
        {
          title: 'New Employee System Setup',
          description: 'Complete system onboarding workflow for new hires',
          code: `<Accordion type="single" collapsible defaultValue="account-creation" className="w-full">
  <AccordionItem value="account-creation">
    <AccordionTrigger className="text-left">
      <div className="flex items-center gap-3">
        <UserCheck className="w-4 h-4 text-brown-600" />
        Account Creation & Verification
        <Badge className="ml-auto mr-4 bg-green-100 text-green-700">
          Required
        </Badge>
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="space-y-6">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-medium mb-3 text-green-800">Account Setup Checklist</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Employee ID assigned</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Work email created</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Temporary password issued</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">Multi-factor authentication setup</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">Security training completion</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">Profile photo upload</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">Emergency contacts added</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">Direct deposit setup</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-brown-200">
            <div className="text-center">
              <Globe className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h5 className="font-medium text-sm mb-1">Portal Access</h5>
              <p className="text-xs text-gray-600">Employee self-service portal</p>
            </div>
          </Card>
          <Card className="p-4 border-brown-200">
            <div className="text-center">
              <Smartphone className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h5 className="font-medium text-sm mb-1">Mobile App</h5>
              <p className="text-xs text-gray-600">HR mobile application</p>
            </div>
          </Card>
          <Card className="p-4 border-brown-200">
            <div className="text-center">
              <Monitor className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h5 className="font-medium text-sm mb-1">Desktop Tools</h5>
              <p className="text-xs text-gray-600">Work productivity suite</p>
            </div>
          </Card>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="system-training">
    <AccordionTrigger className="text-left">
      <div className="flex items-center gap-3">
        <BookOpen className="w-4 h-4 text-brown-600" />
        System Training & Resources
        <Badge className="ml-auto mr-4 bg-blue-100 text-blue-700">
          Week 1-2
        </Badge>
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">Required Training Modules</h4>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">HR Portal Navigation</span>
                  <Badge className="bg-green-100 text-green-700 text-xs">Completed</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full w-full"></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">Duration: 30 minutes</p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Time Tracking System</span>
                  <Badge className="bg-yellow-100 text-yellow-700 text-xs">In Progress</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full w-3/4"></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">Duration: 45 minutes</p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Benefits Enrollment</span>
                  <Badge className="bg-gray-100 text-gray-700 text-xs">Pending</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-400 h-2 rounded-full w-0"></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">Duration: 60 minutes</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">Support Resources</h4>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-sm mb-2 text-blue-800">Quick Start Guide</h5>
                <p className="text-xs text-blue-700 mb-2">Essential steps to get started with HR systems</p>
                <Button size="sm" variant="outline" className="text-xs h-7">
                  Download PDF
                </Button>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg">
                <h5 className="font-medium text-sm mb-2 text-purple-800">Video Tutorials</h5>
                <p className="text-xs text-purple-700 mb-2">Step-by-step video walkthroughs</p>
                <Button size="sm" variant="outline" className="text-xs h-7">
                  Watch Videos
                </Button>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <h5 className="font-medium text-sm mb-2 text-green-800">Live Support</h5>
                <p className="text-xs text-green-700 mb-2">1-on-1 assistance with HR specialist</p>
                <Button size="sm" variant="outline" className="text-xs h-7">
                  Schedule Session
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="integration-setup">
    <AccordionTrigger className="text-left">
      <div className="flex items-center gap-3">
        <RefreshCw className="w-4 h-4 text-brown-600" />
        System Integration & Sync
        <Badge className="ml-auto mr-4 bg-purple-100 text-purple-700">
          Advanced
        </Badge>
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Connect your HR account with other business systems for seamless data flow and automation.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 border-brown-200">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Package2 className="w-4 h-4 text-blue-600" />
              Payroll Integration
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>ADP Workforce</span>
                <Badge className="bg-green-100 text-green-700 text-xs">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>QuickBooks Payroll</span>
                <Badge className="bg-gray-100 text-gray-700 text-xs">Available</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Paychex</span>
                <Badge className="bg-gray-100 text-gray-700 text-xs">Available</Badge>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 border-brown-200">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-600" />
              Calendar Systems
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Google Workspace</span>
                <Badge className="bg-green-100 text-green-700 text-xs">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Microsoft 365</span>
                <Badge className="bg-yellow-100 text-yellow-700 text-xs">Pending</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Apple Calendar</span>
                <Badge className="bg-gray-100 text-gray-700 text-xs">Available</Badge>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h4 className="font-medium mb-2 text-orange-800">Integration Benefits</h4>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• Automatic data synchronization between systems</li>
            <li>• Reduced manual data entry and errors</li>
            <li>• Real-time updates across all platforms</li>
            <li>• Streamlined reporting and analytics</li>
          </ul>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="security-compliance">
    <AccordionTrigger className="text-left">
      <div className="flex items-center gap-3">
        <Shield className="w-4 h-4 text-brown-600" />
        Security & Compliance Setup
        <Badge className="ml-auto mr-4 bg-red-100 text-red-700">
          Critical
        </Badge>
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="space-y-4">
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <h4 className="font-medium mb-3 text-red-800">Security Requirements</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Strong password policy</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Two-factor authentication</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">Security awareness training</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">Privacy policy acknowledgment</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">Data handling certification</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">Access level verification</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">Incident reporting setup</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">Regular security reviews</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <Lock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="font-medium text-sm">Data Encryption</div>
            <div className="text-xs text-gray-600">256-bit SSL</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="font-medium text-sm">GDPR Compliant</div>
            <div className="text-xs text-gray-600">Privacy Protected</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <FileCheck className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="font-medium text-sm">SOC 2 Certified</div>
            <div className="text-xs text-gray-600">Audit Ready</div>
          </div>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
</Accordion>`
        }
      ]
    }
  ];

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
                  <h1 className="text-xl font-semibold">Accordion</h1>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                    Components
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Expandable and collapsible HR accordion components
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
                      HR Accordion Components
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Expandable and collapsible accordion components specifically designed for HR applications. 
                      These examples showcase employee policies, benefits information, FAQs, and onboarding processes 
                      with interactive content sections.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Shield className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Employee Policies</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                        Comprehensive company policies, code of conduct, and workplace guidelines.
                      </p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Heart className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Benefits Information</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                        Health insurance, retirement plans, and professional development programs.
                      </p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <HelpCircle className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-2">FAQ & Onboarding</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                        Department FAQs and step-by-step onboarding checklists.
                      </p>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Sections */}
              {sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-28">
                  <div className="space-y-8">
                    <div>
                      <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                        {section.title}
                      </h1>
                      <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                        {section.description}
                      </p>
                    </div>

                    {section.examples.map((example, index) => (
                      <div key={index} className="space-y-6">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{example.title}</h3>
                          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{example.description}</p>
                        </div>

                        {/* Live Example */}
                        <PreviewCard title="Live Example">
                          {section.id === 'employee-policies' && index === 0 && (
                            <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value="code-of-conduct">
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <Shield className="w-4 h-4 text-brown-600" />
                                    Code of Conduct
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                      Our code of conduct outlines the ethical standards and behavioral expectations for all employees.
                                    </p>
                                    <ul className="space-y-2 text-sm">
                                      <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        Treat all colleagues with respect and professionalism
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        Maintain confidentiality of sensitive information
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        Report any violations or concerns to HR immediately
                                      </li>
                                    </ul>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              
                              <AccordionItem value="attendance-policy">
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-brown-600" />
                                    Attendance & Time Off Policy
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="p-4 bg-brown-50 rounded-lg">
                                        <h4 className="font-medium mb-2">Working Hours</h4>
                                        <p className="text-sm text-gray-600">Standard: 9:00 AM - 6:00 PM</p>
                                        <p className="text-sm text-gray-600">Flexible hours available</p>
                                      </div>
                                      <div className="p-4 bg-brown-50 rounded-lg">
                                        <h4 className="font-medium mb-2">PTO Allowance</h4>
                                        <p className="text-sm text-gray-600">20 days annual leave</p>
                                        <p className="text-sm text-gray-600">10 sick days per year</p>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              
                              <AccordionItem value="remote-work">
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <Building2 className="w-4 h-4 text-brown-600" />
                                    Remote Work Guidelines
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-3">
                                    <p className="text-sm text-gray-600">
                                      Guidelines for maintaining productivity and communication while working remotely.
                                    </p>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">Required</Badge>
                                        <span className="text-sm">Daily check-in with team lead</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">Required</Badge>
                                        <span className="text-sm">Maintain regular communication hours</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">Recommended</Badge>
                                        <span className="text-sm">Use company VPN for secure access</span>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          )}

                          {section.id === 'benefits-information' && index === 0 && (
                            <Accordion type="multiple" className="w-full">
                              <AccordionItem value="health-insurance">
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <Heart className="w-4 h-4 text-red-500" />
                                    Health Insurance
                                    <Badge className="ml-auto mr-4 bg-green-100 text-green-700">
                                      100% Covered
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <Card className="p-4 border-brown-200">
                                        <h4 className="font-medium mb-2">Medical</h4>
                                        <p className="text-sm text-gray-600 mb-2">
                                          Comprehensive coverage including preventive care
                                        </p>
                                        <ul className="text-xs space-y-1">
                                          <li>• Annual checkups</li>
                                          <li>• Specialist visits</li>
                                          <li>• Emergency care</li>
                                        </ul>
                                      </Card>
                                      <Card className="p-4 border-brown-200">
                                        <h4 className="font-medium mb-2">Dental</h4>
                                        <p className="text-sm text-gray-600 mb-2">
                                          Full dental coverage with orthodontics
                                        </p>
                                        <ul className="text-xs space-y-1">
                                          <li>• Cleanings & exams</li>
                                          <li>• Fillings & crowns</li>
                                          <li>• Orthodontic care</li>
                                        </ul>
                                      </Card>
                                      <Card className="p-4 border-brown-200">
                                        <h4 className="font-medium mb-2">Vision</h4>
                                        <p className="text-sm text-gray-600 mb-2">
                                          Eye care and prescription coverage
                                        </p>
                                        <ul className="text-xs space-y-1">
                                          <li>• Eye exams</li>
                                          <li>• Prescription glasses</li>
                                          <li>• Contact lenses</li>
                                        </ul>
                                      </Card>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              
                              <AccordionItem value="retirement-401k">
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                    401(k) Retirement Plan
                                    <Badge className="ml-auto mr-4 bg-blue-100 text-blue-700">
                                      6% Match
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4">
                                    <div className="p-4 bg-gradient-to-r from-brown-50 to-orange-50 rounded-lg">
                                      <h4 className="font-medium mb-2">Company Matching</h4>
                                      <p className="text-sm text-gray-600 mb-3">
                                        We match 100% of your contributions up to 6% of your salary.
                                      </p>
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <span className="font-medium">Vesting Schedule:</span>
                                          <p className="text-gray-600">Immediate vesting</p>
                                        </div>
                                        <div>
                                          <span className="font-medium">Enrollment:</span>
                                          <p className="text-gray-600">Available after 90 days</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              
                              <AccordionItem value="professional-development">
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <GraduationCap className="w-4 h-4 text-blue-600" />
                                    Professional Development
                                    <Badge className="ml-auto mr-4 bg-purple-100 text-purple-700">
                                      $2,000 Annual
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                      Invest in your career growth with our comprehensive development programs.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-3">
                                        <h4 className="font-medium">Learning Opportunities</h4>
                                        <ul className="space-y-2 text-sm">
                                          <li className="flex items-center gap-2">
                                            <BookOpen className="w-3 h-3 text-brown-600" />
                                            Online courses & certifications
                                          </li>
                                          <li className="flex items-center gap-2">
                                            <Users className="w-3 h-3 text-brown-600" />
                                            Conference attendance
                                          </li>
                                          <li className="flex items-center gap-2">
                                            <Award className="w-3 h-3 text-brown-600" />
                                            Internal mentorship program
                                          </li>
                                        </ul>
                                      </div>
                                      <div className="space-y-3">
                                        <h4 className="font-medium">Reimbursement Process</h4>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 bg-brown-100 text-brown-700 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                                            Submit pre-approval request
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 bg-brown-100 text-brown-700 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                                            Complete the program
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 bg-brown-100 text-brown-700 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                                            Submit receipts for reimbursement
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          )}

                          {section.id === 'department-faqs' && index === 0 && (
                            <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value="payroll-questions">
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <HelpCircle className="w-4 h-4 text-brown-600" />
                                    Payroll & Compensation Questions
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4">
                                    <div className="space-y-3">
                                      <div className="p-3 border-l-4 border-brown-200 bg-brown-50">
                                        <h5 className="font-medium text-sm mb-1">When is payday?</h5>
                                        <p className="text-sm text-gray-600">
                                          Payroll is processed bi-weekly on Fridays. Direct deposit typically 
                                          arrives by end of business day.
                                        </p>
                                      </div>
                                      <div className="p-3 border-l-4 border-brown-200 bg-brown-50">
                                        <h5 className="font-medium text-sm mb-1">How do I update my tax withholdings?</h5>
                                        <p className="text-sm text-gray-600">
                                          Log into the employee portal and navigate to "Tax Information" 
                                          or contact HR directly for assistance.
                                        </p>
                                      </div>
                                      <div className="p-3 border-l-4 border-brown-200 bg-brown-50">
                                        <h5 className="font-medium text-sm mb-1">Can I get an advance on my salary?</h5>
                                        <p className="text-sm text-gray-600">
                                          Salary advances are available in emergency situations. 
                                          Please speak with HR to discuss your specific circumstances.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              
                              <AccordionItem value="time-off-questions">
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-brown-600" />
                                    Time Off & Leave Questions
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-3">
                                    <div className="p-3 border-l-4 border-blue-200 bg-blue-50">
                                      <h5 className="font-medium text-sm mb-1">How do I request time off?</h5>
                                      <p className="text-sm text-gray-600">
                                        Submit requests through the employee portal at least 2 weeks in advance. 
                                        Emergency requests should be called in directly.
                                      </p>
                                    </div>
                                    <div className="p-3 border-l-4 border-blue-200 bg-blue-50">
                                      <h5 className="font-medium text-sm mb-1">What's the policy for sick days?</h5>
                                      <p className="text-sm text-gray-600">
                                        You have 10 sick days per year. No doctor's note required for 
                                        single-day absences. Extended illness requires medical documentation.
                                      </p>
                                    </div>
                                    <div className="p-3 border-l-4 border-blue-200 bg-blue-50">
                                      <h5 className="font-medium text-sm mb-1">Can I carry over unused vacation days?</h5>
                                      <p className="text-sm text-gray-600">
                                        Up to 5 vacation days can be carried over to the following year. 
                                        Unused days beyond this are forfeited.
                                      </p>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              
                              <AccordionItem value="benefits-questions">
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <Heart className="w-4 h-4 text-brown-600" />
                                    Benefits & Insurance Questions
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-3">
                                    <div className="p-3 border-l-4 border-green-200 bg-green-50">
                                      <h5 className="font-medium text-sm mb-1">When does my health insurance start?</h5>
                                      <p className="text-sm text-gray-600">
                                        Health insurance begins on the first day of the month following 
                                        your start date. You'll receive enrollment materials during onboarding.
                                      </p>
                                    </div>
                                    <div className="p-3 border-l-4 border-green-200 bg-green-50">
                                      <h5 className="font-medium text-sm mb-1">Can I add family members to my plan?</h5>
                                      <p className="text-sm text-gray-600">
                                        Yes, you can add eligible dependents during open enrollment or 
                                        within 30 days of qualifying life events.
                                      </p>
                                    </div>
                                    <div className="p-3 border-l-4 border-green-200 bg-green-50">
                                      <h5 className="font-medium text-sm mb-1">How do I file an insurance claim?</h5>
                                      <p className="text-sm text-gray-600">
                                        Most claims are filed automatically by your healthcare provider. 
                                        For manual claims, use the insurance company's mobile app or website.
                                      </p>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          )}

                          {section.id === 'onboarding-checklist' && index === 0 && (
                            <Accordion type="single" collapsible defaultValue="week-1" className="w-full">
                              <AccordionItem value="week-1">
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-brown-600" />
                                    Week 1: Getting Started
                                    <Badge className="ml-auto mr-4 bg-orange-100 text-orange-700">
                                      Critical
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-3">
                                        <h4 className="font-medium">Documentation</h4>
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-sm">Complete I-9 verification</span>
                                          </div>
                                          <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-sm">Submit tax withholding forms</span>
                                          </div>
                                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm">Emergency contact information</span>
                                          </div>
                                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm">Direct deposit setup</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="space-y-3">
                                        <h4 className="font-medium">IT Setup</h4>
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-sm">Receive laptop and equipment</span>
                                          </div>
                                          <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-sm">Set up email and accounts</span>
                                          </div>
                                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm">Install required software</span>
                                          </div>
                                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm">Security training completion</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              
                              <AccordionItem value="week-2">
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <Users className="w-4 h-4 text-brown-600" />
                                    Week 2: Team Integration
                                    <Badge className="ml-auto mr-4 bg-blue-100 text-blue-700">
                                      Important
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                      <h4 className="font-medium mb-3">Team Meetings & Introductions</h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm">Meet your direct team members</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Briefcase className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm">Attend department overview session</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Target className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm">Review role expectations</span>
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                            <Coffee className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm">Schedule coffee chats with peers</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm">Access training materials</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Settings className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm">Learn team tools and processes</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              
                              <AccordionItem value="month-1">
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <TrendingUp className="w-4 h-4 text-brown-600" />
                                    Month 1: Performance Goals
                                    <Badge className="ml-auto mr-4 bg-purple-100 text-purple-700">
                                      Ongoing
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4">
                                    <div className="p-4 bg-purple-50 rounded-lg">
                                      <h4 className="font-medium mb-3">30-Day Objectives</h4>
                                      <div className="space-y-3">
                                        <div className="flex items-start gap-3 p-3 bg-white rounded border">
                                          <Target className="w-5 h-5 text-purple-600 mt-0.5" />
                                          <div>
                                            <h5 className="font-medium text-sm mb-1">Complete all required training modules</h5>
                                            <p className="text-xs text-gray-600">
                                              Finish compliance training, role-specific learning paths, and company culture sessions.
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-white rounded border">
                                          <Award className="w-5 h-5 text-purple-600 mt-0.5" />
                                          <div>
                                            <h5 className="font-medium text-sm mb-1">Establish working relationships</h5>
                                            <p className="text-xs text-gray-600">
                                              Build rapport with team members, understand communication preferences, and collaboration style.
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-white rounded border">
                                          <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                                          <div>
                                            <h5 className="font-medium text-sm mb-1">Complete first project milestone</h5>
                                            <p className="text-xs text-gray-600">
                                              Successfully deliver your first assigned task or project component with mentor guidance.
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          )}

                          {section.id === 'profile-stepper' && index === 0 && (
                            <Accordion type="single" collapsible defaultValue="personal-info" className="w-full">
                              <AccordionItem value="personal-info">
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 bg-brown-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                        1
                                      </div>
                                      <User className="w-4 h-4 text-brown-600" />
                                    </div>
                                    Personal Information
                                    <Badge className="ml-auto mr-4 bg-green-100 text-green-700">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Complete
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-6">
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                      <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="font-medium text-green-800">Section Complete</span>
                                      </div>
                                      <p className="text-sm text-green-700">
                                        All required personal information has been provided and verified.
                                      </p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-3">
                                        <h4 className="font-medium">Basic Information</h4>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Full Name:</span>
                                            <span className="font-medium">Sarah Johnson</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Employee ID:</span>
                                            <span className="font-medium">EMP-2024-001</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Date of Birth:</span>
                                            <span className="font-medium">January 15, 1990</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Phone:</span>
                                            <span className="font-medium">(555) 123-4567</span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-3">
                                        <h4 className="font-medium">Contact Details</h4>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Email:</span>
                                            <span className="font-medium">sarah.johnson@company.com</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Address:</span>
                                            <span className="font-medium">123 Main St, City, ST</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Emergency Contact:</span>
                                            <span className="font-medium">John Johnson (Spouse)</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Emergency Phone:</span>
                                            <span className="font-medium">(555) 987-6543</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex justify-end">
                                      <Button variant="outline" size="sm">
                                        <Edit className="w-3 h-3 mr-1" />
                                        Edit Information
                                      </Button>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              
                              <AccordionItem value="employment-details">
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 bg-brown-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                        2
                                      </div>
                                      <Briefcase className="w-4 h-4 text-brown-600" />
                                    </div>
                                    Employment Details
                                    <Badge className="ml-auto mr-4 bg-green-100 text-green-700">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Complete
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-6">
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                      <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="font-medium text-green-800">Employment Setup Complete</span>
                                      </div>
                                      <p className="text-sm text-green-700">
                                        Job role, department, and reporting structure have been configured.
                                      </p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-4">
                                        <h4 className="font-medium">Position Information</h4>
                                        <div className="space-y-3">
                                          <div className="p-3 bg-brown-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Building2 className="w-4 h-4 text-brown-600" />
                                              <span className="font-medium">Department</span>
                                            </div>
                                            <p className="text-sm text-gray-600">Human Resources</p>
                                          </div>
                                          
                                          <div className="p-3 bg-brown-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Award className="w-4 h-4 text-brown-600" />
                                              <span className="font-medium">Job Title</span>
                                            </div>
                                            <p className="text-sm text-gray-600">Senior HR Specialist</p>
                                          </div>
                                          
                                          <div className="p-3 bg-brown-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Calendar className="w-4 h-4 text-brown-600" />
                                              <span className="font-medium">Start Date</span>
                                            </div>
                                            <p className="text-sm text-gray-600">March 1, 2024</p>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-4">
                                        <h4 className="font-medium">Reporting Structure</h4>
                                        <div className="space-y-3">
                                          <div className="p-3 bg-blue-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                              <User className="w-4 h-4 text-blue-600" />
                                              <span className="font-medium">Direct Manager</span>
                                            </div>
                                            <p className="text-sm text-gray-600">Michael Chen - HR Director</p>
                                          </div>
                                          
                                          <div className="p-3 bg-blue-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Users className="w-4 h-4 text-blue-600" />
                                              <span className="font-medium">Team</span>
                                            </div>
                                            <p className="text-sm text-gray-600">HR Operations Team (5 members)</p>
                                          </div>
                                          
                                          <div className="p-3 bg-blue-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                              <MapPin className="w-4 h-4 text-blue-600" />
                                              <span className="font-medium">Work Location</span>
                                            </div>
                                            <p className="text-sm text-gray-600">Hybrid - Office/Remote</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              
                              <AccordionItem value="system-access">
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                        3
                                      </div>
                                      <Key className="w-4 h-4 text-orange-600" />
                                    </div>
                                    System Access & Security
                                    <Badge className="ml-auto mr-4 bg-orange-100 text-orange-700">
                                      <Clock className="w-3 h-3 mr-1" />
                                      In Progress
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-6">
                                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Clock className="w-4 h-4 text-orange-600" />
                                        <span className="font-medium text-orange-800">Security Setup in Progress</span>
                                      </div>
                                      <p className="text-sm text-orange-700">
                                        IT team is currently setting up system access and security credentials.
                                      </p>
                                    </div>
                                    
                                    <div className="space-y-4">
                                      <h4 className="font-medium">Access Requirements</h4>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <div>
                                              <span className="font-medium text-sm">Email Account</span>
                                              <p className="text-xs text-gray-600">Office 365 access configured</p>
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <div>
                                              <span className="font-medium text-sm">HRIS System</span>
                                              <p className="text-xs text-gray-600">Workday access granted</p>
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                                            <Clock className="w-4 h-4 text-orange-500" />
                                            <div>
                                              <span className="font-medium text-sm">VPN Access</span>
                                              <p className="text-xs text-gray-600">Pending IT setup</p>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                                            <Clock className="w-4 h-4 text-orange-500" />
                                            <div>
                                              <span className="font-medium text-sm">Security Badge</span>
                                              <p className="text-xs text-gray-600">Physical access card pending</p>
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                            <AlertCircle className="w-4 h-4 text-gray-500" />
                                            <div>
                                              <span className="font-medium text-sm">MFA Setup</span>
                                              <p className="text-xs text-gray-600">Requires employee action</p>
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                            <AlertCircle className="w-4 h-4 text-gray-500" />
                                            <div>
                                              <span className="font-medium text-sm">Security Training</span>
                                              <p className="text-xs text-gray-600">Scheduled for next week</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              
                              <AccordionItem value="preferences">
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                        4
                                      </div>
                                      <Settings className="w-4 h-4 text-gray-500" />
                                    </div>
                                    Preferences & Settings
                                    <Badge className="ml-auto mr-4 bg-gray-100 text-gray-600">
                                      <AlertCircle className="w-3 h-3 mr-1" />
                                      Not Started
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-6">
                                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                      <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium text-gray-700">Setup Pending</span>
                                      </div>
                                      <p className="text-sm text-gray-600">
                                        Complete previous steps before configuring preferences and settings.
                                      </p>
                                    </div>
                                    
                                    <div className="space-y-4 opacity-50">
                                      <h4 className="font-medium">Available Preferences</h4>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                          <h5 className="text-sm font-medium text-gray-700">Communication</h5>
                                          <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                              <Mail className="w-3 h-3 text-gray-400" />
                                              <span>Email notifications</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Smartphone className="w-3 h-3 text-gray-400" />
                                              <span>SMS alerts</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Calendar className="w-3 h-3 text-gray-400" />
                                              <span>Calendar sync preferences</span>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                          <h5 className="text-sm font-medium text-gray-700">Work Preferences</h5>
                                          <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                              <Clock className="w-3 h-3 text-gray-400" />
                                              <span>Working hours</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Globe className="w-3 h-3 text-gray-400" />
                                              <span>Time zone</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Monitor className="w-3 h-3 text-gray-400" />
                                              <span>System theme</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="text-center">
                                      <Button disabled variant="outline">
                                        Configure Preferences
                                      </Button>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          )}

                          {section.id === 'account-management' && index === 0 && (
                            <div className="space-y-4">
                              <div className="text-sm font-medium text-gray-600 mb-4">Account (2)</div>
                              
                              <Accordion type="multiple" className="w-full">
                                <AccordionItem value="corporate-accounts">
                                  <AccordionTrigger className="text-left">
                                    <div className="flex items-center gap-3">
                                      <Building2 className="w-4 h-4 text-brown-600" />
                                      Corporate Accounts
                                      <Badge variant="secondary" className="ml-auto mr-4 bg-gray-100 text-gray-600">
                                        156 Customers
                                      </Badge>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg text-sm font-medium">
                                        <div>Company Name</div>
                                        <div>Contract Value</div>
                                        <div>Start Date</div>
                                        <div>Employees</div>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg text-sm">
                                          <div className="font-medium">TechCorp Solutions</div>
                                          <div className="text-green-600 font-medium">$850,000</div>
                                          <div>2024-01-15</div>
                                          <div>250</div>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg text-sm">
                                          <div className="font-medium">Global Industries</div>
                                          <div className="text-green-600 font-medium">$1,200,000</div>
                                          <div>2023-11-08</div>
                                          <div>485</div>
                                        </div>
                                      </div>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                                
                                <AccordionItem value="individual-accounts">
                                  <AccordionTrigger className="text-left">
                                    <div className="flex items-center gap-3">
                                      <User className="w-4 h-4 text-brown-600" />
                                      Individual Accounts
                                      <Badge variant="secondary" className="ml-auto mr-4 bg-gray-100 text-gray-600">
                                        1,243 Accounts
                                      </Badge>
                                      <Badge variant="outline" className="mr-4 bg-orange-50 text-orange-600 border-orange-200">
                                        Draft
                                      </Badge>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="space-y-6">
                                      <div className="grid grid-cols-4 gap-4 p-4 bg-brown-50 rounded-lg">
                                        <div>
                                          <div className="text-sm text-gray-600 mb-1">Account Manager</div>
                                          <div className="font-medium">James Brown</div>
                                        </div>
                                        <div>
                                          <div className="text-sm text-gray-600 mb-1">Contract Value</div>
                                          <div className="font-medium text-green-600">$250,000</div>
                                        </div>
                                        <div>
                                          <div className="text-sm text-gray-600 mb-1">Start Date</div>
                                          <div className="font-medium">2024-01-15</div>
                                        </div>
                                        <div>
                                          <div className="text-sm text-gray-600 mb-1">Member</div>
                                          <div className="font-medium">45</div>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h4 className="font-medium mb-3">Recent services</h4>
                                        <div className="border rounded-lg overflow-hidden">
                                          <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                              <CheckSquare className="w-4 h-4" />
                                              Date
                                            </div>
                                            <div>Type</div>
                                            <div>Cost</div>
                                            <div></div>
                                          </div>
                                          <div className="divide-y">
                                            <div className="grid grid-cols-4 gap-4 p-3 text-sm">
                                              <div className="flex items-center gap-2">
                                                <input type="checkbox" className="rounded" />
                                                2024-01-15
                                              </div>
                                              <div>Fleet Maintance</div>
                                              <div className="font-medium">$12,000</div>
                                              <div className="text-right">
                                                <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                              </div>
                                            </div>
                                            <div className="grid grid-cols-4 gap-4 p-3 text-sm">
                                              <div className="flex items-center gap-2">
                                                <input type="checkbox" className="rounded" />
                                                2024-02-28
                                              </div>
                                              <div>Emergency Repair</div>
                                              <div className="font-medium">$3,500</div>
                                              <div className="text-right">
                                                <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                              </div>
                                            </div>
                                            <div className="grid grid-cols-4 gap-4 p-3 text-sm">
                                              <div className="flex items-center gap-2">
                                                <input type="checkbox" className="rounded" />
                                                2024-01-15
                                              </div>
                                              <div>Fleet Maintance</div>
                                              <div className="font-medium">$12,000</div>
                                              <div className="text-right">
                                                <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                              
                              <div className="text-sm font-medium text-gray-600 mb-4 mt-8">Recruitment Processes (2)</div>
                              
                              <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="active-positions">
                                  <AccordionTrigger className="text-left">
                                    <div className="flex items-center gap-3">
                                      <Briefcase className="w-4 h-4 text-brown-600" />
                                      Active Positions
                                      <Badge variant="secondary" className="ml-auto mr-4 bg-blue-100 text-blue-600">
                                        12 Positions
                                      </Badge>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="space-y-3">
                                      <div className="grid grid-cols-3 gap-4 p-3 border rounded-lg">
                                        <div>
                                          <div className="font-medium">Senior Software Engineer</div>
                                          <div className="text-sm text-gray-600">Engineering Department</div>
                                        </div>
                                        <div className="text-sm">
                                          <div>Posted: 2024-03-01</div>
                                          <div>Applications: 45</div>
                                        </div>
                                        <div className="text-right">
                                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-3 gap-4 p-3 border rounded-lg">
                                        <div>
                                          <div className="font-medium">HR Business Partner</div>
                                          <div className="text-sm text-gray-600">Human Resources</div>
                                        </div>
                                        <div className="text-sm">
                                          <div>Posted: 2024-02-28</div>
                                          <div>Applications: 28</div>
                                        </div>
                                        <div className="text-right">
                                          <Badge className="bg-yellow-100 text-yellow-700">Review</Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                                
                                <AccordionItem value="talent-pipeline">
                                  <AccordionTrigger className="text-left">
                                    <div className="flex items-center gap-3">
                                      <Users className="w-4 h-4 text-brown-600" />
                                      Talent Pipeline
                                      <Badge variant="secondary" className="ml-auto mr-4 bg-purple-100 text-purple-600">
                                        186 Candidates
                                      </Badge>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-3 gap-4">
                                        <Card className="p-4 border-brown-200">
                                          <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">62</div>
                                            <div className="text-sm text-gray-600">Screening</div>
                                          </div>
                                        </Card>
                                        <Card className="p-4 border-brown-200">
                                          <div className="text-center">
                                            <div className="text-2xl font-bold text-yellow-600">34</div>
                                            <div className="text-sm text-gray-600">Interviewing</div>
                                          </div>
                                        </Card>
                                        <Card className="p-4 border-brown-200">
                                          <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">90</div>
                                            <div className="text-sm text-gray-600">Qualified</div>
                                          </div>
                                        </Card>
                                      </div>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            </div>
                          )}

                          {section.id === 'account-setup' && index === 0 && (
                            <Accordion type="single" collapsible defaultValue="payment-methods" className="w-full">
                              <AccordionItem value="update-account">
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <User className="w-4 h-4 text-brown-600" />
                                    How do I update my account information?
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                      You can update your account information through the HR portal or by contacting the HR department directly.
                                    </p>
                                    <div className="space-y-3">
                                      <div className="p-3 bg-blue-50 rounded-lg">
                                        <h5 className="font-medium text-sm mb-2">Online Portal Steps:</h5>
                                        <ol className="text-sm space-y-1 ml-4">
                                          <li>1. Log into the employee portal</li>
                                          <li>2. Navigate to "Profile Settings"</li>
                                          <li>3. Update your information</li>
                                          <li>4. Click "Save Changes"</li>
                                        </ol>
                                      </div>
                                      <div className="p-3 bg-green-50 rounded-lg">
                                        <h5 className="font-medium text-sm mb-2">Required Documentation:</h5>
                                        <ul className="text-sm space-y-1">
                                          <li>• Government-issued ID for name changes</li>
                                          <li>• Proof of address for address updates</li>
                                          <li>• Marriage certificate for marital status changes</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              
                              <AccordionItem value="payment-methods">
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <CreditCard className="w-4 h-4 text-brown-600" />
                                    What payment methods are accepted for payroll?
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                      We support multiple payroll delivery methods to ensure you receive your compensation conveniently and securely.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <Card className="p-4 border-brown-200">
                                        <h4 className="font-medium mb-3 flex items-center gap-2">
                                          <Banknote className="w-4 h-4 text-green-600" />
                                          Direct Deposit
                                        </h4>
                                        <ul className="text-sm space-y-1 text-gray-600">
                                          <li>• Most common and secure method</li>
                                          <li>• Funds available on payday</li>
                                          <li>• Requires bank account verification</li>
                                          <li>• Can split between multiple accounts</li>
                                        </ul>
                                      </Card>
                                      <Card className="p-4 border-brown-200">
                                        <h4 className="font-medium mb-3 flex items-center gap-2">
                                          <FileCheck className="w-4 h-4 text-blue-600" />
                                          Paper Check
                                        </h4>
                                        <ul className="text-sm space-y-1 text-gray-600">
                                          <li>• Physical check delivery</li>
                                          <li>• Available for pickup or mail</li>
                                          <li>• Processing may take 1-2 business days</li>
                                          <li>• Backup option if direct deposit fails</li>
                                        </ul>
                                      </Card>
                                    </div>
                                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                      <h5 className="font-medium text-sm mb-2 text-yellow-800">Setup Requirements:</h5>
                                      <p className="text-sm text-yellow-700">
                                        To set up direct deposit, you'll need your bank routing number and account number. 
                                        Contact HR to complete the setup process or update your payment preferences.
                                      </p>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              
                              <AccordionItem value="password-reset">
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <Lock className="w-4 h-4 text-brown-600" />
                                    How do I reset my password?
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                      Follow these steps to reset your password securely and regain access to your account.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-3">
                                        <h4 className="font-medium">Self-Service Reset</h4>
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                                            <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                                            <span className="text-sm">Visit the login page</span>
                                          </div>
                                          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                                            <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                                            <span className="text-sm">Click "Forgot Password"</span>
                                          </div>
                                          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                                            <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                                            <span className="text-sm">Enter your email address</span>
                                          </div>
                                          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                                            <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                                            <span className="text-sm">Check email for reset link</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="space-y-3">
                                        <h4 className="font-medium">IT Support Reset</h4>
                                        <div className="p-3 border rounded-lg">
                                          <p className="text-sm text-gray-600 mb-2">
                                            Contact IT support if you can't access your email or need immediate assistance:
                                          </p>
                                          <div className="space-y-1 text-sm">
                                            <div className="flex items-center gap-2">
                                              <Phone className="w-3 h-3 text-brown-600" />
                                              <span>Extension: 1234</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Mail className="w-3 h-3 text-brown-600" />
                                              <span>support@company.com</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Clock className="w-3 h-3 text-brown-600" />
                                              <span>Available: Mon-Fri 8AM-6PM</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              
                              <AccordionItem value="access-permissions">
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <Key className="w-4 h-4 text-brown-600" />
                                    How do I request additional system access?
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                      Access permissions are granted based on job responsibilities and security requirements.
                                    </p>
                                    <div className="space-y-4">
                                      <div className="p-4 bg-purple-50 rounded-lg">
                                        <h4 className="font-medium mb-3">Request Process</h4>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                                            <span>Submit access request form through HR portal</span>
                                          </div>
                                          <div className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                                            <span>Manager approval required for all requests</span>
                                          </div>
                                          <div className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                                            <span>IT security review for sensitive systems</span>
                                          </div>
                                          <div className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                                            <span>Approval notification within 2-3 business days</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 border rounded-lg">
                                          <h5 className="font-medium text-sm mb-2">Standard Access</h5>
                                          <p className="text-xs text-gray-600">Email, intranet, basic HR systems</p>
                                          <Badge className="mt-2 bg-green-100 text-green-700 text-xs">Auto-Approved</Badge>
                                        </div>
                                        <div className="p-3 border rounded-lg">
                                          <h5 className="font-medium text-sm mb-2">Elevated Access</h5>
                                          <p className="text-xs text-gray-600">Financial systems, admin tools</p>
                                          <Badge className="mt-2 bg-yellow-100 text-yellow-700 text-xs">Requires Approval</Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          )}

                          {section.id === 'hr-system-onboarding' && index === 0 && (
                            <Accordion type="single" collapsible defaultValue="account-creation" className="w-full">
                              <AccordionItem value="account-creation">
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <UserCheck className="w-4 h-4 text-brown-600" />
                                    Account Creation & Verification
                                    <Badge className="ml-auto mr-4 bg-green-100 text-green-700">
                                      Required
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-6">
                                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                      <h4 className="font-medium mb-3 text-green-800">Account Setup Checklist</h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-sm">Employee ID assigned</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-sm">Work email created</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-sm">Temporary password issued</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-yellow-600" />
                                            <span className="text-sm">Multi-factor authentication setup</span>
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-yellow-600" />
                                            <span className="text-sm">Security training completion</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-yellow-600" />
                                            <span className="text-sm">Profile photo upload</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-yellow-600" />
                                            <span className="text-sm">Emergency contacts added</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-yellow-600" />
                                            <span className="text-sm">Direct deposit setup</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <Card className="p-4 border-brown-200">
                                        <div className="text-center">
                                          <Globe className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                          <h5 className="font-medium text-sm mb-1">Portal Access</h5>
                                          <p className="text-xs text-gray-600">Employee self-service portal</p>
                                        </div>
                                      </Card>
                                      <Card className="p-4 border-brown-200">
                                        <div className="text-center">
                                          <Smartphone className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                          <h5 className="font-medium text-sm mb-1">Mobile App</h5>
                                          <p className="text-xs text-gray-600">HR mobile application</p>
                                        </div>
                                      </Card>
                                      <Card className="p-4 border-brown-200">
                                        <div className="text-center">
                                          <Monitor className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                          <h5 className="font-medium text-sm mb-1">Desktop Tools</h5>
                                          <p className="text-xs text-gray-600">Work productivity suite</p>
                                        </div>
                                      </Card>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              
                              <AccordionItem value="system-training">
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <BookOpen className="w-4 h-4 text-brown-600" />
                                    System Training & Resources
                                    <Badge className="ml-auto mr-4 bg-blue-100 text-blue-700">
                                      Week 1-2
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-4">
                                        <h4 className="font-medium">Required Training Modules</h4>
                                        <div className="space-y-3">
                                          <div className="p-3 border rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                              <span className="font-medium text-sm">HR Portal Navigation</span>
                                              <Badge className="bg-green-100 text-green-700 text-xs">Completed</Badge>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                              <div className="bg-green-600 h-2 rounded-full w-full"></div>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">Duration: 30 minutes</p>
                                          </div>
                                          
                                          <div className="p-3 border rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                              <span className="font-medium text-sm">Time Tracking System</span>
                                              <Badge className="bg-yellow-100 text-yellow-700 text-xs">In Progress</Badge>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                              <div className="bg-yellow-600 h-2 rounded-full w-3/4"></div>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">Duration: 45 minutes</p>
                                          </div>
                                          
                                          <div className="p-3 border rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                              <span className="font-medium text-sm">Benefits Enrollment</span>
                                              <Badge className="bg-gray-100 text-gray-700 text-xs">Pending</Badge>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                              <div className="bg-gray-400 h-2 rounded-full w-0"></div>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">Duration: 60 minutes</p>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-4">
                                        <h4 className="font-medium">Support Resources</h4>
                                        <div className="space-y-3">
                                          <div className="p-3 bg-blue-50 rounded-lg">
                                            <h5 className="font-medium text-sm mb-2 text-blue-800">Quick Start Guide</h5>
                                            <p className="text-xs text-blue-700 mb-2">Essential steps to get started with HR systems</p>
                                            <Button size="sm" variant="outline" className="text-xs h-7">
                                              Download PDF
                                            </Button>
                                          </div>
                                          
                                          <div className="p-3 bg-purple-50 rounded-lg">
                                            <h5 className="font-medium text-sm mb-2 text-purple-800">Video Tutorials</h5>
                                            <p className="text-xs text-purple-700 mb-2">Step-by-step video walkthroughs</p>
                                            <Button size="sm" variant="outline" className="text-xs h-7">
                                              Watch Videos
                                            </Button>
                                          </div>
                                          
                                          <div className="p-3 bg-green-50 rounded-lg">
                                            <h5 className="font-medium text-sm mb-2 text-green-800">Live Support</h5>
                                            <p className="text-xs text-green-700 mb-2">1-on-1 assistance with HR specialist</p>
                                            <Button size="sm" variant="outline" className="text-xs h-7">
                                              Schedule Session
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              
                              <AccordionItem value="integration-setup">
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <RefreshCw className="w-4 h-4 text-brown-600" />
                                    System Integration & Sync
                                    <Badge className="ml-auto mr-4 bg-purple-100 text-purple-700">
                                      Advanced
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                      Connect your HR account with other business systems for seamless data flow and automation.
                                    </p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <Card className="p-4 border-brown-200">
                                        <h4 className="font-medium mb-3 flex items-center gap-2">
                                          <Package2 className="w-4 h-4 text-blue-600" />
                                          Payroll Integration
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex items-center justify-between">
                                            <span>ADP Workforce</span>
                                            <Badge className="bg-green-100 text-green-700 text-xs">Connected</Badge>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span>QuickBooks Payroll</span>
                                            <Badge className="bg-gray-100 text-gray-700 text-xs">Available</Badge>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span>Paychex</span>
                                            <Badge className="bg-gray-100 text-gray-700 text-xs">Available</Badge>
                                          </div>
                                        </div>
                                      </Card>
                                      
                                      <Card className="p-4 border-brown-200">
                                        <h4 className="font-medium mb-3 flex items-center gap-2">
                                          <Calendar className="w-4 h-4 text-green-600" />
                                          Calendar Systems
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex items-center justify-between">
                                            <span>Google Workspace</span>
                                            <Badge className="bg-green-100 text-green-700 text-xs">Connected</Badge>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span>Microsoft 365</span>
                                            <Badge className="bg-yellow-100 text-yellow-700 text-xs">Pending</Badge>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span>Apple Calendar</span>
                                            <Badge className="bg-gray-100 text-gray-700 text-xs">Available</Badge>
                                          </div>
                                        </div>
                                      </Card>
                                    </div>
                                    
                                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                      <h4 className="font-medium mb-2 text-orange-800">Integration Benefits</h4>
                                      <ul className="text-sm text-orange-700 space-y-1">
                                        <li>• Automatic data synchronization between systems</li>
                                        <li>• Reduced manual data entry and errors</li>
                                        <li>• Real-time updates across all platforms</li>
                                        <li>• Streamlined reporting and analytics</li>
                                      </ul>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              
                              <AccordionItem value="security-compliance">
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-3">
                                    <Shield className="w-4 h-4 text-brown-600" />
                                    Security & Compliance Setup
                                    <Badge className="ml-auto mr-4 bg-red-100 text-red-700">
                                      Critical
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4">
                                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                      <h4 className="font-medium mb-3 text-red-800">Security Requirements</h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-sm">Strong password policy</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-sm">Two-factor authentication</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-yellow-600" />
                                            <span className="text-sm">Security awareness training</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-yellow-600" />
                                            <span className="text-sm">Privacy policy acknowledgment</span>
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-yellow-600" />
                                            <span className="text-sm">Data handling certification</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-yellow-600" />
                                            <span className="text-sm">Access level verification</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-yellow-600" />
                                            <span className="text-sm">Incident reporting setup</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-yellow-600" />
                                            <span className="text-sm">Regular security reviews</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-4">
                                      <div className="text-center p-3 border rounded-lg">
                                        <Lock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                        <div className="font-medium text-sm">Data Encryption</div>
                                        <div className="text-xs text-gray-600">256-bit SSL</div>
                                      </div>
                                      <div className="text-center p-3 border rounded-lg">
                                        <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                        <div className="font-medium text-sm">GDPR Compliant</div>
                                        <div className="text-xs text-gray-600">Privacy Protected</div>
                                      </div>
                                      <div className="text-center p-3 border rounded-lg">
                                        <FileCheck className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                                        <div className="font-medium text-sm">SOC 2 Certified</div>
                                        <div className="text-xs text-gray-600">Audit Ready</div>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          )}
                        </PreviewCard>

                        {/* Code Block */}
                        <PreviewCard title="Code Example">
                          <CodeBlock
                            code={example.code}
                            language="tsx"
                            id={`${section.id}-${index}`}
                          />
                        </PreviewCard>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};