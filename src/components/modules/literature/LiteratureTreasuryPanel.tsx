import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookMarked,
  Feather,
  MessageSquareQuote,
  Quote,
  Search,
  Shuffle,
} from 'lucide-react';
import {
  APHORISM_CATEGORIES,
  APHORISMS_DATA,
  CLASSIC_POEMS_ANTHOLOGY,
  SATIRE_TASLAMA_EXAMPLES,
  type AphorismCategory,
  type ClassicPoemEntry,
} from '../../../data/literatureRichData';

type TreasurySubTab = 'aphorisms' | 'poems' | 'satire';

interface LiteratureTreasuryPanelProps {
  onLoadPoemToEditor: (poem: { title: string; genre: string; content: string }) => void;
}

export function LiteratureTreasuryPanel({ onLoadPoemToEditor }: LiteratureTreasuryPanelProps) {
  const [subTab, setSubTab] = useState<TreasurySubTab>('aphorisms');
  const [categoryFilter, setCategoryFilter] = useState<'all' | AphorismCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const featuredAphorism = APHORISMS_DATA[featuredIndex % APHORISMS_DATA.length];
  const qLower = searchQuery.trim().toLocaleLowerCase('tr');

  const filteredAphorisms = useMemo(() => {
    return APHORISMS_DATA.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (!qLower) return true;
      return (
        item.quote.toLocaleLowerCase('tr').includes(qLower) ||
        item.author.toLocaleLowerCase('tr').includes(qLower) ||
        item.reflection.toLocaleLowerCase('tr').includes(qLower)
      );
    });
  }, [categoryFilter, qLower]);

  const filteredPoems = useMemo(() => {
    return CLASSIC_POEMS_ANTHOLOGY.filter((p) => {
      if (!qLower) return true;
      return (
        p.title.toLocaleLowerCase('tr').includes(qLower) ||
        p.poet.toLocaleLowerCase('tr').includes(qLower) ||
        p.theme.toLocaleLowerCase('tr').includes(qLower) ||
        p.content.toLocaleLowerCase('tr').includes(qLower)
      );
    });
  }, [qLower]);

  const filteredSatires = useMemo(() => {
    return SATIRE_TASLAMA_EXAMPLES.filter((s) => {
      if (!qLower) return true;
      return (
        s.title.toLocaleLowerCase('tr').includes(qLower) ||
        s.poet.toLocaleLowerCase('tr').includes(qLower) ||
        s.excerpt.toLocaleLowerCase('tr').includes(qLower) ||
        s.critiqueTarget.toLocaleLowerCase('tr').includes(qLower)
      );
    });
  }, [qLower]);

  const handleNextFeatured = () => {
    setFeaturedIndex((prev) => (prev + 1) % APHORISMS_DATA.length);
  };

  const handleTransfer = (poem: ClassicPoemEntry) => {
    onLoadPoemToEditor({
      title: `${poem.title} (${poem.poet})`,
      genre: poem.genre,
      content: poem.content,
    });
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div
          className="control-grid gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          role="tablist"
        >
          {(
            [
              {
                id: 'aphorisms',
                label: `Veciz Sözler ve Özdeyişler (${APHORISMS_DATA.length})`,
                icon: Quote,
              },
              {
                id: 'poems',
                label: `Seçme Klasik Şiirler (${CLASSIC_POEMS_ANTHOLOGY.length})`,
                icon: Feather,
              },
              {
                id: 'satire',
                label: `Hiciv ve Taşlama Köşesi (${SATIRE_TASLAMA_EXAMPLES.length})`,
                icon: MessageSquareQuote,
              },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={subTab === t.id}
                onClick={() => setSubTab(t.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  subTab === t.id
                    ? 'bg-white dark:bg-slate-800 text-navy-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Şair, söz, tema veya eser ara..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* SUB-TAB 1: APHORISMS / VECİZ SÖZLER */}
      {subTab === 'aphorisms' && (
        <div className="space-y-5">
          {/* Günün Vecizesi Banner */}
          <section className="rounded-xl bg-navy-900 text-white p-6 sm:p-7 border border-navy-800">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2 max-w-3xl">
                <p className="text-xs font-medium text-gold-400">
                  Günün Vecizesi · {featuredAphorism.category}
                </p>
                <blockquote className="text-lg sm:text-2xl font-display font-medium leading-relaxed text-white">
                  “{featuredAphorism.quote}”
                </blockquote>
                <p className="text-xs text-teal-300 font-medium">
                  — {featuredAphorism.author} ({featuredAphorism.era})
                </p>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {featuredAphorism.reflection}
                </p>
              </div>
              <button
                type="button"
                onClick={handleNextFeatured}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Başka Vecize Göster</span>
              </button>
            </div>
          </section>

          {/* Category Filter */}
          <div className="control-grid gap-2">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer whitespace-nowrap ${
                categoryFilter === 'all'
                  ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-navy-900 dark:text-white'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
              }`}
            >
              Tümü ({APHORISMS_DATA.length})
            </button>
            {APHORISM_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-navy-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Aphorism Grid */}
          {filteredAphorisms.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center text-sm text-slate-500 dark:text-slate-400">
              Arama ölçütünüze uygun veciz söz bulunamadı.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAphorisms.map((item) => (
                <article
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2.5">
                    <p className="text-[11px] font-medium text-teal-700 dark:text-teal-400">
                      {item.category} · {item.era}
                    </p>
                    <blockquote className="font-display text-base font-medium text-navy-900 dark:text-white leading-relaxed">
                      “{item.quote}”
                    </blockquote>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.reflection}
                    </p>
                  </div>
                  <p className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-gold-700 dark:text-gold-400">
                    — {item.author}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: CLASSIC PUBLIC-DOMAIN POEMS */}
      {subTab === 'poems' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Türk edebiyatının kamu malı klasiklerinden seçilen bu dörtlük ve beyitleri tek tıkla
            şiir editörüne aktararak hece ölçüsü, kafiye düzeni ve edebî sanat incelemesi
            yapabilirsiniz.
          </p>

          {filteredPoems.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center text-sm text-slate-500 dark:text-slate-400">
              Arama ölçütünüze uygun şiir bulunamadı.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredPoems.map((poem) => (
                <article
                  key={poem.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-teal-700 dark:text-teal-400">
                          {poem.poet} · {poem.era}
                        </p>
                        <h3 className="mt-0.5 text-lg font-semibold text-navy-900 dark:text-white">
                          {poem.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Tür: {poem.genre} · Ölçü: {poem.meterInfo} · Tema: {poem.theme}
                        </p>
                      </div>
                      <BookMarked className="w-5 h-5 text-gold-600 dark:text-gold-400 shrink-0" />
                    </div>

                    <pre className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 font-display text-sm leading-7 text-slate-800 dark:text-slate-100 whitespace-pre-wrap">
                      {poem.content}
                    </pre>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      <strong>Açıklama:</strong> {poem.explanation}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleTransfer(poem)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer whitespace-nowrap"
                    >
                      <span>Editöre Aktar ve İncele</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: SATIRE / HİCİV VE TAŞLAMA */}
      {subTab === 'satire' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>Hiciv ve Taşlama Nedir?</strong> Divan edebiyatında <em>hiciv</em>, halk
            edebiyatında <em>taşlama</em>, günümüzde ise <em>yergi</em> adını alan bu tür; toplumdaki
            aksaklıkları, haksızlıkları, kibri ve çıkar ilişkilerini zekâ, ironi ve ince mizah yoluyla
            eleştirir. Aşağıda edebiyat tarihimizden seçilmiş kamu malı örnekleri inceleyebilirsiniz.
          </div>

          {filteredSatires.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center text-sm text-slate-500 dark:text-slate-400">
              Arama ölçütünüze uygun hiciv veya taşlama örneği bulunamadı.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredSatires.map((sat) => (
                <article
                  key={sat.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-3.5"
                >
                  <div>
                    <p className="text-xs text-teal-700 dark:text-teal-400">
                      {sat.poet} · {sat.century}
                    </p>
                    <h3 className="mt-0.5 text-base font-semibold text-navy-900 dark:text-white">
                      {sat.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Eser: {sat.workTitle}
                    </p>
                  </div>

                  <pre className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 font-display text-sm leading-7 text-navy-900 dark:text-gold-300 whitespace-pre-wrap">
                    {sat.excerpt}
                  </pre>

                  <div className="space-y-2 text-xs leading-relaxed">
                    <p className="text-slate-700 dark:text-slate-200">
                      <strong>Günümüz Türkçesiyle:</strong> {sat.modernMeaning}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <strong>Eleştiri Konusu:</strong> {sat.critiqueTarget}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
