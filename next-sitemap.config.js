/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://www.contenaissance.com",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  autoLastmod: true,
  exclude: ["/api/*"],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "Bingbot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Applebot", allow: "/" },
    ],
  },
  transform: async (_config, path) => {
    const routeConfig = {
      "/": { priority: 1, changefreq: "weekly" },
      "/portfolio": { priority: 0.8, changefreq: "monthly" },
      "/services": { priority: 0.8, changefreq: "monthly" },
      "/contact": { priority: 0.7, changefreq: "monthly" },
    };

    const custom = routeConfig[path];

    return {
      loc: path,
      changefreq: custom?.changefreq ?? "weekly",
      priority: custom?.priority ?? 0.7,
      lastmod: new Date().toISOString(),
    };
  },
};
