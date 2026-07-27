import { Skeleton } from '@/components/ui/skeleton';

// Fallback do Suspense pra todas as rotas lazy — antes era só um spinner
// genérico numa tela em branco, sem nenhuma relação com a forma do
// conteúdo real (chrome do app some por completo até o chunk carregar).
// Aproxima a silhueta da sidebar + header + cards que praticamente toda
// tela interna tem, pra a transição parecer contínua em vez de
// branco -> spinner -> conteúdo.
export const RouteFallback = () => (
  <div className="min-h-screen bg-background flex">
    <aside className="hidden md:flex w-64 flex-col gap-2 border-r border-border p-4 shrink-0">
      <Skeleton className="h-10 w-32 mb-4" />
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full rounded-lg" />
      ))}
    </aside>
    <div className="flex-1 flex flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56 hidden sm:block" />
        </div>
        <Skeleton className="h-9 w-9 rounded-full" />
      </header>
      <main className="flex-1 p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </main>
    </div>
  </div>
);
