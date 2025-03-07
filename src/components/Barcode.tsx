
import { generateBarcode } from "@/services/barcodeService";
import { useEffect, useState } from "react";

interface BarcodeProps {
  value: string;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

const Barcode = ({ value, size = 'md', showValue = true }: BarcodeProps) => {
  const [barcodeUrl, setBarcodeUrl] = useState<string>('');
  
  useEffect(() => {
    setBarcodeUrl(generateBarcode(value));
  }, [value]);
  
  const sizeClasses = {
    sm: 'w-32',
    md: 'w-48',
    lg: 'w-64'
  };
  
  return (
    <div className="flex flex-col items-center">
      {barcodeUrl && (
        <img 
          src={barcodeUrl} 
          alt={`Barcode: ${value}`} 
          className={`${sizeClasses[size]} h-auto`} 
        />
      )}
      {showValue && <span className="text-xs mt-1">{value}</span>}
    </div>
  );
};

export default Barcode;
