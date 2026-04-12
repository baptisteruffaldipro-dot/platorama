const MenuFormulas = () => {
  return (
    <div className="flex flex-col items-center gap-1 py-3 px-4">
      <div className="flex items-center gap-3 text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
        <span>Entrée / Plat / Dessert <strong className="text-accent">56€</strong></span>
        <span className="text-border">•</span>
        <span>Entrée / Plat ou Plat / Dessert <strong className="text-accent">48€</strong></span>
      </div>
    </div>
  );
};

export default MenuFormulas;
