import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';

const FMS_ITEMS = [
  'FMS - SMARCREEN 9" o 12"',
  'FMS - CORE LP - HP WW',
  'FMS - GPS OMNISTAR (G3) ANT + BRACKET',
  'FMS - CABLE DISPLAY ETHERNET M12M124D-5',
  'FMS - CABLE DISPLAY ETHERNET M12RJ45',
  'FMS - CABLE DISPLAY POWER',
  'FMS - CABLE CORE POWER',
  'FMS - BRACKET SMARTSCREEN',
  'FMS - BRACKET CORE',
  'FMS - BRACKET ANTENA GPS',
  'FMS - CONECTOR TNC',
  'FMS - C.A - PLM - INTEGRACION - ENCODER',
];

const CAS_ITEMS = [
  'CAS - MASTIL',
  'CAS - QC1000 RB HxGN',
  'CAS - QD1400 HxGN MineDiscover',
  'CAS - QL1210 Mag Antenna',
  'CAS - QM1105 Cable Smart Antenna',
  'CAS - QM1106 Cable Smart Antenna',
  'CAS - QM1110 Junction Harness',
  'CAS - QL1220 RC L-Bracket, Smart',
  'CAS - QL1421 RAM mount, base Plate diamond',
  'CAS - QL1422 RAM mount, Arm',
  'CAS - QL1423 RAM mount, base plate round',
];

const ALL_ITEMS = [...FMS_ITEMS, ...CAS_ITEMS];

export { ALL_ITEMS };

export default function ComponentChecklist({ values = {}, onChange, readOnly = false }) {
  const toggle = (item) => {
    if (readOnly) return;
    onChange({ ...values, [item]: !values[item] });
  };

  return (
    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
      {ALL_ITEMS.map((item) => {
        const checked = !!values[item];
        return (
          <div
            key={item}
            onClick={() => toggle(item)}
            className={`flex items-center justify-between px-4 py-2.5 text-sm ${readOnly ? '' : 'cursor-pointer hover:bg-slate-50'}`}
          >
            <span className="text-slate-700 font-medium">{item}</span>
            {readOnly ? (
              checked
                ? <Badge className="bg-green-100 text-green-700">Yes</Badge>
                : <Badge className="bg-red-100 text-red-700">No</Badge>
            ) : (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggle(item); }}
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                  checked ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {checked ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {checked ? 'Yes' : 'No'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}