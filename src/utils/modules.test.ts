import assert from 'node:assert/strict';
import {
  analyzePoemAlgorithmically,
  countTurkishSyllables,
} from './poetryUtils.ts';
import {
  analyzeLinear,
  checkMathAnswer,
  generateDeterministicExercise,
  MATH_TOPICS,
  sampleLinearEquation,
} from './mathEngine.ts';
import {
  getQariAudioUrl,
  QARI_OPTIONS,
  SURAH_DUA_LIBRARY,
} from '../data/religionRichData.ts';

import { MATH_TEST_PACKS } from '../data/tests/mathTestsData.ts';
import { LITERATURE_TEST_PACKS } from '../data/tests/literatureTestsData.ts';
import { HISTORY_TEST_PACKS } from '../data/tests/historyTestsData.ts';
import { PHILOSOPHY_TEST_PACKS } from '../data/tests/philosophyTestsData.ts';
import { SCIENCE_TEST_PACKS } from '../data/tests/scienceTestsData.ts';
import { ENGLISH_TEST_PACKS } from '../data/tests/englishTestsData.ts';
import { RELIGION_TEST_PACKS } from '../data/tests/religionTestsData.ts';

function runModuleTests() {
  // 1. Turkish syllable counting (including Turkish dotted/dotless vowels)
  assert.equal(countTurkishSyllables('İlim ilim bilmektir'), 7);
  assert.equal(countTurkishSyllables('Sessiz gemi kalkar bu limandan'), 10);
  assert.equal(countTurkishSyllables('Çiçekler açtı bahçede'), 8);
  assert.equal(countTurkishSyllables(''), 0);

  // 2. Algorithmic poem analysis (meter consistency + rhyme detection + uncertainty notice)
  const quatrain = [
    'Güneş doğar dağların ardında',
    'Rüzgâr eser serin bir ormanda',
    'Umut büyür gönlün her anında',
    'Bahar gelir açar tüm cihanda',
  ].join('\n');
  const analysis = analyzePoemAlgorithmically(quatrain);
  assert.equal(analysis.lineCount, 4);
  assert.equal(analysis.stanzaCount, 1);
  assert.equal(analysis.rhymeScheme.length, 4);
  assert.ok(analysis.rhymeScheme.startsWith('a'), 'Rhyme scheme should start with a');
  assert.ok(
    analysis.warnings.some((w) => w.toLocaleLowerCase('tr-TR').includes('algoritmik')),
    'Should include an algorithmic uncertainty notice'
  );

  // 3. Deterministic middle-school linear equation sampler: y = 2x - 4
  const sampledLinear = sampleLinearEquation(2, -4, -2, 2, 4);
  assert.equal(sampledLinear.length, 5);
  assert.equal(sampledLinear[0].y, -8); // 2(-2) - 4 = -8
  assert.equal(sampledLinear[2].y, -4); // 2(0) - 4 = -4
  assert.equal(sampledLinear[4].y, 0); // 2(2) - 4 = 0

  // 4. Qari audio & Arabic metadata verification for Din Kültürü Surahs & Duas
  assert.equal(QARI_OPTIONS.length, 4);
  assert.ok(SURAH_DUA_LIBRARY.length >= 11, 'En az 11 sure/ayet/dua kaydı olmalıdır');
  for (const entry of SURAH_DUA_LIBRARY) {
    assert.ok(
      Boolean(entry.quranApiRef || entry.staticArabicText),
      `${entry.title} için Arapça metin kaynağı tanımlı olmalıdır`
    );
    if (entry.audioType === 'surah' || entry.audioType === 'ayah') {
      for (const qari of QARI_OPTIONS) {
        const url = getQariAudioUrl(entry, qari.id);
        assert.ok(url && url.endsWith('.mp3'), `${entry.title} / ${qari.name} geçerli MP3 URL döndürmelidir`);
      }
    }
  }

  // 5. Linear analyzer: y = 2x - 6 -> slope 2, yIntercept -6, xIntercept 3, 5 table points
  const linear = analyzeLinear(2, -6);
  assert.equal(linear.slope, 2);
  assert.equal(linear.yIntercept, -6);
  assert.equal(linear.xIntercept, 3);
  assert.equal(linear.passesOrigin, false);
  assert.equal(linear.tablePoints.length, 5);

  // 6. Answer checker (fractions, Turkish comma decimals, algebraic equivalence)
  assert.equal(checkMathAnswer('0,5', ['1/2']), true);
  assert.equal(checkMathAnswer('2x + 4', ['4 + 2*x']), true);
  assert.equal(checkMathAnswer('12', ['15']), false);

  // 7. Deterministic exercise generator across legacy and all MEB Ortaokul topics
  const legacyEx = generateDeterministicExercise('Denklem Çözme', 'orta');
  assert.equal(legacyEx.hints.length, 3);
  assert.equal(checkMathAnswer(legacyEx.acceptedAnswers[0], legacyEx.acceptedAnswers), true);

  for (const topic of MATH_TOPICS) {
    const ex = generateDeterministicExercise(topic, 'orta');
    assert.equal(ex.hints.length, 3, `Topic ${topic} should provide 3 hints`);
    assert.ok(ex.acceptedAnswers.length >= 1, `Topic ${topic} should have accepted answers`);
    assert.equal(
      checkMathAnswer(ex.acceptedAnswers[0], ex.acceptedAnswers),
      true,
      `Topic ${topic} primary answer should pass checkMathAnswer`
    );
  }

  // 8. Verify 5+ tests x 10 multiple-choice questions across all 7 academic modules
  const testBanks = [
    { name: 'Matematik', packs: MATH_TEST_PACKS },
    { name: 'Fen Bilimleri', packs: SCIENCE_TEST_PACKS },
    { name: 'İngilizce', packs: ENGLISH_TEST_PACKS },
    { name: 'Din Kültürü', packs: RELIGION_TEST_PACKS },
    { name: 'Edebiyat & Türkçe', packs: LITERATURE_TEST_PACKS },
    { name: 'Tarih', packs: HISTORY_TEST_PACKS },
    { name: 'Felsefe', packs: PHILOSOPHY_TEST_PACKS },
  ];

  let totalMcqCount = 0;
  for (const bank of testBanks) {
    assert.ok(bank.packs.length >= 5, `${bank.name} en az 5 test içermelidir`);
    const seenIds = new Set<string>();
    for (const pack of bank.packs) {
      assert.equal(pack.questions.length, 10, `${bank.name} / ${pack.title} tam 10 soru içermelidir`);
      for (const q of pack.questions) {
        assert.ok(!seenIds.has(q.id), `Tekrarlanan soru kimliği: ${q.id}`);
        seenIds.add(q.id);
        assert.equal(q.options.length, 4, `Soru ${q.id} 4 seçenekli (A-D) olmalıdır`);
        assert.ok(
          q.correctIndex >= 0 && q.correctIndex < 4,
          `Soru ${q.id} geçerli correctIndex (0..3) içermelidir`
        );
        assert.ok(q.explanation.trim().length > 10, `Soru ${q.id} açıklama içermelidir`);
        totalMcqCount += 1;
      }
    }
  }
  assert.ok(totalMcqCount >= 350, 'Toplam çoktan seçmeli soru sayısı en az 350 olmalıdır');

  console.log(
    `✓ Tüm modül birim testleri (8/8 · ${MATH_TOPICS.length} ortaokul matematik konusu · ${totalMcqCount} çoktan seçmeli test sorusu) başarıyla geçti.`
  );
}

runModuleTests();
