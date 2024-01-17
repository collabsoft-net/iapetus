
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const windowWithAJS = window as unknown as Window & { AJS: any };

export const getMetaData = (key: string) => {
  return windowWithAJS.AJS?.Meta?.get(key) as string || null;
}