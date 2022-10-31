import type { NextApiRequest, NextApiResponse } from "next";

import { execWrapper } from "./exec";
import Services from "../../public/services.json";

type Data = {};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const promises = Services.map(async (service) => ({
    [service.name]: await Promise.all(
      service.commands.map(({ command }) => execWrapper(command))
    ),
  }));
  const pings = await Promise.all(promises);

  res.status(200).json(pings);
};

export default handler;
