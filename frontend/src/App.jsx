import { FaYoutube, FaWalking } from 'react-icons/fa';
import { FiCode, FiPlusCircle, FiUpload } from 'react-icons/fi';

function App() {
  const days = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY'
  ];

  return (
    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-[#e4e3f2] relative overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-center">
          <thead>
            <tr className="border-b border-[#e4e3f2]">
              <th className="bg-[#f2f1fb] py-5 px-4 font-bold text-[#323147] text-xs tracking-wider border-r border-[#e4e3f2] w-[20%] select-none">
                DAY
              </th>
              <th className="bg-white py-5 px-4 font-bold text-[#323147] text-xs tracking-wider border-r border-[#e4e3f2] w-[20%] select-none">
                <div className="flex items-center justify-center gap-2">
                  <FaYoutube className="text-[#ff0000] text-lg" />
                  <span>YT</span>
                </div>
              </th>
              <th className="bg-white py-5 px-4 font-bold text-[#323147] text-xs tracking-wider border-r border-[#e4e3f2] w-[20%] select-none">
                <div className="flex items-center justify-center gap-2">
                  <FiCode className="text-[#3b82f6] text-lg stroke-[3]" />
                  <span>DSA</span>
                </div>
              </th>
              <th className="bg-white py-5 px-4 font-bold text-[#323147] text-xs tracking-wider border-r border-[#e4e3f2] w-[20%] select-none">
                <div className="flex items-center justify-center gap-2">
                  <FaWalking className="text-[#22c55e] text-lg" />
                  <span>WALK</span>
                </div>
              </th>
              <th className="bg-[#f2f1fb] py-5 px-4 font-bold text-[#7c3aed] text-xs tracking-wider w-[20%] select-none">
                <div className="flex items-center justify-center gap-2">
                  <FiPlusCircle className="text-[#7c3aed] text-lg stroke-[2.5]" />
                  <span>NEW LIST</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day} className="border-b border-[#e4e3f2] last:border-b-0">
                {/* DAY label cell */}
                <td className="bg-[#f2f1fb] py-6 px-4 font-bold text-[#323147] text-xs tracking-wider border-r border-[#e4e3f2] select-none">
                  {day}
                </td>
                
                {/* YT Checkbox */}
                <td className="bg-white py-6 px-4 border-r border-[#e4e3f2]">
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#b0afc5]/70 rounded-md bg-white cursor-pointer hover:border-slate-500 transition-colors" />
                  </div>
                </td>
                
                {/* DSA Checkbox */}
                <td className="bg-white py-6 px-4 border-r border-[#e4e3f2]">
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#b0afc5]/70 rounded-md bg-white cursor-pointer hover:border-slate-500 transition-colors" />
                  </div>
                </td>
                
                {/* WALK Checkbox */}
                <td className="bg-white py-6 px-4 border-r border-[#e4e3f2]">
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#b0afc5]/70 rounded-md bg-white cursor-pointer hover:border-slate-500 transition-colors" />
                  </div>
                </td>
                
                {/* NEW LIST Column cell (empty lavender cell) */}
                <td className="bg-[#f2f1fb] py-6 px-4">
                  {/* Empty spacer cell matching the lavender column styling */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Floating Overlay Controls */}
      {/* Bottom left Edit button */}
      <div className="absolute bottom-6 left-6 z-20">
        <button className="w-16 h-16 rounded-full bg-[#9da1b4]/90 text-white flex items-center justify-center text-sm font-bold shadow-lg hover:bg-[#868aa0] hover:scale-105 active:scale-95 transition-all cursor-not-allowed" disabled>
          Edit
        </button>
      </div>

      {/* Bottom right Share/Upload button */}
      <div className="absolute bottom-6 right-6 z-20">
        <button className="w-16 h-16 rounded-full bg-[#9da1b4]/90 text-white flex items-center justify-center shadow-lg hover:bg-[#868aa0] hover:scale-105 active:scale-95 transition-all cursor-not-allowed" disabled>
          <FiUpload className="text-xl stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}

export default App;
