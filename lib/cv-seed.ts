// Starter profile taken from the owner's CV. Used by the "Import from CV" button.
const F = (label: string, value: string) => ({ label, value });
const I = (title: string, subtitle: string, description: string, link = "") => ({ title, subtitle, link, description });

export const CV_SECTIONS: {
  name: string;
  type: "fields" | "items";
  fields?: { label: string; value: string }[];
  items?: { title: string; subtitle: string; link: string; description: string }[];
}[] = [
  {
    name: "Personal Information",
    type: "fields",
    fields: [
      F("Name", "Muhammad Usman"),
      F("Job title", "Web Developer"),
      F("Email", "usmananees040@gmail.com"),
      F("Number", "0330 600 7684"),
      F("Location", "Kot Addu, Pakistan"),
      F("Portfolio", "usman-builds.netlify.app"),
      F("LinkedIn", ""),
      F("GitHub", ""),
    ],
  },
  {
    name: "Professional Summary",
    type: "fields",
    fields: [
      F(
        "Summary",
        "Web Developer with hands-on experience building responsive, full-stack applications using React.js, Next.js, JavaScript (ES6+), and the MERN stack. Independently designed and shipped multiple production web apps and landing pages, including an interactive exam-preparation portal and a business email-management tool used to browse 200,000+ records. Combines solid front-end and back-end development skills with strong problem-solving ability and a background in IT systems support.",
      ),
    ],
  },
  {
    name: "Professional Experience",
    type: "items",
    items: [
      I("IT Manager — Global Ecommerce Consultants", "Feb 2025 – June 2026", "Support internal systems and infrastructure while applying web development skills to the company's digital initiatives. Experience letter available."),
      I("Web Development Intern", "May 2023 – Nov 2023", "Built and maintained responsive web pages using HTML, CSS, JavaScript, and PHP on real client projects. Completion certificate awarded."),
    ],
  },
  {
    name: "Technical Skills",
    type: "fields",
    fields: [
      F("Languages & Frameworks", "JavaScript (ES6+), TypeScript, React.js, Next.js, PHP, HTML5, CSS3"),
      F("Frontend & Styling", "Bootstrap, Tailwind CSS, Responsive / Mobile-First Design"),
      F("Stack & Tools", "MERN Stack (MongoDB, Express.js, React.js, Node.js), React Native (Expo), Firebase, MQTT, Git & GitHub, RESTful APIs"),
      F("Core Competencies", "Problem Solving, Debugging & Troubleshooting, Team Collaboration, Communication, Time Management, IT Support & Systems Administration"),
    ],
  },
  {
    name: "Projects",
    type: "items",
    items: [
      I("IoT-Based Smart Mining Helmet — Final Year Project", "React Native (Expo), TypeScript, Firebase, MQTT/RTSP, ESP32, GPS Module (NEO-6M)", "Co-developed a wearable IoT safety system for underground miners with gas, temperature/humidity, GPS, and live-video sensors built into a single helmet-mounted unit. Built the companion React Native (Expo) app in TypeScript for real-time dashboards and location tracking synced via Firebase, using MQTT/RTSP over Wi-Fi; field trials achieved 85% hazard-detection accuracy."),
      I("TestGenius – MCQs Exam Preparation Portal", "Next.js, React.js, Supabase (PostgreSQL), Groq AI", "Built a full-stack MCQ practice and job-listing platform for students in Pakistan — a Next.js public site plus a role-based React admin/student portal on Supabase, with a Groq-powered AI assistant and four-tier role permissions."),
      I("ResumeGenius – AI Resume Builder & ATS Checker", "Next.js, TypeScript, MongoDB, Groq AI", "Built a full-stack SaaS resume builder with Groq-powered AI rewriting, tiered subscriptions, a drag-and-drop editor with live ATS scoring, and Word/PDF export. Solo-developed end-to-end, from schema to UI."),
      I("HeavyMail – Email Backup Management Tool", "HTML5, CSS3, JavaScript, Tailwind CSS", "Built a web-based tool to manage large volumes of email backups — uploading folders, handling multiple accounts, and browsing up to 200,000 emails per account — with a familiar Gmail/Outlook-style interface built in Tailwind CSS."),
    ],
  },
  {
    name: "Education",
    type: "items",
    items: [I("BS Information Technology", "MNS University of Agriculture, Multan · 2021 – 2025", "")],
  },
  {
    name: "Certifications",
    type: "items",
    items: [
      I("MERN Stack Development", "Tech Nexus Virtual University · Oct 2024 – Jan 2025", ""),
      I("Certificate in IT (CIT)", "NAVTTC · Mar 2024 – May 2024", ""),
    ],
  },
];

