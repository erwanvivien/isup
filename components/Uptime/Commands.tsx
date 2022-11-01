import { Button, Collapse, Stack, Text } from "@mantine/core";
import { format } from "path";
import { useState } from "react";
import { RetrieveData } from "../../pages/api/retrieve";

type CommandProps = {
  command: string;
  statuses: RetrieveData["statuses"][string];
};

const Command: React.FC<CommandProps> = ({ command, statuses }) => {
  return (
    <div>
      <Text>{JSON.stringify(statuses)}</Text>
    </div>
  );
};

type CommandsProps = {
  service: string;
  statuses: RetrieveData["statuses"][string];
};

const Commands: React.FC<CommandsProps> = ({ service, statuses }) => {
  const [open, setOpen] = useState(true);

  const commands = Array.from(new Set(statuses.map((s) => s.commandName)));

  return (
    <>
      <Collapse in={open}>
        {commands.map((command) => (
          <Command
            key={command}
            command={command}
            statuses={statuses.filter((e) => e.commandName === command)}
          />
        ))}
      </Collapse>
    </>
  );
};

export default Commands;
