export function getImageUrl(path: string | undefined | null): string {
  // Handle null/undefined paths
  if (!path) {
    return '';
  }
  
  // If the path is already absolute (starts with http/https), return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If path doesn't start with /, add it
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  
  // In development, return the path as is (Vite will handle it)
  // In production, this will work with the static files
  return path;
}