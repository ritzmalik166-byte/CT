/** Editable placeholder legal copy for footer policy modals. No dedicated routes. */

export type LegalPolicyId = "privacy" | "cookies";

export type LegalPolicySection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalPolicy = {
  id: LegalPolicyId;
  title: string;
  eyebrow: string;
  lastUpdated: string;
  intro: string;
  sections: LegalPolicySection[];
};

export const LEGAL_POLICIES: Record<LegalPolicyId, LegalPolicy> = {
  privacy: {
    id: "privacy",
    title: "Privacy Policy",
    eyebrow: "Legal",
    lastUpdated: "26 August 2026",
    intro:
      "This Privacy Policy explains how Contenaissance (“we”, “us”, or “our”) collects, uses, stores, and shares information when you visit our website, contact us, subscribe to updates, or use our services. This is placeholder copy that can be replaced with your final legal text.",
    sections: [
      {
        heading: "1. Who we are",
        paragraphs: [
          "Contenaissance is a creative and technology studio. For privacy questions related to this website, you can reach us through the contact details on our Contact page or by writing to the email address published on the site.",
          "If we appoint a data protection officer or a local representative, those details will be added here.",
        ],
      },
      {
        heading: "2. Information we collect",
        paragraphs: [
          "We collect information that you provide directly and information that is generated automatically when you use the website.",
        ],
        bullets: [
          "Contact and enquiry details, such as your name, email address, phone number, company name, and the message you send through forms.",
          "Newsletter or update requests, including the email address you submit in the footer.",
          "Project or briefing details you choose to share when discussing a potential engagement.",
          "Technical data such as IP address, browser type, device type, approximate location, referring URL, pages viewed, and timestamps.",
          "Cookie and similar technology data, described in more detail in our Cookies Policy.",
        ],
      },
      {
        heading: "3. How we use information",
        paragraphs: [
          "We use personal information only for the purposes described in this policy, or for closely related purposes that you would reasonably expect.",
        ],
        bullets: [
          "To respond to enquiries, schedule conversations, and deliver the services you request.",
          "To send updates or newsletters where you have asked us to do so.",
          "To operate, secure, and improve the website, including diagnosing technical issues.",
          "To measure how the site is used and to understand which content is useful.",
          "To comply with legal obligations and to protect our rights, users, and business.",
        ],
      },
      {
        heading: "4. Legal bases",
        paragraphs: [
          "Where applicable privacy laws require a legal basis, we typically rely on one or more of the following: your consent, the performance of a contract or steps taken at your request before entering a contract, our legitimate interests in running and improving the studio, and compliance with legal obligations.",
          "You may withdraw consent at any time where processing is based on consent. Withdrawal does not affect the lawfulness of processing that happened before withdrawal.",
        ],
      },
      {
        heading: "5. Sharing of information",
        paragraphs: [
          "We do not sell your personal information. We may share information with trusted service providers who help us operate the website and our business, such as hosting, email delivery, form handling, analytics, and communication tools.",
          "Those providers are expected to use the information only to perform services for us and to protect it appropriately. We may also disclose information if required by law, to protect our rights, or in connection with a business transfer such as a merger or acquisition.",
        ],
      },
      {
        heading: "6. Retention",
        paragraphs: [
          "We keep personal information only for as long as needed for the purposes described in this policy, including to meet legal, accounting, or reporting requirements. Enquiry records, newsletter lists, and technical logs may be retained for different periods depending on their purpose.",
          "When information is no longer required, we will delete it or anonymise it where deletion is not immediately possible.",
        ],
      },
      {
        heading: "7. Your rights",
        paragraphs: [
          "Depending on where you live, you may have rights to access, correct, delete, or restrict the use of your personal information, to object to certain processing, to withdraw consent, and to receive a copy of information you provided to us.",
          "To exercise these rights, contact us using the details on our Contact page. We may need to verify your identity before fulfilling a request. You may also have the right to lodge a complaint with a data protection authority.",
        ],
      },
      {
        heading: "8. International transfers",
        paragraphs: [
          "Our service providers and collaborators may process information in countries other than your own. Where we transfer personal information internationally, we will take steps designed to ensure it receives an adequate level of protection, such as contractual safeguards.",
        ],
      },
      {
        heading: "9. Children’s privacy",
        paragraphs: [
          "This website and our services are not directed to children. We do not knowingly collect personal information from children. If you believe a child has provided information to us, please contact us and we will take appropriate steps to delete it.",
        ],
      },
      {
        heading: "10. Security",
        paragraphs: [
          "We use reasonable technical and organisational measures to protect personal information against unauthorised access, loss, misuse, or alteration. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.",
        ],
      },
      {
        heading: "11. Changes to this policy",
        paragraphs: [
          "We may update this Privacy Policy from time to time. The “Last updated” date at the top of this notice will change when we do. Continued use of the website after an update means you should review the revised policy.",
        ],
      },
      {
        heading: "12. Contact",
        paragraphs: [
          "If you have questions about this Privacy Policy or how we handle personal information, please contact Contenaissance through the Contact page on this website.",
        ],
      },
    ],
  },
  cookies: {
    id: "cookies",
    title: "Cookies Policy",
    eyebrow: "Legal",
    lastUpdated: "26 August 2026",
    intro:
      "This Cookies Policy explains how Contenaissance uses cookies and similar technologies on our website. It is placeholder copy that can be replaced with your final legal text and a complete cookie inventory.",
    sections: [
      {
        heading: "1. What cookies are",
        paragraphs: [
          "Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences, keep the experience working, and understand how the site is used.",
          "We may also use similar technologies such as pixels, local storage, and tags. In this policy, we refer to all of these as “cookies” for simplicity.",
        ],
      },
      {
        heading: "2. How we use cookies",
        paragraphs: [
          "Cookies help us operate the website, remember choices, measure performance, and improve content. Some cookies are set by us. Others may be set by third parties who provide services on our behalf, such as analytics or embedded media.",
        ],
      },
      {
        heading: "3. Types of cookies we use",
        paragraphs: [
          "The categories below describe the kinds of cookies that may be used on this website. The exact list can be updated as tools change.",
        ],
        bullets: [
          "Strictly necessary cookies: required for core functions such as page navigation, security, form submission, and remembering cookie choices.",
          "Functional cookies: remember preferences such as language or interface choices so the site feels more consistent on return visits.",
          "Analytics cookies: help us understand which pages are visited, how visitors move through the site, and where technical issues occur.",
          "Marketing or media cookies: may be used if we embed videos, social content, or campaign tags. These can also help us understand whether our communications are useful.",
        ],
      },
      {
        heading: "4. Cookie duration",
        paragraphs: [
          "Session cookies last only until you close your browser. Persistent cookies remain for a set period, or until you delete them, so the site can recognise your device on a later visit.",
          "Retention periods vary by cookie. Necessary cookies are typically kept only as long as needed for the relevant feature. Analytics and preference cookies may last from a few months up to around two years unless you clear them sooner.",
        ],
      },
      {
        heading: "5. Third-party cookies",
        paragraphs: [
          "Some pages may load content or tools from third parties, for example analytics providers, fonts, maps, or video hosts. Those third parties may set their own cookies according to their privacy and cookie policies.",
          "We do not control third-party cookies. You should review the relevant provider’s policy if you want details about their practices.",
        ],
      },
      {
        heading: "6. Managing your preferences",
        paragraphs: [
          "You can control cookies through your browser settings. Most browsers let you block or delete cookies, or alert you before a cookie is stored. If you disable certain cookies, parts of the website may not work as expected.",
          "Where a cookie banner or preference centre is available, you can also use it to accept, reject, or customise non-essential cookies. You can usually change that choice later.",
        ],
      },
      {
        heading: "7. Do Not Track and similar signals",
        paragraphs: [
          "Some browsers offer a “Do Not Track” setting. There is no common standard for responding to these signals. We will describe our approach here if a specific handling process is adopted.",
        ],
      },
      {
        heading: "8. Updates to this policy",
        paragraphs: [
          "We may update this Cookies Policy when we change the tools we use or when the law requires it. The “Last updated” date at the top will change when we do. Please review this notice periodically.",
        ],
      },
      {
        heading: "9. Contact",
        paragraphs: [
          "If you have questions about our use of cookies, please contact Contenaissance through the Contact page on this website.",
        ],
      },
    ],
  },
};
