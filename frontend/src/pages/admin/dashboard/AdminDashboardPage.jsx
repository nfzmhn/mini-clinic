import { NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../../services/api'
import './AdminDashboardPage.css'

function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const user = getUser()

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard')
      return data?.data || data
    },
  })

  const { data: usersData } = useQuery({
    queryKey: ['users-count'],
    queryFn: async () => {
      const { data } = await api.get('/users')
      return Array.isArray(data) ? data : (data?.data || [])
    },
  })

  const userCount = Array.isArray(usersData) ? usersData.length : 0
  const doctorCount = Array.isArray(usersData) ? usersData.filter(u => u.role === 'DOCTOR').length : 0
  const staffCount = Array.isArray(usersData) ? usersData.filter(u => u.role === 'REGISTRATION_OFFICER').length : 0

  const stats = isLoading ? [] : [
    { label: 'Total Pasien Terdaftar', value: String(statsData?.patients ?? '-'), sub: 'Database MySQL aktif', icon: 'group', color: 'bg-[#b3ebff]/30 text-[#00677d]' },
    { label: 'Pengguna Sistem', value: String(userCount), sub: `${doctorCount} Dokter • ${staffCount} Petugas`, icon: 'badge', color: 'bg-[#d7e2ff] text-[#001637]' },
    { label: 'Poliklinik Aktif', value: String(statsData?.polis ?? '-'), sub: 'Unit layanan aktif', icon: 'local_hospital', color: 'bg-[#50d9fe]/20 text-[#005c70]' },
    { label: 'Kunjungan Hari Ini', value: String(statsData?.registrations ?? '-'), sub: `${statsData?.menunggu ?? '-'} antrean pending`, icon: 'monitor_heart', color: 'bg-[#6ffbbe]/30 text-[#005236]' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="flex flex-col">
          <div className="h-16 px-6 flex items-center gap-3 bg-white border-b border-[#c4c6d0]/20">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white"><span className="material-symbols-outlined text-[20px]">admin_panel_settings</span></div>
            <div className="flex flex-col"><span className="font-headline text-[0.95rem] font-bold text-primary tracking-tight">MEDVITA ADMIN</span><span className="text-[10px] uppercase tracking-widest text-secondary font-bold">Master Control</span></div>
          </div>
          <div className="p-4">
            <div className="p-3 bg-[#e5eeff] rounded-xl flex items-center justify-between">
              <div className="flex flex-col"><span className="text-[0.7rem] font-bold text-[#44474f] uppercase tracking-wider">Login Sebagai</span><span className="text-sm font-bold text-primary">{user?.username || 'Admin'}</span></div>
            </div>
          </div>
          <nav className="px-3 space-y-1">
            <NavLink to="/admin/dashboard" end className={({isActive}) => `admin-nav-link ${isActive ? 'admin-nav-link--active' : ''}`}><span className="material-symbols-outlined text-[20px]">dashboard</span>Dashboard Sistem</NavLink>
            <NavLink to="/admin/patients" className={({isActive}) => `admin-nav-link ${isActive ? 'admin-nav-link--active' : ''}`}><span className="material-symbols-outlined text-[20px]">group</span>Master Data Pasien</NavLink>
            <NavLink to="/admin/polis" className={({isActive}) => `admin-nav-link ${isActive ? 'admin-nav-link--active' : ''}`}><span className="material-symbols-outlined text-[20px]">local_hospital</span>Master Poliklinik</NavLink>
            <NavLink to="/admin/users" className={({isActive}) => `admin-nav-link ${isActive ? 'admin-nav-link--active' : ''}`}><span className="material-symbols-outlined text-[20px]">badge</span>Manajemen Pengguna</NavLink>
            <button onClick={handleLogout} className="admin-nav-link admin-nav-link--danger mt-4 w-full text-left"><span className="material-symbols-outlined text-[20px]">logout</span>Keluar Sistem</button>
          </nav>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="flex items-center gap-3"><span className="text-sm font-bold text-primary">Dashboard Administrasi Sistem</span></div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="text-right leading-none"><span className="text-sm font-bold text-primary">{user?.username || 'Admin'}</span><br/><span className="text-xs text-[#44474f]">Administrator</span></div>
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                {(user?.username || 'A').slice(0, 1).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <div>
            <h1 className="font-headline text-2xl font-bold text-primary">Selamat Datang, {user?.username || 'Administrator'}</h1>
            <p className="text-sm text-[#44474f]">Pusat kontrol untuk manajemen data master, pengguna, dan operasional klinis.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#c4c6d0]/30 shadow-sm p-5 animate-pulse h-24" />
              ))
            ) : (
              stats.map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-[#c4c6d0]/30 shadow-sm p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-[#44474f]">{s.label}</span>
                    <div className="text-3xl font-bold font-headline text-primary mt-1">{s.value}</div>
                    <span className="text-xs font-semibold text-[#00677d] mt-1 block">{s.sub}</span>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.color}`}><span className="material-symbols-outlined text-2xl">{s.icon}</span></div>
                </div>
              ))
            )}
          </div>

          <section className="bg-white rounded-2xl border border-[#c4c6d0]/30 shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary">rocket_launch</span><h3 className="font-headline font-bold text-primary">Akses Cepat Master Data</h3></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <NavLink to="/admin/patients" className="p-4 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] flex items-center gap-3 transition-all">
                <div className="w-10 h-10 rounded-lg bg-white text-primary flex items-center justify-center"><span className="material-symbols-outlined">group</span></div>
                <div><div className="text-sm font-bold text-primary">Master Pasien</div><div className="text-xs text-[#44474f]">Kelola identitas & rekam medis</div></div>
              </NavLink>
              <NavLink to="/admin/users" className="p-4 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] flex items-center gap-3 transition-all">
                <div className="w-10 h-10 rounded-lg bg-white text-primary flex items-center justify-center"><span className="material-symbols-outlined">badge</span></div>
                <div><div className="text-sm font-bold text-primary">Manajemen Pengguna</div><div className="text-xs text-[#44474f]">Akun Dokter, Petugas, Admin</div></div>
              </NavLink>
              <NavLink to="/admin/polis" className="p-4 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] flex items-center gap-3 transition-all">
                <div className="w-10 h-10 rounded-lg bg-white text-primary flex items-center justify-center"><span className="material-symbols-outlined">local_hospital</span></div>
                <div><div className="text-sm font-bold text-primary">Master Poliklinik</div><div className="text-xs text-[#44474f]">Kelola unit poli & jadwal</div></div>
              </NavLink>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
