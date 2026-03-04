'use client';

import { StateData, statusColors, statusLabels } from '@/data/thca-legality';

interface StateInfoPanelProps {
  state: StateData | null;
}

export default function StateInfoPanel({ state }: StateInfoPanelProps) {
  if (!state) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 min-h-[200px] flex items-center justify-center">
        <p className="text-gray-400 text-center">
          Hover over a state to see<br />its THCa legal status
        </p>
      </div>
    );
  }

  const statusColor = statusColors[state.status];
  const statusLabel = statusLabels[state.status];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: statusColor }}
        />
        <h3 className="text-xl font-bold text-gray-900">{state.name}</h3>
      </div>

      <div
        className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-4"
        style={{
          backgroundColor: `${statusColor}20`,
          color: statusColor,
          border: `1px solid ${statusColor}40`
        }}
      >
        {statusLabel}
      </div>

      <p className="text-gray-600 text-sm leading-relaxed">
        {state.description}
      </p>
    </div>
  );
}
