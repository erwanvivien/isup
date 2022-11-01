import styles from "./Uptime.module.css";

import { Suspense, useEffect, useState } from "react";
import { RetrieveData, RetrieveResponse } from "../../pages/api/retrieve";
import Service from "./Service";

const Uptime: React.FC = () => {
  const [services, setServices] = useState<RetrieveData["services"]>([]);
  const [statuses, setStatuses] = useState<RetrieveData["statuses"]>({});

  useEffect(() => {
    const controllerAbort = new AbortController();
    const signal = controllerAbort.signal;

    const fetchServices = async () => {
      const resp = await fetch("/api/retrieve", { signal })
        .then((res) => res.json() as Promise<RetrieveResponse>)
        .catch((err) => console.error(err));

      if (!resp || !resp.success) return;

      setServices(resp.data.services);
      setStatuses(resp.data.statuses);
    };

    fetchServices();
    const interval = setInterval(fetchServices, 1000 * 60);

    return () => {
      controllerAbort.abort();
      clearInterval(interval);
    };
  }, []);

  return (
    <Suspense>
      <div className={styles.container}>
        {services.map((service) => (
          <Service
            key={service.name}
            service={service}
            statuses={statuses[service.name]}
          />
        ))}
      </div>
    </Suspense>
  );
};

export default Uptime;
