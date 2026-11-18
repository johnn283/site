import React from 'react';
import { MessageCircle } from 'lucide-react';
import type { SiteSettings } from '../types/studio';

interface WhatsAppFloatingButtonProps {
  settings: SiteSettings;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({ settings }) => {
  const message = encodeURIComponent(
    'Olá J.A VOZ – Estúdio de Gravações! Vim pelo site e gostaria de solicitar um orçamento.'
  );
  const href = `https://wa.me/${settings.whatsapp_number}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Conversar no WhatsApp com ${settings.brand_name}`}
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-black/50 border border-emerald-400/30 px-4 py-3 sm:px-5 sm:py-3.5 transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
    >
      <MessageCircle className="w-5 h-5 shrink-0 fill-current" />
      <span className="hidden sm:inline text-sm font-semibold whitespace-nowrap">
        Falar no WhatsApp
      </span>
    </a>
  );
};
