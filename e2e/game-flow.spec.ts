import { expect, test } from "@playwright/test";

test.describe("Jogo do Duvido — fluxo completo", () => {
  test("home → reveal → timer → gabarito → início", async ({ page }) => {
    await page.goto("/");

    // Home
    await expect(page.getByRole("heading", { name: "Duvido!", level: 1 })).toBeVisible();
    await page.getByRole("button", { name: "Sortear categoria" }).click();

    // Reveal — the start button appears only after the suspense animation.
    const startTimer = page.getByRole("button", { name: "Iniciar timer" });
    await expect(startTimer).toBeVisible({ timeout: 5_000 });
    await startTimer.click();

    // Timer — countdown is shown; skip straight to the answer key.
    const reveal = page.getByRole("button", { name: "Revelar gabarito" });
    await expect(reveal).toBeVisible();
    await reveal.click();

    // Gabarito
    await expect(page.getByText("Gabarito oficial")).toBeVisible();
    await page.getByRole("button", { name: "Início" }).click();

    // Back home
    await expect(page.getByRole("heading", { name: "Duvido!", level: 1 })).toBeVisible();
  });

  test("preferências persistem a duração escolhida", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Preferências" }).click();
    await page.getByRole("button", { name: "90s", pressed: false }).click();
    await page.getByRole("button", { name: "Fechar" }).click();

    await page.reload();

    await page.getByRole("button", { name: "Preferências" }).click();
    await expect(page.getByRole("button", { name: "90s", pressed: true })).toBeVisible();
  });
});
