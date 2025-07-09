import { Applications } from "@collabsoft-net/enums";
import { PlatformBridge } from "./PlatformBridge";

export type CreatePlatformBridge = <T extends Applications> (product: T) => Promise<PlatformBridge<T>>;
