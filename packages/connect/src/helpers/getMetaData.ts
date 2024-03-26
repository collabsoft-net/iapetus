
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const windowWithAJS = window as unknown as Window & { AJS: any };

export const getMetaData = (key: string) => {
  let result = windowWithAJS.AJS?.Meta?.get(key) as string || null;
  if (!result) {
    const meta = document.querySelector(`meta[name='${key}']`);
    if (meta) {
      result = meta.getAttribute('content');
    }
  }
  return result;
}