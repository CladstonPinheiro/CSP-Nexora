'use client';

import { useEffect, useState } from 'react';

const WHATSAPP_NUMBER = '5561920043098';
const SITE_MESSAGE = 'Olá! Vim através do site da CSP Nexora e gostaria de saber mais sobre os serviços.';
const MAPS_MESSAGE = 'Olá! Vim através do Google Maps e gostaria de saber mais sobre os serviços.';

const ORIGEM_PARAM = 'origem';
const ORIGEM_MAPS_VALUE = 'maps';

export const WHATSAPP_SITE_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(SITE_MESSAGE)}`;
const WHATSAPP_MAPS_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(MAPS_MESSAGE)}`;

export function useWhatsappSiteLink(): string {
  const [link, setLink] = useState(WHATSAPP_SITE_LINK);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get(ORIGEM_PARAM) === ORIGEM_MAPS_VALUE) {
      setLink(WHATSAPP_MAPS_LINK);
    }
  }, []);

  return link;
}
