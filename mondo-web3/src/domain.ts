import { createDomain } from "effector";
import { attachLogger } from "effector-logger/attach";

const domain = createDomain("mndc");
attachLogger(domain);

export default domain;
