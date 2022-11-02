import {
  Badge,
  Button,
  Code,
  Collapse,
  Group,
  HoverCard,
  MantineGradient,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons";

import { useState } from "react";
import { RetrieveData } from "../../pages/api/retrieve";

import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
dayjs.extend(relativeTime);

import styles from "./Uptime.module.css";

type CommandProps = {
  command: string;
  statuses: RetrieveData["statuses"][string];
};

const Command: React.FC<CommandProps> = ({ command, statuses }) => {
  const sorted = statuses
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, 14)
    .reverse();

  return (
    <div>
      <Title order={3}>{command}</Title>
      <Group style={{ display: "flex", flexWrap: "nowrap", gap: 4 }}>
        {sorted.map((status) => (
          <HoverCard key={status.id} width={280} shadow="md" closeDelay={50}>
            <HoverCard.Target>
              <Button
                style={{ flex: 1, height: 24, padding: 0 }}
                color={status.retcode === 0 ? "green" : "red"}
              >
                {status.retcode === 0 ? "✓" : "X"}
              </Button>
            </HoverCard.Target>
            <HoverCard.Dropdown>
              <Text weight={700}>{dayjs(status.timestamp).toString()}</Text>
              <Text>stdout</Text>
              <Code block={true}>{status.stdout}</Code>
              <Text>exit: {status.retcode}</Text>
            </HoverCard.Dropdown>
          </HoverCard>
        ))}
      </Group>
      <Group position="apart" style={{ marginTop: 4 }}>
        <Text size="xs" color="dimmed">
          {dayjs(sorted.at(0)?.timestamp).fromNow()}
        </Text>
        <Text size="xs" color="dimmed">
          {dayjs(sorted.at(-1)?.timestamp).fromNow()}
        </Text>
      </Group>
    </div>
  );
};

type CommandsProps = {
  service: string;
  statuses: RetrieveData["statuses"][string];
};

const Commands: React.FC<CommandsProps> = ({ service, statuses }) => {
  const commands = Array.from(new Set(statuses.map((s) => s.commandName))).sort(
    (a, b) => a.localeCompare(b)
  );
  const statusPerCommands = Object.fromEntries(
    commands.map(
      (command) =>
        [command, statuses.filter((e) => e.commandName === command)] as const
    )
  );

  const uptimePerCommands = Object.fromEntries(
    commands.map((command) => {
      const status = statusPerCommands[command]
        .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
        .slice(0, 14)
        .reverse();

      if (status.length === 0) return [command, 0];
      return [
        command,
        (status.filter((e) => e.retcode === 0).length * 100) / status.length,
      ] as const;
    })
  );

  const uptimeToGradient: (uptime: number) => MantineGradient = (uptime) => {
    if (uptime > 90) return { from: "teal", to: "lime", deg: 105 };
    if (uptime > 70) return { from: "#ffc107", to: "yellow" };
    return { from: "orange", to: "red" };
  };

  const [open, setOpen] = useState(
    commands.filter((e) => uptimePerCommands[e] === 100).length !==
      commands.length
  );

  return (
    <>
      <div className={styles.commands_title} onClick={() => setOpen(!open)}>
        <Title>{service}</Title>
        {commands.map((command) => (
          <Badge
            key={command}
            variant="gradient"
            gradient={uptimeToGradient(uptimePerCommands[command])}
          >
            {command}
          </Badge>
        ))}
        {open ? <IconChevronUp /> : <IconChevronDown />}
      </div>
      <Collapse in={open} className={styles.commands_list}>
        {commands.map((command) => (
          <Command
            key={command}
            command={command}
            statuses={statusPerCommands[command]}
          />
        ))}
      </Collapse>
    </>
  );
};

export default Commands;
