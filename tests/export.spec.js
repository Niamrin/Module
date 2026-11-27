import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { handoffCourse } from "../src/handoff-course.js";

const hiddenText = "Только для автора: разбор задания";

function example(format) {
  const course = handoffCourse();
  course.format = format;
  const quiz = course.blocks.find(block => block.type === "quiz");
  quiz.data.attempts = 1;
  const tab = {
    id: "tab", title: "Задание", body: "",
    blocks: [
      { id: "details", type: "spoiler", data: { title: "Открыть задание", open: false, body: "", blocks: [quiz] } },
      { id: "private", type: "text", hidden: true, data: { body: hiddenText } },
    ],
  };
  course.blocks = course.blocks.map(block => block === quiz
    ? { id: "practice", type: "tabs", slideId: quiz.slideId, data: { tabs: [tab] } }
    : block);
  return course;
}

for (const standalone of [false, true]) {
  for (const format of ["page", "presentation"]) {
    test(`${standalone ? "Автономный" : "Веб"}-конструктор → ${format} → офлайн-урок`, async ({ page, context }, testInfo) => {
      const course = example(format);
      if (standalone) {
        await context.setOffline(true);
        await page.goto(pathToFileURL(resolve("dist/course_builder_vue3.html")).href);
      } else {
        await page.goto("./");
      }

      page.once("dialog", dialog => dialog.accept());
      await page.locator('input[accept*=".json"]').setInputFiles({
        name: "курс.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(course)),
      });
      await expect(page.locator(".course-head h1")).toHaveText(course.title);
      const downloadEvent = page.waitForEvent("download");
      await page.getByRole("button", { name: "HTML ↓" }).click();
      const download = await downloadEvent;
      expect(download.suggestedFilename()).toBe(course.title + ".html");
      const path = testInfo.outputPath("lesson.html");
      await download.saveAs(path);
      expect(await readFile(path, "utf8")).not.toContain(hiddenText);

      await context.setOffline(true);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(pathToFileURL(path).href);
      await expect(page).toHaveTitle(course.title);
      const next = page.getByRole("button", { name: "Далее →" });
      if (format === "presentation") {
        await expect(page.locator("h1")).toHaveText(course.slides[0].title);
        await next.click();
        await expect(page.locator("h1")).toHaveText(course.slides[1].title);
      } else {
        await expect(page.locator("h1")).toHaveText(course.title);
        await expect(page.locator(".slide-nav")).toHaveCount(0);
      }
      await expect(page.locator(".mapbox img")).toHaveJSProperty("complete", true);
      expect(await page.locator(".mapbox img").evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
      await page.getByRole("button", { name: "Что уже сделано" }).click();
      await expect(page.locator(".map-detail")).toContainText("Запрос на склад отправлен");
      if (format === "presentation") await next.click();

      await page.getByText("Открыть задание", { exact: true }).click();
      await page.getByRole("button", { name: "Начать тест" }).click();
      const answer = page.getByRole("radio", { name: /Ирина проверит/ });
      await answer.check();
      if (format === "presentation") {
        await next.click();
        await expect(page.locator("h1")).toHaveText(course.slides[3].title);
        await page.getByRole("button", { name: "← Назад" }).click();
        await expect(answer).toBeChecked();
      }
      await page.getByRole("button", { name: "Завершить тест" }).click();
      await expect(page.getByRole("status")).toContainText("Тест пройден");
      await expect(page.getByText("Попытки закончились.")).toBeVisible();
      if (format === "presentation") {
        await next.click();
        await page.getByRole("button", { name: "Завершить просмотр" }).click();
        await expect(page.locator("h1")).toHaveText("Просмотр завершён");
      }
    });
  }
}
