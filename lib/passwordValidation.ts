export function validarSenhaForte(senha: string): string | null {
  if (senha.length < 10) return 'A senha precisa ter no mínimo 10 caracteres.';
  if (!/[A-Z]/.test(senha)) return 'A senha precisa ter pelo menos uma letra maiúscula.';
  if (!/[0-9]/.test(senha)) return 'A senha precisa ter pelo menos um número.';
  if (!/[^A-Za-z0-9]/.test(senha)) return 'A senha precisa ter pelo menos um caractere especial.';
  return null;
}
