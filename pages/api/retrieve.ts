import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../prisma/prisma";
import { Service, ServiceStatus } from "@prisma/client";
import { dataWrapper, ResApi } from "./utils";

type ServiceStatusDate = ServiceStatus & {
  timestamp: string;
};

type RetrieveData = {
  services: Service[];
  statuses: Record<
    string,
    {
      command: string;
      time: string;
      ok: boolean;
    }[]
  >;
  succeeded: Record<
    string,
    { total: number; failed: number; succeeded: number }
  >;
};
type RetrieveResponse = ResApi<RetrieveData>;

const getStatuses = (
  serviceName: string,
  serviceTemplate: string,
  commandName?: string,
  lastHours: number = 0.5
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

const getSucceeded = async (serviceName: string) => {
  const out = await prisma.$queryRaw` 
SELECT
  COUNT(*), COUNT(CASE WHEN "retcode" = 0 THEN 1 END)
FROM
  ServiceStatus
WHERE
  serviceName = ${serviceName};
`;
  return out;
};

const getServices = () => prisma.service.findMany({});

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<RetrieveResponse>
) => {
  let lastHours = 0.5;
  if (req.query.lastHours && Number(req.query.lastHours) > 0) {
    lastHours = Number(req.query.lastHours);
  }

  let commandName: string | undefined = undefined;
  if (req.query.commandName) {
    commandName = String(req.query.commandName);
  }

  const services = await getServices();
  const promises = services.map(async (service) => {
    const status = await getStatuses(
      service.name,
      service.template,
      commandName,
      lastHours
    );

    return status.map((s) => ({
      command: s.commandName,
      time: s.timestamp,
      ok: s.retcode === 0,
    }));
  });

  const exec_statuses = await Promise.all(promises);
  const statuses = Object.fromEntries(
    services.map((service, i) => [service.name, exec_statuses[i]])
  );

  const arraySuccess = services.map(async (service) => {
    const success = (await getSucceeded(service.name)) as any;
    const total = Number(success[0]["COUNT(*)"]);
    const succeeded = Number(
      success[0]['COUNT(CASE WHEN "retcode" = 0 THEN 1 END)']
    );

    return [
      service.name,
      {
        total,
        succeeded,
        failed: total - succeeded,
      },
    ] as const;
  });
  const succeeded = Object.fromEntries(await Promise.all(arraySuccess));

  return res.status(200).json(
    dataWrapper({
      services,
      statuses,
      succeeded,
    })
  );
};

export type { RetrieveResponse, RetrieveData };
export default handler;
