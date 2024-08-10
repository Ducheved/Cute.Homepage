type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
interface JsonObject {
  [key: string]: JsonValue;
}
interface JsonArray extends Array<JsonValue> {}

export const convertNumbersToStrings = (obj: JsonValue): JsonValue => {
  if (Array.isArray(obj)) {
    return obj.map(convertNumbersToStrings);
  } else if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] =
        typeof obj[key] === "number"
          ? obj[key].toString()
          : convertNumbersToStrings(obj[key]);
      return acc;
    }, {} as JsonObject);
  }
  return obj;
};
