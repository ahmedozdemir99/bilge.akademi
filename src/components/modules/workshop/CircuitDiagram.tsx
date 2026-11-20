import { useEffect, useRef } from 'react';

export function CircuitDiagram({ parallel, closed }: { parallel: boolean; closed: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const left = 34;
    const right = 394;
    const top = 39;
    const bottom = 156;
    const battery = 214;
    const bulbA = 203;
    const bulbB = 308;
    const middle = 96;
    ctx.clearRect(0, 0, 428, 184);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.font = '15px system-ui, sans-serif';
    ctx.textAlign = 'center';

    function path(points: [number, number][], color = '#475569') {
      if (!ctx) return;
      ctx.beginPath();
      ctx.strokeStyle = color;
      points.forEach(([x, y], index) => index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
      ctx.stroke();
    }

    function lamp(x: number, y: number, label: string, on: boolean) {
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(x, y, 13, 0, Math.PI * 2);
      ctx.fillStyle = on ? '#fde68a' : '#f1f5f9';
      ctx.fill();
      ctx.strokeStyle = on ? '#b45309' : '#475569';
      ctx.stroke();
      path([[x - 8, y - 8], [x + 8, y + 8]]);
      path([[x - 8, y + 8], [x + 8, y - 8]]);
      ctx.fillStyle = '#0f172a';
      ctx.fillText(label, x, y - 18);
    }

    path([[left, top], [left, bottom], [battery - 6, bottom]]);
    path([[battery + 6, bottom], [right, bottom], [right, top]]);
    path([[battery - 6, bottom - 12], [battery - 6, bottom + 12]]);
    path([[battery + 6, bottom - 7], [battery + 6, bottom + 7]]);
    ctx.fillStyle = '#0f172a';
    ctx.fillText('Pil', battery, bottom + 25);
    path([[left, top], [93, top]]);
    path([[93, top], [128, closed ? top : top - 18]], '#0f766e');
    path([[128, top], [bulbA - 13, top]]);
    lamp(bulbA, top, 'A', closed);
    if (parallel) {
      path([[bulbA + 13, top], [right, top]]);
      path([[left, middle], [bulbA - 13, middle]]);
      lamp(bulbA, middle, 'B', true);
      path([[bulbA + 13, middle], [right, middle]]);
    } else {
      path([[bulbA + 13, top], [bulbB - 13, top]]);
      lamp(bulbB, top, 'B', closed);
      path([[bulbB + 13, top], [right, top]]);
    }
  }, [parallel, closed]);

  return <canvas ref={canvasRef} width={428} height={184} aria-hidden="true" className="h-auto w-full max-w-lg rounded-lg bg-white" />;
}
