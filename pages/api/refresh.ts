import type { NextApiRequest, NextApiResponse } from "next";

import { ExecOutput, execWrapper } from "./exec";
import Services from "../../config/services.json";
import Templates from "../../config/templates.json";
import prisma from "../../prisma/prisma";
import { dataWrapper, errorWrapper, ERROR_IDS, ResApi } from "./utils";
import { clearInterval } from "timers";

type RefreshData = string;
type RefreshResponse = ResApi<RefreshData>;

const addStatus = (
  serviceName: string,
  serviceTemplate: string,
  commandName: string,
  output: ExecOutput
) =>
  prisma.serviceStatus.create({
    data: {
      serviceName,
      serviceTemplate,
      retcode: output.error?.code || 0,
      commandName,
      stdout: output.stdout,
    },
  });

let interval: NodeJS.Timeout;

type TemplateType = typeof Templates;
type TemplateKinds = keyof TemplateType;
type TemplateCommands = keyof TemplateType[TemplateKinds]["commands"];

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
    const promises = Services.flatMap(
      async (service) =>
        await Promise.all(
          service.commands.map((command) => {
            const params = Object.entries(service.variables)
              .map((e) => e.join("="))
              .join(" ");
            const execCommand =
              Templates[service.template as TemplateKinds].commands[
                command as TemplateCommands
              ];
            return execWrapper(`${params} ${execCommand}`).then((output) =>
              addStatus(service.name, service.template, command, output)
            );
          })
        )
    );

    const _ = await Promise.all(promises);
    console.log(`[${new Date().toISOString()}]`, "Refreshed");
  };

  refreshData();
  interval = setInterval(refreshData, 1000 * 30);

  return res.status(200).json(dataWrapper("OK"));
};

export type { RefreshResponse, RefreshData };
export default handler;
