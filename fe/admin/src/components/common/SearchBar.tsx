import { Search } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  placeholder?: string;
}

export function SearchBar({ placeholder = 'Tìm kiếm lô hàng, tài khoản, audit log...' }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div 
      className={`relative w-full flex items-center bg-white border rounded-xl overflow-hidden transition-all duration-300 h-[38px] ${
        isFocused ? 'border-sage-500 ring-2 ring-sage-500/20 shadow-sm' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="pl-3 text-slate-400">
        <Search size={18} />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-slate-700 placeholder-slate-400"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
}
