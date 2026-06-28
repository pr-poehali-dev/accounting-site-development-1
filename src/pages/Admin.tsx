import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  adminLogin,
  getRequests,
  getAdmins,
  addAdmin,
  updateRequestStatus,
} from '@/lib/api';

interface Request {
  id: number;
  name: string;
  phone: string;
  price?: string;
  comment?: string;
  status: string;
  created_at: string;
}
interface Admin {
  id: number;
  login: string;
  email: string;
  created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  done: 'Завершена',
};
const STATUS_COLOR: Record<string, string> = {
  new: 'bg-accent text-accent-foreground',
  in_progress: 'bg-secondary text-secondary-foreground',
  done: 'bg-primary text-primary-foreground',
};

const AdminPage = () => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [me, setMe] = useState<{ login: string } | null>(null);
  const [newAdmin, setNewAdmin] = useState({ login: '', email: '', password: '' });
  const { toast } = useToast();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const loadData = useCallback(async (t: string) => {
    const r = await getRequests(t);
    if (r.error) {
      setToken(null);
      localStorage.removeItem('admin_token');
      return;
    }
    setRequests(r.requests || []);
    setMe(r.me || null);
    const a = await getAdmins(t);
    setAdmins(a.admins || []);
  }, []);

  useEffect(() => {
    if (token) loadData(token);
  }, [token, loadData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await adminLogin(login, password);
    setLoading(false);
    if (res.token) {
      localStorage.setItem('admin_token', res.token);
      setToken(res.token);
    } else {
      toast({ title: 'Ошибка входа', description: res.error || 'Проверьте данные', variant: 'destructive' });
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setRequests([]);
    setAdmins([]);
  };

  const changeStatus = async (id: number, status: string) => {
    if (!token) return;
    await updateRequestStatus(token, id, status);
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const res = await addAdmin(token, newAdmin);
    if (res.success) {
      toast({ title: 'Администратор добавлен' });
      setNewAdmin({ login: '', email: '', password: '' });
      const a = await getAdmins(token);
      setAdmins(a.admins || []);
    } else {
      toast({ title: 'Ошибка', description: res.error, variant: 'destructive' });
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm animate-fade-in">
          <CardHeader className="text-center">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
              <Icon name="ShieldCheck" size={28} className="text-primary-foreground" />
            </div>
            <CardTitle className="font-display text-3xl">Админ-панель</CardTitle>
            <CardDescription>Сала-Консалт</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label>Логин</Label>
                <Input value={login} onChange={(e) => setLogin(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Пароль</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Вход…' : 'Войти'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Icon name="ShieldCheck" size={20} className="text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">Админ-панель</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{me?.login}</span>
            <Button variant="outline" size="sm" onClick={logout} className="gap-2">
              <Icon name="LogOut" size={16} /> Выйти
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Tabs defaultValue="requests">
          <TabsList className="mb-6">
            <TabsTrigger value="requests" className="gap-2">
              <Icon name="Inbox" size={16} /> Заявки
              <Badge variant="secondary">{requests.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="admins" className="gap-2">
              <Icon name="Users" size={16} /> Администраторы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-2xl">Заявки клиентов</CardTitle>
                <CardDescription>Все обращения с сайта</CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Заявок пока нет</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Имя</TableHead>
                          <TableHead>Телефон</TableHead>
                          <TableHead>Цена</TableHead>
                          <TableHead>Комментарий</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {requests.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="font-medium">{r.name}</TableCell>
                            <TableCell>{r.phone}</TableCell>
                            <TableCell>{r.price ? `${r.price} ₽` : '—'}</TableCell>
                            <TableCell className="max-w-[200px] truncate text-muted-foreground">{r.comment || '—'}</TableCell>
                            <TableCell>
                              <Badge className={STATUS_COLOR[r.status]}>{STATUS_LABEL[r.status] || r.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {r.status !== 'in_progress' && (
                                  <Button size="sm" variant="outline" onClick={() => changeStatus(r.id, 'in_progress')}>
                                    В работу
                                  </Button>
                                )}
                                {r.status !== 'done' && (
                                  <Button size="sm" variant="outline" onClick={() => changeStatus(r.id, 'done')}>
                                    Завершить
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admins">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Список администраторов</CardTitle>
                  <CardDescription>Кто имеет доступ к панели</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {admins.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <Icon name="User" size={18} className="text-accent" />
                      </div>
                      <div>
                        <div className="font-medium">{a.login}</div>
                        <div className="text-xs text-muted-foreground">{a.email}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Добавить администратора</CardTitle>
                  <CardDescription>Новый логин, почта и пароль</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddAdmin} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Логин</Label>
                      <Input value={newAdmin.login} onChange={(e) => setNewAdmin({ ...newAdmin, login: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Пароль</Label>
                      <Input type="text" value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} required />
                    </div>
                    <Button type="submit" className="w-full gap-2">
                      <Icon name="UserPlus" size={16} /> Добавить
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPage;
