import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../prisma/prisma";
import { Service, ServiceStatus } from "@prisma/client";
import { dataWrapper, ResApi } from "./utils";

type RetrieveData = {
  services: Service[];
  statuses: Record<string, ServiceStatus[]>[];
};
type RetrieveResponse = ResApi<RetrieveData>;

const getStatuses = (
  serviceName: string,
  serviceKind: string,
  commandName?: string,
  lastHours: number = 6
) =>
  prisma.serviceStatus.findMany({
    where: {
      service: {
        name: serviceName,
        kind: serviceKind,
      },
      commandName: commandName,
      timestamp: {
        gt: new Date(Date.now() - 1000 * 60 * 60 * lastHours),
      },
    },
  });

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
  const promises = services.map(async (service) => ({
    [service.name]: await getStatuses(
      service.name,
      service.kind,
      commandName,
      lastHours
    ),
  }));

  const statuses = await Promise.all(promises);
  return res.status(200).json(dataWrapper({ services, statuses }));
};

export type { RetrieveData };
export default handler;
