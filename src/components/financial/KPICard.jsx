import React from 'react';
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const KPICard = ({
    title,
    value,
    valueFull,
    change,
    trend, // "up" | "down" | "neutral"
    icon: Icon,
    description,
    compareValue
}) => {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-2.5 sm:p-4">
                <div className="flex items-start justify-between gap-1.5">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
                        <p className="text-base sm:text-2xl font-bold text-foreground mt-0.5 truncate" title={valueFull}>
                            {value}
                        </p>
                        {compareValue && (
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-sm rounded-md bg-violet-50 px-2 py-0.5 font-semibold text-violet-700">
                                    vs {compareValue}
                                </span>
                            </div>
                        )}
                    </div>
                    {Icon && (
                        <div className="flex h-6 w-6 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        </div>
                    )}
                </div>
                <div className="mt-2 text-xs text-slate-500 font-medium">{description}</div>
            </CardContent>
        </Card>
    );
};

export default KPICard;
