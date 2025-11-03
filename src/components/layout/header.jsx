import React, { useMemo } from 'react';
// Tambahkan 'useLocation' untuk membaca URL browser
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';

// Fungsi bantuan getGreeting (tidak berubah)
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

// Komponen ToggleGardenSelector (tidak berubah, sudah bagus)
const ToggleGardenSelector = ({ selected, onSelectionChange, options }) => {
    const [option1, option2] = options;
    return (
        <div className="relative flex w-60 items-center rounded-full bg-green-600 p-1">
            <span
                className={`absolute h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out`}
                style={{
                    transform: selected === option1 ? 'translateX(0)' : 'translateX(calc(100% + 4px))'
                }}
            />
            <button
                onClick={() => onSelectionChange(option1)}
                className={`relative z-10 flex-1 rounded-full py-1.5 text-sm font-bold transition-colors duration-300 ease-in-out focus:outline-none`}
                style={{ color: selected === option1 ? '#22c55e' : 'white' }}
            >
              {option1}
            </button>
            <button
              onClick={() => onSelectionChange(option2)}
              className={`relative z-10 flex-1 rounded-full py-1.5 text-sm font-bold transition-colors duration-300 ease-in-out focus:outline-none`}
              style={{ color: selected === option2 ? '#22c55e' : 'white' }}
            >
                {option2}
            </button>
        </div>
    );
};


const Header = ({ 
  onMenuClick,
  notifications = 15,
  user = { initials: "VG", name: "Admin" }
}) => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook untuk mendapatkan info URL
  const greeting = getGreeting();
  // Ubah nama opsi agar cocok dengan nama file/komponen
  const gardenOptions = ['Kasturi Lime', 'Key Lime'];

  // PERUBAHAN 1: Hapus `useState`. Tentukan kebun aktif dari URL.
  // Ini memastikan toggle selalu sinkron dengan halaman yang ditampilkan.
  const selectedGarden = useMemo(() => {
    if (location.pathname.includes('/key-lime')) {
      return 'Key Lime';
    }
    // Jadikan Kasturi sebagai default untuk semua rute overview lainnya
    return 'Kasturi Lime';
  }, [location.pathname]);

  // PERUBAHAN 2: Fungsi ini sekarang akan mengubah URL, bukan state lokal.
  const handleGardenChange = (garden) => {
    if (garden === 'Key Lime') {
      navigate('/overview/key-lime');
    } else if (garden === 'Kasturi Lime') {
      navigate('/overview/kasturi-lime');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick} 
            className="lg:hidden p-2 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {greeting}, <span className="font-semibold text-green-600">{user.name}</span>!
            </h1>
            <p className="hidden md:block text-sm text-slate-500">
              Welcome to your agricultural command center.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ToggleGardenSelector
            // PERUBAHAN 3: Gunakan state yang didapat dari URL
            selected={selectedGarden}
            onSelectionChange={handleGardenChange}
            options={gardenOptions}
          />
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="Notifications">
              <Bell className="w-6 h-6 text-slate-500" />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {notifications > 99 ? '99+' : notifications}
                </span>
              )}
            </button>
            <button className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-offset-white ring-transparent hover:ring-green-200 transition-all" aria-label="User profile">
              <span className="text-white text-sm font-bold">{user.initials}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;