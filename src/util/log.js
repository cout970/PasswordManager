/**
 * Temporary log function to replace console.error()
 * Allows for easier debugging and removal of unneeded console.error() calls
 * @param any
 */
export function report_error(...any) {
  console.error(...any);
}
