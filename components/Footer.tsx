'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Mail, Globe, Youtube } from 'lucide-react';


const Footer = () => {
  return (
    <footer className="pt-32 pb-12 bg-black text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="space-y-8">
             <img src="/logo.png" alt="CSP Nexora" style={{ width: '140px', height: 'auto' }} className="object-contain" />
             <p className="text-gray-500 text-sm leading-relaxed max-w-xs italic">
                Sua parceira estratégica na jornada da automação inteligente. Criamos o futuro da sua operação com IA.
             </p>
             <div className="space-y-4">
                <h4 className="font-bold uppercase text-[10px] tracking-[0.3em] text-cyan-500">Redes Sociais</h4>
                <div className="flex gap-4">
                   <a 
                      href="https://www.instagram.com/csp_nexora/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-cyan-500 hover:text-black transition-all cursor-pointer"
                      title="Instagram"
                      id="footer-instagram"
                   >
                      <Instagram className="w-4 h-4" />
                   </a>
                   <a 
                      href="https://www.youtube.com/channel/UC7RHkQdtDzdHP-aIzrQl2tQ" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-cyan-500 hover:text-black transition-all cursor-pointer"
                      title="YouTube"
                      id="footer-youtube"
                   >
                      <Youtube className="w-4 h-4" />
                    </a>
                   <a 
                      href="https://www.facebook.com/cspnexora/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-cyan-500 hover:text-black transition-all cursor-pointer"
                      title="Facebook"
                      id="footer-facebook"
                   >
                      <Facebook className="w-4 h-4" />
                   </a>
                   <a 
                      href="https://wa.me/5561920043098" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-cyan-500 hover:text-black transition-all cursor-pointer"
                      title="WhatsApp"
                      id="footer-whatsapp"
                   >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                         <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.455h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                   </a>
                </div>
             </div>
          </div>

          <div className="space-y-8">
             <h4 className="font-bold uppercase text-[10px] tracking-[0.3em] text-cyan-500">Links Rápidos</h4>
             <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li>
                   <a href="/#servicos" className="hover:text-cyan-400 cursor-pointer transition-colors block">
                      Soluções
                   </a>
                </li>
                <li>
                   <a href="/#diferenciais" className="hover:text-cyan-400 cursor-pointer transition-colors block">
                      Diferenciais
                   </a>
                </li>
                <li>
                   <a href="/#processo" className="hover:text-cyan-400 cursor-pointer transition-colors block">
                      Como Funciona
                   </a>
                </li>
                <li>
                   <a href="/#impacto" className="hover:text-cyan-400 cursor-pointer transition-colors block">
                      Resultados
                   </a>
                </li>
             </ul>
          </div>

          <div className="space-y-8 lg:col-span-2">
             <h4 className="font-bold uppercase text-[10px] tracking-[0.3em] text-cyan-500">Contato</h4>
             <div className="grid md:grid-cols-2 gap-8 text-sm text-gray-500">
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-cyan-500" />
                      <span>contato@cspnexora.com.br</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 fill-cyan-500 shrink-0" viewBox="0 0 24 24">
                         <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.455h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      <span>(61) 92004-3098</span>
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-cyan-500" />
                      <span>cspnexora.com.br</span>
                   </div>
                   <div className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-center">
                      Brasília, DF
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
           <div className="flex gap-8">
              <span className="hover:text-white cursor-pointer transition-colors">Privacidade</span>
              <span className="hover:text-white cursor-pointer transition-colors">Termos</span>
           </div>
           <div>
              © 2026 CSP NEXORA. TODOS OS DIREITOS RESERVADOS.
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
