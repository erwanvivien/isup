import styles from "./Uptime.module.css";

import { Suspense, useEffect, useState } from "react";
import { RetrieveData, RetrieveResponse } from "../../pages/api/retrieve";
import Service from "./Service";
import { Grid, Loader, SimpleGrid, Text, Title } from "@mantine/core";
import Commands from "./Commands";
import Link from "next/link";

type Stats = Record<
  string,
  { total: number; failed: number; succeeded: number }
>;

const Uptime: React.FC = () => {
  const [services, setServices] = useState<RetrieveData["services"]>([]);
  const [statuses, setStatuses] = useState<RetrieveData["statuses"]>({});
  const [stats, setStats] = useState<Stats>({});
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    const controllerAbort = new AbortController();
    const signal = controllerAbort.signal;

    const fetchServices = async () => {
      fetch("/api/retrieve", { signal })
        .then((res) => res.json() as Promise<RetrieveResponse>)
        .then((resp) => {
          if (!resp || !resp.success) return;

          setServices(resp.data.services);
          setStatuses(resp.data.statuses);
          setStats(resp.data.succeeded);
        })
        .catch((err) => (!signal.aborted ? console.error(err) : null))
        .then(() => setFetched(true));
    };

    fetchServices();
    const interval = setInterval(fetchServices, 1000 * 60);

    return () => {
      controllerAbort.abort();
      clearInterval(interval);
    };
  }, []);

  const ServicesDisplay: React.FC = () => (
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
  );

  if (!fetched) {
    return <Loader />;
  }

  if (services.length === 0) {
    return (
      <>
        <Title>No services were fetched</Title>
        <Text>
          Please try to{" "}
          <Link href="/api/refresh" style={{ color: "lightskyblue" }}>
            refresh
          </Link>
        </Text>
      </>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <ServicesDisplay />
        {services.map((service) => (
          <div key={service.name}>
            <Commands
              service={service.name}
              statuses={statuses[service.name]}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default Uptime;
