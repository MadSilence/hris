const fs = require('fs');

// Read the MessagingPage.tsx file
let content = fs.readFileSync('./components/MessagingPage.tsx', 'utf8');

// Find and fix all template literal issues in CodeBlock components
// Replace patterns like \\\\` with \` and \\\\$ with \$

// Fix pattern 1: \\\\`flex \\\\${...}\\\\`
content = content.replace(/\\\\`flex \\\\\\$\{([^}]+)\}\\\\`/g, '`flex ${$1}`');

// Fix pattern 2: \\\\`([^`]+)\\\\\\$\{([^}]+)\}([^`]*)\\\\`
content = content.replace(/\\\\`([^`]*?)\\\\\\$\{([^}]+)\}([^`]*?)\\\\`/g, '`$1\${$2}$3`');

// Fix pattern 3: More specific pattern for message thread template literals
content = content.replace(/className=\{\\\\`flex \\\\\\$\{message\.isOwn \? 'justify-end' : 'justify-start'\}\\\\`\}/g, "className={`flex \${message.isOwn ? 'justify-end' : 'justify-start'}`}");

// Fix pattern 4: Template literals for max-w styling
content = content.replace(/className=\{\\\\`max-w-xs p-3 rounded-lg \\\\\\$\{([^}]+)\}\\\\`\}/g, "className={`max-w-xs p-3 rounded-lg \${$1}`}");

// Write back to file
fs.writeFileSync('./components/MessagingPage.tsx', content, 'utf8');

console.log('Fixed template literal syntax errors in MessagingPage.tsx');