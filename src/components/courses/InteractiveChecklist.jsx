import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { awardPoints, POINTS } from '../gamification/gamificationHelpers';

export default function InteractiveChecklist({ title, checks, user, onAllComplete }) {
  const [selectedItems, setSelectedItems] = useState({});

  const handleCheck = async (index) => {
    const isCurrentlyChecked = selectedItems[index];
    
    if (isCurrentlyChecked) {
      setSelectedItems(prev => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
    } else {
      setSelectedItems(prev => ({
        ...prev,
        [index]: true
      }));
      
      await awardPoints(user.email, POINTS.CHECK_COMPLETE, 'Check completado');

      // Check if all completed after setting this one
      if (Object.keys(selectedItems).length + 1 === checks.length) {
        onAllComplete?.();
      }
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
      <CardContent className="space-y-2">
        {checks.map((check, index) => {
          const isChecked = selectedItems[index];
          const checkText = typeof check === 'string' ? check : (check.text || check.question || check);

          return (
            <button
              key={index}
              onClick={() => handleCheck(index)}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left",
                isChecked 
                  ? "border-green-500 bg-green-50" 
                  : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
              )}
            >
              <div className="shrink-0 mt-0.5">
                {isChecked ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <p className={cn(
                  "font-medium",
                  isChecked ? "text-green-900 line-through" : "text-slate-900"
                )}>
                  {checkText}
                </p>
                {check.description && (
                  <p className="text-sm text-slate-600 mt-1">{check.description}</p>
                )}
              </div>
            </button>
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