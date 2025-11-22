import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "ZenVerifier",
  version: packageJson.version,
  copyright: `© ${currentYear}, ZenVerifier.`,
  meta: {
    title: "ZenVerifier - Email Verification & Validation Platform",
    description:
      "ZenVerifier is a powerful email verification and validation platform. Verify single emails or process bulk verification jobs with ease. Built with Next.js, featuring real-time validation, detailed analytics, and seamless integration.",
  },
};
