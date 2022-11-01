import styles from "./Uptime.module.css";

import { Suspense, useEffect, useState } from "react";
import { RetrieveData, RetrieveResponse } from "../../pages/api/retrieve";
import Service from "./Service";
import { Grid, Loader, SimpleGrid, Title } from "@mantine/core";

type Stats = Record<
  string,
  { total: number; failed: number; succeeded: number }
>;

const formatStats = (
  data: RetrieveData["statuses"]
): [Record<string, Stats>, Stats] => {
  const serviceEntries: [string, Stats][] = Object.entries(data).map(
    ([serviceName, commandStatuses]) => [
      serviceName,
      commandStatuses.reduce((acc, curr) => {
        acc[curr.commandName] ??= { total: 0, failed: 0, succeeded: 0 };

        acc[curr.commandName].total++;
        if (curr.retcode !== 0) acc[curr.commandName].failed++;
        else acc[curr.commandName].succeeded++;

        return acc;
      }, {} as Stats),
    ],
    {}
  );

  const statEntries = serviceEntries.reduce((acc, [serviceName, curr]) => {
    acc[serviceName] ??= { total: 0, failed: 0, succeeded: 0 };

    Object.values(curr).forEach(({ total, failed, succeeded }) => {
      acc[serviceName].total += total;
      acc[serviceName].failed += failed;
      acc[serviceName].succeeded += succeeded;
    });

    return acc;
  }, {} as Stats);

  return [Object.fromEntries(serviceEntries), statEntries];
};

const Uptime: React.FC = () => {
  const [services, setServices] = useState<RetrieveData["services"]>([]);
  const [serviceStats, setStatsService] = useState<Record<string, Stats>>({});
  const [stats, setStats] = useState<Stats>({});

  useEffect(() => {
    const controllerAbort = new AbortController();
    const signal = controllerAbort.signal;

    const fetchServices = async () => {
      const resp = await fetch("/api/retrieve", { signal })
        .then((res) => res.json() as Promise<RetrieveResponse>)
        .catch((err) => console.error(err));

      if (!resp || !resp.success) return;

      const [serviceStats, stats] = formatStats(resp.data.statuses);

      setServices(resp.data.services);
      setStatsService(serviceStats);
      setStats(stats);
    };

    fetchServices();
    const interval = setInterval(fetchServices, 1000 * 60);

    return () => {
      controllerAbort.abort();
      clearInterval(interval);
    };
  }, []);

  return (
    <Suspense fallback={<Loader />}>
      <Title order={2}>Test</Title>
      <div className={styles.container}>
        <SimpleGrid cols={3}>
          {services.map((service, i) => (
            <Service
              key={service.name}
              title={service.name}
              total={stats[service.name]?.total ?? 0}
              completed={stats[service.name]?.succeeded ?? 0}
              stats={[
                {
                  label: "Failed",
                  value: stats[service.name]?.failed ?? 0,
                },
                {
                  label: "Refresh interval",
                  value: "" + service.interval + "s",
                },
              ]}
            />
          ))}
        </SimpleGrid>
      </div>
    </Suspense>
  );
};

export default Uptime;
