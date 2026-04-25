// Batch fix script for icon imports across multiple files
const fs = require('fs');
const path = require('path');

const filesToFix = [
  '/components/CommandMenuPage.tsx',
  '/components/DataDisplayPage.tsx',
  '/components/DrawerPage.tsx', 
  '/components/FileUploadPage.tsx',
  '/components/FormsPage.tsx',
  '/components/HRCardsPage.tsx',
  '/components/InputPage.tsx',
  '/components/InteractionPage.tsx',
  '/components/LayoutPage.tsx',
  '/components/ListsPage.tsx',
  '/components/ModalsPage.tsx',
  '/components/NavigationPage.tsx',
  '/components/PaginationPage.tsx',
  '/components/SimpleInsightPage.tsx',
  '/components/SkeletonsPage.tsx',
  '/components/StatusPage.tsx',
  '/components/SystemColorsPage.tsx',
  '/components/TextEditorPage.tsx',
  '/components/TypographySystemPage.tsx'
];

const staticIconMappings = `// Static icon mappings
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
  'System Colors': Palette,
  'Icons': Hash,
  'Miscellaneous': Settings,
  'Default': Package
};`;

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Remove problematic imports
    content = content.replace(/import { categoryIcons, componentIcons } from '\.\/constants\/iconMappings';\s*/g, '');
    content = content.replace(/import { useThemedIcon, useThemedCategoryIcon } from '\.\/shared\/IconThemeSwitcher';\s*/g, '');

    // Add static mappings after CodeBlock import
    if (content.includes("import { CodeBlock } from './shared/CodeBlock';")) {
      content = content.replace(
        "import { CodeBlock } from './shared/CodeBlock';",
        `import { CodeBlock } from './shared/CodeBlock';\n${staticIconMappings}`
      );
    } else {
      // Fallback: add after ComponentData import
      content = content.replace(
        "import { ComponentData } from './constants/componentsData';",
        `import { ComponentData } from './constants/componentsData';\n${staticIconMappings}`
      );
    }

    // Replace hook usage
    content = content.replace(
      /const IconComponent = useThemedCategoryIcon\(category\);/g,
      "const IconComponent = categoryIcons[category] || categoryIcons['Base components'];"
    );
    content = content.replace(
      /const ComponentIcon = useThemedIcon\(component\.name\);/g,
      "const ComponentIcon = componentIcons[component.name] || componentIcons['Default'];"
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function fixAll() {
  let fixed = 0;
  for (const file of filesToFix) {
    if (fixFile(file)) {
      fixed++;
    }
  }
  console.log(`Fixed ${fixed} out of ${filesToFix.length} files`);
}

fixAll();