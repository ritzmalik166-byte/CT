/** Legal copy for footer policy modals. No dedicated routes. */

export type LegalPolicyId = "privacy" | "cookies";

export type LegalPolicyLink = {
  label: string;
  href: string;
};

export type LegalPolicyParagraph = string | Array<string | LegalPolicyLink>;

export type LegalPolicySubsection = {
  subheading: string;
  paragraphs: LegalPolicyParagraph[];
  bullets?: string[];
  paragraphsAfterBullets?: LegalPolicyParagraph[];
};

export type LegalPolicyContactItem = {
  label: string;
  value: string;
  href?: string;
};

export type LegalPolicySection = {
  heading: string;
  paragraphs?: LegalPolicyParagraph[];
  bullets?: string[];
  paragraphsAfterBullets?: LegalPolicyParagraph[];
  subsections?: LegalPolicySubsection[];
  contactItems?: LegalPolicyContactItem[];
};

export type LegalPolicy = {
  id: LegalPolicyId;
  title: string;
  eyebrow: string;
  lastUpdated: string;
  intro: LegalPolicyParagraph[];
  sections: LegalPolicySection[];
};

export const LEGAL_POLICIES: Record<LegalPolicyId, LegalPolicy> = {
  privacy: {
    id: "privacy",
    title: "Privacy Policy",
    eyebrow: "Legal",
    lastUpdated: "26 August 2026",
    intro: [
      'Contenaissance ("the company," "we," "our," or "us") cares about the privacy of anyone who visits this website or reaches out about a project. This policy lays out what information gets collected, how it\'s used, and what choices are available. Using this website means agreeing to the practices described below.',
      [
        "It applies to ",
        {
          label: "www.contenaissance.com",
          href: "https://www.contenaissance.com",
        },
        " and any related services offered under the Contenaissance name.",
      ],
    ],
    sections: [
      {
        heading: "Information We Collect",
        subsections: [
          {
            subheading: "Information Visitors Provide Directly",
            paragraphs: [
              "Filling out the contact form means sharing a few details:",
            ],
            bullets: [
              "Full name",
              "Email address",
              "Contact number",
              "Service of interest",
              "Country",
              "Enquiry message",
            ],
            paragraphsAfterBullets: [
              "None of this gets collected unless a visitor chooses to submit the form. It's entirely voluntary, whether the reason is a project, a collaboration, or just a general question."
            ]
          },

          {
            subheading: "Information Collected Automatically",
            paragraphs: [
              "Like most websites, this one picks up some technical information in the background: browser type, device type, an approximate location based on IP address, which pages get viewed, how long a visit lasts, and how someone arrived at the site. This data is usually aggregated or anonymized. It helps us understand how people use the site and where it needs work.",
            ],
          },
        ],
      },
      {
        heading: "How We Use This Information",
        paragraphs: [
          "The information gathered through the contact form and general site activity goes toward a few things:",
        ],
        bullets: [
          "Responding to enquiries and project requests",
          "Understanding which services visitors care about most",
          "Improving website content, design, and user experience",
          "Sending updates related to an ongoing enquiry or project",
          "Keeping the website secure and running properly",
        ],
        paragraphsAfterBullets: [
          "We don't sell contact information to third parties. It's used to follow up on the enquiry a visitor submits, nothing more.",
        ],
      },
      {
        heading: "Cookies & Tracking Technologies",
        paragraphs: [
          "This website may use cookies and similar tracking technologies to keep things running smoothly, remember visitor preferences, and get a sense of overall traffic patterns. Cookies are small text files a website stores on a visitor's device so certain information can carry over between visits.",
          "Visitors can control or turn off cookies through their browser settings. Doing so might affect how parts of the site function, but the core content stays accessible either way.",
          "A separate Cookies Policy covers the specific categories of cookies this site uses, for anyone who wants the finer details.",
        ],
      },
      {
        heading: "Sharing of Information",
        paragraphs: [
          "Personal information doesn't get shared with outside parties, except in these situations:",
        ],
        bullets: [
          "With service providers who help run this website or process enquiries, such as hosting providers or email delivery services, and only to the extent they need that information to do their job",
          "When required by law, regulation, or a valid legal process",
          "To protect the rights, safety, or property of Contenaissance, its clients, or the public",
          "As part of a business transition, such as a merger or acquisition, where information may transfer along with it",
        ],
        paragraphsAfterBullets: [
          "Contenaissance operates as part of the Ritz Media World group of companies. Information may be shared internally within this group where it's needed to respond to an enquiry or deliver a requested service.",
        ],
      },
      {
        heading: "Data Retention",
        paragraphs: [
          "Information submitted through the contact form is kept for as long as it's needed to respond to the enquiry, manage an ongoing project relationship, or meet legal and accounting obligations. Once that purpose is done, the information gets deleted or anonymized.",
        ],
      },
      {
        heading: "Data Security",
        paragraphs: [
          "Reasonable technical and organizational measures are in place to protect personal information from unauthorized access, alteration, disclosure, or loss. That said, no method of transmission over the internet or electronic storage can offer a complete guarantee. No one can promise total security, and we won't pretend otherwise.",
        ],
      },
      {
        heading: "Your Rights",
        paragraphs: [
          "Depending on the data protection laws that apply, visitors may have the right to:",
        ],
        bullets: [
          "Request access to the personal information held about them",
          "Request correction of inaccurate or incomplete information",
          "Request deletion of their personal information, where applicable",
          "Withdraw consent for future communication at any time",
        ],
        paragraphsAfterBullets: [
          [
            "Visitors based in India are covered under the ",
            {
              label: "Digital Personal Data Protection Act",
              href: "https://prsindia.org/billtrack/digital-personal-data-protection-bill-2023",
            },
            ", and this policy is built to align with its principles. Visitors from other regions may have additional rights under their own local laws.",
          ],
          "To exercise any of these rights, visitors can reach out using the contact details below.",
        ],
      },
      {
        heading: "Third-Party Links & Embedded Content",
        paragraphs: [
          "This website may include links to third-party platforms, such as social media pages, or embedded content like videos. These third parties run under their own privacy policies, and Contenaissance isn't responsible for how they collect or use information. Visitors are encouraged to check the privacy practices of any third-party site before sharing information there.",
        ],
      },
      {
        heading: "Children's Privacy",
        paragraphs: [
          "This website isn't directed at children, and personal information isn't knowingly collected from anyone under the age of 18. If we learn that a minor has submitted information without appropriate consent, it gets deleted.",
        ],
      },
      {
        heading: "Changes to This Policy",
        paragraphs: [
          "This Privacy Policy may be updated from time to time to reflect changes in practices, technology, legal requirements, or other factors. Any changes will be posted on this page along with an updated effective date. Continuing to use the website after changes go live means accepting the revised policy.",
        ],
      },
      {
        heading: "Contact Us",
        paragraphs: [
          "Questions about this Privacy Policy or how personal information is handled can go here:",
        ],
        contactItems: [
          {
            label: "Email:",
            value: "info@ritzmediaworld.com",
            href: "mailto:info@ritzmediaworld.com",
          },
          {
            label: "Phone:",
            value: "+91-9220516777",
            href: "tel:+919220516777",
          },
          {
            label: "Address:",
            value:
              "Unit No. 404, 4th Floor, Corporate Park Tower A1, Sector 142, Noida, Uttar Pradesh 201305, India",
          },
        ],
      },
    ],
  },
  cookies: {
    id: "cookies",
    title: "Cookies Policy",
    eyebrow: "Legal",
    lastUpdated: "26 August 2026",
    intro: [
      "This site uses cookies. Not in a sneaky way, in the ordinary way most websites do, to keep things working and to get a sense of who's visiting and how. This policy walks through what cookies actually are, which kinds show up here, and how to manage them if you'd rather not have them around.",
      [
        "Read it alongside the Privacy Policy, which covers personal information more broadly. This one applies specifically to ",
        {
          label: "www.contenaissance.com",
          href: "https://www.contenaissance.com",
        },
        ".",
      ],
    ],
    sections: [
      {
        heading: "What Are Cookies",
        paragraphs: [
          "A cookie is a small text file. A website drops it on your device, phone, laptop, tablet, whatever you're browsing on, so it can remember things between visits: a preference, a login, that kind of thing. It also gives the site owner a rough picture of how people move through the pages.",
          "They won't damage a device. No harmful code hiding inside. Most browsers accept them by default, but every browser gives you some way to manage or block them if you go looking in the settings.",
        ],
      },
      {
        heading: "Types of Cookies This Site Uses",
        subsections: [
          {
            subheading: "Essential Cookies",
            paragraphs: [
              "These run the basic machinery: pages load, navigation works, sections connect to each other. Turn them off and parts of the site stop functioning the way they're supposed to. That's exactly why there's no toggle for these. They stay on.",
            ],
          },
          {
            subheading: "Performance & Analytics Cookies",
            paragraphs: [
              "Which pages get the most traffic. How long people stick around. Where things break. That's what this category tracks, and it's how site performance gets measured and improved over time. The data comes in aggregated and anonymous form, so no individual visitor gets identified through it.",
            ],
          },
          {
            subheading: "Functionality Cookies",
            paragraphs: [
              "Set a language preference, pick a region, and these cookies remember it next time you're back. Small thing, but it's what makes a return visit feel less like starting from scratch. Without them, some features get clunkier.",
            ],
          },
          {
            subheading: "Third-Party Cookies",
            paragraphs: [
              "A handful of cookies here don't come from Contenaissance at all. They arrive through embedded content, a social media widget, or a video player, and whoever runs that service sets them independently. Their own privacy and cookies policies govern that data, not this one.",
            ],
          },
        ],
      },
      {
        heading: "Why Cookies Get Used Here",
        paragraphs: ["A few reasons, mostly practical:"],
        bullets: [
          "Security and basic site function",
          "Understanding how visitors actually move through the site, to fix layout and content that isn't working",
          "Remembering preferences so browsing feels less repetitive",
          "Making embedded videos and social features work the way they're supposed to",
        ],
      },
      {
        heading: "How Long They Stick Around",
        paragraphs: [
          "Two categories, really. Session cookies disappear the moment the browser closes; they only exist for the length of one visit. Persistent cookies hang around longer, either for a set stretch of time or until someone deletes them manually, and that's what lets a site recognize a returning visitor.",
        ],
      },
      {
        heading: "Managing Cookie Preferences",
        paragraphs: [
          "You're in control of this, not the website. Browser settings typically let you see what's stored, delete some or all of it, block specific sites or every site, or get a heads-up before anything new gets saved.",
          "Every browser handles it a bit differently, so the fastest route is the browser's own help section. One thing worth knowing before switching everything off: disabling essential cookies in particular can break parts of the site outright.",
        ],
      },
      {
        heading: "Changes to This Policy",
        paragraphs: [
          "Cookies change. Regulations change. This page gets updated when either one does, along with a new effective date. Using the site after an update goes live counts as accepting it.",
        ],
      },
      {
        heading: "Contact Us",
        paragraphs: [
          "Questions about this policy or how cookies get used here:",
        ],
        contactItems: [
          {
            label: "Email:",
            value: "info@ritzmediaworld.com",
            href: "mailto:info@ritzmediaworld.com",
          },
          {
            label: "Phone:",
            value: "+91-9220516777",
            href: "tel:+919220516777",
          },
          {
            label: "Address:",
            value:
              "Unit No. 404, 4th Floor, Corporate Park Tower A1, Sector 142, Noida, Uttar Pradesh 201305, India",
          },
        ],
      },
    ],
  },
};
