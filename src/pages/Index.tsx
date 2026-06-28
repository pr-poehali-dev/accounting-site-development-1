import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const HERO_IMG =
  'https://cdn.poehali.dev/projects/175413c5-7109-404b-8d40-74bda43251e5/files/3c38ed3a-6067-41da-81ca-226adf793e5a.jpg';

const THEMES = [
  { id: 'light', name: 'Светлая деловая', icon: 'Sun' },
  { id: 'dark', name: 'Тёмная элегантная', icon: 'Moon' },
  { id: 'emerald', name: 'Изумрудная', icon: 'Leaf' },
  { id: 'warm', name: 'Тёплая премиум', icon: 'Flame' },
];

const SERVICES = [
  { icon: 'Calculator', title: 'Бухгалтерский учёт', text: 'Полное ведение учёта, первичная документация и контроль операций.' },
  { icon: 'FileText', title: 'Налоговая отчётность', text: 'Подготовка и сдача деклараций, оптимизация налоговой нагрузки.' },
  { icon: 'Users', title: 'Кадры и зарплата', text: 'Расчёт зарплаты, кадровый учёт и отчётность в фонды.' },
  { icon: 'Briefcase', title: 'Регистрация бизнеса', text: 'Открытие ООО и ИП, подбор системы налогообложения «под ключ».' },
  { icon: 'ShieldCheck', title: 'Восстановление учёта', text: 'Приведём бухгалтерию в порядок и устраним ошибки за прошлые периоды.' },
  { icon: 'TrendingUp', title: 'Финансовый консалтинг', text: 'Анализ показателей и рекомендации для роста вашего бизнеса.' },
];

const STATS = [
  { value: '12+', label: 'лет на рынке' },
  { value: '350+', label: 'довольных клиентов' },
  { value: '100%', label: 'сдача в срок' },
  { value: '24/7', label: 'поддержка' },
];

const NAV = [
  { id: 'home', label: 'Главная' },
  { id: 'services', label: 'Услуги' },
  { id: 'about', label: 'О нас' },
  { id: 'contacts', label: 'Контакты' },
  { id: 'request', label: 'Заявка' },
];

const Index = () => {
  const [theme, setTheme] = useState('light');
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', price: '', comment: '' });
  const { toast } = useToast();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Заявка отправлена!',
      description: 'Мы свяжемся с вами в ближайшее время.',
    });
    setForm({ name: '', phone: '', price: '', comment: '' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Icon name="Landmark" size={22} className="text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-2xl font-bold">Сала-Консалт</div>
              <div className="text-[11px] tracking-widest text-muted-foreground uppercase">Бухгалтерия</div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => scrollTo(n.id)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Icon name="Palette" size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {THEMES.map((t) => (
                  <DropdownMenuItem key={t.id} onClick={() => setTheme(t.id)} className="gap-2 cursor-pointer">
                    <Icon name={t.icon} size={16} />
                    {t.name}
                    {theme === t.id && <Icon name="Check" size={14} className="ml-auto text-accent" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => scrollTo('request')} className="hidden sm:flex">
              Оставить заявку
            </Button>
            <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              <Icon name={menuOpen ? 'X' : 'Menu'} size={20} />
            </Button>
          </div>
        </div>
        {menuOpen && (
          <div className="lg:hidden border-t border-border bg-background animate-fade-in">
            <div className="container py-4 flex flex-col gap-1">
              {NAV.map((n) => (
                <button
                  key={n.id}
                  onClick={() => scrollTo(n.id)}
                  className="text-left py-2.5 text-sm font-medium hover:text-accent"
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="home" className="relative pt-32 pb-24 overflow-hidden">
        <div className="container grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
              <Icon name="MapPin" size={14} /> г. Грозный, Чеченская Республика
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] mb-6">
              Бухгалтерия,<br />которой <span className="text-accent">доверяют</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mb-8">
              Профессиональное сопровождение бизнеса: ведём учёт, считаем налоги и сдаём
              отчётность вовремя — пока вы развиваете своё дело.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={() => scrollTo('request')} className="gap-2">
                <Icon name="Send" size={18} /> Оставить заявку
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollTo('services')}>
                Наши услуги
              </Button>
            </div>
          </div>
          <div className="relative animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <div className="absolute -inset-4 hero-grad rounded-3xl opacity-10 blur-2xl" />
            <img
              src={HERO_IMG}
              alt="Офис Сала-Консалт"
              className="relative rounded-3xl shadow-2xl w-full object-cover aspect-[4/3]"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-4xl md:text-5xl font-bold text-accent">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-accent font-semibold tracking-wider uppercase text-sm">Услуги</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-2">Что мы делаем</h2>
            <p className="text-muted-foreground mt-4">Полный спектр бухгалтерских и финансовых услуг для бизнеса любого масштаба.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <div
                key={s.title}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-accent hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-5 group-hover:bg-accent transition-colors">
                  <Icon name={s.icon} size={26} className="text-primary group-hover:text-accent-foreground transition-colors" />
                </div>
                <h3 className="font-display text-2xl font-semibold mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 bg-secondary/40 border-y border-border">
        <div className="container grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="text-accent font-semibold tracking-wider uppercase text-sm">О нас</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-2 mb-6">
              Надёжный партнёр вашего бизнеса
            </h2>
            <p className="text-muted-foreground mb-4">
              «Сала-Консалт» — команда опытных бухгалтеров и финансовых консультантов из Грозного.
              Мы берём на себя всю рутину, чтобы вы могли сосредоточиться на главном.
            </p>
            <p className="text-muted-foreground mb-8">
              Гарантируем точность расчётов, конфиденциальность и сдачу отчётности строго в срок.
            </p>
            <div className="space-y-3">
              {['Индивидуальный подход к каждому клиенту', 'Полная финансовая ответственность', 'Прозрачные цены без скрытых платежей'].map((t) => (
                <div key={t} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <Icon name="Check" size={14} className="text-accent-foreground" />
                  </div>
                  <span className="text-sm font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: 'Award', t: 'Опыт', d: '12+ лет практики' },
              { icon: 'Lock', t: 'Безопасность', d: 'Полная конфиденциальность' },
              { icon: 'Clock', t: 'Скорость', d: 'Отвечаем в течение часа' },
              { icon: 'HeartHandshake', t: 'Доверие', d: '350+ клиентов с нами' },
            ].map((c) => (
              <div key={c.t} className="p-6 rounded-2xl bg-card border border-border">
                <Icon name={c.icon} size={28} className="text-accent mb-3" />
                <div className="font-display text-xl font-semibold">{c.t}</div>
                <div className="text-xs text-muted-foreground mt-1">{c.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Request + Contacts */}
      <section id="request" className="py-24">
        <div className="container grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <span className="text-accent font-semibold tracking-wider uppercase text-sm">Заявка</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-2 mb-6">Оставьте заявку</h2>
            <p className="text-muted-foreground mb-8">Укажите желаемую цену и комментарий — мы свяжемся с вами и обсудим детали.</p>
            <form onSubmit={submit} className="space-y-4">
              <Input
                placeholder="Ваше имя"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                placeholder="Телефон"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
              <Input
                placeholder="Ваша цена (₽)"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <Textarea
                placeholder="Комментарий — опишите вашу задачу"
                rows={4}
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
              />
              <Button type="submit" size="lg" className="w-full gap-2">
                <Icon name="Send" size={18} /> Отправить заявку
              </Button>
            </form>
          </div>

          {/* Contacts */}
          <div id="contacts">
            <span className="text-accent font-semibold tracking-wider uppercase text-sm">Контакты</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-2 mb-6">Связаться с нами</h2>
            <div className="space-y-4">
              {[
                { icon: 'Phone', t: 'Телефон', d: '+7 (928) 745-17-25', href: 'tel:+79287451725' },
                { icon: 'Mail', t: 'Email', d: 'info@sala-consult.ru', href: 'mailto:info@sala-consult.ru' },
                { icon: 'MapPin', t: 'Офис', d: 'г. Грозный, ул. Нурсултана Назарбаева, 92' },
                { icon: 'Clock', t: 'Режим работы', d: 'Пн – Пт: 10:00 – 18:00' },
              ].map((c) => (
                <a
                  key={c.t}
                  href={c.href || undefined}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border hover:border-accent transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <Icon name={c.icon} size={22} className="text-accent" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{c.t}</div>
                    <div className="font-semibold mt-0.5">{c.d}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="hero-grad text-primary-foreground">
        <div className="container py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-primary-foreground/15 flex items-center justify-center">
              <Icon name="Landmark" size={22} />
            </div>
            <div className="font-display text-2xl font-bold">Сала-Консалт</div>
          </div>
          <p className="text-sm opacity-80">© 2026 Сала-Консалт. Бухгалтерское сопровождение в Грозном.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
