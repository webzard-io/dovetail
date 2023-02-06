export function informerLog(name: string, ...args: Parameters<typeof console.log>) {
  return console.log(`[DOVETAIL ${name}]`, ...args);
}
