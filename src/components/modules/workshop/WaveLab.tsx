import { useEffect, useRef, useState } from 'react';
import { Feedback, primaryButton, RangeField, secondaryButton, type LabCallbacks } from './workshopControls';

function WaveCanvas({ amplitude, cycles, playing }: { amplitude: number; cycles: number; playing: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phase = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { width, height } = canvas;
    const center = height / 2;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frameId = 0;
    let previousTime = 0;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = '#99c5c5';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let column = 0; column <= width; column += 40) {
        ctx.moveTo(column, 0);
        ctx.lineTo(column, height);
      }
      for (let row = 0; row <= height; row += 18) {
        ctx.moveTo(0, row);
        ctx.lineTo(width, row);
      }
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, center);
      ctx.lineTo(width, center);
      ctx.strokeStyle = '#536d79';
      ctx.stroke();

      ctx.beginPath();
      for (let x = 0; x <= width; x += 2) {
        const y = center - amplitude * 13 * Math.sin(x / width * Math.PI * 2 * cycles - phase.current);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#0f766e';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    function animate(time: number) {
      if (previousTime) phase.current = (phase.current + Math.min(time - previousTime, 50) * 0.002) % (2 * Math.PI);
      previousTime = time;
      draw();
      frameId = requestAnimationFrame(animate);
    }

    function update() {
      cancelAnimationFrame(frameId);
      previousTime = 0;
      draw();
      if (playing && !reducedMotion.matches) frameId = requestAnimationFrame(animate);
    }

    update();
    reducedMotion.addEventListener('change', update);
    return () => {
      cancelAnimationFrame(frameId);
      reducedMotion.removeEventListener('change', update);
    };
  }, [amplitude, cycles, playing]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={180}
      role="img"
      aria-label={`Dalga grafiği. Genlik ${amplitude} birim, ekranda ${cycles} tam dalga.`}
      className="aspect-[32/9] h-auto w-full rounded-xl bg-teal-50"
    />
  );
}

export function WaveLab({ onComplete, onMistake }: LabCallbacks) {
  const [amplitude, setAmplitude] = useState(2);
  const [cycles, setCycles] = useState(2);
  const [playing, setPlaying] = useState(false);
  const [choice, setChoice] = useState<'closer' | 'farther' | null>(null);

  return (
    <>
      <WaveCanvas amplitude={amplitude} cycles={cycles} playing={playing} />
      <div className="grid gap-4 sm:grid-cols-2">
        <RangeField label="Genlik (birim)" value={amplitude} min={1} max={5} onChange={(value) => { setAmplitude(value); setChoice(null); }} />
        <RangeField label="Ekrandaki tam dalga sayısı" value={cycles} min={1} max={5} onChange={(value) => { setCycles(value); setChoice(null); }} />
      </div>
      <div>
        <button type="button" className={primaryButton} onClick={() => setPlaying(!playing)}>
          {playing ? 'Hareketi durdur' : 'Dalgayı oynat'}
        </button>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Genlik, denge çizgisi ile tepe arasındaki uzaklıktır. Dalga boyu, iki komşu tepe arasındaki uzaklıktır.</p>
        {playing && <p className="mt-1 hidden text-sm text-slate-600 motion-reduce:block dark:text-slate-300">Hareket azaltma ayarı nedeniyle grafik sabit gösteriliyor. Sürgülerle grafiği değiştirebilirsin.</p>}
      </div>
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Aynı genişliğe daha çok dalga sığarsa tepeler arasındaki mesafe nasıl değişir?</legend>
        <div className="control-grid gap-2">
          <button type="button" aria-pressed={choice === 'closer'} className={secondaryButton} onClick={() => {
            setChoice('closer');
            onComplete();
          }}>Azalır</button>
          <button type="button" aria-pressed={choice === 'farther'} className={secondaryButton} onClick={() => {
            if (choice !== 'farther') onMistake();
            setChoice('farther');
          }}>Artar</button>
        </div>
      </fieldset>
      {choice && <Feedback correct={choice === 'closer'}>{choice === 'closer'
        ? 'Doğru. Aynı genişliğe daha çok dalga sığdığında dalga boyu kısalır.'
        : 'Sürgüyü 1’den 5’e çıkar ve komşu tepelerin birbirine uzaklığını karşılaştır.'}</Feedback>}
    </>
  );
}
