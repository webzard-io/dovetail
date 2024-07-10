export const ID_PROP = "__id__"

function uuidv4() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
      (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
  } else {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0,
        v = c == "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export function defineId(object: Record<string, unknown>, id?: string) {
  if (object[ID_PROP]) return;

  Object.defineProperty(object, ID_PROP, {
    value: id || uuidv4(),
    enumerable: false,
    writable: false,
  })
}
