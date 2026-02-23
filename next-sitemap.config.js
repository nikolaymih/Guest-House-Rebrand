/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || "https://www.stanovets.eu",
  generateRobotsTxt: true,
  exclude: ["/admin", "/admin/*", "/en/admin", "/en/admin/*"],
};
