export type Help = {
  title: string;
  about: string;
  sections: { heading: string; items: string[] }[];
};

export const HELP = {
  dashboard: {
    title: "Dashboard",
    about: "A read-only overview of every job in the system. Nothing is edited here. Use it to see where things stand at a glance.",
    sections: [
      { heading: "What you see", items: [
        "Total jobs, and one card per stage: Added, Waiting for approval, Approved, Applied.",
        "Jobs by platform: how many jobs came from each source (LinkedIn, Indeed, etc.).",
        "Recently added: the latest jobs with their current stage.",
      ] },
      { heading: "How to use it", items: [
        "Click a stage card to open the jobs list filtered to that stage.",
        "Click a platform bar to see only jobs from that platform.",
        "Check the Approved card first. Those are jobs you are cleared to apply to.",
        "The page refreshes itself every few seconds. No manual reload needed.",
      ] },
    ],
  },
  jobs: {
    title: "Received with email (Jobs)",
    about: "The working list of all jobs. This is where each job moves through its lifecycle from found to applied.",
    sections: [
      { heading: "Job lifecycle", items: [
        "Added: you found the job and saved it (via the Add job page).",
        "Waiting for approval: you prepared the application and submitted it for the owner to review.",
        "Approved: the owner clicked Approve. Only now may you apply.",
        "Applied: you applied and marked it as applied.",
      ] },
      { heading: "What you do here", items: [
        "On an Added job: open 'Prepare application → send for approval' and record everything: notes, the cover letter or answers, every application form field with the value you will enter, and the customised CV (upload the file or paste a link). Submit is rejected if nothing is recorded.",
        "On an Approved job: apply on the platform using the job URL, then fill the 'After applying' report: how you applied, the confirmation message or reference, how the CV was attached, and screenshots as proof. A report without proof is rejected. This is how the owner verifies the application really happened.",
        "Never apply to a job that is not Approved. Do not click Approve yourself. That is the owner's decision.",
        "Every file and link attached at any stage (when added, prepared, applied) is listed under 'Files & links' on the card, with the stage it came from. Attach everything you use so the owner can verify it.",
        "Open 'Details & history' on a card to see the full description, custom fields, and what happened and when.",
      ] },
      { heading: "Finding jobs", items: [
        "Use the stage tabs, platform chips, and search box to filter.",
        "Open posting opens the original job page in a new tab.",
        "Delete removes a job permanently. Use it only for duplicates or mistakes.",
      ] },
    ],
  },
  addJob: {
    title: "Add job",
    about: "Where new jobs are saved. Jobs differ a lot between platforms, so every field is optional and you can add your own fields.",
    sections: [
      { heading: "Before you add a job", items: [
        "Open the Focus keywords page first. Only add jobs that match the include keywords and skip any that match the exclude keywords.",
        "If a job's URL is already saved, you will get a 'already exists' message. Do not add it twice.",
      ] },
      { heading: "How to add", items: [
        "Fill in whatever the job has: title, company, platform, URL, location, salary, description. Leave the rest empty.",
        "Platform is where you found it (e.g. linkedin, indeed). Reuse the same spelling each time so filters and stats stay clean.",
        "For anything else (job type, deadline, contact email, tech stack…) click Add field, or one of the suggestions, and fill the name and value.",
        "Attach related files (job description PDF, a screenshot of the posting) and any extra links in the Files & links card. Everything attached stays visible on the job for the owner to cross-check.",
        "Click Add job. It is saved with the stage 'Added' and appears on the Received with email page.",
      ] },
      { heading: "Tips", items: [
        "Paste the full job description. It helps when preparing the application.",
        "Always include the URL so the job can be opened and applied to later.",
      ] },
    ],
  },
  profile: {
    title: "Profile",
    about: "Everything known about the owner, in sections the owner defines. Use it as the source of truth when filling applications.",
    sections: [
      { heading: "Sections", items: [
        "Key / value fields: simple facts like Name, Email, Phone, Location, LinkedIn.",
        "List of entries: repeating items like Projects, Experience or Education, each with a title, subtitle, link and description.",
        "Use the information here for names, contact details and experience when preparing an application. Never invent details that are not here.",
      ] },
      { heading: "How to manage", items: [
        "Create section: type a name, choose the type, click Create section.",
        "Edit a field or entry by changing the text and clicking the save icon / Save.",
        "Add new fields with the Add row at the bottom of a section. The trash icon removes one.",
        "Only change the profile when the owner asks you to.",
      ] },
    ],
  },
  focus: {
    title: "Focus keywords",
    about: "Tells the agent which jobs are worth adding. This is the filter that keeps irrelevant jobs out.",
    sections: [
      { heading: "Rules for the agent", items: [
        "Read this page before searching for jobs and again whenever it may have changed.",
        "Only add jobs that match the Include keywords (roles, skills, areas).",
        "Never add jobs that match the Exclude keywords, even if they also match an include keyword.",
        "Follow the extra notes (for example remote only, seniority, salary, location).",
        "If a job is borderline, add it and explain why in its description or a custom field.",
      ] },
      { heading: "How to manage (owner)", items: [
        "Type one or more keywords, separated by commas, and click the plus button.",
        "Click a keyword chip to remove it.",
        "Write anything else the agent should know in 'Extra notes' and click Save notes.",
      ] },
    ],
  },
  template: {
    title: "Upload a template (CV)",
    about: "The owner's CV template and the rules for customising it for each job.",
    sections: [
      { heading: "What is here", items: [
        "Current template: the uploaded file, a download button, detected {{placeholders}}, and the extracted text.",
        "Agent instructions: the owner's rules for how to edit the CV. Follow them exactly.",
      ] },
      { heading: "How to use it for a job", items: [
        "Download the template and make a copy. Never overwrite the original.",
        "Replace each placeholder, such as {{full_name}}, with values from the Profile page.",
        "Tailor sections like Summary and Skills to the job, following the instructions. Do not invent experience.",
        "Put the customised CV somewhere reachable and paste its link in the job's 'Customised CV link' when submitting for approval.",
      ] },
      { heading: "If the owner uploads a new template", items: [
        "Upload replaces the old one. The agent instructions are kept.",
        "DOCX works best because the text and placeholders are extracted automatically.",
      ] },
    ],
  },
} satisfies Record<string, Help>;

export type HelpKey = keyof typeof HELP;
