import { useMemo } from 'react';
import katex from 'katex';

interface MathFormulaProps {
  latex: string;
  display?: boolean;
  className?: string;
}

export function MathFormula({ latex, display = false, className = '' }: MathFormulaProps) {
  const html = useMemo(() => {
    const cleaned = latex.replace(/^\$\$|\$\$$/g, '').replace(/^\$|\$$/g, '').trim();
    try {
      return katex.renderToString(cleaned, {
        displayMode: display,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return cleaned;
    }
  }, [display, latex]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
