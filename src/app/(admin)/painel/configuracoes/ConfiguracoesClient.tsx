'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Building2, User, Bell, Shield, Loader2, Check, Trash2, Plus, Pencil, Eye, EyeOff, ArrowUp, ArrowDown, Upload, Link, Monitor, Tablet, Smartphone, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/base/button';
import { Input, Textarea } from '@/components/ui/base/input';
import { cn, maskPhoneInput, maskCnpjInput, maskCepInput, maskUfInput } from '@/lib/utils';
import { apiFetch } from '@/lib/api-client';

const TABS = [
  { id: 'perfil', label: 'Perfil', icon: User },
  { id: 'empresa', label: 'Empresa', icon: Building2 },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
  { id: 'seguranca', label: 'Segurança', icon: Shield },
  { id: 'banners', label: 'Banners', icon: ImageIcon },
];

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

type BannerItem = {
  id: string; title: string; subtitle: string | null; imageUrl: string;
  linkUrl: string | null; linkText: string | null; order: number; active: boolean;
};

type BannerFormData = {
  title: string; subtitle: string; imageUrl: string; linkUrl: string;
  linkText: string; active: boolean;
};

export function ConfiguracoesClient() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState('perfil');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const [profileName, setProfileName] = useState(session?.user?.name ?? '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [empresa, setEmpresa] = useState({
    name: '', cnpj: '', phone: '', email: '',
    address: '', city: '', state: '', cep: '',
    hoursWeekday: '', hoursSaturday: '', hoursSunday: '',
    instagram: '', facebook: '', youtube: '', logo: '', about: '',
  });
  const [empresaLoaded, setEmpresaLoaded] = useState(false);
  const [empresaLogoMode, setEmpresaLogoMode] = useState<'url' | 'upload'>('url');
  const [empresaUploading, setEmpresaUploading] = useState(false);
  const [empresaUploadPreview, setEmpresaUploadPreview] = useState<string | null>(null);
  const empresaFileRef = useRef<HTMLInputElement>(null);

  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [editingBannerId, setEditingBannerId] = useState<string | 'new' | null>(null);
  const [bannerForm, setBannerForm] = useState<BannerFormData>({ title: '', subtitle: '', imageUrl: '', linkUrl: '', linkText: 'Saiba mais', active: true });
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerImageMode, setBannerImageMode] = useState<'url' | 'upload'>('url');
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerUploadPreview, setBannerUploadPreview] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBanners = useCallback(async () => {
    setBannersLoading(true);
    try {
      const res = await fetch('/api/banners');
      if (res.ok) setBanners(await res.json());
    } catch { /* ignore */ } finally { setBannersLoading(false); }
  }, []);

  useEffect(() => { if (activeTab === 'banners') fetchBanners(); }, [activeTab, fetchBanners]);

  useEffect(() => {
    if (activeTab === 'empresa' && !empresaLoaded) {
      fetch('/api/settings/empresa')
        .then(r => r.json())
        .then(d => {
          const normalized = {
            ...d,
            phone: maskPhoneInput(d.phone ?? ''),
            cnpj: maskCnpjInput(d.cnpj ?? ''),
            cep: maskCepInput(d.cep ?? ''),
            state: maskUfInput(d.state ?? ''),
          };
          setEmpresa(prev => ({ ...prev, ...normalized }));
          if (d?.logo) setEmpresaLogoMode('url');
          setEmpresaLoaded(true);
        })
        .catch(() => setEmpresaLoaded(true));
    }
  }, [activeTab, empresaLoaded]);

  const resetBannerForm = () => {
    setEditingBannerId(null);
    setBannerForm({ title: '', subtitle: '', imageUrl: '', linkUrl: '', linkText: 'Saiba mais', active: true });
    setBannerImageMode('url');
    setBannerUploadPreview(null);
    setBannerError('');
  };

  const handleBannerUpload = async (file: File) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setBannerUploadPreview(preview);
    setBannerUploading(true);
    setBannerError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiFetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro no upload');
      setBannerForm(f => ({ ...f, imageUrl: data.url }));
    } catch (err) {
      setBannerUploadPreview(null);
      setBannerError(err instanceof Error ? err.message : 'Falha ao enviar imagem');
    } finally {
      setBannerUploading(false);
    }
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleBannerUpload(file);
  };

  const startEditBanner = (banner: BannerItem) => {
    setEditingBannerId(banner.id);
    setBannerForm({
      title: banner.title,
      subtitle: banner.subtitle ?? '',
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl ?? '',
      linkText: banner.linkText ?? 'Saiba mais',
      active: banner.active,
    });
    setBannerImageMode('url');
    setBannerUploadPreview(null);
  };

  const handleBannerSave = async () => {
    if (!bannerForm.title.trim() || !bannerForm.imageUrl.trim()) return;
    setBannerSaving(true);
    setBannerError('');
    try {
      const isNew = editingBannerId === 'new';
      const url = isNew ? '/api/banners' : `/api/banners/${editingBannerId}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify({
          ...bannerForm,
          subtitle: bannerForm.subtitle || undefined,
          linkUrl: bannerForm.linkUrl || undefined,
          linkText: bannerForm.linkText || undefined,
        }),
      });
      if (res.ok) {
        resetBannerForm();
        await fetchBanners();
      } else {
        const data = await res.json().catch(() => ({}));
        setBannerError(data.error ?? 'Erro ao salvar banner');
      }
    } catch {
      setBannerError('Erro de conexão ao salvar banner');
    } finally { setBannerSaving(false); }
  };

  const handleBannerDelete = async (id: string) => {
    if (!confirm('Excluir este banner?')) return;
    setBannerError('');
    try {
      const res = await apiFetch(`/api/banners/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchBanners();
      else setBannerError('Erro ao excluir banner');
    } catch { setBannerError('Erro de conexão ao excluir'); }
  };

  const handleBannerToggleActive = async (banner: BannerItem) => {
    setBannerError('');
    try {
      const res = await apiFetch(`/api/banners/${banner.id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: !banner.active }),
      });
      if (res.ok) await fetchBanners();
      else setBannerError('Erro ao alterar status');
    } catch { setBannerError('Erro de conexão'); }
  };

  const handleBannerReorder = async (id: string, direction: 'up' | 'down') => {
    const idx = banners.findIndex(b => b.id === id);
    if (idx === -1) return;
    const newItems = [...banners];
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= newItems.length) return;
    [newItems[idx], newItems[target]] = [newItems[target], newItems[idx]];
    const reordered = newItems.map((b, i) => ({ id: b.id, order: i }));
    setBanners(newItems);
    try {
      await apiFetch('/api/banners/' + newItems[0].id, {
        method: 'PATCH',
        body: JSON.stringify({ items: reordered }),
      });
    } catch { await fetchBanners(); }
  };

  const handleProfileSave = async () => {
    setSaveState('saving');
    setErrorMsg('');
    try {
      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: profileName }),
      });
      if (!res.ok) throw new Error('Falha ao salvar');
      await update({ name: profileName });
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } catch {
      setSaveState('error');
      setErrorMsg('Não foi possível salvar o perfil.');
    }
  };

  const handlePasswordSave = async () => {
    setErrorMsg('');
    if (newPassword !== confirmPassword) {
      setErrorMsg('As senhas não coincidem.');
      setSaveState('error');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg('A nova senha deve ter ao menos 8 caracteres.');
      setSaveState('error');
      return;
    }
    setSaveState('saving');
    try {
      const res = await apiFetch('/api/profile?action=password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Falha ao alterar senha');
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } catch (err) {
      setSaveState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao alterar senha.');
    }
  };

  const handleEmpresaUpload = async (file: File) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setEmpresaUploadPreview(preview);
    setEmpresaUploading(true);
    setBannerError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiFetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro no upload');
      setEmpresa(f => ({ ...f, logo: data.url }));
    } catch (err) {
      setEmpresaUploadPreview(null);
      setBannerError(err instanceof Error ? err.message : 'Falha ao enviar logo');
    } finally {
      setEmpresaUploading(false);
    }
  };

  const handleEmpresaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleEmpresaUpload(file);
  };

  const handleEmpresaSave = async () => {
    setSaveState('saving');
    setErrorMsg('');
    try {
      const fields: Record<string, string> = {};
      Object.entries(empresa).forEach(([k, v]) => { fields[`company_${k}`] = v ?? ''; });
      const res = await apiFetch('/api/settings/empresa', {
        method: 'PUT',
        body: JSON.stringify({ fields }),
      });
      if (!res.ok) {
         const data = await res.json().catch(() => ({}));
         throw new Error(data.error || 'Falha ao salvar');
      }
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } catch (err) {
      setSaveState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Não foi possível salvar os dados da empresa.');
    }
  };

  const handleSave = () => {
    if (activeTab === 'banners') return;
    if (activeTab === 'perfil') handleProfileSave();
    else if (activeTab === 'seguranca') handlePasswordSave();
    else if (activeTab === 'empresa') handleEmpresaSave();
    else {
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-ink-400 text-sm mt-1">Gerencie suas preferências e dados da empresa</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-56 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSaveState('idle'); setErrorMsg(''); }}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                  activeTab === tab.id
                    ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                    : 'text-ink-400 hover:text-white hover:bg-white/5 border border-transparent'
                )}
              >
                <tab.icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 bg-ink-900 rounded-2xl border border-white/5 p-6">
          {activeTab === 'perfil' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white mb-4">Dados do Perfil</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-300 font-bold text-2xl">
                  {profileName?.charAt(0) ?? 'A'}
                </div>
                <div>
                  <p className="text-white font-medium">{profileName || 'Administrador'}</p>
                  <p className="text-ink-500 text-sm">{session?.user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profile-name" className="text-xs text-ink-400 font-medium block mb-1.5">Nome</label>
                  <Input id="profile-name" value={profileName} onChange={e => setProfileName(e.target.value)} className="bg-ink-800 border-white/5" />
                </div>
                <div>
                  <label htmlFor="profile-email" className="text-xs text-ink-400 font-medium block mb-1.5">E-mail</label>
                  <Input id="profile-email" value={session?.user?.email ?? ''} disabled className="bg-ink-800 border-white/5" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'empresa' && (
            <div className="space-y-6">
              {!empresaLoaded ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-10 rounded-xl bg-ink-800/50 animate-pulse" />)}
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-1">Dados da Empresa</h2>
                    <p className="text-xs text-ink-500">Essas informações são exibidas no rodapé e nas páginas públicas do site.</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-ink-300 uppercase tracking-wider mb-3">Identificação</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="emp-name" className="text-xs text-ink-400 font-medium block mb-1.5">Nome da empresa</label>
                        <Input id="emp-name" value={empresa.name} onChange={e => setEmpresa(f => ({ ...f, name: e.target.value }))} placeholder="AutoPrime Seminovos" className="bg-ink-800 border-white/5" />
                      </div>
                      <div>
                        <label htmlFor="emp-cnpj" className="text-xs text-ink-400 font-medium block mb-1.5">CNPJ</label>
                        <Input id="emp-cnpj" value={empresa.cnpj} onChange={e => setEmpresa(f => ({ ...f, cnpj: maskCnpjInput(e.target.value) }))} placeholder="00.000.000/0001-00" className="bg-ink-800 border-white/5" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-ink-300 uppercase tracking-wider mb-3">Contato</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="emp-phone" className="text-xs text-ink-400 font-medium block mb-1.5">Telefone</label>
                        <Input id="emp-phone" value={empresa.phone} onChange={e => setEmpresa(f => ({ ...f, phone: maskPhoneInput(e.target.value) }))} placeholder="(11) 99999-0000" className="bg-ink-800 border-white/5" />
                      </div>
                      <div>
                        <label htmlFor="emp-email" className="text-xs text-ink-400 font-medium block mb-1.5">E-mail de contato</label>
                        <Input id="emp-email" type="email" value={empresa.email} onChange={e => setEmpresa(f => ({ ...f, email: e.target.value }))} placeholder="contato@autoprime.com.br" className="bg-ink-800 border-white/5" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-ink-300 uppercase tracking-wider mb-3">Endereço</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label htmlFor="emp-address" className="text-xs text-ink-400 font-medium block mb-1.5">Rua / Número</label>
                        <Input id="emp-address" value={empresa.address} onChange={e => setEmpresa(f => ({ ...f, address: e.target.value }))} placeholder="Av. Europa, 1000" className="bg-ink-800 border-white/5" />
                      </div>
                      <div>
                        <label htmlFor="emp-cep" className="text-xs text-ink-400 font-medium block mb-1.5">CEP</label>
                        <Input id="emp-cep" value={empresa.cep} onChange={e => setEmpresa(f => ({ ...f, cep: maskCepInput(e.target.value) }))} placeholder="01200-000" className="bg-ink-800 border-white/5" />
                      </div>
                      <div>
                        <label htmlFor="emp-city" className="text-xs text-ink-400 font-medium block mb-1.5">Cidade</label>
                        <Input id="emp-city" value={empresa.city} onChange={e => setEmpresa(f => ({ ...f, city: e.target.value }))} placeholder="São Paulo" className="bg-ink-800 border-white/5" />
                      </div>
                      <div>
                        <label htmlFor="emp-state" className="text-xs text-ink-400 font-medium block mb-1.5">Estado (UF)</label>
                        <Input id="emp-state" value={empresa.state} onChange={e => setEmpresa(f => ({ ...f, state: maskUfInput(e.target.value) }))} placeholder="SP" maxLength={2} className="bg-ink-800 border-white/5" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-ink-300 uppercase tracking-wider mb-3">Horário de funcionamento</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="emp-hw" className="text-xs text-ink-400 font-medium block mb-1.5">Seg–Sex</label>
                        <Input id="emp-hw" value={empresa.hoursWeekday} onChange={e => setEmpresa(f => ({ ...f, hoursWeekday: e.target.value }))} placeholder="08h às 18h" className="bg-ink-800 border-white/5" />
                      </div>
                      <div>
                        <label htmlFor="emp-hsat" className="text-xs text-ink-400 font-medium block mb-1.5">Sábado</label>
                        <Input id="emp-hsat" value={empresa.hoursSaturday} onChange={e => setEmpresa(f => ({ ...f, hoursSaturday: e.target.value }))} placeholder="09h às 14h" className="bg-ink-800 border-white/5" />
                      </div>
                      <div>
                        <label htmlFor="emp-hsun" className="text-xs text-ink-400 font-medium block mb-1.5">Domingo</label>
                        <Input id="emp-hsun" value={empresa.hoursSunday} onChange={e => setEmpresa(f => ({ ...f, hoursSunday: e.target.value }))} placeholder="Fechado" className="bg-ink-800 border-white/5" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-ink-300 uppercase tracking-wider mb-3">Redes sociais</p>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label htmlFor="emp-ig" className="text-xs text-ink-400 font-medium block mb-1.5">Instagram</label>
                        <Input id="emp-ig" value={empresa.instagram} onChange={e => setEmpresa(f => ({ ...f, instagram: e.target.value }))} placeholder="https://instagram.com/autoprime" className="bg-ink-800 border-white/5" />
                      </div>
                      <div>
                        <label htmlFor="emp-fb" className="text-xs text-ink-400 font-medium block mb-1.5">Facebook</label>
                        <Input id="emp-fb" value={empresa.facebook} onChange={e => setEmpresa(f => ({ ...f, facebook: e.target.value }))} placeholder="https://facebook.com/autoprime" className="bg-ink-800 border-white/5" />
                      </div>
                      <div>
                        <label htmlFor="emp-yt" className="text-xs text-ink-400 font-medium block mb-1.5">YouTube</label>
                        <Input id="emp-yt" value={empresa.youtube} onChange={e => setEmpresa(f => ({ ...f, youtube: e.target.value }))} placeholder="https://youtube.com/@autoprime" className="bg-ink-800 border-white/5" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-ink-300 uppercase tracking-wider mb-3">Sobre a empresa</p>
                    <Textarea
                      value={empresa.about}
                      onChange={e => setEmpresa(f => ({ ...f, about: e.target.value }))}
                      rows={3}
                      placeholder="Breve apresentação exibida no rodapé..."
                      className="bg-ink-800 border-white/5 w-full"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-ink-300 uppercase tracking-wider mb-3">Logo da empresa</p>

                    <div className="flex items-center gap-1 bg-ink-900 rounded-lg p-0.5 border border-white/5 w-fit mb-3">
                      <button
                        type="button"
                        onClick={() => setEmpresaLogoMode('url')}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                          empresaLogoMode === 'url' ? 'bg-primary-500/15 text-primary-400' : 'text-ink-400 hover:text-white'
                        )}
                      >
                        <Link className="h-3.5 w-3.5" /> URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmpresaLogoMode('upload')}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                          empresaLogoMode === 'upload' ? 'bg-primary-500/15 text-primary-400' : 'text-ink-400 hover:text-white'
                        )}
                      >
                        <Upload className="h-3.5 w-3.5" /> Upload
                      </button>
                    </div>

                    {empresaLogoMode === 'url' ? (
                      <Input value={empresa.logo} onChange={e => setEmpresa(f => ({ ...f, logo: e.target.value }))} placeholder="https://..." className="bg-ink-800 border-white/5" />
                    ) : (
                      <div className="flex items-center gap-3">
                        <input
                          ref={empresaFileRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
                          onChange={handleEmpresaFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => empresaFileRef.current?.click()}
                          disabled={empresaUploading}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink-900 border border-dashed border-ink-600 text-ink-300 text-sm hover:border-primary-500/50 hover:text-white transition-all disabled:opacity-50"
                        >
                          {empresaUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          {empresaUploading ? 'Enviando...' : 'Selecionar arquivo'}
                        </button>
                        {empresa.logo && !empresaUploading && (
                          <span className="text-xs text-success-400">Logo enviado ✓</span>
                        )}
                      </div>
                    )}

                    {(empresaUploadPreview || empresa.logo) && (
                      <div className="mt-3 inline-flex items-center justify-center bg-ink-950 border border-white/5 rounded-xl px-6 py-4">
                        {empresa.logo && !empresa.logo.endsWith('.svg') ? (
                          <img src={empresaUploadPreview || empresa.logo} alt="Logo preview" className="h-12 w-auto object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <span className="font-display uppercase tracking-[0.3em] text-sm font-light text-ink-100">
                            Auto<span className="font-black text-primary-500">Prime</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl bg-primary-500/5 border border-primary-500/10 p-4">
                    <p className="text-xs text-ink-400 leading-relaxed">
                      <span className="font-semibold text-primary-400">Dica:</span> Os dados salvos aqui atualizam automaticamente o rodapé e as informações de contato exibidas em todo o site público. O campo Telefone também alimenta os links de WhatsApp (botão flutuante e CTAs).
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'notificacoes' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white mb-4">Preferências de Notificação</h2>
              {[
                { label: 'Novos leads por e-mail', desc: 'Receba notificação quando um novo lead chegar' },
                { label: 'Veículos reservados', desc: 'Alerta quando um veículo for reservado' },
                { label: 'Relatório semanal', desc: 'Resumo de desempenho toda segunda-feira' },
                { label: 'Sistema atualizado', desc: 'Notificação de novas versões do sistema' },
              ].map(item => (
                <label key={item.label} className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="mt-1.5 h-4 w-4 rounded border-ink-600 text-primary-600 focus:ring-primary-500" />
                  <div>
                    <p className="text-white text-sm font-medium">{item.label}</p>
                    <p className="text-ink-500 text-xs">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {activeTab === 'seguranca' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white mb-4">Alterar Senha</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="cur-pw" className="text-xs text-ink-400 font-medium block mb-1.5">Senha atual</label>
                  <Input id="cur-pw" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" className="bg-ink-800 border-white/5" />
                </div>
                <div>
                  <label htmlFor="new-pw" className="text-xs text-ink-400 font-medium block mb-1.5">Nova senha</label>
                  <Input id="new-pw" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="bg-ink-800 border-white/5" />
                </div>
                <div>
                  <label htmlFor="conf-pw" className="text-xs text-ink-400 font-medium block mb-1.5">Confirmar nova senha</label>
                  <Input id="conf-pw" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="bg-ink-800 border-white/5" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'banners' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Gerenciar Banners</h2>
                {editingBannerId !== 'new' && (
                  <Button variant="primary" size="sm" onClick={() => { setEditingBannerId('new'); setBannerForm({ title: '', subtitle: '', imageUrl: '', linkUrl: '', linkText: 'Saiba mais', active: true }); setBannerImageMode('upload'); setBannerUploadPreview(null); }}>
                    <Plus className="h-4 w-4 mr-1.5" /> Novo Banner
                  </Button>
                )}
              </div>

              {(editingBannerId === 'new' || editingBannerId && editingBannerId !== 'new' && banners.find(b => b.id === editingBannerId)) && (
                <div className="bg-ink-800 rounded-xl border border-white/5 p-4 space-y-3 mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-ink-400 font-medium block mb-1">Título *</label>
                      <Input value={bannerForm.title} onChange={e => setBannerForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Oferta Imperdível" className="bg-ink-900 border-white/5" />
                    </div>
                    <div>
                      <label className="text-xs text-ink-400 font-medium block mb-1">Subtítulo</label>
                      <Input value={bannerForm.subtitle} onChange={e => setBannerForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Ex: Condições especiais esse mês" className="bg-ink-900 border-white/5" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs text-ink-400 font-medium block mb-1.5">Imagem *</label>

                      <div className="bg-ink-900 rounded-xl border border-white/5 p-3 mb-3 space-y-2">
                        <p className="text-[11px] font-semibold text-ink-300 uppercase tracking-wider">Dimensões recomendadas</p>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { icon: Monitor, label: 'Desktop', size: '1920 × 600px', ratio: '~3:1' },
                            { icon: Tablet, label: 'Tablet', size: '1024 × 400px', ratio: '~2.5:1' },
                            { icon: Smartphone, label: 'Mobile', size: '640 × 360px', ratio: '~16:9' },
                          ].map(item => (
                            <div key={item.label} className="flex items-start gap-2 p-2 rounded-lg bg-ink-800/50">
                              <item.icon className="h-3.5 w-3.5 text-ink-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[11px] font-medium text-ink-200">{item.label}</p>
                                <p className="text-[10px] text-ink-500">{item.size}</p>
                                <p className="text-[10px] text-ink-500">{item.ratio}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-ink-500 leading-relaxed">
                          Formatos: JPEG, PNG, WebP, AVIF. Tamanho máx: 10MB. Imagens serão otimizadas e convertidas para WebP automaticamente.
                        </p>
                      </div>

                      <div className="flex items-center gap-1 bg-ink-900 rounded-lg p-0.5 border border-white/5 w-fit mb-3">
                        <button
                          type="button"
                          onClick={() => setBannerImageMode('url')}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                            bannerImageMode === 'url' ? 'bg-primary-500/15 text-primary-400' : 'text-ink-400 hover:text-white'
                          )}
                        >
                          <Link className="h-3.5 w-3.5" /> URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setBannerImageMode('upload')}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                            bannerImageMode === 'upload' ? 'bg-primary-500/15 text-primary-400' : 'text-ink-400 hover:text-white'
                          )}
                        >
                          <Upload className="h-3.5 w-3.5" /> Upload
                        </button>
                      </div>

                      {bannerImageMode === 'url' ? (
                        <Input value={bannerForm.imageUrl} onChange={e => setBannerForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." className="bg-ink-900 border-white/5" />
                      ) : (
                        <div className="flex items-center gap-3">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            onChange={handleBannerFileChange}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={bannerUploading}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink-900 border border-dashed border-ink-600 text-ink-300 text-sm hover:border-primary-500/50 hover:text-white transition-all disabled:opacity-50"
                          >
                            {bannerUploading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                            {bannerUploading ? 'Enviando...' : 'Selecionar arquivo'}
                          </button>
                          {bannerForm.imageUrl && !bannerUploading && (
                            <span className="text-xs text-success-400">Imagem enviada ✓</span>
                          )}
                        </div>
                      )}

                      {(bannerUploadPreview || (bannerForm.imageUrl && bannerImageMode === 'url')) && (
                        <div className="mt-2 relative w-full aspect-[3/1] rounded-lg overflow-hidden bg-ink-900 border border-white/5">
                          <img
                            src={bannerUploadPreview || bannerForm.imageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-ink-400 font-medium block mb-1">Link (URL)</label>
                      <Input value={bannerForm.linkUrl} onChange={e => setBannerForm(f => ({ ...f, linkUrl: e.target.value }))} placeholder="https://..." className="bg-ink-900 border-white/5" />
                    </div>
                    <div>
                      <label className="text-xs text-ink-400 font-medium block mb-1">Texto do Link</label>
                      <Input value={bannerForm.linkText} onChange={e => setBannerForm(f => ({ ...f, linkText: e.target.value }))} placeholder="Saiba mais" className="bg-ink-900 border-white/5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="banner-active" checked={bannerForm.active} onChange={e => setBannerForm(f => ({ ...f, active: e.target.checked }))} className="h-4 w-4 rounded border-ink-600 text-primary-600 focus:ring-primary-500" />
                    <label htmlFor="banner-active" className="text-sm text-white">Ativo</label>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="primary" size="sm" onClick={handleBannerSave} disabled={bannerSaving || bannerUploading || !bannerForm.title.trim() || !bannerForm.imageUrl.trim()}>
                      {bannerSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                      {editingBannerId === 'new' ? 'Criar Banner' : 'Salvar'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={resetBannerForm}>Cancelar</Button>
                    {bannerError && <span className="text-red-400 text-xs font-medium ml-auto">{bannerError}</span>}
                  </div>
                </div>
              )}

              {bannerError && !editingBannerId && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                  {bannerError}
                </div>
              )}

              {bannersLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-ink-800/50 animate-pulse" />)}
                </div>
              ) : banners.length === 0 ? (
                <div className="text-center py-12 text-ink-500">
                  <div className="h-12 w-12 mx-auto mb-3 rounded-xl bg-ink-800" />
                  <p className="font-medium">Nenhum banner cadastrado</p>
                  <p className="text-sm mt-1">Clique em &quot;Novo Banner&quot; para começar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {banners.map((banner, idx) => (
                    <div key={banner.id} className="flex items-center gap-3 bg-ink-800/50 rounded-xl border border-white/5 p-3 group">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => handleBannerReorder(banner.id, 'up')} disabled={idx === 0} className="p-0.5 text-ink-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed">
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button onClick={() => handleBannerReorder(banner.id, 'down')} disabled={idx === banners.length - 1} className="p-0.5 text-ink-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed">
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-ink-900">
                        <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{banner.title}</p>
                        {banner.subtitle && <p className="text-ink-500 text-xs truncate">{banner.subtitle}</p>}
                      </div>
                      <button
                        onClick={() => handleBannerToggleActive(banner)}
                        className={cn('p-1.5 rounded-lg transition-colors', banner.active ? 'text-success-500 hover:text-success-400' : 'text-ink-500 hover:text-white')}
                        title={banner.active ? 'Desativar' : 'Ativar'}
                      >
                        {banner.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button onClick={() => startEditBanner(banner)} className="p-1.5 rounded-lg text-ink-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleBannerDelete(banner.id)} className="p-1.5 rounded-lg text-ink-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab !== 'banners' && (
            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-white/5">
              {saveState === 'saved' && (
                <span className="text-emerald-400 text-sm font-medium flex items-center gap-1.5">
                  <Check size={14} /> Salvo com sucesso!
                </span>
              )}
              {saveState === 'error' && (
                <span className="text-red-400 text-sm font-medium">{errorMsg}</span>
              )}
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={saveState === 'saving' || (activeTab === 'seguranca' && (!currentPassword || !newPassword || !confirmPassword))}
              >
                {saveState === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar alterações'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
