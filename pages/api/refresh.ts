import type { NextApiRequest, NextApiResponse } from "next";

import { ExecOutput, execWrapper } from "./exec";
import Services from "../../public/services.json";
import prisma from "../../prisma/prisma";
import { ServiceStatus } from "@prisma/client";

type Data = Record<string, ServiceStatus[]>[];

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

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const promises = Services.map(async (service) => ({
    [service.name]: await Promise.all(
      service.commands.map(({ command, name }) =>
        execWrapper(command).then((output) =>
          addStatus(service.name, service.kind, name, output)
        )
      )
    ),
  }));

  const commands = await Promise.all(promises);
  return res.status(200).json(commands);
};

export default handler;
