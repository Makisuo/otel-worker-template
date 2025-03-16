import * as EffectOpenTelemetryTracer from "@effect/opentelemetry/Tracer";
import {
	FetchHttpClient,
	HttpApiBuilder,
	HttpMiddleware,
	HttpServer,
} from "@effect/platform";
import { type ResolveConfigFn, instrument } from "@microlabs/otel-cf-workers";
import { trace } from "@opentelemetry/api";
import { ConfigProvider, Layer, Logger, pipe } from "effect";
import { ApiLive, HttpAppLive } from "./http";
import { TracingOtelLive } from "./tracing";

const config: ResolveConfigFn = (env: Env) => {
	return {
		exporter: {
			url: "http://localhost:4318/v1/traces",
		},
		service: { name: "otel-worker-template" },
	};
};

const LiveApp = (env: Env, _context: ExecutionContext, _request?: Request) =>
	Layer.mergeAll(
		FetchHttpClient.layer,
		Layer.setConfigProvider(ConfigProvider.fromJson(env)),
		TracingOtelLive,
		Logger.replace(Logger.defaultLogger, Logger.jsonLogger),
	);

export const workerHandler = {
	async fetch(
		request: Request,
		env: Env,
		context: ExecutionContext,
	): Promise<Response> {
		return HttpApiBuilder.toWebHandler(
			Layer.mergeAll(ApiLive, HttpServer.layerContext).pipe(
				Layer.provide(
					LiveApp(env, context, request).pipe(
						Layer.withParentSpan(
							EffectOpenTelemetryTracer.makeExternalSpan(
								// biome-ignore lint/style/noNonNullAssertion: <explanation>
								trace
									.getActiveSpan()!
									.spanContext(),
							),
						),
					),
				),
			),
			{ middleware: HttpMiddleware.logger },
		).handler(request);
	},
};

export default instrument(workerHandler, config) satisfies ExportedHandler<Env>;
