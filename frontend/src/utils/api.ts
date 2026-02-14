export const getApiUrl = (path: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};
