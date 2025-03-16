import * as Resource from "@effect/opentelemetry/Resource";
import * as Tracer from "@effect/opentelemetry/Tracer";
import { HttpMiddleware, HttpServerRequest } from "@effect/platform";
import type { Default } from "@effect/platform/HttpApp";
import type { HttpServerResponse } from "@effect/platform/HttpServerResponse";
import { trace } from "@opentelemetry/api";
import { Effect, Layer } from "effect";
import type { AnySpan } from "effect/Tracer";

export const SERVICE_NAME = "otel-worker-template";

export const TraceLive = Tracer.layerGlobal.pipe(
	Layer.provide(
		Resource.layer({
			serviceName: SERVICE_NAME,
		}),
	),
);

export const getParentSpan = (): AnySpan | undefined => {
	const span = trace.getActiveSpan();
	return span && Tracer.makeExternalSpan(span.spanContext());
};

export const withActiveSpan = <A, E, R>(layer: Layer.Layer<A, E, R>) => {
	const parent = getParentSpan();
	return parent
		? layer.pipe(Layer.withParentSpan(parent))
		: layer.pipe(Layer.withSpan("orphaned"));
};

export const tracerHttpMiddleware = HttpMiddleware.make((httpApp) =>
	Effect.gen(function* () {
		const span = yield* Tracer.currentOtelSpan;

		const request = yield* HttpServerRequest.HttpServerRequest;

		span.updateName(`http.server ${request.method} ${request.url}`);

		return yield* httpApp;
	}),
) as <E, R>(
	httpApp: Default<E, R>,
) => Effect.Effect<
	HttpServerResponse,
	never,
	R | HttpServerRequest.HttpServerRequest
>;
