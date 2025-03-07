
/**
 * A simple utility to generate and render barcodes
 */
export const generateBarcode = (value: string): string => {
  // In a real application, we would use a proper barcode generation library
  // For this demo, we'll create a simple representation
  const digits = value.toString().padStart(12, '0').slice(0, 12);
  
  // Generate SVG for the barcode
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80">
      <rect width="100%" height="100%" fill="white" />
      ${generateBarcodeLines(digits)}
      <text x="100" y="70" text-anchor="middle" font-family="Arial" font-size="12">${digits}</text>
    </svg>
  `;
  
  // Convert SVG to data URL
  return `data:image/svg+xml;base64,${btoa(svgString)}`;
};

// Helper function to generate the barcode lines
const generateBarcodeLines = (digits: string): string => {
  let svgContent = '';
  let position = 10;
  const height = 50;
  
  // For each digit, create some bars
  for (let i = 0; i < digits.length; i++) {
    const digit = parseInt(digits[i], 10);
    const barWidth = 2;
    const spaceWidth = 1;
    const barsPerDigit = digit + 1;
    
    for (let j = 0; j < barsPerDigit; j++) {
      svgContent += `<rect x="${position}" y="10" width="${barWidth}" height="${height}" fill="black" />`;
      position += barWidth + spaceWidth;
    }
    
    position += 3; // Space between digit groups
  }
  
  return svgContent;
};

// Print a barcode
export const printBarcode = (barcodeValue: string, productName: string): void => {
  const barcodeUrl = generateBarcode(barcodeValue);
  
  // Create a temporary div to hold the content to be printed
  const printDiv = document.createElement('div');
  printDiv.style.textAlign = 'center';
  printDiv.style.padding = '20px';
  
  printDiv.innerHTML = `
    <div style="font-family: Arial; margin-bottom: 5px; font-size: 12px;">${productName}</div>
    <img src="${barcodeUrl}" style="max-width: 100%; height: auto;" />
    <div style="font-family: Arial; margin-top: 5px; font-size: 12px;">${barcodeValue}</div>
  `;
  
  // Append to body temporarily
  document.body.appendChild(printDiv);
  
  // Print the div content
  window.print();
  
  // Remove the div after printing
  document.body.removeChild(printDiv);
};
