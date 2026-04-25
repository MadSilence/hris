import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Terminal, Code2, FileCode, Download, Eye, EyeOff, Play, Pause, RotateCcw, Settings, Maximize2, ExternalLink, Github, Book, Zap, Package, Lightbulb, RefreshCw, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { CodeBlock } from './shared/CodeBlock';
import { MainSidebar } from './shared/MainSidebar';
import { ComponentData } from './constants/componentsData';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';

interface CodeSnippetsPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

// Helper component for preview cards
const PreviewCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ 
  title, 
  children, 
  className = "" 
}) => (
  <Card className={`p-6 ${className}`}>
    <h4 className="mb-4">{title}</h4>
    {children}
  </Card>
);

export const CodeSnippetsPage: React.FC<CodeSnippetsPageProps> = ({
  onBack,
  components,
  onComponentClick,
  currentComponent
}) => {
  const [copiedCode, setCopiedCode] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [theme, setTheme] = useState('light');
  const [isExecuting, setIsExecuting] = useState(false);
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const { inputRef: sidebarInputRef, handleKeyDown: handleSidebarKeyDown } = useInputKeyboardShortcuts({
    value: sidebarSearchTerm,
    onChange: setSidebarSearchTerm,
    enableGlobalShortcuts: false,
  });

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const executeCode = () => {
    setIsExecuting(true);
    setTimeout(() => setIsExecuting(false), 2000);
  };

  const sidebarSections = [
    { id: 'basic-snippets', label: 'Basic Code Blocks' },
    { id: 'syntax-highlighting', label: 'Syntax Highlighting' },
    { id: 'languages', label: 'Programming Languages' },
    { id: 'inline-code', label: 'Inline Code' },
    { id: 'interactive', label: 'Interactive Snippets' },
    { id: 'terminal', label: 'Terminal Commands' },
    { id: 'configurations', label: 'Configuration Files' },
    { id: 'api-examples', label: 'API Examples' },
    { id: 'diff-viewer', label: 'Code Diff' },
    { id: 'advanced', label: 'Advanced Features' }
  ];

  const [activeSection, setActiveSection] = useState('basic-snippets');

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
      const sections = ['basic-snippets', 'syntax-highlighting', 'languages', 'inline-code', 'interactive', 'terminal', 'configurations', 'api-examples', 'diff-viewer', 'advanced'];
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

  return (
    <div className="min-h-screen bg-brown-50/30 flex">
      <MainSidebar 
        currentComponent={currentComponent}
        components={components}
        onComponentClick={onComponentClick}
        onBack={onBack}
        sidebarSearchTerm={sidebarSearchTerm}
        setSidebarSearchTerm={setSidebarSearchTerm}
        collapsedCategories={collapsedCategories}
        setCollapsedCategories={setCollapsedCategories}
        sidebarInputRef={sidebarInputRef}
        handleSidebarKeyDown={handleSidebarKeyDown}
      />
      
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
                  <h1 className="text-xl font-semibold">Code snippets</h1>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                    Application UI
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Beautifully formatted code blocks with syntax highlighting, copy functionality, and interactive features
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
              {/* Basic Code Blocks Section */}
              <section id="basic-snippets" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Basic Code Blocks
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Simple code blocks with clean formatting and copy functionality.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Simple Code Block">
                      <CodeBlock
                        code={`function greetUser(name) {
  return \`Hello, \${name}!\`;
}

// Usage
const message = greetUser('John');
console.log(message);`}
                        language="javascript"
                        id="basic-example"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </PreviewCard>

                    <PreviewCard title="Compact Code Block">
                      <CodeBlock
                        code={`const users = await fetch('/api/users').then(r => r.json());`}
                        language="javascript"
                        id="compact-example"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Syntax Highlighting Section */}
              <section id="syntax-highlighting" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Syntax Highlighting
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Rich syntax highlighting for better code readability.
                    </p>
                  </div>

                  <PreviewCard title="React Component Example">
                    <CodeBlock
                      code={`import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';

interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  userId, 
  onUpdate 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(\`/api/users/\${userId}\`);
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        {user?.name || 'Unknown User'}
      </h2>
      <p className="text-gray-600 mb-4">{user?.email}</p>
      <Button onClick={() => onUpdate?.(user)}>
        Update Profile
      </Button>
    </Card>
  );
};`}
                      language="tsx"
                      id="react-component"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Programming Languages Section */}
              <section id="languages" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Programming Languages
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Support for multiple programming languages with proper syntax highlighting.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Python Example">
                      <CodeBlock
                        code={`def calculate_factorial(n):
    """Calculate factorial using recursion."""
    if n <= 1:
        return 1
    return n * calculate_factorial(n - 1)

# Example usage
numbers = [5, 7, 10]
results = {}

for num in numbers:
    result = calculate_factorial(num)
    results[num] = result
    print(f"Factorial of {num} is {result}")

# Using list comprehension
factorials = [calculate_factorial(x) for x in range(1, 6)]
print(f"First 5 factorials: {factorials}")`}
                        language="python"
                        id="python-example"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </PreviewCard>

                    <PreviewCard title="CSS Example">
                      <CodeBlock
                        code={`:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --spacing-unit: 0.25rem;
  --border-radius: 0.5rem;
}

.card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: calc(var(--spacing-unit) * 6);
  transition: all 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.card-header {
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: calc(var(--spacing-unit) * 4);
  padding-bottom: calc(var(--spacing-unit) * 4);
}

.card-title {
  color: var(--primary-color);
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

@media (max-width: 768px) {
  .card {
    margin: var(--spacing-unit);
    padding: calc(var(--spacing-unit) * 4);
  }
}`}
                        language="css"
                        id="css-example"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </PreviewCard>

                    <PreviewCard title="SQL Example">
                      <CodeBlock
                        code={`-- Employee performance analysis query
WITH employee_metrics AS (
  SELECT 
    e.employee_id,
    e.name,
    e.department,
    e.hire_date,
    COUNT(p.project_id) as projects_completed,
    AVG(pr.rating) as avg_performance_rating,
    SUM(t.hours_worked) as total_hours
  FROM employees e
  LEFT JOIN project_assignments pa ON e.employee_id = pa.employee_id
  LEFT JOIN projects p ON pa.project_id = p.project_id
  LEFT JOIN performance_reviews pr ON e.employee_id = pr.employee_id
  LEFT JOIN timesheets t ON e.employee_id = t.employee_id
  WHERE p.completion_date >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
  GROUP BY e.employee_id, e.name, e.department, e.hire_date
),
department_averages AS (
  SELECT 
    department,
    AVG(projects_completed) as dept_avg_projects,
    AVG(avg_performance_rating) as dept_avg_rating
  FROM employee_metrics
  GROUP BY department
)
SELECT 
  em.name,
  em.department,
  em.projects_completed,
  em.avg_performance_rating,
  em.total_hours,
  da.dept_avg_projects,
  da.dept_avg_rating,
  CASE 
    WHEN em.avg_performance_rating >= da.dept_avg_rating 
    THEN 'Above Average'
    ELSE 'Below Average'
  END as performance_status
FROM employee_metrics em
JOIN department_averages da ON em.department = da.department
ORDER BY em.avg_performance_rating DESC, em.projects_completed DESC;`}
                        language="sql"
                        id="sql-example"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </PreviewCard>

                    <PreviewCard title="JSON Configuration">
                      <CodeBlock
                        code={`{
  "name": "hr-dashboard",
  "version": "1.0.0",
  "description": "Human Resources Management Dashboard",
  "main": "src/index.tsx",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "@tanstack/react-query": "^4.24.0",
    "tailwindcss": "^3.2.0",
    "framer-motion": "^10.0.0",
    "lucide-react": "^0.311.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@vitejs/plugin-react": "^3.1.0",
    "typescript": "^4.9.0",
    "vite": "^4.1.0",
    "vitest": "^0.28.0"
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}`}
                        language="json"
                        id="json-example"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Inline Code Section */}
              <section id="inline-code" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Inline Code
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Inline code elements for highlighting code within text.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Inline Code Examples">
                      <div className="space-y-4">
                        <p>
                          To install the package, run <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">npm install react</code> in your terminal.
                        </p>
                        <p>
                          The <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">useState</code> hook is essential for managing component state.
                        </p>
                        <p>
                          Make sure to import the component: <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">import {"{ Button }"} from './ui/button'</code>
                        </p>
                        <p>
                          The API endpoint is <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">/api/v1/users/{"{id}"}</code>
                        </p>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Code with Keyboard Shortcuts">
                      <div className="space-y-4">
                        <p>
                          Press <kbd className="px-2 py-1 bg-gray-200 border border-gray-300 rounded text-sm font-mono">Ctrl</kbd> + 
                          <kbd className="px-2 py-1 bg-gray-200 border border-gray-300 rounded text-sm font-mono ml-1">S</kbd> to save.
                        </p>
                        <p>
                          Use <kbd className="px-2 py-1 bg-gray-200 border border-gray-300 rounded text-sm font-mono">Cmd</kbd> + 
                          <kbd className="px-2 py-1 bg-gray-200 border border-gray-300 rounded text-sm font-mono ml-1">K</kbd> to open the command palette.
                        </p>
                        <p>
                          Navigate with <kbd className="px-2 py-1 bg-gray-200 border border-gray-300 rounded text-sm font-mono">Tab</kbd> and 
                          <kbd className="px-2 py-1 bg-gray-200 border border-gray-300 rounded text-sm font-mono ml-1">Shift</kbd> + 
                          <kbd className="px-2 py-1 bg-gray-200 border border-gray-300 rounded text-sm font-mono ml-1">Tab</kbd>
                        </p>
                      </div>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Interactive Snippets Section */}
              <section id="interactive" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Interactive Code Snippets
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Code blocks with interactive features like execution, editing, and live preview.
                    </p>
                  </div>

                  <PreviewCard title="Interactive Code Editor">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="javascript">JavaScript</SelectItem>
                              <SelectItem value="typescript">TypeScript</SelectItem>
                              <SelectItem value="python">Python</SelectItem>
                              <SelectItem value="css">CSS</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-2">
                            <Switch 
                              id="line-numbers" 
                              checked={showLineNumbers}
                              onCheckedChange={setShowLineNumbers}
                            />
                            <label htmlFor="line-numbers" className="text-sm">Line numbers</label>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={executeCode}
                                  disabled={isExecuting}
                                >
                                  {isExecuting ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{isExecuting ? 'Running...' : 'Run code'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Reset code</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Maximize2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Fullscreen</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>

                      <CodeBlock
                        code={`// Interactive code example
function calculateBonus(salary, performanceRating) {
  const bonusPercentages = {
    excellent: 0.15,
    good: 0.10,
    average: 0.05,
    poor: 0
  };
  
  const percentage = bonusPercentages[performanceRating] || 0;
  const bonus = salary * percentage;
  
  return {
    salary,
    performanceRating,
    bonusPercentage: percentage * 100,
    bonusAmount: bonus,
    totalCompensation: salary + bonus
  };
}

// Test the function
const employee = {
  name: "Alice Johnson",
  salary: 75000,
  rating: "excellent"
};

const result = calculateBonus(employee.salary, employee.rating);
console.log(\`\${employee.name}'s bonus calculation:\`);
console.log(result);`}
                        language={selectedLanguage}
                        id="interactive-example"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />

                      {isExecuting && (
                        <div className="bg-gray-50 border rounded p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Terminal className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">Output:</span>
                          </div>
                          <pre className="text-sm text-gray-700">
{`Alice Johnson's bonus calculation:
{
  salary: 75000,
  performanceRating: "excellent",
  bonusPercentage: 15,
  bonusAmount: 11250,
  totalCompensation: 86250
}`}
                          </pre>
                        </div>
                      )}
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Terminal Commands Section */}
              <section id="terminal" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Terminal Commands
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Terminal and command-line interface examples with proper formatting.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Development Commands">
                      <CodeBlock
                        code={`# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Deploy to staging
npm run deploy:staging

# Check bundle size
npm run analyze`}
                        language="bash"
                        id="dev-commands"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </PreviewCard>

                    <PreviewCard title="Git Workflow">
                      <CodeBlock
                        code={`# Create and switch to feature branch
git checkout -b feature/user-profile

# Stage changes
git add .

# Commit with descriptive message
git commit -m "Add user profile component with edit functionality"

# Push to remote
git push origin feature/user-profile

# Create pull request (GitHub CLI)
gh pr create --title "Add user profile component" --body "Implements user profile editing with validation"

# Merge main branch changes
git checkout main
git pull origin main

# Update feature branch
git checkout feature/user-profile
git rebase main`}
                        language="bash"
                        id="git-commands"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Docker Commands">
                    <CodeBlock
                      code={`# Build the application image
docker build -t hr-dashboard:latest .

# Run container with environment variables
docker run -d \
  --name hr-dashboard \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://user:pass@localhost:5432/hrdb \
  hr-dashboard:latest

# View logs
docker logs hr-dashboard --follow

# Execute commands in running container
docker exec -it hr-dashboard /bin/bash

# Docker Compose for development
docker-compose up -d

# Scale services
docker-compose up --scale web=3

# Stop and remove containers
docker-compose down --volumes`}
                      language="bash"
                      id="docker-commands"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Configuration Files Section */}
              <section id="configurations" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Configuration Files
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Common configuration files for development and deployment.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="TypeScript Config">
                      <CodeBlock
                        code={`{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "allowJs": false,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": [
    "src",
    "vite.config.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build"
  ],
  "references": [
    { "path": "./tsconfig.node.json" }
  ]
}`}
                        language="json"
                        id="typescript-config"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </PreviewCard>

                    <PreviewCard title="Tailwind Config">
                      <CodeBlock
                        code={`import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brown: {
          50: '#f6f2f0',
          100: '#f0ece9',
          200: '#e2d6d0',
          300: '#d1bfb6',
          400: '#b5978c',
          500: '#947068',
          600: '#7a5a54',
          700: '#664242',
          800: '#4d3232',
          900: '#3d2626',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}`}
                        language="javascript"
                        id="tailwind-config"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* API Examples Section */}
              <section id="api-examples" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      API Examples
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      API request and response examples for common HR operations.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Employee API">
                      <div className="space-y-4">
                        <h5 className="font-medium">Request</h5>
                        <CodeBlock
                          code={`// Create new employee
const response = await fetch('/api/employees', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@company.com',
    department: 'Engineering',
    position: 'Senior Developer',
    startDate: '2024-01-15',
    salary: 95000,
    manager: 'john.smith@company.com'
  })
});`}
                          language="javascript"
                          id="employee-request"
                          copiedCode={copiedCode}
                          onCopy={copyToClipboard}
                        />
                        
                        <h5 className="font-medium">Response</h5>
                        <CodeBlock
                          code={`{
  "success": true,
  "data": {
    "id": "emp_7Yd9sKm3nP2x",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah.johnson@company.com",
    "department": "Engineering",
    "position": "Senior Developer",
    "startDate": "2024-01-15",
    "salary": 95000,
    "manager": {
      "id": "emp_3Kf8jLn2mQ9z",
      "name": "John Smith",
      "email": "john.smith@company.com"
    },
    "createdAt": "2024-01-15T09:30:00Z",
    "updatedAt": "2024-01-15T09:30:00Z",
    "status": "active"
  },
  "message": "Employee created successfully"
}`}
                          language="json"
                          id="employee-response"
                          copiedCode={copiedCode}
                          onCopy={copyToClipboard}
                        />
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Performance Review API">
                      <div className="space-y-4">
                        <h5 className="font-medium">Request</h5>
                        <CodeBlock
                          code={`// Submit performance review
const reviewData = {
  employeeId: 'emp_7Yd9sKm3nP2x',
  reviewPeriod: {
    startDate: '2023-07-01',
    endDate: '2023-12-31'
  },
  ratings: {
    technical: 4.5,
    communication: 4.0,
    leadership: 3.8,
    productivity: 4.2,
    teamwork: 4.6
  },
  goals: [
    {
      title: 'Complete certification',
      status: 'completed',
      weight: 0.3
    },
    {
      title: 'Lead team project',
      status: 'in_progress', 
      weight: 0.4
    }
  ],
  comments: 'Excellent performance with strong technical contributions.',
  overallRating: 4.2,
  recommendations: [
    'Consider for promotion',
    'Increase project leadership opportunities'
  ]
};

const response = await fetch('/api/performance-reviews', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify(reviewData)
});`}
                          language="javascript"
                          id="review-request"
                          copiedCode={copiedCode}
                          onCopy={copyToClipboard}
                        />
                      </div>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Code Diff Section */}
              <section id="diff-viewer" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Code Diff Viewer
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Display code changes with additions and deletions clearly highlighted.
                    </p>
                  </div>

                  <PreviewCard title="Component Update Diff">
                    <CodeBlock
                      code={`  import React, { useState } from 'react';
  import { Button } from './ui/button';
+ import { Card } from './ui/card';
+ import { Badge } from './ui/badge';

  interface EmployeeCardProps {
    employee: Employee;
+   showBadge?: boolean;
+   onUpdate?: () => void;
  }

  export const EmployeeCard: React.FC<EmployeeCardProps> = ({ 
-   employee 
+   employee,
+   showBadge = false,
+   onUpdate
  }) => {
    const [isEditing, setIsEditing] = useState(false);

    return (
-     <div className="p-4 border rounded">
+     <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{employee.name}</h3>
            <p className="text-gray-600">{employee.position}</p>
+           {showBadge && (
+             <Badge variant="secondary" className="mt-2">
+               {employee.department}
+             </Badge>
+           )}
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(!isEditing)}
          >
-           Edit
+           {isEditing ? 'Save' : 'Edit'}
          </Button>
        </div>
-     </div>
+     </Card>
    );
  };`}
                      language="diff"
                      id="diff-example"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Advanced Features Section */}
              <section id="advanced" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Advanced Features
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Advanced code block features including tabs, collapsible sections, and annotations.
                    </p>
                  </div>

                  <PreviewCard title="Tabbed Code Examples">
                    <Tabs defaultValue="react" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="react">React</TabsTrigger>
                        <TabsTrigger value="vue">Vue</TabsTrigger>
                        <TabsTrigger value="angular">Angular</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="react" className="mt-4">
                        <CodeBlock
                          code={`import React, { useState, useEffect } from 'react';

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {employees.map(employee => (
        <EmployeeCard key={employee.id} employee={employee} />
      ))}
    </div>
  );
};`}
                          language="tsx"
                          id="react-tab"
                          copiedCode={copiedCode}
                          onCopy={copyToClipboard}
                        />
                      </TabsContent>
                      
                      <TabsContent value="vue" className="mt-4">
                        <CodeBlock
                          code={`<template>
  <div class="space-y-4">
    <div v-if="loading">Loading...</div>
    <div v-else>
      <EmployeeCard 
        v-for="employee in employees" 
        :key="employee.id" 
        :employee="employee" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Employee } from '@/types'

const employees = ref<Employee[]>([])
const loading = ref(true)

const fetchEmployees = async () => {
  try {
    const response = await fetch('/api/employees')
    const data = await response.json()
    employees.value = data
  } catch (error) {
    console.error('Failed to fetch employees:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchEmployees()
})
</script>`}
                          language="vue"
                          id="vue-tab"
                          copiedCode={copiedCode}
                          onCopy={copyToClipboard}
                        />
                      </TabsContent>
                      
                      <TabsContent value="angular" className="mt-4">
                        <CodeBlock
                          code={`import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
}

@Component({
  selector: 'app-employee-list',
  template: \`
    <div class="space-y-4">
      <div *ngIf="loading">Loading...</div>
      <div *ngIf="!loading">
        <app-employee-card 
          *ngFor="let employee of employees" 
          [employee]="employee">
        </app-employee-card>
      </div>
    </div>
  \`
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchEmployees();
  }

  fetchEmployees(): void {
    this.http.get<Employee[]>('/api/employees')
      .subscribe({
        next: (data) => {
          this.employees = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to fetch employees:', error);
          this.loading = false;
        }
      });
  }
}`}
                          language="typescript"
                          id="angular-tab"
                          copiedCode={copiedCode}
                          onCopy={copyToClipboard}
                        />
                      </TabsContent>
                    </Tabs>
                  </PreviewCard>

                  <PreviewCard title="Code Usage Instructions">
                    <div className="space-y-4">
                      <h5 className="font-medium">Installation & Setup</h5>
                      <CodeBlock
                        code={`# 1. Install the HR Dashboard package
npm install @company/hr-dashboard

# 2. Install peer dependencies  
npm install react react-dom tailwindcss

# 3. Add to your main CSS file
@import '@company/hr-dashboard/styles';

# 4. Configure Tailwind CSS
npx tailwindcss init`}
                        language="bash"
                        id="setup-instructions"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />

                      <h5 className="font-medium">Basic Usage</h5>
                      <CodeBlock
                        code={`import { EmployeeCard, Dashboard, Reports } from '@company/hr-dashboard';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard>
        <Reports />
        <EmployeeCard 
          employee={{
            id: '1',
            name: 'John Doe',
            position: 'Developer',
            department: 'Engineering'
          }}
          showBadge={true}
          onUpdate={() => console.log('Employee updated')}
        />
      </Dashboard>
    </div>
  );
}`}
                        language="tsx"
                        id="usage-example"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
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