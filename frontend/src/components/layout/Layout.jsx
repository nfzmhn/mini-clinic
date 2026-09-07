import { NavLink } from 'react-router-dom'
import './Layout.css'

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="flex flex-col">
          <div className="app-sidebar__brand">
            <img alt="Medvita" className="h-8 w-auto" src="/logo.png" />
            <div className="flex flex-col"><span className="text-sm font-bold text-[#001637]">Medvita</span><span className="text-[0.65rem] font-bold text-[#00677d] uppercase tracking-wider">Clinical OS</span></div>
          </div>
          <div className="app-sidebar__nav">
            <p className="app-sidebar__nav-title">Menu Loket</p>
            <nav className="flex flex-col gap-1">
              <NavLink to="/dashboard" className={({isActive}) => `app-sidebar__link ${isActive ? 'app-sidebar__link--active' : ''}`}><span className="material-symbols-outlined text-lg">dashboard</span>Dashboard</NavLink>
              <NavLink to="/patients" className={({isActive}) => `app-sidebar__link ${isActive ? 'app-sidebar__link--active' : ''}`}><span className="material-symbols-outlined text-lg">folder_shared</span>Data Pasien</NavLink>
            </nav>
          </div>
        </div>
        <div className="app-sidebar__bottom">
          <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#c4c6d0]/20 text-xs">
            <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-[#6ffbbe] animate-pulse" /><span className="font-bold text-[#001637]">Loket 01 - Online</span></div>
            <div className="flex items-center gap-1.5 text-[#44474f]"><span className="material-symbols-outlined text-sm text-[#6ffbbe]">verified</span>SATUSEHAT Terhubung</div>
          </div>
        </div>
      </aside>
      <div className="app-workspace">
        <header className="app-topbar">
          <div className="app-topbar__search"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747780] text-lg">search</span><input placeholder="Cari Pasien (NIK, No. RM, Nama)..." /></div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3"><img src="https://lh3.googleusercontent.com/aida/AEtjO1Up_4ZEgVRNDaLK2wVE1Rffv1L2dQr7yIHVQqoNT0P8BjFnjOpal7A0afbdfRNZ8VDmcABLXCGrWBNYlDMkRz5heYMRG_rAdImNufNPgK4o4t4vCqYpajPpTldMZdsinrEcUn04bZdRRNy6l9VDnbYHacKrLtKv-Btg9EY142J1XEvBEUxHIH0MiOr_NhJt4TXc9XlFQdjLDM7_gL2qenYzpy-xDMSiVtpc36dpLUPQYHgyxJ1JYl9YXUc" className="w-9 h-9 rounded-xl object-cover" /><div className="hidden lg:block text-xs leading-none"><span className="font-bold text-[#001637]">Anita Rahmawati</span><br/><span className="text-[#44474f]">Petugas Admisi</span></div></div>
          </div>
        </header>
        <main className="app-main"><div className="app-main__inner">{children}</div></main>
      </div>
    </div>
  )
}
