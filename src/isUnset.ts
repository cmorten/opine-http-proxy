export function isUnset(val: unknown) {
  return (typeof val === "undefined" || val === "" || val === null);
}
