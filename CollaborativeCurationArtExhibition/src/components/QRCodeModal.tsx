import { QRCodeSVG } from 'qrcode.react';
import { X, Printer } from 'lucide-react';
import type { Guest } from '@/stores/guestStore';

interface Props {
  open: boolean;
  onClose: () => void;
  guest: Guest | null;
}

export default function QRCodeModal({ open, onClose, guest }: Props) {
  if (!open || !guest) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('qrcode-print-area');
    if (!printContent) return;
    const win = window.open('', '', 'width=400,height=500');
    if (!win) return;
    win.document.write(`
      <html><head><title>QR Code - ${guest.name}</title>
      <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;font-family:sans-serif;}</style>
      </head><body>${printContent.innerHTML}</body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-sm rounded-lg p-6" style={{ background: '#1e1e38', border: '1px solid #2a2a4e' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Playfair Display', color: '#c9a96e' }}>签到二维码</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10"><X size={18} style={{ color: '#888' }} /></button>
        </div>
        <div id="qrcode-print-area" className="flex flex-col items-center py-4">
          <div className="p-4 rounded-lg" style={{ background: '#ffffff' }}>
            <QRCodeSVG value={guest.qrcodeToken} size={180} />
          </div>
          <div className="mt-4 text-center">
            <div className="text-base font-semibold" style={{ color: '#f5f0eb' }}>{guest.name}</div>
            {guest.category && <div className="text-xs mt-1" style={{ color: '#c9a96e' }}>{guest.category}</div>}
            {guest.organization && <div className="text-xs mt-1" style={{ color: '#888' }}>{guest.organization}</div>}
          </div>
        </div>
        <div className="flex justify-center mt-2">
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm" style={{ border: '1px solid #c9a96e', color: '#c9a96e' }}>
            <Printer size={14} /> 打印二维码
          </button>
        </div>
      </div>
    </div>
  );
}
