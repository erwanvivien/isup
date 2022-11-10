import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../prisma/prisma";
import { Service, ServiceStatus } from "@prisma/client";
import { dataWrapper, errorWrapper, ERROR_IDS, ResApi } from "./utils";

type ServiceStatusDate = ServiceStatus & {
  timestamp: string;
};
type RetrieveOneResponse = ResApi<ServiceStatusDate>;

const getStatus = (timestamp: string, commandName: string, service: string) =>
  prisma.serviceStatus.findFirst({
    where: {
      commandName,
      timestamp,
      serviceName: service,
    },
  }) as any as Promise<ServiceStatusDate | null>;

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<RetrieveOneResponse>
) => {
  if (req.method !== "GET") {
    const error = errorWrapper(
      ERROR_IDS.METHOD_NOT_ALLOWED,
      "Method not allowed",
      405
    );
    return res.status(405).json(error);
  }

  const { timestamp, command, service } = req.query;
  if (
    typeof timestamp !== "string" ||
    typeof command !== "string" ||
    typeof service !== "string"
  ) {
    return res
      .status(400)
      .json(errorWrapper(ERROR_IDS.BAD_REQUEST, "Bad request", 400));
  }

  const status = await getStatus(timestamp, command, service);
  if (!status) {
    return res
      .status(404)
      .json(errorWrapper(ERROR_IDS.NOT_FOUND, "Not found", 404));
  }

  res.setHeader("Cache-Control", "max-age=3600");
  return res.status(200).json(dataWrapper(status));
};

export type { RetrieveOneResponse, ServiceStatusDate };
export default handler;
