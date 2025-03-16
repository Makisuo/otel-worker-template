import * as EffectOpenTelemetryResource from "@effect/opentelemetry/Resource";
import * as EffectOpenTelemetryTracer from "@effect/opentelemetry/Tracer";
import { Layer } from "effect";

export const TracingOtelLive = EffectOpenTelemetryTracer.layerGlobal.pipe(
	Layer.provide(
		EffectOpenTelemetryResource.layer({
			serviceName: "otel-worker-template",
		}),
	),
);
