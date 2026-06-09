/**
 * Корректный URL для файлов из public/.
 * На GitHub Pages base = /имя-репозитория/, локально — /.
 */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL;
  const normalized = path.replace(/^\//, '');
  return `${base}${normalized}`;
}
