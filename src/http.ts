import { HttpApiBuilder, HttpApiScalar, HttpServer } from "@effect/platform";
import { Layer, pipe } from "effect";
import { Api } from "./api";
import { HttpRootLive } from "./routes/root/http";

export const ApiLive = Layer.provide(HttpApiBuilder.api(Api), [HttpRootLive]);

export const HttpAppLive = pipe(
	HttpApiBuilder.Router.Live,
	Layer.provide(HttpApiScalar.layer()),
	Layer.provideMerge(HttpApiBuilder.middlewareOpenApi()),
	Layer.provideMerge(
		HttpApiBuilder.middlewareCors({
			credentials: true,
		}),
	),
	Layer.provideMerge(HttpServer.layerContext),
	Layer.provideMerge(ApiLive),
);
