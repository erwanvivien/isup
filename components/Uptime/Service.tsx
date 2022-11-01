import { RetrieveData } from "../../pages/api/retrieve";

type ServiceListProps = {
  service: RetrieveData["services"][number];
  statuses: RetrieveData["statuses"][string];
};

const ServiceList: React.FC<ServiceListProps> = ({ service, statuses }) => (
  <></>
);

export default ServiceList;
