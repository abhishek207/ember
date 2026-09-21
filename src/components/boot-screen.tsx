export function BootScreen() {
  return (
    <div className="scene-home flex h-dvh flex-col items-center justify-center text-foreground">
      <div className="flex flex-col items-center gap-5">
        <div className="relative grid size-16 place-items-center rounded-2xl bg-card/80 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
          <span className="ember-core block size-3.5 rounded-full bg-foreground" />
          <span className="pointer-events-none absolute inset-2 rounded-full border-2 border-primary" />
        </div>
        <div className="text-center">
          <p className="font-display text-3xl font-medium tracking-tight">Ember</p>
          <p className="mt-1 text-sm text-muted-foreground">A healthier you is still in you.</p>
        </div>
      </div>
    </div>
  );
}
