
import { Product } from "@/context/InventoryContext";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Tag } from "lucide-react";
import { printBarcode } from "@/services/barcodeService";
import { formatCurrency } from "@/services/inventoryService";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
  const handlePrintBarcode = () => {
    printBarcode(product.barcode, product.name);
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-lg">{product.name}</h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              product.stock > 10 
                ? 'bg-green-100 text-green-800' 
                : product.stock > 0 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-red-100 text-red-800'
            }`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
          
          <div className="mt-2 space-y-1">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Brand:</span> {product.brand}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Model:</span> {product.model}
            </p>
            {product.storage && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Storage:</span> {product.storage}
              </p>
            )}
            {product.color && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Color:</span> {product.color}
              </p>
            )}
            <div className="flex justify-between mt-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Cost:</span> {formatCurrency(product.purchasePrice)}
              </p>
              <p className="text-sm font-semibold text-primary">
                {formatCurrency(product.sellingPrice)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-0 border-t">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={handlePrintBarcode}
        >
          <Tag className="h-3.5 w-3.5 mr-1" />
          Barcode
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={() => onEdit(product)}
          >
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-destructive hover:text-destructive/90 hover:bg-destructive/10"
            onClick={() => onDelete(product.id)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
