import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { 
  Check, 
  ChevronRight,
  ChevronLeft,
  User,
  Building,
  FileText,
  CreditCard,
  Mail,
  Shield,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Menu,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { MainSidebar } from './shared/MainSidebar';
import { PageHeader } from './shared/PageHeader';
import { CodeBlock } from './shared/CodeBlock';
import { createCopyHandler } from './shared/copyUtils';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';

interface ProgressStepsPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const ProgressStepsPage: React.FC<ProgressStepsPageProps> = ({
  onBack,
  components,
  onComponentClick,
  currentComponent
}) => {
  const [activeSection, setActiveSection] = useState('linear-progress');
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set([1]));
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // MainSidebar required state
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const { inputRef: sidebarInputRef, handleKeyDown: handleSidebarKeyDown } = useInputKeyboardShortcuts({
    value: sidebarSearchTerm,
    onChange: setSidebarSearchTerm,
    enableGlobalShortcuts: false,
  });

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
      const sections = ['linear-progress', 'vertical-steps', 'form-wizard', 'onboarding-flow', 'process-tracker'];
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

  const linearSteps = [
    { title: 'Personal Information', icon: User },
    { title: 'Employment Details', icon: Building },
    { title: 'Documentation', icon: FileText },
    { title: 'Benefits Selection', icon: Shield },
    { title: 'Review & Submit', icon: CheckCircle2 }
  ];

  const verticalSteps = [
    {
      title: 'Application Submitted',
      description: 'Your application has been received and is under review.',
      date: 'March 15, 2024',
      status: 'completed'
    },
    {
      title: 'Initial Screening',
      description: 'HR team is conducting initial screening of your profile.',
      date: 'March 18, 2024',
      status: 'completed'
    },
    {
      title: 'Technical Interview',
      description: 'Scheduled technical interview with the engineering team.',
      date: 'March 22, 2024',
      status: 'current'
    },
    {
      title: 'Final Interview',
      description: 'Final interview with the hiring manager.',
      date: 'March 25, 2024',
      status: 'pending'
    },
    {
      title: 'Decision & Offer',
      description: 'Final decision and offer letter preparation.',
      date: 'March 28, 2024',
      status: 'pending'
    }
  ];

  const formSteps = [
    { id: 1, title: 'Basic Info', fields: ['Name', 'Email', 'Phone'] },
    { id: 2, title: 'Address', fields: ['Street', 'City', 'State', 'ZIP'] },
    { id: 3, title: 'Payment', fields: ['Card Number', 'Expiry', 'CVV'] },
    { id: 4, title: 'Review', fields: ['Confirmation'] }
  ];

  const onboardingSteps = [
    {
      title: 'Welcome to the Team!',
      description: 'Let\'s get you set up with everything you need to get started.',
      icon: <User className="w-8 h-8" />,
      completed: true
    },
    {
      title: 'Complete Your Profile',
      description: 'Add your professional information and profile picture.',
      icon: <Building className="w-8 h-8" />,
      completed: false
    },
    {
      title: 'Setup Your Workspace',
      description: 'Configure your workspace preferences and tools.',
      icon: <FileText className="w-8 h-8" />,
      completed: false
    },
    {
      title: 'Meet Your Team',
      description: 'Get introduced to your colleagues and team members.',
      icon: <Calendar className="w-8 h-8" />,
      completed: false
    }
  ];

  const processes = [
    {
      name: 'Employee Onboarding',
      steps: 8,
      completed: 6,
      status: 'in-progress',
      dueDate: 'March 30, 2024'
    },
    {
      name: 'Performance Review',
      steps: 5,
      completed: 5,
      status: 'completed',
      dueDate: 'March 15, 2024'
    },
    {
      name: 'Benefits Enrollment',
      steps: 4,
      completed: 2,
      status: 'in-progress',
      dueDate: 'April 5, 2024'
    },
    {
      name: 'Training Program',
      steps: 12,
      completed: 0,
      status: 'not-started',
      dueDate: 'April 10, 2024'
    }
  ];

  const handleNextStep = () => {
    if (currentStep < formSteps.length) {
      setCompletedSteps(prev => new Set([...prev, currentStep + 1]));
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCopyCode = createCopyHandler(setCopiedCode);

  const sections = [
    { id: 'linear-progress', label: 'Linear Progress Steps', icon: ChevronRight },
    { id: 'vertical-steps', label: 'Vertical Timeline Steps', icon: Calendar },
    { id: 'form-wizard', label: 'Form Wizard Steps', icon: FileText },
    { id: 'onboarding-flow', label: 'Onboarding Flow', icon: User },
    { id: 'process-tracker', label: 'Process Tracker', icon: CheckCircle2 }
  ];

  return (
    <div className="min-h-screen bg-brown-50/30 flex">
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
      
      <div className="flex-1 flex flex-col">
        <PageHeader 
          title="Progress Steps"
          description="Step indicators, progress trackers, and multi-step workflows for HR processes and user onboarding"
          onBack={onBack}
          sections={sections}
        />

        <div className="flex-1 relative">
          {/* Floating Navigation */}
          <div className="fixed right-8 top-40 z-30 hidden xl:block">
            <div className="bg-white rounded-lg border border-brown-200 shadow-lg p-4 w-56">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-brown-100">
                <Menu className="h-4 w-4" style={{ color: 'var(--color-text-quaternary)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>On this page</span>
              </div>
              <nav className="space-y-1">
                {sections.map((section) => (
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

          <main className="p-8 xl:pr-72 max-w-6xl mx-auto space-y-16">
            {/* Linear Progress Steps */}
            <section id="linear-progress" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Linear Progress Steps</h2>
                <p className="text-muted-foreground mb-6">
                  Horizontal step indicators showing progress through a multi-step process with clear visual hierarchy.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-8 border-brown-200">
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      {linearSteps.map((step, index) => {
                        const stepNumber = index + 1;
                        const isActive = stepNumber === currentStep;
                        const isCompleted = completedSteps.has(stepNumber);
                        const StepIcon = step.icon;
                        
                        return (
                          <React.Fragment key={index}>
                            <div className="flex flex-col items-center flex-1">
                              <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                                isCompleted 
                                  ? 'bg-brown-700 border-brown-700 text-white' 
                                  : isActive
                                    ? 'border-brown-700 bg-brown-50 text-brown-700'
                                    : 'border-brown-300 bg-white text-brown-400'
                              }`}>
                                {isCompleted ? (
                                  <Check className="w-5 h-5" />
                                ) : (
                                  <StepIcon className="w-5 h-5" />
                                )}
                              </div>
                              
                              <div className="mt-3 text-center">
                                <div className={`text-sm font-medium ${
                                  isActive ? 'text-brown-700' : isCompleted ? 'text-brown-600' : 'text-brown-400'
                                }`}>
                                  {step.title}
                                </div>
                              </div>
                            </div>
                            
                            {index < linearSteps.length - 1 && (
                              <div className="flex items-center flex-1">
                                <div className="flex-1 h-0.5 mx-4 bg-brown-200">
                                  <div 
                                    className={`h-full bg-brown-700 transition-all duration-500 ${
                                      completedSteps.has(stepNumber + 1) ? 'w-full' : 'w-0'
                                    }`}
                                  />
                                </div>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    
                    <div className="text-center">
                      <div className="mb-4">
                        <h3 className="font-semibold mb-2">{linearSteps[currentStep - 1].title}</h3>
                        <p className="text-muted-foreground">Step {currentStep} of {linearSteps.length}</p>
                      </div>
                      
                      <div className="flex justify-center gap-3">
                        <Button 
                          variant="outline" 
                          onClick={handlePrevStep}
                          disabled={currentStep === 1}
                          className="border-brown-300 hover:bg-brown-50"
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Previous
                        </Button>
                        <Button 
                          onClick={handleNextStep}
                          disabled={currentStep === linearSteps.length}
                          className="bg-brown-700 hover:bg-brown-800"
                        >
                          {currentStep === linearSteps.length ? 'Complete' : 'Next'}
                          {currentStep !== linearSteps.length && <ChevronRight className="w-4 h-4 ml-2" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                <CodeBlock
                  title="Linear Progress Steps"
                  language="tsx"
                  id="linear-progress-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<div className="flex items-center justify-between">
  {steps.map((step, index) => {
    const stepNumber = index + 1;
    const isActive = stepNumber === currentStep;
    const isCompleted = completedSteps.has(stepNumber);
    const StepIcon = step.icon;
    
    return (
      <React.Fragment key={index}>
        <div className="flex flex-col items-center flex-1">
          <div className={\`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all \${
            isCompleted 
              ? 'bg-brown-700 border-brown-700 text-white' 
              : isActive
                ? 'border-brown-700 bg-brown-50 text-brown-700'
                : 'border-brown-300 bg-white text-brown-400'
          }\`}>
            {isCompleted ? (
              <Check className="w-5 h-5" />
            ) : (
              <StepIcon className="w-5 h-5" />
            )}
          </div>
        </div>
      </React.Fragment>
    );
  })}
</div>`}
                />
              </div>
            </section>

            {/* Vertical Timeline Steps */}
            <section id="vertical-steps" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Vertical Timeline Steps</h2>
                <p className="text-muted-foreground mb-6">
                  Vertical timeline format ideal for showing recruitment progress, application status, or project milestones.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-8 border-brown-200">
                  <div className="space-y-6">
                    {verticalSteps.map((step, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                            step.status === 'completed'
                              ? 'bg-brown-700 border-brown-700 text-white'
                              : step.status === 'current'
                                ? 'bg-orange-600 border-orange-600 text-white animate-pulse'
                                : 'bg-white border-brown-300 text-brown-400'
                          }`}>
                            {step.status === 'completed' ? (
                              <Check className="w-5 h-5" />
                            ) : step.status === 'current' ? (
                              <Clock className="w-5 h-5" />
                            ) : (
                              <div className="w-2 h-2 bg-brown-300 rounded-full" />
                            )}
                          </div>
                          
                          {index < verticalSteps.length - 1 && (
                            <div className={`w-0.5 h-16 mt-2 ${
                              step.status === 'completed' ? 'bg-brown-700' : 'bg-brown-200'
                            }`} />
                          )}
                        </div>
                        
                        <div className="flex-1 pb-8">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{step.title}</h4>
                            {step.status === 'current' && (
                              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                                In Progress
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-2">{step.description}</p>
                          <div className="flex items-center gap-2 text-sm text-brown-600">
                            <Calendar className="w-4 h-4" />
                            {step.date}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <CodeBlock
                  title="Vertical Timeline Steps"
                  language="tsx"
                  id="vertical-steps-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<div className="space-y-6">
  {steps.map((step, index) => (
    <div key={index} className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div className={\`flex items-center justify-center w-10 h-10 rounded-full border-2 \${
          step.status === 'completed'
            ? 'bg-brown-700 border-brown-700 text-white'
            : step.status === 'current'
              ? 'bg-orange-600 border-orange-600 text-white animate-pulse'
              : 'bg-white border-brown-300 text-brown-400'
        }\`}>
          {step.status === 'completed' ? (
            <Check className="w-5 h-5" />
          ) : step.status === 'current' ? (
            <Clock className="w-5 h-5" />
          ) : (
            <div className="w-2 h-2 bg-brown-300 rounded-full" />
          )}
        </div>
      </div>
    </div>
  ))}
</div>`}
                />
              </div>
            </section>

            {/* Form Wizard Steps */}
            <section id="form-wizard" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Form Wizard Steps</h2>
                <p className="text-muted-foreground mb-6">
                  Multi-step form navigation with clear progress indication and easy step-by-step completion.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-8 border-brown-200">
                  <div className="max-w-3xl mx-auto">
                    {/* Step Indicator */}
                    <div className="flex items-center justify-center mb-8">
                      {formSteps.map((step, index) => (
                        <React.Fragment key={step.id}>
                          <button
                            onClick={() => setCurrentStep(step.id)}
                            className="flex items-center gap-3"
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                              completedSteps.has(step.id) && currentStep !== step.id
                                ? 'bg-brown-700 text-white'
                                : currentStep === step.id
                                  ? 'bg-brown-700 text-white'
                                  : 'bg-gray-300 text-gray-500'
                            }`}>
                              {completedSteps.has(step.id) && currentStep !== step.id ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                step.id
                              )}
                            </div>
                            <span className="text-sm font-medium">{step.title}</span>
                          </button>
                          {index < formSteps.length - 1 && (
                            <ChevronRight className="w-4 h-4 text-brown-300 mx-4" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Current Step Content */}
                    <div className="bg-brown-50 rounded-lg p-6 mb-6">
                      <h3 className="font-semibold mb-4">
                        Step {currentStep}: {formSteps.find(s => s.id === currentStep)?.title}
                      </h3>
                      <div className="space-y-4">
                        {formSteps.find(s => s.id === currentStep)?.fields.map((field, index) => (
                          <div key={index}>
                            <label className="block text-sm font-medium mb-2">{field}</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                              placeholder={`Enter your ${field.toLowerCase()}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={handlePrevStep}
                        disabled={currentStep === 1}
                        className="border-brown-300 hover:bg-brown-50"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                      <Button 
                        onClick={handleNextStep}
                        disabled={currentStep === formSteps.length}
                        className="bg-brown-700 hover:bg-brown-800"
                      >
                        {currentStep === formSteps.length ? 'Submit' : 'Next'}
                        {currentStep !== formSteps.length && <ChevronRight className="w-4 h-4 ml-2" />}
                      </Button>
                    </div>
                  </div>
                </Card>

                <CodeBlock
                  title="Form Wizard Steps"
                  language="tsx"
                  id="form-wizard-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<div className="flex items-center justify-center mb-8">
  {steps.map((step, index) => (
    <React.Fragment key={step.id}>
      <button
        onClick={() => setCurrentStep(step.id)}
        className="flex items-center gap-3"
      >
        <div className={\`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all \${
          completedSteps.has(step.id) && currentStep !== step.id
            ? 'bg-brown-700 text-white'
            : currentStep === step.id
              ? 'bg-brown-700 text-white'
              : 'bg-gray-300 text-gray-500'
        }\`}>
          {completedSteps.has(step.id) && currentStep !== step.id ? (
            <Check className="w-3 h-3" />
          ) : (
            step.id
          )}
        </div>
        <span className="text-sm font-medium">{step.title}</span>
      </button>
      {index < steps.length - 1 && (
        <ChevronRight className="w-4 h-4 text-brown-300 mx-4" />
      )}
    </React.Fragment>
  ))}
</div>`}
                />
              </div>
            </section>

            {/* Onboarding Flow */}
            <section id="onboarding-flow" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Onboarding Flow</h2>
                <p className="text-muted-foreground mb-6">
                  Employee onboarding progress with interactive steps and completion tracking for new hire workflows.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-8 border-brown-200">
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <h3 className="text-xl font-semibold mb-2">Welcome to Your New Journey!</h3>
                      <p className="text-muted-foreground">
                        Complete these steps to get fully set up in our system.
                      </p>
                    </div>

                    <div className="space-y-6">
                      {onboardingSteps.map((step, index) => (
                        <div
                          key={index}
                          className={`p-6 rounded-lg border transition-all ${
                            index === onboardingStep
                              ? 'border-brown-700 bg-brown-50'
                              : step.completed
                                ? 'border-green-200 bg-green-50'
                                : 'border-brown-200 bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                              step.completed
                                ? 'bg-green-500 text-white'
                                : index === onboardingStep
                                  ? 'bg-brown-700 text-white'
                                  : 'bg-brown-200 text-brown-500'
                            }`}>
                              {step.completed ? (
                                <Check className="w-6 h-6" />
                              ) : (
                                step.icon
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">{step.title}</h4>
                                {step.completed && (
                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                    Completed
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-muted-foreground mb-4">{step.description}</p>
                              
                              {index === onboardingStep && !step.completed && (
                                <div className="flex gap-3">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      const newSteps = [...onboardingSteps];
                                      newSteps[index].completed = true;
                                      if (index < onboardingSteps.length - 1) {
                                        setOnboardingStep(index + 1);
                                      }
                                    }}
                                    className="bg-brown-700 hover:bg-brown-800"
                                  >
                                    <Play className="w-4 h-4 mr-2" />
                                    Start Step
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-brown-300 hover:bg-brown-50">
                                    Skip for Now
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 text-center">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="flex-1 h-2 bg-brown-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-brown-700 transition-all duration-500 ease-out"
                            style={{ width: `${(onboardingSteps.filter(s => s.completed).length / onboardingSteps.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-brown-700">
                          {onboardingSteps.filter(s => s.completed).length} of {onboardingSteps.length}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You're doing great! Keep going to complete your setup.
                      </p>
                    </div>
                  </div>
                </Card>

                <CodeBlock
                  title="Onboarding Flow"
                  language="tsx"
                  id="onboarding-flow-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<div className="space-y-6">
  {steps.map((step, index) => (
    <div
      key={index}
      className={\`p-6 rounded-lg border transition-all \${
        index === currentStep
          ? 'border-brown-700 bg-brown-50'
          : step.completed
            ? 'border-green-200 bg-green-50'
            : 'border-brown-200 bg-white'
      }\`}
    >
      <div className="flex items-start gap-4">
        <div className={\`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center \${
          step.completed
            ? 'bg-green-500 text-white'
            : index === currentStep
              ? 'bg-brown-700 text-white'
              : 'bg-brown-200 text-brown-500'
        }\`}>
          {step.completed ? (
            <Check className="w-6 h-6" />
          ) : (
            step.icon
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">{step.title}</h4>
            {step.completed && (
              <Badge className="bg-green-100 text-green-700">
                Completed
              </Badge>
            )}
          </div>
          
          <p className="text-muted-foreground mb-4">{step.description}</p>
          
          {index === currentStep && !step.completed && (
            <div className="flex gap-3">
              <Button size="sm" onClick={() => startStep(index)}>
                <Play className="w-4 h-4 mr-2" />
                Start Step
              </Button>
              <Button size="sm" variant="outline">
                Skip for Now
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  ))}
</div>`}
                />
              </div>
            </section>

            {/* Process Tracker */}
            <section id="process-tracker" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Process Tracker</h2>
                <p className="text-muted-foreground mb-6">
                  Track multiple HR processes simultaneously with progress indicators, status updates, and completion metrics.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-8 border-brown-200">
                  <div className="space-y-6">
                    {processes.map((process, index) => {
                      const progressPercentage = (process.completed / process.steps) * 100;
                      
                      return (
                        <div key={index} className="border border-brown-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold">{process.name}</h4>
                              <Badge className={`${
                                process.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : process.status === 'in-progress'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-gray-100 text-gray-700'
                              }`}>
                                {process.status === 'completed'
                                  ? 'Completed'
                                  : process.status === 'in-progress'
                                    ? 'In Progress'
                                    : 'Not Started'
                                }
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-brown-600">
                              <Calendar className="w-4 h-4" />
                              Due {process.dueDate}
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {process.completed} of {process.steps} steps completed
                              </span>
                              <span className="font-medium">
                                {Math.round(progressPercentage)}%
                              </span>
                            </div>
                            
                            <Progress value={progressPercentage} className="h-2" />
                            
                            <div className="flex justify-between">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-brown-300 hover:bg-brown-50"
                              >
                                View Details
                              </Button>
                              
                              {process.status !== 'completed' && (
                                <Button
                                  size="sm"
                                  className="bg-brown-700 hover:bg-brown-800"
                                >
                                  {process.status === 'not-started' ? 'Start Process' : 'Continue'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <CodeBlock
                  title="Process Tracker"
                  language="tsx"
                  id="process-tracker-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<div className="space-y-6">
  {processes.map((process, index) => {
    const progressPercentage = (process.completed / process.steps) * 100;
    
    return (
      <div key={index} className="border border-brown-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h4 className="font-semibold">{process.name}</h4>
            <Badge className={\`\${
              process.status === 'completed'
                ? 'bg-green-100 text-green-700'
                : process.status === 'in-progress'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-700'
            }\`}>
              {process.status === 'completed'
                ? 'Completed'
                : process.status === 'in-progress'
                  ? 'In Progress'
                  : 'Not Started'
              }
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-brown-600">
            <Calendar className="w-4 h-4" />
            Due {process.dueDate}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {process.completed} of {process.steps} steps completed
            </span>
            <span className="font-medium">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>
    );
  })}
</div>`}
                />
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};