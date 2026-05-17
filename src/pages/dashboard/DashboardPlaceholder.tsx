export default function DashboardPlaceholder({ title }: { title: string }) {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-display font-bold mb-2">{title} <span className="text-white/40">Section</span></h1>
      <div className="h-96 w-full rounded-[3rem] border border-white/5 bg-luxury-charcoal/20 flex flex-col items-center justify-center text-center p-10">
        <h3 className="text-2xl font-display font-bold text-white mb-2">Expanding Excellence</h3>
        <p className="text-white/40 max-w-xs transition-opacity">This section is being prepared for your elite management experience.</p>
      </div>
    </div>
  );
}
