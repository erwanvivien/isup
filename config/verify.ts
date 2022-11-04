import Templates from "./templates.json";
import Services from "./services.json";
import { exit } from "process";

type TemplateType = keyof typeof Templates;

let ret = 0;

Services.forEach((service) => {
  const template = Templates[service.template as TemplateType];
  const mandatoryVar = template.variables.mandatory;

  const missing = mandatoryVar.filter((e) => !(e in service.variables));

  if (missing.length > 0) {
    console.log(
      `Service ${service.name} has missing variables: ['${missing.join(
        "', '"
      )}']`
    );
    ret = 1;
  }
});

exit(ret);
