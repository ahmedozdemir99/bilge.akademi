import { compile } from 'mathjs';

export const MATH_TOPICS = [
  'Çarpanlar ve Katlar (EBOB-EKOK)',
  'Üslü İfadeler',
  'Kareköklü İfadeler',
  'Cebirsel İfadeler ve Özdeşlikler',
  'Birinci Dereceden Denklemler',
  'Oran-Orantı ve Yüzdeler',
  'Üçgenler ve Pisagor',
  'Doğrusal İlişkiler ve Eğim',
  'Olasılık ve Veri Analizi',
  'Kesirler ve Tam Sayılar',
] as const;

export type MathTopic = (typeof MATH_TOPICS)[number];

export interface PlotPoint {
  x: number;
  y: number;
}

export interface LinearAnalysis {
  slope: number;
  yIntercept: number;
  xIntercept: number | null;
  angleDeg: number;
  slopeDirection: 'Pozitif Eğim (Sağa Yatık / Artan)' | 'Negatif Eğim (Sola Yatık / Azalan)' | 'Sıfır Eğim (x Eksenine Paralel)';
  passesOrigin: boolean;
  tablePoints: PlotPoint[];
  latex: string;
}

export function sampleLinearEquation(m: number, n: number, xMin = -8, xMax = 8, steps = 32): PlotPoint[] {
  const points: PlotPoint[] = [];
  const stepSize = (xMax - xMin) / steps;
  for (let i = 0; i <= steps; i += 1) {
    const x = Number((xMin + i * stepSize).toFixed(2));
    const y = Number((m * x + n).toFixed(2));
    points.push({ x, y });
  }
  return points;
}

export function analyzeLinear(m: number, n: number): LinearAnalysis {
  const xIntercept = m !== 0 ? Number((-n / m).toFixed(2)) : null;
  const angleDeg = Number(((Math.atan(m) * 180) / Math.PI).toFixed(1));
  const signN = n > 0 ? `+ ${n}` : n < 0 ? `- ${Math.abs(n)}` : '';
  const mPart = m === 0 ? '' : m === 1 ? 'x' : m === -1 ? '-x' : `${m}x`;
  const latex =
    m === 0
      ? `y = ${n}`
      : `y = ${mPart}${signN ? ` ${signN}` : ''}`.trim();

  const slopeDirection: LinearAnalysis['slopeDirection'] =
    m > 0
      ? 'Pozitif Eğim (Sağa Yatık / Artan)'
      : m < 0
        ? 'Negatif Eğim (Sola Yatık / Azalan)'
        : 'Sıfır Eğim (x Eksenine Paralel)';

  const tablePoints: PlotPoint[] = [-2, -1, 0, 1, 2].map((x) => ({
    x,
    y: Number((m * x + n).toFixed(2)),
  }));

  return {
    slope: m,
    yIntercept: n,
    xIntercept,
    angleDeg,
    slopeDirection,
    passesOrigin: n === 0,
    tablePoints,
    latex,
  };
}

export interface MathExerciseItem {
  topic: string;
  difficulty: 'kolay' | 'orta' | 'zor';
  questionText: string;
  expressionLatex: string;
  acceptedAnswers: string[];
  answerDisplayLatex: string;
  hints: string[];
  fullSolution: string;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export function generateDeterministicExercise(
  topic: string,
  difficulty: 'kolay' | 'orta' | 'zor'
): MathExerciseItem {
  const scale = difficulty === 'kolay' ? 1 : difficulty === 'orta' ? 2 : 3;

  if (topic === 'Çarpanlar ve Katlar (EBOB-EKOK)') {
    const base = randInt(3, 4 + 2 * scale);
    const m1 = randInt(2, 5);
    const m2 = m1 + 1;
    const n1 = base * m1;
    const n2 = base * m2;
    const askEbob = difficulty !== 'zor';
    const ebob = gcd(n1, n2);
    const ekok = (n1 * n2) / ebob;
    const ans = askEbob ? ebob : ekok;
    return {
      topic,
      difficulty,
      questionText: askEbob
        ? `${n1} ve ${n2} sayılarının En Büyük Ortak Böleni (EBOB) kaçtır?`
        : `${n1} ve ${n2} sayılarının En Küçük Ortak Katı (EKOK) kaçtır?`,
      expressionLatex: askEbob ? `\\text{EBOB}(${n1}, ${n2}) = ?` : `\\text{EKOK}(${n1}, ${n2}) = ?`,
      acceptedAnswers: [String(ans)],
      answerDisplayLatex: `${ans}`,
      hints: [
        `İki sayıyı da asal çarpanlarına ayırın (${n1} = ${base} × ${m1}, ${n2} = ${base} × ${m2}).`,
        `${m1} ve ${m2} ardışık doğal sayılar olduğu için aralarında asaldır.`,
        askEbob
          ? `Ortak çarpan doğrudan ${ebob} olur.`
          : `EKOK = (${n1} × ${n2}) / EBOB = ${n1 * n2} / ${ebob}.`,
      ],
      fullSolution: askEbob
        ? `${n1} = ${base}·${m1} ve ${n2} = ${base}·${m2} olduğundan EBOB(${n1}, ${n2}) = ${ebob}.`
        : `EBOB(${n1}, ${n2}) = ${ebob} olduğundan EKOK(${n1}, ${n2}) = (${n1} × ${n2}) / ${ebob} = ${ekok}.`,
    };
  }

  if (topic === 'Üslü İfadeler') {
    const base = randInt(2, 3);
    const p1 = randInt(2, 3 + scale);
    const p2 = randInt(1, 3);
    const p3 = randInt(1, Math.max(1, p1 + p2 - 2));
    const finalPow = p1 + p2 - p3;
    const ans = Math.pow(base, finalPow);
    return {
      topic,
      difficulty,
      questionText: 'Üslü ifadelerde çarpma ve bölme kurallarını kullanarak işlemin sonucunu bulunuz:',
      expressionLatex: `\\frac{${base}^{${p1}} \\cdot ${base}^{${p2}}}{${base}^{${p3}}} = ?`,
      acceptedAnswers: [String(ans), `${base}^${finalPow}`],
      answerDisplayLatex: `${base}^{${finalPow}} = ${ans}`,
      hints: [
        'Tabanları aynı üslü ifadeler çarpılırken üsler toplanır.',
        `Pay kısmı ${base}^(${p1} + ${p2}) = ${base}^${p1 + p2} olur.`,
        `Bölme işleminde payın üssünden paydanın üssü çıkarılır: ${base}^(${p1 + p2} - ${p3}) = ${base}^${finalPow}.`,
      ],
      fullSolution: `${base}^${p1} · ${base}^${p2} / ${base}^${p3} = ${base}^(${p1}+${p2}-${p3}) = ${base}^${finalPow} = ${ans}.`,
    };
  }

  if (topic === 'Kareköklü İfadeler') {
    const a = randInt(2, 3 + scale);
    const b = randInt(2, 4 + scale);
    const c = randInt(1, 3);
    const ans = a + b - c;
    return {
      topic,
      difficulty,
      questionText: 'Tam kare sayıların kareköklerini bularak işlemin sonucunu hesaplayınız:',
      expressionLatex: `\\sqrt{${a * a}} + \\sqrt{${b * b}} - \\sqrt{${c * c}} = ?`,
      acceptedAnswers: [String(ans)],
      answerDisplayLatex: `${ans}`,
      hints: [
        `Her köklü terimin hangi sayının karesi olduğunu düşünün: ${a * a} = ${a}².`,
        `√${a * a} = ${a}, √${b * b} = ${b} ve √${c * c} = ${c} olur.`,
        `Şimdi ${a} + ${b} - ${c} işlemini yapın.`,
      ],
      fullSolution: `√${a * a} + √${b * b} - √${c * c} = ${a} + ${b} - ${c} = ${ans}.`,
    };
  }

  if (topic === 'Cebirsel İfadeler ve Özdeşlikler') {
    const a = randInt(3, 5 + 2 * scale);
    const b = randInt(1, a - 1);
    const ans = (a - b) * (a + b);
    return {
      topic,
      difficulty,
      questionText: 'İki kare farkı özdeşliğini (a² - b² = (a - b)(a + b)) kullanarak işlemin sonucunu bulunuz:',
      expressionLatex: `${a}^2 - ${b}^2 = ?`,
      acceptedAnswers: [String(ans)],
      answerDisplayLatex: `${ans}`,
      hints: [
        'İki kare farkı özdeşliğini hatırlayın: a² - b² = (a - b) · (a + b).',
        `(${a} - ${b}) = ${a - b} ve (${a} + ${b}) = ${a + b} olur.`,
        `${a - b} × ${a + b} çarpımını hesaplayın.`,
      ],
      fullSolution: `${a}² - ${b}² = (${a} - ${b})(${a} + ${b}) = ${a - b} × ${a + b} = ${ans}.`,
    };
  }

  if (topic === 'Birinci Dereceden Denklemler' || topic === 'Denklem Çözme' || topic === 'Eşitsizlikler') {
    const xVal = randInt(2, 5 * scale);
    const a = randInt(2, 3 + scale);
    const b = randInt(3, 8 * scale);
    const rhs = a * xVal + b;
    return {
      topic,
      difficulty,
      questionText: 'Aşağıdaki birinci dereceden denklemi sağlayan x değerini bulunuz:',
      expressionLatex: `${a}x + ${b} = ${rhs}`,
      acceptedAnswers: [String(xVal)],
      answerDisplayLatex: `x = ${xVal}`,
      hints: [
        `Önce eşitliğin her iki tarafından ${b} sayısını çıkararak x’li terimi yalnız bırakın.`,
        `${a}x = ${rhs} - ${b} = ${rhs - b} elde edilir.`,
        `Son adımda ${rhs - b} sayısını ${a} katsayısına bölün.`,
      ],
      fullSolution: `${a}x + ${b} = ${rhs} ⇒ ${a}x = ${rhs - b} ⇒ x = ${rhs - b}/${a} = ${xVal}.`,
    };
  }

  if (topic === 'Oran-Orantı ve Yüzdeler') {
    const price = randInt(2, 5 * scale) * 20;
    const pct = [10, 15, 20, 25, 30][randInt(0, 4)];
    const discounted = price - (price * pct) / 100;
    return {
      topic,
      difficulty,
      questionText: `Etiket fiyatı ${price} TL olan bir kitap setine %${pct} indirim yapılıyor. İndirimli satış fiyatı kaç TL olur?`,
      expressionLatex: `${price} - ${price} \\cdot \\frac{${pct}}{100} = ?`,
      acceptedAnswers: [String(discounted)],
      answerDisplayLatex: `${discounted}\\text{ TL}`,
      hints: [
        `Önce ${price} TL’nin %${pct} kadarını (indirim tutarını) hesaplayın.`,
        `İndirim tutarı = (${price} × ${pct}) / 100 = ${(price * pct) / 100} TL’dir.`,
        `Etiket fiyatından indirimi çıkarın: ${price} - ${(price * pct) / 100}.`,
      ],
      fullSolution: `İndirim = ${price} × ${pct}/100 = ${(price * pct) / 100} TL. İndirimli fiyat = ${price} - ${(price * pct) / 100} = ${discounted} TL.`,
    };
  }

  if (topic === 'Üçgenler ve Pisagor' || topic === 'Geometri') {
    const triples = [
      [3, 4, 5],
      [6, 8, 10],
      [5, 12, 13],
      [8, 15, 17],
      [9, 12, 15],
    ];
    const [a, b, c] = triples[randInt(0, Math.min(triples.length - 1, scale + 1))];
    return {
      topic,
      difficulty,
      questionText: `Dik kenar uzunlukları ${a} cm ve ${b} cm olan bir dik üçgenin hipotenüs uzunluğu (c) kaç cm’dir?`,
      expressionLatex: `a = ${a}, \\quad b = ${b}, \\quad c = \\sqrt{a^2 + b^2} = ?`,
      acceptedAnswers: [String(c)],
      answerDisplayLatex: `c = ${c}\\text{ cm}`,
      hints: [
        'Pisagor bağıntısını yazın: a² + b² = c².',
        `${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c} olur.`,
        `Karesi ${c * c} olan pozitif tam sayıyı (√${c * c}) bulun.`,
      ],
      fullSolution: `c² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c} ⇒ c = √${c * c} = ${c} cm.`,
    };
  }

  if (topic === 'Doğrusal İlişkiler ve Eğim') {
    const m = randInt(2, 4 + scale);
    const n = randInt(1, 7);
    const x0 = randInt(2, 5);
    const y0 = m * x0 + n;
    return {
      topic,
      difficulty,
      questionText: `y = ${m}x + ${n} doğrusal denkleminde x = ${x0} için y değeri kaç olur?`,
      expressionLatex: `y = ${m}x + ${n}, \\quad x = ${x0} \\Rightarrow y = ?`,
      acceptedAnswers: [String(y0)],
      answerDisplayLatex: `y = ${y0}`,
      hints: [
        `Denklemde x yerine ${x0} yazın.`,
        `Önce çarpma işlemini yapın: ${m} × ${x0} = ${m * x0}.`,
        `Bulduğunuz sonuca ${n} ekleyin.`,
      ],
      fullSolution: `y = ${m}·(${x0}) + ${n} = ${m * x0} + ${n} = ${y0}.`,
    };
  }

  if (topic === 'Olasılık ve Veri Analizi') {
    const red = randInt(2, 4 + scale);
    const blue = randInt(2, 4 + scale);
    const total = red + blue;
    const g = gcd(red, total);
    const simNum = red / g;
    const simDen = total / g;
    return {
      topic,
      difficulty,
      questionText: `Bir torbada eş büyüklükte ${red} kırmızı ve ${blue} mavi top vardır. Rastgele çekilen bir topun kırmızı olma olasılığı nedir? (Kesir olarak yazabilirsiniz, ör. ${simNum}/${simDen})`,
      expressionLatex: `P(\\text{Kırmızı}) = \\frac{${red}}{${red} + ${blue}} = ?`,
      acceptedAnswers: [`${red}/${total}`, `${simNum}/${simDen}`, String(Number((red / total).toFixed(4)))],
      answerDisplayLatex: `\\frac{${simNum}}{${simDen}}`,
      hints: [
        'Olasılık = (İstenen durumların sayısı) / (Tüm olası durumların sayısı).',
        `Torbada toplam ${red} + ${blue} = ${total} top vardır.`,
        `Kırmızı top sayısı ${red} olduğundan olasılık ${red}/${total} olur.`,
      ],
      fullSolution: `P(Kırmızı) = ${red} / (${red} + ${blue}) = ${red}/${total} = ${simNum}/${simDen}.`,
    };
  }

  // General arithmetic / fractions / integers fallback
  const a = randInt(2, 5 * scale);
  const b = randInt(3, 6 * scale);
  const c = randInt(2, 4 * scale);
  const ans = a * b + c;
  return {
    topic,
    difficulty,
    questionText: 'İşlem önceliğine dikkat ederek aşağıdaki ifadenin sonucunu bulunuz:',
    expressionLatex: `${a} \\times ${b} + ${c}`,
    acceptedAnswers: [String(ans)],
    answerDisplayLatex: `${ans}`,
    hints: [
      'İşlem önceliğine göre önce çarpma işlemi yapılır.',
      `${a} × ${b} = ${a * b} sonucunu bulun.`,
      `Bulduğunuz ${a * b} değerine ${c} ekleyin.`,
    ],
    fullSolution: `${a} × ${b} + ${c} = ${a * b} + ${c} = ${ans}.`,
  };
}

export function checkMathAnswer(userInput: string, acceptedAnswers: string[]): boolean {
  const norm = userInput.trim().toLowerCase().replace(/\s+/g, '').replace(/,/g, '.');
  if (!norm) return false;

  for (const acc of acceptedAnswers) {
    const accNorm = acc.trim().toLowerCase().replace(/\s+/g, '').replace(/,/g, '.');
    if (norm === accNorm) return true;
    try {
      const userCompiled = compile(norm);
      const accCompiled = compile(accNorm);
      try {
        const userNum = Number(userCompiled.evaluate());
        const accNum = Number(accCompiled.evaluate());
        if (Number.isFinite(userNum) && Number.isFinite(accNum) && Math.abs(userNum - accNum) < 1e-4) {
          return true;
        }
      } catch {
        // Test algebraic equivalence in x at 3 non-trivial points
        const testXs = [-1.3, 0.7, 2.9];
        const allMatch = testXs.every((x) => {
          const u = Number(userCompiled.evaluate({ x }));
          const a = Number(accCompiled.evaluate({ x }));
          return Number.isFinite(u) && Number.isFinite(a) && Math.abs(u - a) < 1e-4;
        });
        if (allMatch) return true;
      }
    } catch {
      // Non-numeric comparison already checked
    }
  }
  return false;
}
