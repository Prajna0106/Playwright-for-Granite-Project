import { expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { test } from "../fixtures";
import { TASKS_TABLE_SELECTORS } from "../constants/selectors";
import { COMMON_TEXTS } from "../constants/texts";

test.describe("Comments Page", () => {
  let comment = faker.lorem.sentence(5);
  let comment2 = faker.lorem.sentence(5);
  let taskName = faker.word.words(3);
  let assigneeEmail = process.env.STANDARD_EMAIL;
  let creatorEmail = process.env.ADMIN_EMAIL;
  let password = process.env.ADMIN_PASSWORD;

  test.beforeEach(async ({ page, taskPage }, testInfo) => {
    await test.step("Step 0: Go to dashboard", () => page.goto("/"));
    if (testInfo.title.includes(COMMON_TEXTS.skipSetup)) return;
    await test.step("Step 1: Create a new task", () =>
      taskPage.createTaskAndVerify({
        taskName,
        userName: COMMON_TEXTS.standardUserName,
      }));
  });

  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const completedTaskInDashboard = page
      .getByTestId(TASKS_TABLE_SELECTORS.completedTasksTable)
      .getByRole("row", { name: taskName });

    await test.step("Step 8: Go to dashboard", () => page.goto("/"));
    await test.step("Step 9: Mark task as completed", async () => {
      await page.goto("/");
      await page
        .getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable)
        .getByRole("row", { name: taskName })
        .getByRole("checkbox")
        .click();
    });

    await test.step("Step 10: Delete completed task", () =>
      completedTaskInDashboard
        .getByTestId(TASKS_TABLE_SELECTORS.deleteTaskButton)
        .click());

    await test.step("Step 11: Assert deleted task has been removed from the dashboard", async () => {
      await expect(completedTaskInDashboard).toBeHidden();
      await expect(
        page
          .getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable)
          .getByRole("row", { name: taskName })
      ).toBeHidden();
    });

    await context.close();
  });

  test("should add a comment as a creator and verify count updates for both creator and assignee", async ({
    page,
    commentsPage,
  }) => {
    await page.goto("/");

    await test.step("Step 2: Add comment as creator", async () => {
      await commentsPage.addAndVerifyComment({
        taskName,
        comment,
      });
    });

    await test.step("Step 3: Verify assignee sees comment and count updates", async () => {
      await page.getByTestId("navbar-logout-link").click();
      await commentsPage.verifyCommentCountAndVisible({
        taskName,
        userEmail: assigneeEmail,
        password,
        comment,
      });
    });
  });

  test(`should add a comment as an assignee and verify count updates for both assignee and creator ${COMMON_TEXTS.skipSetup}`, async ({
    page,
    commentsPage,
  }) => {
    await page.goto("/");
    await page.getByTestId("navbar-logout-link").click();
    await test.step("Step 2: Login as Assignee", async () => {
      await commentsPage.login({ userEmail: assigneeEmail, password });
    });

    await test.step("Step 3: Assignee adds a comment", async () => {
      await commentsPage.addAndVerifyComment({
        taskName,
        comment: comment2,
      });
    });

    await test.step("Step 5: Creator verifies the comment and count update", async () => {
      await page.getByTestId("navbar-logout-link").click();
      await commentsPage.verifyCommentCountAndVisible({
        taskName,
        userEmail: creatorEmail,
        password,
        comment: comment2,
      });
    });
  });
});
