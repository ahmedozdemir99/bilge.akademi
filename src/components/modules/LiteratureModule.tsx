import { WorkshopLinks } from './workshop/WorkshopLinks';
import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Bot,
  CheckCircle2,
  Feather,
  Loader2,
  Plus,
  Printer,
  Save,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useAcademy } from '../../context/AcademyContext';
import {
  LITERARY_AUTHORS,
  LITERARY_DEVICES,
  LITERARY_MOVEMENTS,
  LITERARY_PERIODS,
  PUBLIC_DOMAIN_WORKS,
} from '../../data/literatureData';
import { LITERATURE_TEST_PACKS } from '../../data/tests/literatureTestsData';
import type { PoemSummary } from '../../types/academy';
import { triggerPrintReport } from '../../utils/exportUtils';
import { analyzePoemAlgorithmically } from '../../utils/poetryUtils';
import { ConfirmDialog } from '../ui/Modal';
import { MultiTestQuizEngine } from '../ui/MultiTestQuizEngine';
import { LiteratureTreasuryPanel } from './literature/LiteratureTreasuryPanel';
import { PoemVoiceRecorder } from './literature/PoemVoiceRecorder';

type LiteratureTab = 'treasury' | 'editor' | 'recorder' | 'generator' | 'library' | 'quiz';
type LibrarySubTab = 'periods' | 'movements' | 'authors' | 'devices' | 'works';

interface AIPoemAnalysis {
  themeAndEmotion: string;
  imageryAnalysis: string[];
  literaryDevices: { device: string; example: string; explanation: string }[];
  rhymeAndRedifComment: string;
  meterComment: string;
  strengths: string[];
  suggestions: string[];
}

const POEM_GENRES = ['Lirik', 'Epik', 'Pastoral', 'Didaktik', 'Satirik', 'Dramatik', 'Serbest'];

export function LiteratureModule() {
  const { poems, addPoem, updatePoem, deletePoem, recordQuizAttempt, notify } = useAcademy();

  const [activeTab, setActiveTab] = useState<LiteratureTab>('treasury');

  // Editor state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('Boğazda Akşam Rüzgârı');
  const [genre, setGenre] = useState('Lirik');
  const [content, setContent] = useState(
    'Sulara düşerken akşamın izi,\nUyanır kıyıda sessiz bir deniz.\nUzakta parıldar yıldızın gizi,\nZamanda yankılanır eski bir iz.'
  );
  const [isDraft, setIsDraft] = useState(false);
  const [savingPoem, setSavingPoem] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PoemSummary | null>(null);

  // AI Poem Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<AIPoemAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // AI Generator state
  const [genTheme, setGenTheme] = useState('Anadolu’da sonbahar ve zaman');
  const [genGenre, setGenGenre] = useState('Lirik');
  const [genEmotion, setGenEmotion] = useState('Huzur ve özlem');
  const [genLines, setGenLines] = useState(8);
  const [genMeter, setGenMeter] = useState('11’li hece ölçüsü');
  const [genRhyme, setGenRhyme] = useState('abab (Çapraz Kafiye)');
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState('');
  const [generatedPoem, setGeneratedPoem] = useState<{
    title: string;
    poem: string;
    poeticNote: string;
  } | null>(null);

  // Library state
  const [librarySub, setLibrarySub] = useState<LibrarySubTab>('periods');
  const [librarySearch, setLibrarySearch] = useState('');

  const algoReport = useMemo(() => analyzePoemAlgorithmically(content), [content]);

  const handleSelectSavedPoem = (poem: PoemSummary) => {
    setEditingId(poem.id);
    setTitle(poem.title);
    setGenre(poem.genre);
    setContent(poem.content);
    setIsDraft(poem.isDraft);
    setAiAnalysis(null);
    setAiError('');
  };

  const handleNewPoem = () => {
    setEditingId(null);
    setTitle('');
    setGenre('Lirik');
    setContent('');
    setIsDraft(true);
    setAiAnalysis(null);
    setAiError('');
  };

  const handleSavePoem = async (asDraft: boolean) => {
    if (!title.trim() || !content.trim()) {
      notify('error', 'Eksik bilgi', 'Şiir başlığı ve metni boş bırakılamaz.');
      return;
    }
    setSavingPoem(true);
    try {
      if (editingId) {
        await updatePoem(editingId, { title, genre, content, isDraft: asDraft });
      } else {
        const newId = await addPoem({ title, genre, content, isDraft: asDraft });
        setEditingId(newId);
      }
      setIsDraft(asDraft);
    } finally {
      setSavingPoem(false);
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (content.trim().length < 8) {
      setAiError('Analiz için en az birkaç dize yazmalısınız.');
      return;
    }
    setAiLoading(true);
    setAiError('');
    try {
      const summary = `${algoReport.lineCount} dize, ${algoReport.meterLabel}, kafiye düzeni: ${algoReport.rhymeScheme} (${algoReport.rhymePatternName})`;
      const response = await fetch('/api/ai/poem-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, genre, content, algorithmicSummary: summary }),
      });
      const data = await response.json();
      if (!response.ok) {
        setAiError(data.error || 'Şiir analizi alınamadı.');
        return;
      }
      setAiAnalysis(data.analysis as AIPoemAnalysis);
    } catch {
      setAiError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGeneratePoem = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenLoading(true);
    setGenError('');
    try {
      const response = await fetch('/api/ai/poem-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: genTheme,
          genre: genGenre,
          emotion: genEmotion,
          lineCount: genLines,
          syllableMeter: genMeter,
          rhymeScheme: genRhyme,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setGenError(data.error || 'Şiir oluşturulamadı.');
        return;
      }
      setGeneratedPoem(data.result);
    } catch {
      setGenError('Yapay zekâ servisine ulaşılamadı.');
    } finally {
      setGenLoading(false);
    }
  };

  const handleTransferGeneratedToEditor = () => {
    if (!generatedPoem) return;
    setEditingId(null);
    setTitle(generatedPoem.title);
    setGenre(genGenre);
    setContent(generatedPoem.poem);
    setIsDraft(true);
    setAiAnalysis(null);
    setActiveTab('editor');
    notify('info', 'Editöre aktarıldı', 'Şiiri düzenleyip kaydedebilir veya analiz edebilirsiniz.');
  };

  const queryLower = librarySearch.trim().toLocaleLowerCase('tr');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
            Modül 02 · Ortaokul Türkçe & Edebiyat · Veciz Sözler, Seçme Şiirler ve Hiciv Atölyesi
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-navy-900 dark:text-white tracking-tight">
            Şiir ve Edebiyat Atölyesi
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Veciz sözleri, seçme klasik şiirleri ve hiciv-taşlama örneklerini keşfedin; kendi
            şiirinizi yazıp hece ve kafiye ölçümüyle inceleyin.
          </p>
        </div>

        <div
          className="control-grid gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 no-print"
          role="tablist"
        >
          {(
            [
              { id: 'treasury', label: 'Veciz Sözler, Şiirler & Hiciv' },
              { id: 'editor', label: `Şiir Editörü (${poems.length})` },
              { id: 'recorder', label: 'Sesli Şiir Kaydı' },
              { id: 'generator', label: 'Şiir Oluşturucu' },
              { id: 'library', label: 'Edebiyat Kütüphanesi' },
              { id: 'quiz', label: 'Testler (5×10)' },
            ] as { id: LiteratureTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-navy-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 0: APHORISMS, CLASSIC POEMS & SATIRE TREASURY */}

      {activeTab === 'treasury' && (
        <LiteratureTreasuryPanel
          onLoadPoemToEditor={(poem) => {
            setEditingId(null);
            setTitle(poem.title);
            setGenre(poem.genre);
            setContent(poem.content);
            setIsDraft(true);
            setAiAnalysis(null);
            setAiError('');
            setActiveTab('editor');
            notify(
              'info',
              'Şiir editöre aktarıldı',
              'Hece ölçüsü ve kafiye analizini sağ panelden inceleyebilirsiniz.'
            );
          }}
        />
      )}

      {/* TAB 1: POEM EDITOR + ALGORITHMIC & AI ANALYSIS */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Saved Poems Sidebar */}
          <aside className="xl:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 no-print">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-navy-900 dark:text-white">
                Şiirlerim ({poems.length})
              </h2>
              <button
                type="button"
                onClick={handleNewPoem}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yeni</span>
              </button>
            </div>

            {poems.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4">
                Henüz kayıtlı şiiriniz yok. Sağdaki editörden ilk şiirinizi kaydedin.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {poems.map((p) => (
                  <div
                    key={p.id}
                    className={`py-2.5 flex items-start justify-between gap-2 ${
                      editingId === p.id ? 'bg-teal-50/70 dark:bg-teal-950/30 -mx-2 px-2 rounded-lg' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectSavedPoem(p)}
                      className="text-left min-w-0 flex-1 cursor-pointer"
                    >
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {p.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {p.genre} · {p.isDraft ? 'Taslak' : 'Tamamlandı'}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(p)}
                      aria-label={`${p.title} şiirini sil`}
                      className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </aside>

          {/* Main Editor + AI Analysis */}
          <div className="xl:col-span-5 space-y-5">
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label htmlFor="poem-title" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Şiir Başlığı
                  </label>
                  <input
                    id="poem-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={120}
                    placeholder="Şiirinize bir başlık verin..."
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="poem-genre" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Tür
                  </label>
                  <select
                    id="poem-genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    {POEM_GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="poem-body" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Dizeler ({algoReport.lineCount} dize · {algoReport.stanzaCount} bent)
                </label>
                <textarea
                  id="poem-body"
                  rows={10}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={5000}
                  placeholder="Dizelerinizi buraya yazın..."
                  className="w-full px-4 py-3 text-base font-display leading-relaxed rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 no-print">
                <div className="control-grid gap-2">
                  <button
                    type="button"
                    disabled={savingPoem}
                    onClick={() => void handleSavePoem(false)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 disabled:opacity-60 cursor-pointer whitespace-nowrap"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{editingId ? 'Güncelle' : 'Kaydet'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={savingPoem}
                    onClick={() => void handleSavePoem(true)}
                    className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
                  >
                    Taslak Olarak Sakla
                  </button>
                  <button
                    type="button"
                    onClick={triggerPrintReport}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>PDF / Yazdır</span>
                  </button>
                </div>

                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => void handleAnalyzeWithAI()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-gold-500 text-navy-950 hover:bg-gold-400 disabled:opacity-60 cursor-pointer whitespace-nowrap"
                >
                  {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                  <span>{aiLoading ? 'Analiz Ediliyor...' : 'Yapay Zekâ Analizi'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Durum: {isDraft ? 'Taslak' : 'Tamamlandı'} · Yalnızca kendi yazdığınız veya kamu malı
                metinleri inceleyin.
              </p>
            </section>

            {/* Voice Recorder right below Poem Editor */}
            <PoemVoiceRecorder poemTitle={title} poemContent={content} onNotify={notify} />

            {/* AI Analysis Result */}
            {aiError && (
              <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{aiError}</span>
              </div>
            )}

            {aiAnalysis && (
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <Feather className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <h3 className="text-base font-semibold text-navy-900 dark:text-white">
                    Yapay Zekâ Edebî İnceleme Raporu
                  </h3>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-1">
                    Tema ve Ana Duygu
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {aiAnalysis.themeAndEmotion}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-navy-900 dark:text-gold-400 mb-1.5">
                    İmge İncelemesi
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                    {aiAnalysis.imageryAnalysis.map((im, i) => (
                      <li key={i}>{im}</li>
                    ))}
                  </ul>
                </div>

                {aiAnalysis.literaryDevices.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-navy-900 dark:text-gold-400 mb-2">
                      Tespit Edilen Edebî Sanatlar
                    </h4>
                    <div className="space-y-2">
                      {aiAnalysis.literaryDevices.map((d, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs"
                        >
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {d.device} — <span className="font-normal italic">“{d.example}”</span>
                          </p>
                          <p className="mt-1 text-slate-600 dark:text-slate-300">{d.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-white mb-1">Kafiye ve Redif</p>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {aiAnalysis.rhymeAndRedifComment}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-white mb-1">Ölçü ve Ritim</p>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {aiAnalysis.meterComment}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1.5">
                      Güçlü Yönler
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {aiAnalysis.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1.5">
                      Geliştirme Önerileri
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {aiAnalysis.suggestions.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Real-Time Algorithmic Meter & Rhyme Panel */}
          <aside className="xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5">
            <div>
              <h2 className="text-sm font-semibold text-navy-900 dark:text-white">
                Canlı Algoritmik Hece ve Kafiye Ölçümü
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Türkçe ünlü sayımı ve dize sonu ses eşleşmesiyle anlık hesaplanır.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400">Ölçü Tahmini</p>
                <p className="mt-1 font-semibold text-navy-900 dark:text-white">
                  {algoReport.meterLabel}
                </p>
                <p className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                  Tutarlılık: %{algoReport.meterConsistencyPercent}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400">Kafiye Şeması</p>
                <p className="mt-1 font-mono font-semibold text-teal-700 dark:text-teal-400">
                  {algoReport.rhymeScheme}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {algoReport.rhymePatternName}
                </p>
              </div>
            </div>

            {/* Line-by-line syllables */}
            {algoReport.lines.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Dize Dökümü
                </h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
                  {algoReport.lines.map((ln) => (
                    <div key={ln.lineNumber} className="py-2 flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono text-slate-400 w-5 shrink-0 tabular-nums">
                        {ln.lineNumber}.
                      </span>
                      <span className="truncate flex-1 text-slate-700 dark:text-slate-300">
                        {ln.text}
                      </span>
                      <span className="font-mono text-navy-900 dark:text-white shrink-0 tabular-nums">
                        {ln.syllables} hece
                      </span>
                      <span className="font-mono font-semibold text-teal-700 dark:text-teal-400 w-4 text-right shrink-0">
                        {ln.rhymeLetter}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {algoReport.detectedSoundGroups.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Ses Benzerliği Grupları
                </h3>
                <div className="space-y-2">
                  {algoReport.detectedSoundGroups.map((grp) => (
                    <div
                      key={grp.letter}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs"
                    >
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        Grup {grp.letter.toUpperCase()} ({grp.sharedSuffix}): {grp.words.join(', ')}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {grp.likelyType}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uncertainty Warnings */}
            <div className="p-3.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Ölçüm Uyarıları</span>
              </div>
              {algoReport.warnings.map((w, idx) => (
                <p key={idx} className="text-[11px] text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                  {w}
                </p>
              ))}
            </div>
          </aside>
        </div>
      )}

      {/* TAB 1.5: DEDICATED POEM VOICE RECORDING STUDIO */}
      {activeTab === 'recorder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div>
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                Sesli Okuma Metni (Prompter)
              </p>
              <h2 className="mt-1 text-lg font-semibold text-navy-900 dark:text-white">
                {title || 'Başlıksız Şiir'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kayıt yaparken aşağıdan kendi şiirinizi veya kayıtlı şiirlerinizden birini seçip okuyabilirsiniz.
              </p>
            </div>

            {poems.length > 0 && (
              <div>
                <label htmlFor="rec-poem-select" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Kayıtlı Şiir Seç
                </label>
                <select
                  id="rec-poem-select"
                  value={editingId ?? ''}
                  onChange={(e) => {
                    const found = poems.find((p) => p.id === e.target.value);
                    if (found) handleSelectSavedPoem(found);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="">Mevcut Editördeki Şiir</option>
                  {poems.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.genre})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
              <pre className="font-display text-sm sm:text-base leading-8 text-slate-800 dark:text-slate-100 whitespace-pre-wrap">
                {content || 'Okumak istediğiniz dizeleri Şiir Editörü sekmesine yazabilir veya doğrudan kayda başlayabilirsiniz.'}
              </pre>
            </div>
          </div>

          <div className="lg:col-span-7">
            <PoemVoiceRecorder poemTitle={title} poemContent={content} onNotify={notify} />
          </div>
        </div>
      )}

      {/* TAB 2: AI POEM GENERATOR */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleGeneratePoem}
            className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4"
          >
            <h2 className="text-base font-semibold text-navy-900 dark:text-white">
              Özgün Şiir Oluşturma Ölçütleri
            </h2>

            <div>
              <label htmlFor="gen-theme" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Tema
              </label>
              <input
                id="gen-theme"
                type="text"
                value={genTheme}
                onChange={(e) => setGenTheme(e.target.value)}
                required
                maxLength={80}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="gen-genre" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Şiir Türü
                </label>
                <select
                  id="gen-genre"
                  value={genGenre}
                  onChange={(e) => setGenGenre(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  {POEM_GENRES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="gen-emotion" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Ana Duygu
                </label>
                <input
                  id="gen-emotion"
                  type="text"
                  value={genEmotion}
                  onChange={(e) => setGenEmotion(e.target.value)}
                  maxLength={60}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="gen-lines" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Dize Sayısı ({genLines})
                </label>
                <input
                  id="gen-lines"
                  type="range"
                  min={4}
                  max={20}
                  step={2}
                  value={genLines}
                  onChange={(e) => setGenLines(Number(e.target.value))}
                  className="w-full accent-teal-600 mt-2"
                />
              </div>
              <div>
                <label htmlFor="gen-meter" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Hece Ölçüsü
                </label>
                <select
                  id="gen-meter"
                  value={genMeter}
                  onChange={(e) => setGenMeter(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="7’li hece ölçüsü">7’li Hece Ölçüsü</option>
                  <option value="8’li hece ölçüsü">8’li Hece Ölçüsü</option>
                  <option value="11’li hece ölçüsü">11’li Hece Ölçüsü</option>
                  <option value="14’lü hece ölçüsü">14’lü Hece Ölçüsü</option>
                  <option value="Serbest ölçü">Serbest Ölçü</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="gen-rhyme" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Kafiye Düzeni
              </label>
              <select
                id="gen-rhyme"
                value={genRhyme}
                onChange={(e) => setGenRhyme(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                <option value="abab (Çapraz Kafiye)">abab (Çapraz Kafiye)</option>
                <option value="aabb (Düz Kafiye)">aabb (Düz Kafiye)</option>
                <option value="abba (Sarmal Kafiye)">abba (Sarmal Kafiye)</option>
                <option value="aaba (Mâni Tipi)">aaba (Mâni Tipi)</option>
                <option value="Serbest">Serbest</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={genLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 disabled:opacity-60 cursor-pointer"
            >
              {genLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{genLoading ? 'Şiir Yazılıyor...' : 'Özgün Şiir Oluştur'}</span>
            </button>
          </form>

          <section className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 min-h-[360px]">
            {genError && (
              <div className="flex items-start gap-2.5 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{genError}</span>
              </div>
            )}

            {!generatedPoem && !genLoading && !genError && (
              <div className="py-16 text-center">
                <Feather className="w-8 h-8 text-gold-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Seçtiğiniz ölçü ve temaya göre özgün şiir burada oluşturulacaktır.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Üretilen şiiri tek tıkla editöre aktarıp algoritmik olarak inceleyebilirsiniz.
                </p>
              </div>
            )}

            {generatedPoem && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs text-teal-700 dark:text-teal-400">
                      {genGenre} · {genMeter} · {genRhyme}
                    </p>
                    <h3 className="mt-1 text-xl font-display font-semibold text-navy-900 dark:text-white">
                      {generatedPoem.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleTransferGeneratedToEditor}
                    className="px-3.5 py-2 text-xs font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-500 cursor-pointer whitespace-nowrap"
                  >
                    Editöre Aktar
                  </button>
                </div>

                <pre className="font-display text-base leading-8 text-slate-800 dark:text-slate-100 whitespace-pre-wrap">
                  {generatedPoem.poem}
                </pre>

                <p className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  <strong>Edebî Not:</strong> {generatedPoem.poeticNote}
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 3: LITERATURE LIBRARY */}
      {activeTab === 'library' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="control-grid gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {(
                [
                  { id: 'periods', label: 'Dönemler' },
                  { id: 'movements', label: 'Edebî Akımlar' },
                  { id: 'authors', label: 'Şair ve Yazarlar' },
                  { id: 'devices', label: 'Edebî Sanatlar' },
                  { id: 'works', label: 'Eser İncelemeleri' },
                ] as { id: LibrarySubTab; label: string }[]
              ).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setLibrarySub(s.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer whitespace-nowrap ${
                    librarySub === s.id
                      ? 'bg-white dark:bg-slate-800 text-navy-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                placeholder="Kütüphanede ara..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {librarySub === 'periods' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {LITERARY_PERIODS.filter(
                (p) =>
                  !queryLower ||
                  p.name.toLocaleLowerCase('tr').includes(queryLower) ||
                  p.summary.toLocaleLowerCase('tr').includes(queryLower)
              ).map((period) => (
                <article
                  key={period.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-3"
                >
                  <p className="text-xs font-mono text-teal-700 dark:text-teal-400">{period.era}</p>
                  <h3 className="text-lg font-semibold text-navy-900 dark:text-white">
                    {period.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {period.summary}
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {period.keyTraits.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <strong>Önemli Temsilciler:</strong> {period.majorFigures.join(', ')}
                  </p>
                </article>
              ))}
            </div>
          )}

          {librarySub === 'movements' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {LITERARY_MOVEMENTS.filter(
                (m) =>
                  !queryLower ||
                  m.name.toLocaleLowerCase('tr').includes(queryLower) ||
                  m.coreIdea.toLocaleLowerCase('tr').includes(queryLower)
              ).map((mov) => (
                <article
                  key={mov.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2.5"
                >
                  <p className="text-xs text-teal-700 dark:text-teal-400">{mov.originEra}</p>
                  <h3 className="text-base font-semibold text-navy-900 dark:text-white">{mov.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {mov.coreIdea}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <strong>Türk Edebiyatındaki Temsilcileri:</strong> {mov.turkishRepresentatives.join(', ')}
                  </p>
                </article>
              ))}
            </div>
          )}

          {librarySub === 'authors' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {LITERARY_AUTHORS.filter(
                (a) =>
                  !queryLower ||
                  a.name.toLocaleLowerCase('tr').includes(queryLower) ||
                  a.period.toLocaleLowerCase('tr').includes(queryLower)
              ).map((author) => (
                <article
                  key={author.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-2.5"
                >
                  <p className="text-xs text-teal-700 dark:text-teal-400">
                    {author.period} · {author.lifespan}
                  </p>
                  <h3 className="text-lg font-semibold text-navy-900 dark:text-white">
                    {author.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {author.bio}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <strong>Üslup:</strong> {author.styleNotes}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <strong>Başlıca Eserleri:</strong> {author.keyWorks.join(', ')}
                  </p>
                </article>
              ))}
            </div>
          )}

          {librarySub === 'devices' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LITERARY_DEVICES.filter(
                (d) =>
                  !queryLower ||
                  d.name.toLocaleLowerCase('tr').includes(queryLower) ||
                  d.explanation.toLocaleLowerCase('tr').includes(queryLower)
              ).map((dev) => (
                <article
                  key={dev.name}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2"
                >
                  <h3 className="text-base font-semibold text-navy-900 dark:text-white">{dev.name}</h3>
                  <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                    {dev.turkishMeaning}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{dev.explanation}</p>
                  <p className="text-xs font-display italic text-slate-700 dark:text-slate-200 pt-2 border-t border-slate-100 dark:border-slate-800">
                    Örnek: {dev.example}
                  </p>
                </article>
              ))}
            </div>
          )}

          {librarySub === 'works' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Telif hakkı ilkelerine uygun olarak yalnızca kamu malı klasik eserlerin özet ve
                incelemeleri sunulmaktadır.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {PUBLIC_DOMAIN_WORKS.map((work) => (
                  <article
                    key={work.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <p className="text-xs text-teal-700 dark:text-teal-400">
                        {work.period} · {work.genre}
                      </p>
                      <h3 className="text-lg font-semibold text-navy-900 dark:text-white">
                        {work.title}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Yazar: {work.author}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {work.summary}
                      </p>
                      <p className="text-xs font-display italic text-navy-900 dark:text-gold-400 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg">
                        {work.publicDomainExcerpt}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      <p>
                        <strong>Temalar:</strong> {work.themes.join(', ')}
                      </p>
                      <p>
                        <strong>Edebî Önemi:</strong> {work.literarySignificance}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: LITERATURE 5x10 MULTIPLE-CHOICE TEST BANK */}
      {activeTab === 'quiz' && (
        <MultiTestQuizEngine
          moduleLabel="Türkçe ve Edebiyat"
          tests={LITERATURE_TEST_PACKS}
          onCompleteTest={async ({ testTitle, correctCount, totalQuestions }) => {
            await recordQuizAttempt({
              moduleName: 'edebiyat',
              topic: testTitle,
              score: correctCount,
              totalQuestions,
            });
            notify(
              'success',
              'Edebiyat testi kaydedildi',
              `${totalQuestions} soruda ${correctCount} doğru sonucunuz raporlara işlendi.`
            );
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          open={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            await deletePoem(deleteTarget.id);
            if (editingId === deleteTarget.id) handleNewPoem();
            setDeleteTarget(null);
          }}
          title="Şiiri Sil"
          message={`“${deleteTarget.title}” başlıklı şiiri kalıcı olarak silmek istediğinize emin misiniz?`}
        />
      )}

      <WorkshopLinks activities={['words', 'paragraph', 'inference']} />
    </div>
  );
}
