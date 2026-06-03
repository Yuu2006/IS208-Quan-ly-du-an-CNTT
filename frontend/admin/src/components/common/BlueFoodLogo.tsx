import { Leaf } from 'lucide-react';

type BlueFoodLogoProps = {
  compact?: boolean;
};

/** Hiển thị logo BlueFood với phong cách nền khối màu nhạt, có viền mảnh tinh tế. */
export function BlueFoodLogo({ compact = false }: BlueFoodLogoProps) {
  return (
    <div className={`flex shrink-0 items-center justify-center bg-sage-50 border border-sage-200 text-sage-700 ${compact ? 'h-10 w-10 rounded-xl' : 'h-16 w-16 rounded-[22px]'}`}>
      <Leaf size={compact ? 24 : 38} strokeWidth={1.8} />
    </div>
  );
}
