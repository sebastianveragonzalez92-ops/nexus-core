import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { awardPoints, POINTS } from '../gamification/gamificationHelpers';

export default function InteractiveChecklist({ title, checks, user, onAllComplete }) {
  const [checkedItems, setCheckedItems] = useState(new Set());

  const handleCheck = async (index) => {
    if (checkedItems.has(index)) {
      setCheckedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    } else {
      setCheckedItems(prev => new Set([...prev, index]));
      await awardPoints(user.email, POINTS.CHECK_COMPLETE, 'Check completado');

      // Check if all completed
      if (checkedItems.size + 1 === checks.length) {
        onAllComplete?.();
      }
    }
  };

  const progress = (checkedItems.size / checks.length) * 100;
  const allComplete = checkedItems.size === checks.length;

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
            {checkedItems.size}/{checks.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2 mt-3" />
      </CardHeader>
      <CardContent className="space-y-2">
        {checks.map((check, index) => {
          const isChecked = checkedItems.has(index);
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
                  {check.text}
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