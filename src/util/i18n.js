/**
 * Translate text
 *
 * Usage example: `t("Hello {name}", {name: 'John'})` will print:
 * es: 'Hola John'
 * en: 'Hello John'
 * ja: 'こんにちは John'
 *
 * The second argument is optional: `t("Hello")`
 *
 * @param {string} defaultText
 * @param {Record<string, string>|undefined} args
 * @returns {string}
 */
export function t(defaultText, args = undefined) {

  if (args) {
    Object.entries(args).forEach(([key, value]) => {
      defaultText = defaultText.replace(`{${key}}`, value);
    });
  }

  return defaultText;
}
