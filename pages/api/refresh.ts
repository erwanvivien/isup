import type { NextApiRequest, NextApiResponse } from "next";

import { ExecOutput, execWrapper } from "./exec";
import Services from "../../public/services.json";
import prisma from "../../prisma/prisma";
import { dataWrapper, errorWrapper, ERROR_IDS, ResApi } from "./utils";
import { clearInterval } from "timers";

type RefreshData = string;
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

let interval: NodeJS.Timeout;

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

  clearInterval(interval);
  const refreshData = async () => {
    const promises = Services.flatMap(async (service) => ({
      [service.name]: await Promise.all(
        service.commands.map(({ command, name }) =>
          execWrapper(command).then((output) =>
            addStatus(service.name, service.kind, name, output)
          )
        )
      ),
    }));

    const _ = await Promise.all(promises);
    console.log(`[${new Date().toISOString()}]`, "Refreshed");
  };

  refreshData();
  interval = setInterval(refreshData, 1000 * 30);

  return res.status(200).json(dataWrapper("OK"));
};

export type { RefreshResponse, RefreshData };
export default handler;
