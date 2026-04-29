type MessageTone = "error" | "info";

type MessageAlertProps = {
  tone?: MessageTone;
  title: string;
  message: string;
};

type EmptyStateProps = {
  title: string;
  message: string;
};

type SpinnerBlockProps = {
  label: string;
};

export function MessageAlert({
  tone = "info",
  title,
  message,
}: MessageAlertProps) {
  const className = tone === "error" ? "alert alert-error" : "alert alert-info";

  return (
    <div className={className} role={tone === "error" ? "alert" : "status"}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm opacity-90">{message}</p>
    </div>
  );
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <p className="text-lg font-semibold text-slate-900">{title}</p>
      <p className="mt-2 max-w-xl text-sm text-slate-600">{message}</p>
    </div>
  );
}

export function SpinnerBlock({ label }: SpinnerBlockProps) {
  return (
    <div
      className="panel flex items-center gap-3"
      role="status"
      aria-live="polite"
    >
      <span className="spinner" aria-hidden="true" />
      <p className="text-sm font-medium text-slate-700">{label}</p>
    </div>
  );
}

export function BooksSkeleton() {
  return (
    <div
      className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-hidden="true"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <article key={index} className="panel p-4">
          <div className="skeleton h-6 w-3/4" />
          <div className="mt-4 space-y-2">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
            <div className="skeleton h-4 w-4/6" />
          </div>
          <div className="mt-4 flex gap-2">
            <div className="skeleton h-8 w-24" />
            <div className="skeleton h-8 w-20" />
          </div>
        </article>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <section className="panel p-6">
        <div className="skeleton h-8 w-1/2" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="skeleton h-20 w-full" />
          ))}
        </div>
      </section>
      <section className="panel p-6">
        <div className="skeleton h-6 w-44" />
        <div className="mt-4 space-y-3">
          <div className="skeleton h-14 w-full" />
          <div className="skeleton h-14 w-full" />
        </div>
      </section>
    </div>
  );
}
