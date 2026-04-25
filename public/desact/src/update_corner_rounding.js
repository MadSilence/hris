const fs = require('fs');

try {
  // Read the file
  const filePath = '/components/CardHeadersPage.tsx';
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace all instances of rounded-t-lg with rounded-t-xl for card headers
  content = content
    // Replace bg-brown-50 headers
    .replace(/className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-lg"/g, 
             'className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl"')
    // Replace bg-red-50 headers (Alert Status)
    .replace(/className="bg-red-50 border-b border-red-200 px-6 py-4 rounded-t-lg"/g, 
             'className="bg-red-50 border-b border-red-200 px-6 py-4 rounded-t-xl"')
    // Replace bg-green-50 headers (Success Status)
    .replace(/className="bg-green-50 border-b border-green-200 px-6 py-4 rounded-t-lg"/g, 
             'className="bg-green-50 border-b border-green-200 px-6 py-4 rounded-t-xl"')
    // Replace headers that don't have rounded corners yet
    .replace(/className="bg-brown-50 border-b border-brown-200 px-6 py-4"(?!\s+rounded)/g, 
             'className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl"')
    .replace(/className="bg-red-50 border-b border-red-200 px-6 py-4"(?!\s+rounded)/g, 
             'className="bg-red-50 border-b border-red-200 px-6 py-4 rounded-t-xl"')
    .replace(/className="bg-green-50 border-b border-green-200 px-6 py-4"(?!\s+rounded)/g, 
             'className="bg-green-50 border-b border-green-200 px-6 py-4 rounded-t-xl"')
    // Update code examples
    .replace(/  <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-lg">/g, 
             '  <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">')
    .replace(/  <header className="bg-red-50 border-b border-red-200 px-6 py-4 rounded-t-lg">/g, 
             '  <header className="bg-red-50 border-b border-red-200 px-6 py-4 rounded-t-xl">')
    .replace(/  <header className="bg-green-50 border-b border-green-200 px-6 py-4 rounded-t-lg">/g, 
             '  <header className="bg-green-50 border-b border-green-200 px-6 py-4 rounded-t-xl">')
    .replace(/  <header className="bg-brown-50 border-b border-brown-200 px-6 py-4">/g, 
             '  <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">');

  // Write the updated content back to the file
  fs.writeFileSync(filePath, content);
  console.log('Successfully updated all card headers to use rounded-t-xl');
} catch (error) {
  console.error('Error updating file:', error);
}