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

import { useEffect, useState } from "react";
import { RetrieveData } from "../../pages/api/retrieve";

import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
dayjs.extend(relativeTime);

import styles from "./Uptime.module.css";
import {
  RetrieveOneResponse,
  ServiceStatusDate,
} from "../../pages/api/retrieve_one";

type CommandProps = {
  command: string;
  statuses: RetrieveData["statuses"][string];
  service: string;
};

type CommandCard = {
  time: string;
  command: string;
  service: string;
  ok: boolean;
};

const CommandCard: React.FC<CommandCard> = ({ command, service, time, ok }) => {
  const [status, setStatus] = useState<ServiceStatusDate | null>(null);

  useEffect(() => {
    const controllerAbort = new AbortController();
    const signal = controllerAbort.signal;

    const url = `/api/retrieve_one?service=${service}&command=${command}&timestamp=${time}`;

    const fetchStatus = async () => {
      fetch(url, {
        signal,
      })
        .then((res) => res.json() as Promise<RetrieveOneResponse>)
        .then((res) => res.success && setStatus(res.data))
        .catch((err) => (!signal.aborted ? console.error(err) : null));
    };

    let timeout: NodeJS.Timeout;
    fetchStatus();

    return () => {
      controllerAbort.abort();
      clearTimeout(timeout);
    };
  }, [command, service, time]);

  return (
    <>
      <Text weight={700}>{dayjs(time).toString()}</Text>
      <Text>stdout</Text>
      <Code block={true}>{status ? status.stdout : "Loading..."}</Code>
      <Text>exit: {Number(!ok)}</Text>
    </>
  );
};

const Command: React.FC<CommandProps> = ({ command, statuses, service }) => {
  const sorted = statuses
    .sort((a, b) => Date.parse(b.time) - Date.parse(a.time))
    .slice(0, 14)
    .reverse();

  return (
    <div>
      <Title order={3}>{command}</Title>
      <Group style={{ display: "flex", flexWrap: "nowrap", gap: 4 }}>
        {sorted.map((status, index) => (
          <HoverCard key={index} width={280} shadow="md" closeDelay={50}>
            <HoverCard.Target>
              <Button
                style={{ flex: 1, height: 24, padding: 0 }}
                color={status.ok ? "green" : "red"}
              >
                {status.ok ? "✓" : "X"}
              </Button>
            </HoverCard.Target>
            <HoverCard.Dropdown>
              <CommandCard
                command={command}
                ok={status.ok}
                service={service}
                time={status.time}
              />
            </HoverCard.Dropdown>
          </HoverCard>
        ))}
      </Group>
      <Group position="apart" style={{ marginTop: 4 }}>
        <Text size="xs" color="dimmed">
          {dayjs(sorted.at(0)?.time).fromNow()}
        </Text>
        <Text size="xs" color="dimmed">
          {dayjs(sorted.at(-1)?.time).fromNow()}
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
  const commands = Array.from(new Set(statuses.map((s) => s.command))).sort(
    (a, b) => a.localeCompare(b)
  );
  const statusPerCommands = Object.fromEntries(
    commands.map(
      (command) =>
        [command, statuses.filter((e) => e.command === command)] as const
    )
  );

  const uptimePerCommands = Object.fromEntries(
    commands.map((command) => {
      const status = statusPerCommands[command]
        .sort((a, b) => Date.parse(b.time) - Date.parse(a.time))
        .slice(0, 14)
        .reverse();

      if (status.length === 0) return [command, 0];
      return [
        command,
        (status.filter((e) => e.ok).length * 100) / status.length,
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
            service={service}
          />
        ))}
      </Collapse>
    </>
  );
};

export default Commands;
