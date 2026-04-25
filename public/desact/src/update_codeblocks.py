#!/usr/bin/env python3

import os
import re

# Find all CodeBlock usages in component pages that need copiedCode and onCopy props
files_to_update = [
    '/components/AccordionPage.tsx',
    '/components/ButtonsPage.tsx', 
    '/components/FormsPage.tsx',
    '/components/HRCardsPage.tsx',
    '/components/IconsPage.tsx',
    '/components/InputPage.tsx',
    '/components/LayoutPage.tsx',
    '/components/SystemColorsPage.tsx',
    '/components/TypographySystemPage.tsx'
]

def update_codeblock_props(file_path):
    """Update CodeBlock components to include required props"""
    if not os.path.exists(file_path):
        print(f"File {file_path} does not exist, skipping...")
        return
        
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Pattern to find CodeBlock components without copiedCode and onCopy props
    # This regex looks for CodeBlock with existing props but missing the required ones
    pattern = r'<CodeBlock\s+([^>]*?)(?:\s*/>|\s*>)'
    
    def add_missing_props(match):
        props = match.group(1)
        
        # Check if copiedCode and onCopy are already present
        if 'copiedCode=' in props and 'onCopy=' in props:
            return match.group(0)  # Already has required props
            
        # Add the missing props
        if not props.endswith('\n'):
            props = props.rstrip()
            
        # Add required props if missing
        if 'copiedCode=' not in props:
            props += '\n                           copiedCode={copiedCode}'
        if 'onCopy=' not in props:
            props += '\n                           onCopy={copyToClipboard}'
        
        # Return updated CodeBlock
        if match.group(0).endswith('/>'):
            return f'<CodeBlock\n                           {props}\n                         />'
        else:
            return f'<CodeBlock\n                           {props}\n                         >'
    
    # Apply the transformation
    updated_content = re.sub(pattern, add_missing_props, content, flags=re.DOTALL)
    
    # Write back to file only if changes were made
    if updated_content != content:
        with open(file_path, 'w') as f:
            f.write(updated_content)
        print(f"Updated {file_path}")
    else:
        print(f"No changes needed for {file_path}")

# Update all files
for file_path in files_to_update:
    update_codeblock_props(file_path)

print("\nCodeBlock update script completed!")
print("All CodeBlock components should now have show more/less functionality with animations.")