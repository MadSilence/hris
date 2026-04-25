const fs = require('fs');

// Read the file
const filePath = '/components/SystemColorsPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find all CodeBlock usages and add missing props
const codeBlockRegex = /<CodeBlock\s+([^>]+?)\s*\/>/g;

content = content.replace(codeBlockRegex, (match, props) => {
    // Check if the props already include copiedCode and onCopy
    if (props.includes('copiedCode=') && props.includes('onCopy=')) {
        return match; // Already has required props
    }
    
    // Remove the trailing whitespace and add required props
    const cleanProps = props.trim();
    
    // Add the missing props
    const updatedProps = cleanProps + '\n                      copiedCode={copiedCode}\n                      onCopy={copyToClipboard}';
    
    return `<CodeBlock\n                      ${updatedProps}\n                    />`;
});

// Write the file back
fs.writeFileSync(filePath, content);

console.log('✅ Updated all CodeBlock components in SystemColorsPage.tsx');