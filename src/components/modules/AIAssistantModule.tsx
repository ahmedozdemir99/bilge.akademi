import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Bot, Loader2, RotateCcw, Send, ShieldCheck } from 'lucide-react';
import { useAcademy } from '../../context/AcademyContext';
import type { AIChatMessage } from '../../types/academy';

const MODULE_CONTEXTS = [
  'Genel Platform',
  'Öğrenci Takip Sistemi',
  'Şiir ve Edebiyat Atölyesi',
  'İnteraktif Tarih Atlası',
  'Matematik Öğretmeni',
  'Fen Bilimleri Laboratuvarı',
  'İngilizce Dil Atölyesi',
  'Din Kültürü ve Ahlak Bilgisi',
  'Felsefe Akademisi',
];

const QUICK_PROMPTS_TEACHER = [
  '8. sınıf Asitler, Bazlar ve pH konusu için güvenli sınıf içi deney planı ve 5 soruluk LGS taslağı hazırla.',
  '8. sınıf İngilizce Friendship ünitesi için dinleme diyaloğu ve 4 çoktan seçmeli soru yaz.',
  'Din Kültürü Kader ve Tevekkül konusu için hikmetli hikâye destekli 40 dakikalık ders planı oluştur.',
  'Sınıfta deneme netlerini artırmak için ders bazlı yapıcı rehberlik ve çalışma önerileri ver.',
];

const QUICK_PROMPTS_STUDENT = [
  'Fotosentez hızını etkileyen faktörleri ve ışık renginin etkisini günlük örneklerle anlat.',
  'İngilizcede prefer ve would rather kalıplarını 5 günlük örnekle karşılaştır.',
  'Abdestin ve namazın farzlarını akılda kalıcı maddeler hâlinde özetle.',
  'Matematikte üslü ifadeler ve kareköklü sayılar için haftalık çalışma planı hazırla.',
];

export function AIAssistantModule() {
  const {
    assistantInitialContext,
    workspaceView,
    aiConversations,
    saveAIConversationSummary,
  } = useAcademy();

  const [selectedContext, setSelectedContext] = useState(assistantInitialContext || 'Genel Platform');
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text:
        workspaceView === 'teacher'
          ? 'Merhaba! Ben BİLGE AKADEMİ Yapay Zekâ Asistanı. Ders planı hazırlama, sınav sorusu taslağı oluşturma, konu anlatımı veya pedagojik strateji konularında size yardımcı olabilirim.'
          : 'Merhaba! Ben BİLGE AKADEMİ Yapay Zekâ Asistanı. Konu anlatımı, örnek sorular, çalışma planı ve kavram açıklamaları için bana dilediğinizi sorabilirsiniz.',
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (assistantInitialContext) {
      setSelectedContext(assistantInitialContext);
    }
  }, [assistantInitialContext]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || loading) return;

    const nowTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const userMsg: AIChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: nowTime,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          moduleContext: selectedContext,
          roleView: workspaceView,
          history: nextHistory.slice(-8).map((m) => ({ role: m.role, text: m.text })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Yapay zekâ yanıtı alınamadı.');
        return;
      }

      const replyText = String(data.reply || 'Yanıt oluşturulamadı.');
      const assistantMsg: AIChatMessage = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      void saveAIConversationSummary(
        selectedContext,
        trimmed.slice(0, 80),
        trimmed,
        replyText
      );
    } catch {
      setError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        text: 'Yeni bir sohbet başlatıldı. Hangi konu veya ders materyali üzerinde çalışmak istersiniz?',
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setError('');
  };

  const quickPrompts =
    workspaceView === 'teacher' ? QUICK_PROMPTS_TEACHER : QUICK_PROMPTS_STUDENT;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
            Ortak Servis · {workspaceView === 'teacher' ? 'Öğretmen Desteği' : 'Öğrenci Rehberliği'}
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-navy-900 dark:text-white tracking-tight">
            Yapay Zekâ Eğitim Asistanı
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Tüm modüller için Türkçe ders anlatımı, soru taslağı, çalışma planı ve akademik açıklamalar.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            aria-label="Modül bağlamı seçin"
            value={selectedContext}
            onChange={(e) => setSelectedContext(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
          >
            {MODULE_CONTEXTS.map((ctx) => (
              <option key={ctx} value={ctx}>
                Bağlam: {ctx}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleClearChat}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Temizle</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chat Panel */}
        <section className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col h-[560px]">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>Özel öğrenci kayıtları açık izniniz olmadan bu sohbete aktarılmaz.</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-navy-900 text-white dark:bg-teal-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1 text-[11px] opacity-75">
                    <span className="font-medium">
                      {msg.role === 'user' ? 'Siz' : 'Bilge Asistan'}
                    </span>
                    <span className="font-mono tabular-nums">{msg.timestamp}</span>
                  </div>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600 dark:text-teal-400" />
                  <span>Yanıt hazırlanıyor...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div ref={endRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`${selectedContext} hakkında sorunuzu veya isteğinizi yazın...`}
              maxLength={1000}
              className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-teal-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Send className="w-4 h-4" />
              <span>Gönder</span>
            </button>
          </form>
        </section>

        {/* Quick Prompts & Recent History */}
        <aside className="lg:col-span-4 space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h2 className="text-sm font-semibold text-navy-900 dark:text-white">
                Hazır İstem Önerileri
              </h2>
            </div>
            <div className="space-y-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  disabled={loading}
                  className="w-full text-left p-3 rounded-lg text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-teal-600/60 dark:hover:border-teal-500/60 transition-colors cursor-pointer leading-relaxed"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-navy-900 dark:text-white mb-3">
              Son Kayıtlı Sohbetler ({aiConversations.length})
            </h2>
            {aiConversations.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Asistanla sohbet ettiğinizde son konular burada özetlenir.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {aiConversations.slice(0, 5).map((conv) => (
                  <li key={conv.id} className="py-2.5 first:pt-0 last:pb-0">
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                      {conv.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {conv.moduleContext}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
