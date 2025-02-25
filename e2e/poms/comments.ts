import { Page, expect } from "@playwright/test";

export default class CommentsPage {
  constructor(private page: Page) {}
  getCommentLocator = (taskName) =>
    this.page
      .getByRole("row", { name: taskName })
      .locator(
        ".whitespace-no-wrap.px-6.py-4.text-center.text-sm.font-medium.leading-5.text-bb-gray-600"
      );

  getCommentCount = async (commentLocator) => {
    let text = await commentLocator.textContent();
    return Number(text?.trim() || 0);
  };
  finalCount: number;

  addAndVerifyComment = async ({ taskName, comment }) => {
    const commentLocator = this.getCommentLocator(taskName);
    let initialCount = await this.getCommentCount(commentLocator);

    await this.page.getByText(taskName).click();
    await this.page.getByTestId("comments-text-field").fill(comment);
    await this.page.getByTestId("comments-submit-button").click();
    await expect(this.page.getByText(comment)).toBeVisible();

    await this.page.goto("/");
    let updatedCount = await this.getCommentCount(commentLocator);
    this.finalCount = initialCount + 1;
    expect(updatedCount).toBe(this.finalCount);
  };

  verifyCommentCountAndVisible = async ({
    taskName,
    userEmail,
    password,
    comment,
  }) => {
    await this.login({ userEmail, password });

    const commentLocator = this.getCommentLocator(taskName);
    let initialCount = await this.getCommentCount(commentLocator);

    await this.page.getByText(taskName).click();
    await expect(this.page.getByText(comment)).toBeVisible();
    await this.page.goto("/");
    let updatedCount = await this.getCommentCount(commentLocator);
    expect(updatedCount).toBe(this.finalCount);
  };

  login = async ({ userEmail, password }) => {
    await this.page.getByTestId("login-email-field").fill(userEmail);
    await this.page.getByTestId("login-password-field").fill(password);
    await this.page.getByTestId("login-submit-button").click();
  };
}
