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
    <div className="w-full h-full bg-white relative overflow-hidden flex flex-col">
      <div className="w-full h-full overflow-hidden">
        <table className="w-full h-full border-collapse text-center table-fixed">
          <thead>
            <tr className="border-b border-[#e4e3f2]">
              <th className="bg-[#f2f1fb] py-3 md:py-5 px-2 md:px-4 font-bold text-[#323147] text-[10px] md:text-xs tracking-wider border-r border-[#e4e3f2] w-[20%] select-none">
                DAY
              </th>
              <th className="bg-white py-3 md:py-5 px-2 md:px-4 font-bold text-[#323147] text-[10px] md:text-xs tracking-wider border-r border-[#e4e3f2] w-[20%] select-none">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                  <FaYoutube className="text-[#ff0000] text-base md:text-lg" />
                  <span>YT</span>
                </div>
              </th>
              <th className="bg-white py-3 md:py-5 px-2 md:px-4 font-bold text-[#323147] text-[10px] md:text-xs tracking-wider border-r border-[#e4e3f2] w-[20%] select-none">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                  <FiCode className="text-[#3b82f6] text-base md:text-lg stroke-[3]" />
                  <span>DSA</span>
                </div>
              </th>
              <th className="bg-white py-3 md:py-5 px-2 md:px-4 font-bold text-[#323147] text-[10px] md:text-xs tracking-wider border-r border-[#e4e3f2] w-[20%] select-none">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                  <FaWalking className="text-[#22c55e] text-base md:text-lg" />
                  <span>WALK</span>
                </div>
              </th>
              <th className="bg-[#f2f1fb] py-3 md:py-5 px-2 md:px-4 font-bold text-[#7c3aed] text-[10px] md:text-xs tracking-wider w-[20%] select-none">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                  <FiPlusCircle className="text-[#7c3aed] text-base md:text-lg stroke-[2.5]" />
                  <span className="tracking-normal sm:tracking-wider">NEW LIST</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day} className="border-b border-[#e4e3f2] last:border-b-0">
                {/* DAY label cell */}
                <td className="bg-[#f2f1fb] py-3 md:py-6 px-2 md:px-4 font-bold text-[#323147] text-[10px] md:text-xs tracking-wider border-r border-[#e4e3f2] select-none">
                  {day}
                </td>
                
                {/* YT Checkbox */}
                <td className="bg-white py-3 md:py-6 px-2 md:px-4 border-r border-[#e4e3f2]">
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-[#b0afc5]/70 rounded-md bg-white cursor-pointer hover:border-slate-500 transition-colors" />
                  </div>
                </td>
                
                {/* DSA Checkbox */}
                <td className="bg-white py-3 md:py-6 px-2 md:px-4 border-r border-[#e4e3f2]">
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-[#b0afc5]/70 rounded-md bg-white cursor-pointer hover:border-slate-500 transition-colors" />
                  </div>
                </td>
                
                {/* WALK Checkbox */}
                <td className="bg-white py-3 md:py-6 px-2 md:px-4 border-r border-[#e4e3f2]">
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-[#b0afc5]/70 rounded-md bg-white cursor-pointer hover:border-slate-500 transition-colors" />
                  </div>
                </td>
                
                {/* NEW LIST Column cell (empty lavender cell) */}
                <td className="bg-[#f2f1fb] py-3 md:py-6 px-2 md:px-4">
                  {/* Empty spacer cell matching the lavender column styling */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Floating Overlay Controls */}
      {/* Bottom left Edit button */}
      <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 z-20">
        <button className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#9da1b4]/90 text-white flex items-center justify-center text-xs md:text-sm font-bold shadow-lg hover:bg-[#868aa0] hover:scale-105 active:scale-95 transition-all cursor-not-allowed" disabled>
          Edit
        </button>
      </div>

      {/* Bottom right Share/Upload button */}
      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-20">
        <button className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#9da1b4]/90 text-white flex items-center justify-center shadow-lg hover:bg-[#868aa0] hover:scale-105 active:scale-95 transition-all cursor-not-allowed" disabled>
          <FiUpload className="text-lg md:text-xl stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}

export default App;
