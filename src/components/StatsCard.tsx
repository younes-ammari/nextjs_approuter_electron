
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatsCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  className 
}: StatsCardProps) => {
  return (
    <div className={cn(
      "stat-card bg-card text-card-foreground",
      className
    )}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          
          {trend && (
            <div className="flex items-center mt-1">
              <span className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-500" : "text-red-500"
              )}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last period</span>
            </div>
          )}
          
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        
        {icon && (
          <div className="bg-primary/10 p-2 rounded-full">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
