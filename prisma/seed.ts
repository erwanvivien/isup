import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import Services from "../config/services.json";

export default async function seed() {
  for (const service of Services) {
    const data = {
      name: service.name,
      template: service.template,
      interval: service.interval,
    };

    await prisma.service.upsert({
      where: {
        name_template: {
          name: service.name,
          template: service.template,
        },
      },
      create: data,
      update: data,
    });
  }
}

seed().then();
