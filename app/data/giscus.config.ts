/**
 * Giscus comment-widget configuration.
 *
 * Comments are stored as GitHub Discussions on the portfolio repo. To enable:
 *   1. Make the portfolio repo public on GitHub and enable Discussions
 *      (Settings → Features → Discussions), with an "Announcements"-type
 *      category named "Case studies".
 *   2. Install the giscus app on the repo: https://github.com/apps/giscus
 *   3. Open https://giscus.app, pick the repo + category, and copy the
 *      generated data-repo-id / data-category-id values below.
 *
 * Until repoId is filled in, case-study pages show a "comments coming soon"
 * note instead of the widget.
 */
export const GISCUS = {
  repo: "milliondreamsblog/miyoko-portfolio", // <owner>/<repo> — update if different
  repoId: "", // TODO: paste from giscus.app
  category: "Case studies",
  categoryId: "", // TODO: paste from giscus.app
};
