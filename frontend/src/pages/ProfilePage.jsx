import { useEffect, useMemo, useState } from "react";
import { LogOut, ShieldCheck, Sparkles, Check, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getProfileStats, updateProfile, changePassword, setPrefs } from "@/api/auth";
import { PREFERENCE_OPTIONS } from "@/lib/recipeAdapters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function avatarColor(seed = "") {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 92%)`;
}

export default function ProfilePage() {
  const { usuario, updateUsuario, signOut } = useAuth();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [nombre, setNombre] = useState(usuario?.nombre || "");
  const [email, setEmail] = useState(usuario?.email || "");
  const [preferences, setPreferences] = useState(new Set(usuario?.preferencias || []));
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setNombre(usuario?.nombre || "");
    setEmail(usuario?.email || "");
    setPreferences(new Set(usuario?.preferencias || []));
  }, [usuario]);

  useEffect(() => {
    setLoadingStats(true);
    getProfileStats()
      .then((data) => {
        setStats(data);
      })
      .catch(() => toast.error("No pudimos cargar tu resumen."))
      .finally(() => setLoadingStats(false));
  }, []);

  const activePreferences = useMemo(() => [...preferences], [preferences]);
  const initials = (usuario?.nombre || usuario?.email || "").trim().slice(0, 2).toUpperCase();
  const avatarBg = avatarColor(usuario?.email || usuario?.nombre || "");

  const togglePreference = (key) => {
    const next = new Set(preferences);
    next.has(key) ? next.delete(key) : next.add(key);
    setPreferences(next);
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {};
      if (nombre !== usuario?.nombre) payload.nombre = nombre;
      if (email && email !== usuario?.email) payload.email = email;

      if (Object.keys(payload).length === 0) {
        toast.info("No hay cambios en el perfil.");
        return;
      }

      const { usuario: updated } = await updateProfile(payload);
      updateUsuario(updated);
      toast.success("Perfil actualizado.");
    } catch (error) {
      toast.error(error.response?.data?.error || "No se pudo actualizar el perfil.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    try {
      const prefs = activePreferences;
      const res = await setPrefs(prefs);
      updateUsuario({ preferencias: res.preferencias });
      toast.success("Preferencias guardadas.");
    } catch (error) {
      toast.error(error.response?.data?.error || "No se pudo guardar.");
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({ current_password: currentPassword, new_password: newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Contraseña actualizada.");
    } catch (error) {
      toast.error(error.response?.data?.error || "No se pudo actualizar la contraseña.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="container-app py-8 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div
            className="h-14 w-14 rounded-2xl grid place-items-center num-mono text-lg font-semibold text-ink"
            style={{ backgroundColor: avatarBg }}
          >
            {initials || <User className="h-6 w-6 text-ink-soft" />}
          </div>
          <div>
            <p className="eyebrow text-ink-soft">Tu perfil</p>
            <h1 className="display-sm leading-tight">{usuario?.nombre || "Cuenta Mercadona"}</h1>
            <p className="text-sm text-ink-soft">{usuario?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={signOut} className="gap-2" data-testid="logout-button">
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-paper-raised border border-rule rounded-xl p-4 animate-pulse h-28" />
          ))
        ) : (
          <>
            <StatCard label="Favoritas" value={stats?.stats?.favoritos_total || 0} icon={Sparkles} />
            <StatCard label="Productos en lista" value={stats?.stats?.items_totales || 0} icon={Check} />
            <StatCard label="Pendientes" value={stats?.stats?.items_pendientes || 0} icon={ShieldCheck} />
            <StatCard label="Listas creadas" value={stats?.stats?.listas_totales || 0} icon={User} />
          </>
        )}
      </div>

      <section className="bg-paper-raised border border-rule rounded-2xl p-6 space-y-5">
        <header className="flex items-center justify-between">
          <div>
            <p className="eyebrow text-ink-soft">Preferencias</p>
            <h2 className="text-lg font-semibold">Dietas y restricciones</h2>
          </div>
          <Button size="sm" onClick={handleSavePrefs} disabled={savingPrefs} className="gap-2">
            {savingPrefs ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Guardar
          </Button>
        </header>
        <div className="flex flex-wrap gap-2">
          {PREFERENCE_OPTIONS.map((option) => {
            const active = preferences.has(option.key);
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => togglePreference(option.key)}
                className={`px-3 h-9 rounded-full text-sm border transition-colors ${
                  active ? "bg-ink text-paper border-ink" : "bg-paper text-ink border-rule hover:border-ink"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="bg-paper-raised border border-rule rounded-2xl p-6 space-y-4">
          <div>
            <p className="eyebrow text-ink-soft">Datos personales</p>
            <h2 className="text-lg font-semibold">Información básica</h2>
          </div>
          <form className="space-y-4" onSubmit={handleSaveProfile}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink">Nombre</label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={savingProfile} className="gap-2">
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Guardar cambios
              </Button>
              <Button type="button" variant="ghost" onClick={() => { setNombre(usuario?.nombre || ""); setEmail(usuario?.email || ""); }}>
                Restablecer
              </Button>
            </div>
          </form>
        </section>

        <section className="bg-paper-raised border border-rule rounded-2xl p-6 space-y-4">
          <div>
            <p className="eyebrow text-ink-soft">Seguridad</p>
            <h2 className="text-lg font-semibold">Contraseña</h2>
          </div>
          <form className="space-y-4" onSubmit={handleChangePassword}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink">Contraseña actual</label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink">Nueva contraseña</label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink">Repetir contraseña</label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />
            </div>
            <Button type="submit" disabled={savingPassword} className="gap-2">
              {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Actualizar contraseña
            </Button>
          </form>
        </section>
      </div>

      <section className="bg-paper-raised border border-rule rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-ink" />
          <div>
            <p className="text-sm font-semibold text-ink">Zona segura</p>
            <p className="text-sm text-ink-soft">Controla tu sesión y tus datos. Eliminación de cuenta no habilitada.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={signOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-paper-raised border border-rule rounded-2xl p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-mercadona/10 text-mercadona grid place-items-center">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-ink-soft">{label}</p>
        <p className="text-xl font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}
