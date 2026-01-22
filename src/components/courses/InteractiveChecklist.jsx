import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { awardPoints, POINTS } from '../gamification/gamificationHelpers';

export default function InteractiveChecklist({ title, checks, user, onAllComplete }) {
  const [selectedItems, setSelectedItems] = useState({});

  const handleSelect = async (index, value) => {
    setSelectedItems(prev => ({
      ...prev,
      [index]: value
    }));
    
    await awardPoints(user.email, POINTS.CHECK_COMPLETE, 'Check completado');

    // Check if all completed
    const allCompleted = checks.every((_, i) => selectedItems[i] !== undefined || (i === index && value !== undefined));
    if (allCompleted && Object.keys(selectedItems).length + 1 === checks.length) {
      onAllComplete?.();
    }
  };

  const completedCount = Object.keys(selectedItems).length;
  const progress = (completedCount / checks.length) * 100;
  const allComplete = completedCount === checks.length;

  return (
    <Card className={cn(
      "border-2 transition-all",
      allComplete ? "border-green-200 bg-green-50" : "border-slate-200"
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5 text-indigo-600" />
            {title || 'Lista de verificación'}
          </CardTitle>
          <Badge variant={allComplete ? "default" : "outline"}>
            {completedCount}/{checks.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2 mt-3" />
      </CardHeader>
      <CardContent className="space-y-3">
        {checks.map((check, index) => {
          const isCompleted = selectedItems[index] !== undefined;
          const selectedValue = selectedItems[index];
          const hasOptions = check.options && check.options.length > 0;

          return (
            <div
              key={index}
              className={cn(
                "p-3 rounded-lg border-2 transition-all",
                isCompleted 
                  ? "border-green-500 bg-green-50" 
                  : "border-slate-200"
              )}
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="shrink-0 mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "font-medium",
                    isCompleted ? "text-green-900" : "text-slate-900"
                  )}>
                    {check.text}
                  </p>
                  {check.description && (
                    <p className="text-sm text-slate-600 mt-1">{check.description}</p>
                  )}
                </div>
              </div>

              {/* Single choice buttons */}
              {hasOptions && (
                <div className="flex flex-wrap gap-2 ml-8">
                  {check.options.map((option, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(index, option)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border-2",
                        selectedValue === option
                          ? "border-green-500 bg-green-100 text-green-700"
                          : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:bg-indigo-50"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {allComplete && (
          <div className="pt-4 text-center">
            <p className="text-green-700 font-medium flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              ¡Todos los checks completados!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}