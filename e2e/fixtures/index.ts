// fixtures/index.ts

import { test as base } from "@playwright/test";
import LoginPage from "../poms/login";
import { TaskPage } from "../poms/tasks";
import CommentsPage from "../poms/comments";
interface ExtendedFixtures {
  loginPage: LoginPage;
  taskPage: TaskPage;
  commentsPage: CommentsPage;
}

export const test = base.extend<ExtendedFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  taskPage: async ({ page }, use) => {
    const taskPage = new TaskPage(page);
    await use(taskPage);
  },
  commentsPage: async ({ page }, use) => {
    const commentsPage = new CommentsPage(page);
    await use(commentsPage);
  },
});
