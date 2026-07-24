'use client';

import { MessageCircle } from 'lucide-react';

const DEFAULT_MESSAGE = 'Olá! Encontrei sua empresa e gostaria de apresentar uma solução para vocês.';

export function buildWhatsappUrl(phone: string | null): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length <= 11) digits = `55${digits}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
}

export function WhatsAppButton({
  phone,
  className,
  label,
}: {
  phone: string | null;
  className?: string;
  label?: string;
}) {
  const url = buildWhatsappUrl(phone);
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      title="Chamar no WhatsApp"
      className={
        className ??
        'shrink-0 w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 hover:bg-green-500/20 transition-all'
      }
    >
      <MessageCircle className="w-3.5 h-3.5" />
      {label && label}
    </a>
  );
}
