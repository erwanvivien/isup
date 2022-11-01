import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import Services from "../public/services.json";

export default async function seed() {
  for (const service of Services) {
    const data = {
      name: service.name,
      kind: service.kind,
      interval: service.interval,
    };

    await prisma.service.upsert({
      where: {
        name_kind: {
          name: service.name,
          kind: service.kind,
        },
      },
      create: data,
      update: data,
    });
  }
}

seed().then();
