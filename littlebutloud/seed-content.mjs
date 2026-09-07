import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// ─── Members ───────────────────────────────────────────────────────────────
const members = [
  {
    name: "Green Future Initiative",
    age: 18,
    location: "Singapore",
    country: "Singapore",
    initiativeName: "Environmental sustainability",
    description: "Youth-led group focused on reducing plastic waste and promoting circular economy practices in schools.",
    email: "greenfuture@example.com",
    issueArea: "environment",
    memberType: "youth-led group",
    status: "approved",
    eligibleForSpotlight: true,
  },
  {
    name: "Mental Wellness Advocates",
    age: 20,
    location: "Singapore",
    country: "Singapore",
    initiativeName: "Mental health awareness",
    description: "Community organization providing peer support and mental health resources for young adults.",
    email: "mentalwellness@example.com",
    issueArea: "mental health",
    memberType: "community organisation",
    status: "approved",
    eligibleForSpotlight: true,
  },
  {
    name: "Seniors Connect",
    age: 19,
    location: "Singapore",
    country: "Singapore",
    initiativeName: "Intergenerational programs",
    description: "Social service agency bridging the gap between youth and elderly through mentorship and tech training.",
    email: "seniorsconnect@example.com",
    issueArea: "seniors",
    memberType: "social service agency",
    status: "approved",
    eligibleForSpotlight: true,
  },
  {
    name: "Children's Learning Hub",
    age: 21,
    location: "Singapore",
    country: "Singapore",
    initiativeName: "Educational support",
    description: "Youth-led initiative providing tutoring and enrichment programs for underprivileged children.",
    email: "childrenlearning@example.com",
    issueArea: "children",
    memberType: "youth-led group",
    status: "approved",
    eligibleForSpotlight: false,
  },
  {
    name: "Community Health Collective",
    age: 22,
    location: "Singapore",
    country: "Singapore",
    initiativeName: "Health and wellness",
    description: "Multi-sector collaboration promoting holistic health through community workshops and outreach.",
    email: "commhealth@example.com",
    issueArea: "environment",
    memberType: "community organisation",
    status: "approved",
    eligibleForSpotlight: false,
  },
];

for (const member of members) {
  await connection.execute(
    `INSERT INTO members (name, age, location, country, initiativeName, description, email, issueArea, memberType, status, eligibleForSpotlight, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [member.name, member.age, member.location, member.country, member.initiativeName, member.description, member.email, member.issueArea, member.memberType, member.status, member.eligibleForSpotlight]
  );
}

console.log("✓ Created 5 members");

// ─── Events ────────────────────────────────────────────────────────────────
const events = [
  {
    title: "Youth Leadership Summit 2026",
    description: "A full-day summit bringing together young changemakers to share ideas, learn from each other, and collaborate on community projects.",
    eventDate: new Date("2026-05-15T09:00:00"),
    location: "Singapore Convention Centre",
    organiser: "Network of Deeds by Kids",
    status: "upcoming",
  },
  {
    title: "Environmental Action Workshop",
    description: "Hands-on workshop on sustainable practices, waste reduction, and environmental advocacy for youth groups.",
    eventDate: new Date("2026-05-22T14:00:00"),
    location: "Marina Bay Park",
    organiser: "Green Future Initiative",
    status: "upcoming",
  },
  {
    title: "Mental Health Awareness Campaign Launch",
    description: "Launch event for a new mental health awareness campaign with panel discussions, resources, and peer support sessions.",
    eventDate: new Date("2026-06-05T18:00:00"),
    location: "Online (Zoom)",
    organiser: "Mental Wellness Advocates",
    status: "upcoming",
  },
];

for (const event of events) {
  await connection.execute(
    `INSERT INTO events (title, description, eventDate, location, organiser, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [event.title, event.description, event.eventDate, event.location, event.organiser, event.status]
  );
}

console.log("✓ Created 3 events");

// ─── Resources ─────────────────────────────────────────────────────────────
const resources = [
  {
    title: "Youth Leadership Toolkit",
    description: "Comprehensive guide with frameworks, templates, and best practices for youth-led initiatives and group management.",
    resourceType: "Toolkits",
    link: "https://example.com/youth-leadership-toolkit",
    featured: true,
  },
  {
    title: "Mental Health Support Resources",
    description: "Curated collection of mental health resources, hotlines, and peer support strategies for young people.",
    resourceType: "Reports",
    link: "https://example.com/mental-health-resources",
    featured: true,
  },
  {
    title: "Sustainable Living: A Youth Guide",
    description: "Practical article on how young people can adopt sustainable practices in daily life and advocate for environmental change.",
    resourceType: "Articles",
    link: "https://example.com/sustainable-living-guide",
    featured: false,
  },
  {
    title: "Case Study: Green Future Initiative Success",
    description: "In-depth case study documenting how Green Future Initiative reduced plastic waste in 5 schools within 6 months.",
    resourceType: "Case Studies",
    link: "https://example.com/case-study-green-future",
    featured: false,
  },
  {
    title: "Community Engagement Playbook",
    description: "Step-by-step playbook for designing and executing community engagement programs with measurable impact.",
    resourceType: "Toolkits",
    link: "https://example.com/community-engagement-playbook",
    featured: true,
  },
];

for (const resource of resources) {
  await connection.execute(
    `INSERT INTO resources (title, description, resourceType, link, featured, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
    [resource.title, resource.description, resource.resourceType, resource.link, resource.featured]
  );
}

console.log("✓ Created 5 resources");

await connection.end();
console.log("\n✅ Seed content created successfully!");
