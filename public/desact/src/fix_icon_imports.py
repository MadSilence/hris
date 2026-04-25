#!/usr/bin/env python3

import os
import re

# List of files that need to be updated
FILES_TO_UPDATE = [
    "/components/BreadcrumbsPage.tsx",
    "/components/ButtonsPage.tsx", 
    "/components/ChartsPage.tsx",
    "/components/ColorPickerPage.tsx",
    "/components/CommandMenuPage.tsx",
    "/components/DataDisplayPage.tsx",
    "/components/DrawerPage.tsx",
    "/components/FileUploadPage.tsx",
    "/components/FormsPage.tsx",
    "/components/HRCardsPage.tsx",
    "/components/InputPage.tsx",
    "/components/InteractionPage.tsx",
    "/components/LayoutPage.tsx",
    "/components/ListsPage.tsx",
    "/components/ModalsPage.tsx",
    "/components/NavigationPage.tsx",
    "/components/PaginationPage.tsx",
    "/components/SimpleInsightPage.tsx",
    "/components/SkeletonsPage.tsx",
    "/components/StatusPage.tsx",
    "/components/SystemColorsPage.tsx",
    "/components/TextEditorPage.tsx",
    "/components/TypographySystemPage.tsx"
]

# The static icon mappings to insert
STATIC_ICON_MAPPINGS = """// Static icon mappings
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
};"""

def fix_file(filepath):
    """Fix a single file by replacing the problematic imports"""
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Remove the problematic import lines
        content = re.sub(r"import { categoryIcons, componentIcons } from './constants/iconMappings';\s*", '', content)
        content = re.sub(r"import { useThemedIcon, useThemedCategoryIcon } from './shared/IconThemeSwitcher';\s*", '', content)
        
        # Add the static mappings after the CodeBlock import (or similar location)
        if "import { CodeBlock }" in content:
            content = content.replace("import { CodeBlock } from './shared/CodeBlock';", 
                                    f"import {{ CodeBlock }} from './shared/CodeBlock';\n{STATIC_ICON_MAPPINGS}")
        
        # Replace hook usage
        content = re.sub(r"const IconComponent = useThemedCategoryIcon\(category\);", 
                        "const IconComponent = categoryIcons[category] || categoryIcons['Base components'];", content)
        content = re.sub(r"const ComponentIcon = useThemedIcon\(component\.name\);", 
                        "const ComponentIcon = componentIcons[component.name] || componentIcons['Default'];", content)
        
        # Write back the file
        with open(filepath, 'w') as f:
            f.write(content)
        
        print(f"Fixed {filepath}")
        return True
    except Exception as e:
        print(f"Error fixing {filepath}: {e}")
        return False

def main():
    """Fix all files"""
    fixed_count = 0
    
    for filepath in FILES_TO_UPDATE:
        if os.path.exists(filepath):
            if fix_file(filepath):
                fixed_count += 1
        else:
            print(f"File not found: {filepath}")
    
    print(f"\nFixed {fixed_count} files")

if __name__ == "__main__":
    main()