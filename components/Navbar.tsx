'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from './Logo';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Soluções', href: '/#servicos' },
    { name: 'Diferenciais', href: '/#diferenciais' },
    { name: 'Processo', href: '/#processo' },
    { name: 'Resultados', href: '/#impacto' },
  ];

  return (
    <nav
      id="navbar"
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4',
        isScrolled ? 'bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <Logo className="h-10 md:h-12 w-auto" />
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-1 backdrop-blur-md">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-all rounded-full hover:bg-white/5"
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <a 
            href="https://wa.me/5561920043098"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white/5 text-white border border-white/10 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            <MessageSquare className="w-4 h-4 text-cyan-400" /> WhatsApp
          </a>
          <a href="#diagnostico" className="relative group block">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative bg-white text-black px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 text-center">
              Diagnóstico
            </div>
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 bg-[#0A0A0A] border-b border-white/10 p-6 shadow-2xl"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-bold uppercase tracking-widest text-[#AAA] hover:text-white"
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
                <a 
                  href="#diagnostico"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-white text-black px-5 py-4 rounded-xl font-bold uppercase tracking-widest text-center text-sm block hover:bg-white/90 transition-all"
                >
                  Solicitar Diagnóstico
                </a>
                <a 
                  href="https://wa.me/5561920043098"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-white/5 text-white border border-white/10 px-5 py-4 rounded-xl font-bold uppercase tracking-widest text-center text-sm block hover:bg-white/10 transition-all"
                >
                  Falar no WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
