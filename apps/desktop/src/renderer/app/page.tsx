import { Sparkles } from 'lucide-react';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const cards = [
  ['Initiatives', 'Track AI proposals, owners, status, and assumptions.'],
  ['Business Case', 'Model costs, benefits, risk, and payback.'],
  ['Decisions', 'Compare model and architecture tradeoffs.'],
  ['Roadmap', 'Move from business case to deploy and measure.'],
];

export default function Page() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-brand-100/80">
              AI initiative workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
              AI Decision Studio
            </h1>
            <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              by Menoko OG
            </p>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
              Premium desktop workspace for CTO and product/ops leaders evaluating AI initiatives.
            </p>
          </div>
          <div className="rounded-2xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-50">
            Offline-first. AI is optional.
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button className="gap-2">
            <Sparkles className="size-4" />
            New Initiative
          </Button>
          <Button variant="outline">Open Template Library</Button>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([title, text]) => (
          <Card key={title} className="rounded-3xl border-white/10 bg-white/5">
            <CardHeader className="p-5 pb-2">
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0">
              <CardDescription className="text-sm leading-6 text-slate-300">{text}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-lg font-medium">v1 priorities</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>• High-quality exports</li>
            <li>• Deterministic business case calculations</li>
            <li>• Responsive narrow-width layouts</li>
            <li>• OpenAI-compatible provider setup</li>
            <li>• Built-in template library</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-lg font-medium">Connect AI later</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Users can connect their own supported API key to enable the Guarded AI Assistant. Core
            workflows remain available without AI.
          </p>
        </div>
      </section>
    </main>
  );
}
