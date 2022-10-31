import styles from "./Uptime.module.css";

import Services from "../../public/services.json";

const Uptime: React.FC = () => (
  <div className={styles.container}>
    {Services.map((service) => (
      <div key={service.name} className={styles.service}>
        {service.name}
        {service.commands.map((command) => (
          <div key={command.name} className={styles.command}>
            {command.name}
          </div>
        ))}
      </div>
    ))}
  </div>
);

export default Uptime;
