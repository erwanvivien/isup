import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import Services from "../public/services.json";

export default async function seed() {
  const serviceNames = Services.map((service) => service.name);

  Services.forEach(async (service) => {
    const services = await prisma.service.upsert({
      where: {
        name_kind: {
          kind: service.kind,
          name: service.name,
        },
      },
      create: {
        interval: service.interval,
        kind: service.kind,
        name: service.name,
      },
      update: {
        interval: service.interval,
        kind: service.kind,
        name: service.name,
      },
    });
  });
}

export {};
