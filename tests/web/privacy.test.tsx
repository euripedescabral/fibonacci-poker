// @vitest-environment jsdom
import { it, expect } from "vitest";
import { render, cleanup } from "@testing-library/preact";
import { Privacy } from "../../apps/web/src/ui/privacy.js";
import { en } from "../../apps/web/src/i18n/en.js";
import { pt } from "../../apps/web/src/i18n/pt.js";
for (const [locale, dictionary] of [
  ["en", en],
  ["pt", pt],
] as const) {
  it(`provides operator, private contact and retention in ${locale}`, () => {
    try {
      const view = render(<Privacy t={(key) => dictionary[key]} />);
      expect(
        view.getByRole("heading", { name: dictionary.privacyTitle }),
      ).toBeTruthy();
      const contact = view.getByRole("link", {
        name: dictionary.privacyContact,
      });
      expect(contact.getAttribute("href")).toBe(
        "https://www.linkedin.com/in/euripedescabral",
      );
      expect(view.getByText(dictionary.privacyBackup)).toBeTruthy();
      expect(view.getByText(dictionary.privacyUnreleased)).toBeTruthy();
    } finally {
      cleanup();
    }
  });
}
