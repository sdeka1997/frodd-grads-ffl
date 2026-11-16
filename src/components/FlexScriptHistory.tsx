'use client';

import { useState } from 'react';
import { FileCode, Copy, Check, Download, CheckCircle2, AlertTriangle, HelpCircle, Sparkles } from 'lucide-react';

export type ScriptStatus = 'current' | 'verified' | 'bug' | 'unverified';

export interface FlexScript {
  year: string;
  filename: string;
  title: string;
  status: ScriptStatus;
  summary: string;
  code: string;
  /** 1-based line numbers to highlight, with a short reason */
  highlights: { line: number; note: string }[];
}

const STATUS = {
  current: { label: 'Current', icon: Sparkles, cls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
  verified: { label: 'Verified', icon: CheckCircle2, cls: 'border-sky-500/40 bg-sky-500/10 text-sky-300' },
  bug: { label: 'Seed bug', icon: AlertTriangle, cls: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
  unverified: { label: 'Not reproduced', icon: HelpCircle, cls: 'border-slate-600 bg-slate-800 text-slate-300' },
} as const;

export default function FlexScriptHistory({ scripts }: { scripts: FlexScript[] }) {
  const [year, setYear] = useState(scripts[0]?.year);
  const [copied, setCopied] = useState(false);
  const script = scripts.find(s => s.year === year) ?? scripts[0];
  if (!script) return null;

  const status = STATUS[script.status];
  const StatusIcon = status.icon;
  const highlighted = new Map(script.highlights.map(h => [h.line, h.note]));
  const lines = script.code.replace(/\n$/, '').split('\n');

  const copy = () => {
    navigator.clipboard.writeText(script.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([script.code], { type: 'text/x-python' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = script.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <FileCode className="w-5 h-5 text-emerald-400" />
        <h2 className="text-lg font-bold">Scripts by year</h2>
      </div>
      <p className="text-sm text-slate-400 max-w-3xl">
        The exact script used to draw each year’s flex schedule, unedited. Highlighted lines are the ones that decide
        whether the group-chat seed actually changes the draw.
      </p>

      <div className="flex flex-wrap gap-2">
        {scripts.map(s => (
          <button
            key={s.year}
            onClick={() => setYear(s.year)}
            className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
              s.year === script.year
                ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            {s.year}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="p-4 space-y-2 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-100">{script.title}</span>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${status.cls}`}>
              <StatusIcon className="w-3 h-3" /> {status.label}
            </span>
          </div>
          <p className="text-sm text-slate-400">{script.summary}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <code className="text-xs text-slate-500">{script.filename}</code>
            <button onClick={copy} className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border border-slate-700 text-slate-300 hover:text-emerald-300">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={download} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border border-slate-700 text-slate-300 hover:text-emerald-300">
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>
        </div>

        <div className="overflow-auto max-h-[32rem] bg-slate-950/70">
          <pre className="text-xs leading-5 font-mono min-w-max py-2">
            {lines.map((text, i) => {
              const note = highlighted.get(i + 1);
              return (
                <div key={i} className={`flex pr-4 ${note ? 'bg-amber-400/10 border-l-2 border-amber-400' : 'border-l-2 border-transparent'}`}>
                  <span className="select-none w-10 shrink-0 text-right pr-3 text-slate-600">{i + 1}</span>
                  <span className="text-slate-200 whitespace-pre">{text || ' '}</span>
                  {note && <span className="select-none ml-4 text-amber-300/90 italic whitespace-pre">← {note}</span>}
                </div>
              );
            })}
          </pre>
        </div>
      </div>
    </section>
  );
}
