import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export function ImagePreviewModal({ url, label, onClose }: { url: string; label: string; onClose: () => void }) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6" onClick={onClose}>
      <button onClick={onClose} className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
        <X className="h-5 w-5" />
      </button>
      <img src={url} alt={label} className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
      <span className="absolute bottom-8 rounded-full bg-black/50 px-4 py-1.5 text-sm font-medium text-white">{label}</span>
    </div>,
    document.body
  );
}
