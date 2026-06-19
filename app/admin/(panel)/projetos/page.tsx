import { FolderKanban } from 'lucide-react';

export default function ProjetosPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-outfit text-3xl font-black tracking-tight text-white">
          Projetos
        </h1>
        <p className="text-gray-600 text-sm mt-1">Acompanhamento de projetos</p>
      </div>

      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
          <FolderKanban className="w-7 h-7 text-gray-700" />
        </div>
        <p className="text-sm font-bold text-gray-500">Em breve</p>
        <p className="text-xs text-gray-700 mt-1">Módulo de projetos em desenvolvimento</p>
      </div>
    </div>
  );
}
