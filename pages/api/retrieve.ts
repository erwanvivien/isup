import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../prisma/prisma";
import { Service, ServiceStatus } from "@prisma/client";
import { dataWrapper, ResApi } from "./utils";

type ServiceStatusDate = ServiceStatus & {
  timestamp: string;
};

type RetrieveData = {
  services: Service[];
  statuses: Record<string, ServiceStatusDate[]>;
};
type RetrieveResponse = ResApi<RetrieveData>;

const getStatuses = (
  serviceName: string,
  serviceTemplate: string,
  commandName?: string,
  lastHours: number = 6
) =>
  prisma.serviceStatus.findMany({
    where: {
      service: {
        name: serviceName,
        template: serviceTemplate,
      },
      commandName: commandName,
      timestamp: {
        gt: new Date(Date.now() - 1000 * 60 * 60 * lastHours),
      },
    },
  }) as any as Promise<ServiceStatusDate[]>;

const getServices = () => prisma.service.findMany({});

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<RetrieveResponse>
) => {
  let lastHours = 6;
  if (req.query.lastHours && Number(req.query.lastHours) > 0) {
    lastHours = Number(req.query.lastHours);
  }

  let commandName: string | undefined = undefined;
  if (req.query.commandName) {
    commandName = String(req.query.commandName);
  }

  const services = await getServices();
  const promises = services.map(
    async (service) =>
      await getStatuses(service.name, service.template, commandName, lastHours)
  );

  const exec_statuses = await Promise.all(promises);
  const statuses = Object.fromEntries(
    services.map((service, i) => [service.name, exec_statuses[i]])
  );

  return res.status(200).json(dataWrapper({ services, statuses: statuses }));
};

export type { RetrieveResponse, RetrieveData };
export default handler;
