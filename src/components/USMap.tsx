'use client';

import { useState, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Annotation,
} from 'react-simple-maps';
import { stateData, statusColors, StateData } from '@/data/thca-legality';

// Official US Atlas TopoJSON - accurate boundaries
const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

// State FIPS codes to abbreviations
const fipsToAbbr: Record<string, string> = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA',
  '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL',
  '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN',
  '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME',
  '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS',
  '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
  '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
  '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
  '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT',
  '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI',
  '56': 'WY', '72': 'PR',
};

// Small state labels that need offset annotations
const smallStates = ['VT', 'NH', 'MA', 'RI', 'CT', 'NJ', 'DE', 'MD', 'DC'];

interface USMapProps {
  onStateHover?: (state: StateData | null) => void;
  onStateClick?: (state: StateData) => void;
}

const USMap = memo(function USMap({ onStateHover, onStateClick }: USMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (abbr: string, event: React.MouseEvent) => {
    setHoveredState(abbr);
    const rect = (event.target as Element).getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
    if (onStateHover && stateData[abbr]) {
      onStateHover(stateData[abbr]);
    }
  };

  const handleMouseLeave = () => {
    setHoveredState(null);
    if (onStateHover) {
      onStateHover(null);
    }
  };

  const handleClick = (abbr: string) => {
    if (onStateClick && stateData[abbr]) {
      onStateClick(stateData[abbr]);
    }
  };

  return (
    <div className="relative w-full" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Decorative grid overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Map container */}
      <div className="relative z-10">
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{
            scale: 1000,
          }}
          style={{
            width: '100%',
            height: 'auto',
          }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const fips = geo.id;
                const abbr = fipsToAbbr[fips];
                const state = abbr ? stateData[abbr] : null;
                const fillColor = state ? statusColors[state.status] : '#374151';
                const isHovered = hoveredState === abbr;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="#0f172a"
                    strokeWidth={isHovered ? 2 : 0.5}
                    style={{
                      default: {
                        outline: 'none',
                        transition: 'all 0.2s ease-out',
                        filter: isHovered ? 'brightness(1.2) drop-shadow(0 4px 8px rgba(0,0,0,0.4))' : 'none',
                        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                        transformOrigin: 'center',
                      },
                      hover: {
                        outline: 'none',
                        filter: 'brightness(1.2) drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
                        cursor: 'pointer',
                      },
                      pressed: {
                        outline: 'none',
                        filter: 'brightness(1.3)',
                      },
                    }}
                    onMouseEnter={(e) => abbr && handleMouseEnter(abbr, e)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => abbr && handleClick(abbr)}
                  />
                );
              })
            }
          </Geographies>

          {/* Small state annotations */}
          {[
            { abbr: 'VT', coords: [-72.5, 44], offset: [30, -10] },
            { abbr: 'NH', coords: [-71.5, 43.5], offset: [35, 0] },
            { abbr: 'MA', coords: [-71.8, 42.2], offset: [40, 0] },
            { abbr: 'RI', coords: [-71.5, 41.7], offset: [35, 8] },
            { abbr: 'CT', coords: [-72.7, 41.5], offset: [30, 15] },
            { abbr: 'NJ', coords: [-74.5, 40.2], offset: [30, 5] },
            { abbr: 'DE', coords: [-75.5, 39], offset: [28, 0] },
            { abbr: 'MD', coords: [-76.6, 39], offset: [35, 15] },
          ].map(({ abbr, coords, offset }) => {
            const state = stateData[abbr];
            if (!state) return null;
            return (
              <Annotation
                key={abbr}
                subject={coords as [number, number]}
                dx={offset[0]}
                dy={offset[1]}
                connectorProps={{
                  stroke: 'rgba(255,255,255,0.4)',
                  strokeWidth: 1,
                  strokeLinecap: 'round',
                }}
              >
                <text
                  x={4}
                  textAnchor="start"
                  alignmentBaseline="middle"
                  style={{
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: 10,
                    fontWeight: 600,
                    fill: statusColors[state.status],
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  }}
                >
                  {abbr}
                </text>
              </Annotation>
            );
          })}
        </ComposableMap>
      </div>

      {/* Floating tooltip */}
      {hoveredState && stateData[hoveredState] && (
        <div
          className="fixed z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y - 10,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="relative">
            {/* Tooltip card */}
            <div
              className="px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md min-w-[200px]"
              style={{
                background: 'rgba(15, 23, 42, 0.95)',
                borderColor: statusColors[stateData[hoveredState].status],
                boxShadow: `0 8px 32px ${statusColors[stateData[hoveredState].status]}40`,
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-4 h-4 rounded-full ring-2 ring-white/20"
                  style={{ backgroundColor: statusColors[stateData[hoveredState].status] }}
                />
                <span className="font-bold text-white text-lg tracking-tight">
                  {stateData[hoveredState].name}
                </span>
              </div>
              <div
                className="text-xs font-semibold uppercase tracking-widest mb-2 px-2 py-1 rounded-full inline-block"
                style={{
                  backgroundColor: `${statusColors[stateData[hoveredState].status]}20`,
                  color: statusColors[stateData[hoveredState].status],
                }}
              >
                {stateData[hoveredState].status.replace('-', ' ')}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">
                {stateData[hoveredState].description.substring(0, 100)}...
              </p>
            </div>
            {/* Tooltip arrow */}
            <div
              className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 rotate-45"
              style={{
                background: 'rgba(15, 23, 42, 0.95)',
                borderRight: `1px solid ${statusColors[stateData[hoveredState].status]}`,
                borderBottom: `1px solid ${statusColors[stateData[hoveredState].status]}`,
              }}
            />
          </div>
        </div>
      )}

      {/* Glow effect at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(16, 185, 129, 0.1), transparent)',
        }}
      />
    </div>
  );
});

export default USMap;
