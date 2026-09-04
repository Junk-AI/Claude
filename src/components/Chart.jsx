import React, { useId } from 'react';

// A plain SVG line chart. Segments that bridge years the source did not supply
// are drawn dashed and called out beneath the chart, so a student is never
// asked to read a value that was invented to fill a gap.

const PALETTE = ['var(--accent-deep)', '#B08968'];

export default function Chart({ dataset, height = 260 }) {
  const uid = useId();
  const W = 620;
  const H = height;
  const pad = { top: 18, right: 18, bottom: 42, left: 62 };

  const allPoints = dataset.series.flatMap((s) => s.points);
  const xs = [...new Set(allPoints.map((p) => p.x))].sort((a, b) => a - b);
  const ys = allPoints.map((p) => p.y).filter((y) => y !== null && y !== undefined);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  // Round the axis outwards to a readable step so ticks read 1000, 2000, 3000
  // rather than 1418, 2178, 2938.
  const span = yMax - yMin || 1;
  const rawStep = (span * 1.28) / 4;
  const mag = 10 ** Math.floor(Math.log10(rawStep || 1));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((c) => c >= rawStep) || mag * 10;
  const lo = Math.max(0, Math.floor((yMin - span * 0.14) / step) * step);
  const hi = Math.ceil((yMax + span * 0.14) / step) * step;

  const px = (x) => pad.left + ((x - xs[0]) / (xs[xs.length - 1] - xs[0] || 1)) * (W - pad.left - pad.right);
  const py = (y) => H - pad.bottom - ((y - lo) / (hi - lo || 1)) * (H - pad.top - pad.bottom);

  const yTicks = [];
  for (let v = lo; v <= hi + step / 2; v += step) yTicks.push(Number(v.toFixed(6)));
  const fmt = (v) => {
    if (v >= 10000) return v.toLocaleString('en-SG');
    if (step < 1) return v.toFixed(1);
    return Math.round(v).toString();
  };

  // Label at most 8 x values so a wide series stays readable on a phone.
  const xStride = Math.ceil(xs.length / 8);
  const xLabels = xs.filter((_, i) => i % xStride === 0 || i === xs.length - 1);

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 400, display: 'block' }}
           role="img" aria-labelledby={`${uid}-title`}>
        <title id={`${uid}-title`}>{dataset.title}</title>

        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={pad.left} x2={W - pad.right} y1={py(t)} y2={py(t)}
                  stroke="var(--line)" strokeWidth="1" />
            <text x={pad.left - 9} y={py(t) + 4} textAnchor="end"
                  fontSize="10.5" fill="var(--ink-3)">{fmt(t)}</text>
          </g>
        ))}

        {xLabels.map((x) => (
          <text key={x} x={px(x)} y={H - pad.bottom + 17} textAnchor="middle"
                fontSize="10.5" fill="var(--ink-3)">{x}</text>
        ))}

        <text x={pad.left - 46} y={pad.top - 4} fontSize="10" fill="var(--ink-3)">{dataset.yLabel}</text>
        <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--ink-3)">{dataset.xLabel}</text>

        {dataset.series.map((s, si) => {
          const colour = PALETTE[si % PALETTE.length];
          const known = s.points.filter((p) => p.y !== null && p.y !== undefined);
          const segs = [];
          for (let i = 0; i < known.length - 1; i++) {
            const a = known[i];
            const b = known[i + 1];
            const bridged = s.points.indexOf(b) - s.points.indexOf(a) > 1;
            segs.push({ a, b, bridged });
          }
          return (
            <g key={s.name}>
              {segs.map(({ a, b, bridged }, i) => (
                <line key={i} x1={px(a.x)} y1={py(a.y)} x2={px(b.x)} y2={py(b.y)}
                      stroke={colour} strokeWidth="2" strokeLinecap="round"
                      strokeDasharray={bridged ? '5 4' : undefined}
                      opacity={bridged ? 0.45 : 0.9} />
              ))}
              {known.map((p) => (
                <g key={p.x}>
                  <circle cx={px(p.x)} cy={py(p.y)} r={p.projected ? 3.4 : 3.8}
                          fill={p.projected ? 'var(--surface)' : colour}
                          stroke={colour} strokeWidth="1.8" />
                  <title>{`${s.name} ${p.x}: ${p.y}${dataset.unit === '%' ? '%' : ''}${p.approx ? ' (approx.)' : ''}${p.projected ? ' (projected)' : ''}`}</title>
                </g>
              ))}
            </g>
          );
        })}

        {dataset.series.length > 1 && (
          <g>
            {dataset.series.map((s, i) => (
              <g key={s.name} transform={`translate(${pad.left + i * 96}, ${pad.top - 4})`}>
                <rect width="10" height="3" y="-3" rx="1.5" fill={PALETTE[i % PALETTE.length]} />
                <text x="15" y="1" fontSize="10.5" fill="var(--ink-2)">{s.name}</text>
              </g>
            ))}
          </g>
        )}
      </svg>

      <p className="chart-note">
        {dataset.source}
        {dataset.missingNote ? ` Dashed line: ${dataset.missingNote.replace(/^The source /, 'the source ')}` : ''}
        {dataset.projectedFrom ? ` Hollow points from ${dataset.projectedFrom} are projections.` : ''}
      </p>
    </div>
  );
}
