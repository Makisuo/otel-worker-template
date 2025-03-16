import { HttpApi } from "@effect/platform";
import { RootApi } from "./routes/root/api";

export class Api extends HttpApi.make("api").add(RootApi) {}
