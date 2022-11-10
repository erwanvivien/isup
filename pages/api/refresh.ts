import type { NextApiRequest, NextApiResponse } from "next";

import { ExecOutput, execWrapper } from "./exec";
import prisma from "../../prisma/prisma";
import { dataWrapper, errorWrapper, ERROR_IDS, ResApi } from "./utils";
import { clearInterval } from "timers";

type RefreshData = string;
type RefreshResponse = ResApi<RefreshData>;

type Service = {
  name: string;
  template: string;
  interval: number;
  commands: string[];
  variables: Record<string, any>;
};

type Template = Record<
  string,
  {
    variables: {
      possible: string[];
      mandatory: string[];
    } & Record<string, any>;
    commands: Record<string, string>;
  }
>;

const addStatus = (
  serviceName: string,
  serviceTemplate: string,
  commandName: string,
  output: ExecOutput
) => {
  // console.log("Adding status", commandName, "for", serviceName);
  return prisma.serviceStatus.create({
    data: {
      serviceName,
      serviceTemplate,
      retcode: output.error?.code || 0,
      commandName,
      stdout: output.stdout,
    },
  });
};

const addService = (
  serviceName: string,
  serviceTemplate: string,
  serviceInterval: number
) => {
  // console.log("Adding service", serviceName);
  const data = {
    name: serviceName,
    template: serviceTemplate,
    interval: serviceInterval,
  };

  return prisma.service.upsert({
    where: {
      name_template: {
        name: serviceName,
        template: serviceTemplate,
      },
    },
    create: data,
    update: data,
  });
};

const retrieveStatus = async (
  command: string,
  service: Service,
  Templates: Template
) => {
  const params = Object.entries(service.variables)
    .map((e) => e.join("="))
    .join(" ");
  if (!(service.template in Templates))
    return addStatus(service.name, service.template, command, {
      stdout: `Template ${service.template} not found`,
      stderr: "",
      error: {
        code: 1,
        name: "TemplateError",
        message: `Template ${service.template} not found`,
      },
    });
  const template = (Templates as any)[service.template];
  const execCommand = template.commands[command];
  const output = await execWrapper(`${params} ${execCommand}`);
  return await addStatus(service.name, service.template, command, output);
};

let interval: NodeJS.Timeout;

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<RefreshResponse>
) => {
  const Services = (await import("../../config/services.json")).default;
  const Templates = (await import("../../config/templates.json")).default;

  if (req.method !== "GET")
    return res
      .status(405)
      .json(
        errorWrapper(ERROR_IDS.METHOD_NOT_ALLOWED, "Method not allowed", 405)
      );

  const refreshData = async () => {
    for (const service of Services) {
      await addService(service.name, service.template, service.interval);
    }

    const statusPromises = Services.flatMap(
      async (service) =>
        await Promise.all(
          service.commands.map(async (command) =>
            retrieveStatus(command, service, Templates)
          )
        )
    );

    const _statuses = await Promise.allSettled(statusPromises);
    console.log(`[${new Date().toISOString()}]`, "Refreshed");
  };

  refreshData();
  clearInterval(interval);
  interval = setInterval(refreshData, 1000 * 30);

  return res.status(200).json(dataWrapper("OK"));
};

export type { RefreshResponse, RefreshData };
export default handler;
