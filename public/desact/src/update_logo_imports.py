#!/usr/bin/env python3

import os
import re

def update_logo_imports():
    """Update all component pages to use the new DesactLogo component"""
    
    # Directory containing the component files
    components_dir = "/components"
    
    # Get all .tsx files in the components directory (excluding ui subdirectory)
    tsx_files = []
    for filename in os.listdir(components_dir):
        if filename.endswith('.tsx') and not filename.startswith('.'):
            tsx_files.append(os.path.join(components_dir, filename))
    
    # Files we've already updated or don't need to update
    already_updated = [
        '/components/TypographySystemPage.tsx',
        '/components/SystemColorsPage.tsx', 
        '/components/ButtonsPage.tsx',
        '/components/ComponentCard.tsx',
        '/components/ComponentThumbnails.tsx'
    ]
    
    for file_path in tsx_files:
        if file_path in already_updated:
            continue
            
        print(f"Processing {file_path}...")
        
        try:
            # Read the file
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check if this file imports the old logo
            if 'figma:asset/d2cad3d3cd0b53d750200f7865594cb6121e1c9c.png' not in content:
                print(f"  No logo import found in {file_path}, skipping...")
                continue
            
            original_content = content
            
            # Remove the old import line
            content = re.sub(
                r"import desactLogo from 'figma:asset/d2cad3d3cd0b53d750200f7865594cb6121e1c9c\.png';\n",
                "",
                content
            )
            
            # Add the DesactLogo import to the existing imports
            # Find the last import line and add our import after it
            import_pattern = r"(import .+?;\n)(?!import)"
            imports = re.findall(import_pattern, content, re.MULTILINE)
            
            if imports:
                last_import = imports[-1]
                last_import_index = content.rfind(last_import)
                if last_import_index != -1:
                    insert_point = last_import_index + len(last_import)
                    content = (content[:insert_point] + 
                             "import { DesactLogo } from './shared/DesactLogo';\n" + 
                             content[insert_point:])
            
            # Replace the img tag usage with DesactLogo component
            img_pattern = r'<img\s+src=\{desactLogo\}\s+alt="Desact"\s+className="h-8 w-auto transition-transform duration-200 hover:scale-105"\s*/>'
            replacement = '<DesactLogo \n              onClick={onBack}\n              animated={false}\n            />'
            content = re.sub(img_pattern, replacement, content)
            
            # If no changes were made to the content, skip writing
            if content == original_content:
                print(f"  No changes needed for {file_path}")
                continue
            
            # Write the updated content back to the file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
                
            print(f"  Updated {file_path} successfully!")
            
        except Exception as e:
            print(f"  Error processing {file_path}: {e}")

if __name__ == "__main__":
    update_logo_imports()
    print("Logo import update completed!")