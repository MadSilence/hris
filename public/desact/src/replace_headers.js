const fs = require('fs');

try {
  // Read the file
  const filePath = '/components/CardHeadersPage.tsx';
  const content = fs.readFileSync(filePath, 'utf8');

  // Replace all instances of the header class - including special status header cases
  let updatedContent = content
    .replace(
      /className="bg-brown-50 border-b border-brown-200 px-6 py-4"/g,
      'className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-lg"'
    )
    .replace(
      /className="bg-red-50 border-b border-red-200 px-6 py-4"/g,
      'className="bg-red-50 border-b border-red-200 px-6 py-4 rounded-t-lg"'
    )
    .replace(
      /className="bg-green-50 border-b border-green-200 px-6 py-4"/g,
      'className="bg-green-50 border-b border-green-200 px-6 py-4 rounded-t-lg"'
    );

  // Also update code examples to include rounded corners
  updatedContent = updatedContent
    .replace(
      /  <header className="bg-brown-50 border-b border-brown-200 px-6 py-4">/g,
      '  <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-lg">'
    )
    .replace(
      /  <header className="bg-red-50 border-b border-red-200 px-6 py-4">/g,
      '  <header className="bg-red-50 border-b border-red-200 px-6 py-4 rounded-t-lg">'
    )
    .replace(
      /  <header className="bg-green-50 border-b border-green-200 px-6 py-4">/g,
      '  <header className="bg-green-50 border-b border-green-200 px-6 py-4 rounded-t-lg">'
    );

  // Write the updated content back to the file
  fs.writeFileSync(filePath, updatedContent);

  console.log('Successfully updated header classes to include rounded-t-lg');
} catch (error) {
  console.error('Error updating file:', error);
}