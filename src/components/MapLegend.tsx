'use client';

import { statusColors, statusLabels, LegalStatus } from '@/data/thca-legality';

export default function MapLegend() {
  const legendItems: LegalStatus[] = [
    'legal',
    'legal-mmj',
    'legal-gray',
    'legal-restricted',
    'gray-area',
    'illegal',
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Key</h3>
      <div className="space-y-3">
        {legendItems.map((status) => (
          <div key={status} className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded-md flex-shrink-0 border border-gray-200"
              style={{ backgroundColor: statusColors[status] }}
            />
            <span className="text-sm text-gray-700">{statusLabels[status]}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Statistics</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>24 Legal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>7 MMJ Only</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span>9 Gray Area</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>5 Illegal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
