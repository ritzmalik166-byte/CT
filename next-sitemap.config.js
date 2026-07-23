/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://www.contenaissance.com",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  autoLastmod: true,
  exclude: ["/api/*", "/admin", "/admin/*"],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/admin/"] },
      { userAgent: "Googlebot", allow: "/", disallow: ["/admin", "/admin/"] },
      { userAgent: "Bingbot", allow: "/", disallow: ["/admin", "/admin/"] },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: ["/admin", "/admin/"] },
      { userAgent: "ClaudeBot", allow: "/", disallow: ["/admin", "/admin/"] },
      { userAgent: "CCBot", allow: "/", disallow: ["/admin", "/admin/"] },
      { userAgent: "PerplexityBot", allow: "/", disallow: ["/admin", "/admin/"] },
      { userAgent: "Applebot", allow: "/", disallow: ["/admin", "/admin/"] },
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
