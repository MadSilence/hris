const fs = require('fs');

try {
  // Read the file
  const filePath = '/components/CardHeadersPage.tsx';
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace all remaining instances that don't have rounded-t-lg
  content = content
    // Main header patterns
    .replace(/className="bg-brown-50 border-b border-brown-200 px-6 py-4"(?!\s+rounded-t-lg)/g, 
             'className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-lg"')
    .replace(/className="bg-red-50 border-b border-red-200 px-6 py-4"(?!\s+rounded-t-lg)/g, 
             'className="bg-red-50 border-b border-red-200 px-6 py-4 rounded-t-lg"')
    .replace(/className="bg-green-50 border-b border-green-200 px-6 py-4"(?!\s+rounded-t-lg)/g, 
             'className="bg-green-50 border-b border-green-200 px-6 py-4 rounded-t-lg"')
    // Code examples
    .replace(/  <header className="bg-brown-50 border-b border-brown-200 px-6 py-4"(?!\s+rounded-t-lg)/g, 
             '  <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-lg"')
    .replace(/  <header className="bg-red-50 border-b border-red-200 px-6 py-4"(?!\s+rounded-t-lg)/g, 
             '  <header className="bg-red-50 border-b border-red-200 px-6 py-4 rounded-t-lg"')
    .replace(/  <header className="bg-green-50 border-b border-green-200 px-6 py-4"(?!\s+rounded-t-lg)/g, 
             '  <header className="bg-green-50 border-b border-green-200 px-6 py-4 rounded-t-lg"');

  // Write the updated content back to the file
  fs.writeFileSync(filePath, content);
  console.log('Successfully updated all header classes to include rounded-t-lg');
} catch (error) {
  console.error('Error updating file:', error);
}