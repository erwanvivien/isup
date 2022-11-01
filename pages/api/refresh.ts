import type { NextApiRequest, NextApiResponse } from "next";

import { ExecOutput, execWrapper } from "./exec";
import Services from "../../public/services.json";
import prisma from "../../prisma/prisma";
import { ServiceStatus } from "@prisma/client";
import { dataWrapper, errorWrapper, ERROR_IDS, ResApi } from "./utils";

type RefreshData = Record<string, ServiceStatus[]>[];
type RefreshResponse = ResApi<RefreshData>;

const addStatus = (
  serviceName: string,
  serviceKind: string,
  commandName: string,
  output: ExecOutput
) =>
  prisma.serviceStatus.create({
    data: {
      serviceName,
      serviceKind,
      retcode: output.error?.code || 0,
      commandName,
      stdout: output.stdout,
    },
  });

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<RefreshResponse>
) => {
  if (req.method !== "GET")
    return res
      .status(405)
      .json(
        errorWrapper(ERROR_IDS.METHOD_NOT_ALLOWED, "Method not allowed", 405)
      );

  const promises = Services.flatMap(async (service) => ({
    [service.name]: await Promise.all(
      service.commands.map(({ command, name }) =>
        execWrapper(command).then((output) =>
          addStatus(service.name, service.kind, name, output)
        )
      )
    ),
  }));

  const commands = await Promise.all(promises);
  return res.status(200).json(dataWrapper(commands));
};

export type { RefreshData };
export default handler;
