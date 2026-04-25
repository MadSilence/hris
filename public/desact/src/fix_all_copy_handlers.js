const fs = require('fs');
const path = require('path');

// List of component files that likely contain CodeBlock components
const componentFiles = [
  'components/AccordionPage.tsx',
  'components/AlertsPage.tsx', 
  'components/AvatarsPage.tsx',
  'components/BadgesPage.tsx',
  'components/BreadcrumbsPage.tsx',
  'components/ButtonsPage.tsx',
  'components/CardHeadersPage.tsx',
  'components/CarouselsPage.tsx',
  'components/ChartsPage.tsx',
  'components/ColorPickerPage.tsx',
  'components/CommandMenuPage.tsx',
  'components/DashboardPage.tsx',
  'components/DataDisplayPage.tsx',
  'components/DrawerPage.tsx',
  'components/FileUploadPage.tsx',
  'components/FormsPage.tsx',
  'components/HRCardsPage.tsx',
  'components/HeaderNavigationsPage.tsx',
  'components/IconsPage.tsx',
  'components/InlineCTAsPage.tsx',
  'components/InputPage.tsx',
  'components/InteractionPage.tsx',
  'components/LayoutPage.tsx',
  'components/ListsPage.tsx',
  'components/MiscellaneousPage.tsx',
  'components/ModalsPage.tsx',
  'components/NavigationPage.tsx',
  'components/PageHeadersPage.tsx',
  'components/PaginationPage.tsx',
  'components/ReadMePage.tsx',
  'components/SectionFootersPage.tsx',
  'components/SimpleInsightPage.tsx',
  'components/SkeletonsPage.tsx',
  'components/SlideoutMenusPage.tsx',
  'components/StatusPage.tsx',
  'components/SystemColorsPage.tsx',
  'components/TextEditorPage.tsx',
  'components/TypographySystemPage.tsx',
  'components/ActivityGaugesPage.tsx'
];

function fixCopyHandler(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;

  // Check if file contains CodeBlock and has a copy handler
  if (content.includes('CodeBlock') && content.includes('handleCopyCode')) {
    
    // Add import for createCopyHandler if not already present
    if (!content.includes('createCopyHandler')) {
      const importRegex = /(import { CodeBlock } from '\.\/shared\/CodeBlock';)/;
      if (importRegex.test(content)) {
        content = content.replace(
          importRegex,
          `$1\nimport { createCopyHandler } from './shared/copyUtils';`
        );
        hasChanges = true;
      }
    }

    // Replace the old handleCopyCode function with the new utility
    const oldHandlerPattern = /const handleCopyCode = async \(code: string, id: string\) => \{[\s\S]*?\};/;
    if (oldHandlerPattern.test(content)) {
      content = content.replace(
        oldHandlerPattern,
        'const handleCopyCode = createCopyHandler(setCopiedCode);'
      );
      hasChanges = true;
    }
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed copy handler in ${filePath}`);
    return true;
  }

  return false;
}

function main() {
  console.log('Fixing copy handlers across all component pages...\n');
  
  let totalFixed = 0;
  
  componentFiles.forEach(filePath => {
    if (fixCopyHandler(filePath)) {
      totalFixed++;
    }
  });
  
  console.log(`\nCompleted! Fixed copy handlers in ${totalFixed} files.`);
}

main();