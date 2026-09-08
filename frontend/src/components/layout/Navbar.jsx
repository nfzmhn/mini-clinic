import { useState } from 'react'

function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
}

export default function Navbar({ onAddPatient, onLogout }) {
  const [userMenu, setUserMenu] = useState(false)
  const user = getUser()

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-[#c4c6d0]/30 z-40 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <span className="text-xl font-headline font-bold text-[#001637]">Medvita Clinical OS</span>
        <span className="px-2 py-0.5 rounded-full bg-[#b3ebff] text-[#001f27] text-xs font-semibold">Dashboard Admisi</span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onAddPatient} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d2b56] text-white font-semibold text-sm shadow-md hover:bg-[#001637] transition-all">
          <span className="material-symbols-outlined">person_add</span> Tambah Pasien
        </button>
        <div className="relative">
          <button onClick={() => setUserMenu(!userMenu)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold">
            <div className="w-7 h-7 rounded-xl bg-[#0d2b56] flex items-center justify-center text-white font-bold text-sm">
              {(user?.username || 'P').slice(0, 1).toUpperCase()}
            </div>
            <span className="hidden sm:block">{user?.username || 'Petugas'}</span>
          </button>
          {userMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-[#c4c6d0]/30 py-1 z-50">
              <div className="px-4 py-2 border-b border-[#c4c6d0]/20">
                <p className="text-xs font-bold text-[#0b1c30]">{user?.username}</p>
                <p className="text-xs text-[#747780]">{user?.role}</p>
              </div>
              <button onClick={() => { setUserMenu(false); onLogout() }} className="w-full text-left px-4 py-2 text-sm text-[#ba1a1a] hover:bg-[#ffdad6] flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">logout</span> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}