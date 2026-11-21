import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface State {
  hasError: boolean;
  errorMessage: string;
}

type Props = { children: React.ReactNode; embedded?: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    let friendly = 'Beklenmeyen bir uygulama hatası oluştu.';
    try {
      const parsed = JSON.parse(error.message);
      if (parsed && typeof parsed.error === 'string') {
        if (parsed.error.includes('permission') || parsed.error.includes('PERMISSION_DENIED')) {
          friendly =
            'Bu veriye erişim veya işlem yapma yetkiniz bulunmuyor. Lütfen oturumunuzu ve erişim haklarınızı kontrol edin.';
        } else if (parsed.error.includes('Quota exceeded')) {
          friendly =
            'Veritabanı günlük kullanım kotası doldu. Kota ertesi gün yenilenecektir.';
        } else {
          friendly = parsed.error;
        }
      }
    } catch {
      friendly = error.message || friendly;
    }
    return { hasError: true, errorMessage: friendly };
  }

  componentDidCatch(error: Error): void {
    console.error('Bilge Akademi Hata Yakalayıcı:', error);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div role="alert" className={this.props.embedded ? "flex justify-center py-6" : "min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6"}>
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8">
            <div className="flex items-center gap-3 text-red-700 dark:text-red-400 mb-4">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h1 className="text-xl font-semibold">Bir Sorun Oluştu</h1>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {this.state.errorMessage}
            </p>
            <div className="control-grid max-w-md gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Tekrar Dene</span>
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Sayfayı Yenile
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
