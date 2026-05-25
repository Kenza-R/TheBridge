import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const HOSPITAL_ID = "00000000-0000-4000-8000-000000000001";

const colleagues = [
  {
    npi: "1234567890",
    auth0Subject: "dev|physician-demo",
    displayName: "Anjali Patel",
    specialty: "Emergency Medicine",
    careerStage: "attending",
    onboardingDone: true,
  },
  {
    npi: "1987654321",
    auth0Subject: "dev|physician-chen",
    displayName: "Maya Chen",
    specialty: "Internal Medicine",
    careerStage: "attending",
    onboardingDone: true,
  },
  {
    npi: "1122334455",
    auth0Subject: "dev|physician-okafor",
    displayName: "Adaeze Okafor",
    specialty: "Emergency Medicine",
    careerStage: "senior",
    onboardingDone: true,
  },
  {
    npi: "5544332211",
    auth0Subject: "dev|physician-reyes",
    displayName: "Jamie Reyes",
    specialty: "Pediatrics",
    careerStage: "fellow",
    onboardingDone: true,
  },
  {
    npi: "6677889900",
    auth0Subject: "dev|physician-park",
    displayName: "Lina Park",
    specialty: "Cardiology",
    careerStage: "attending",
    onboardingDone: true,
  },
  {
    npi: "0099887766",
    auth0Subject: "dev|physician-hill",
    displayName: "Marcus Hill",
    specialty: "Surgery",
    careerStage: "attending",
    onboardingDone: true,
  },
];

async function main() {
  const hospital = await prisma.hospital.upsert({
    where: { id: HOSPITAL_ID },
    update: {},
    create: {
      id: HOSPITAL_ID,
      name: "Demo Academic Medical Center",
      timezone: "America/New_York",
    },
  });

  for (const c of colleagues) {
    await prisma.physician.upsert({
      where: { npi: c.npi },
      update: { displayName: c.displayName, specialty: c.specialty },
      create: { ...c, hospitalId: hospital.id },
    });
  }

  const primary = await prisma.physician.findUniqueOrThrow({
    where: { npi: "1234567890" },
  });

  console.log("Seed complete:", hospital.name);
  console.log("Primary physician id (use in VITE_DEV_AUTH_TOKEN):", primary.id);
}

main().finally(() => prisma.$disconnect());
