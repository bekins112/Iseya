import type { PageDef } from "./types";

export const copyrightDefaults = {
  header: {
    title: "Copyright Notice",
    intro: "Information about intellectual property rights and usage terms for the Iṣéyá platform.",
    lastUpdated: "Last updated: February 2026",
  },
  highlight: {
    title: "© 2026 Iṣéyá by RenownedTech. All Rights Reserved.",
    subtitle: "Unauthorised reproduction or distribution of any content on this platform is strictly prohibited.",
  },
  sections: {
    items: [
      {
        title: "Copyright Ownership",
        content: "Iṣéyá is a product of Renowned Technology Limited. All content on the Iṣéyá platform, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software, is the property of Renowned Technology Limited (trading as Iṣéyá) or its content suppliers and is protected by Nigerian copyright laws and international copyright treaties. The compilation of all content on this platform is the exclusive property of Renowned Technology Limited.",
      },
      {
        title: "Trademarks",
        content: "The Iṣéyá name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of Renowned Technology Limited. You must not use such marks without the prior written permission of Renowned Technology Limited. All other names, logos, product and service names, designs, and slogans on this platform are the trademarks of their respective owners.",
      },
      {
        title: "Permitted Use",
        content: "You may access and use the Iṣéyá platform for your personal, non-commercial use only. You may download or print a single copy of any portion of the content to which you have properly gained access, solely for your personal, non-commercial use, provided that you keep all copyright, trademark, and other proprietary notices intact.",
      },
      {
        title: "Prohibited Use",
        content: "You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on the platform without prior written consent. You must not use any content from the platform for commercial purposes, including but not limited to reselling, redistributing, or creating competing services. Systematic retrieval of data or content through automated means (scraping, data mining, robots) is strictly prohibited.",
      },
      {
        title: "User-Generated Content",
        content: "Users retain ownership of content they submit to the platform, including job postings, applications, profile information, and messages. By submitting content, you grant Iṣéyá a non-exclusive, worldwide, royalty-free, perpetual licence to use, reproduce, modify, adapt, publish, and display such content in connection with the operation of the platform. You represent and warrant that you own or control all rights to the content you post.",
      },
      {
        title: "Copyright Infringement",
        content: "If you believe that any content on the Iṣéyá platform infringes upon your copyright, please contact us with the following information: a description of the copyrighted work you claim has been infringed, the location of the infringing material on the platform, your contact information, a statement that you have a good faith belief that the use is not authorised, and a statement that the information in your notice is accurate. We will investigate and take appropriate action.",
      },
      {
        title: "Third-Party Content",
        content: "The platform may contain links to third-party websites, services, or content that are not owned or controlled by Iṣéyá. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. The inclusion of any link does not imply endorsement by Iṣéyá.",
      },
      {
        title: "Enforcement & Remedies",
        content: "Iṣéyá reserves the right to take legal action against any unauthorised use of its copyrighted materials or trademarks. Violations of this copyright policy may result in account termination, legal proceedings, and claims for damages. We reserve the right to remove any content that infringes on intellectual property rights without prior notice.",
      },
      {
        title: "Governing Law",
        content: "This copyright notice shall be governed by and construed in accordance with the Copyright Act of Nigeria and applicable international copyright conventions, including the Berne Convention for the Protection of Literary and Artistic Works. Any disputes shall be subject to the exclusive jurisdiction of the courts of the Federal Republic of Nigeria.",
      },
    ],
  },
  contact: {
    note: "For copyright-related enquiries or to report infringement, please",
    linkLabel: "contact us",
  },
};

export const copyrightPage: PageDef = {
  key: "page_copyright",
  label: "Copyright Notice",
  description: "The Copyright Notice page. Edit the page title, intro, highlight banner, and the full list of copyright sections.",
  defaults: copyrightDefaults,
  sections: [
    {
      key: "header",
      label: "Page Header",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "intro", label: "Intro paragraph", type: "textarea" },
        { key: "lastUpdated", label: "Last updated line", type: "text" },
      ],
    },
    {
      key: "highlight",
      label: "Highlight Banner",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
      ],
    },
    {
      key: "sections",
      label: "Copyright Sections",
      description: "The list of copyright sections shown on the page.",
      fields: [
        {
          key: "items",
          label: "Sections",
          type: "list",
          itemLabel: "Section",
          itemFields: [
            { key: "title", label: "Heading", type: "text" },
            { key: "content", label: "Body", type: "textarea" },
          ],
          itemDefaults: { title: "", content: "" },
        },
      ],
    },
    {
      key: "contact",
      label: "Contact Footer",
      fields: [
        { key: "note", label: "Note text", type: "textarea" },
        { key: "linkLabel", label: "Link label", type: "text" },
      ],
    },
  ],
};
