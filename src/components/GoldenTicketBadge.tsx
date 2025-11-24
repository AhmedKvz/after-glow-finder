import { Ticket } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GoldenTicketBadgeProps {
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export const GoldenTicketBadge = ({ size = "md", showTooltip = true }: GoldenTicketBadgeProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const badge = (
    <div className="relative inline-flex items-center justify-center">
      <Ticket 
        className={`${sizeClasses[size]} text-yellow-400 fill-yellow-400/20 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]`}
        strokeWidth={2}
      />
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs font-medium">Golden Ticket – priority access & extra rewards</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
