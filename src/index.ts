import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import type { ResolveConfigFn } from "@microlabs/otel-cf-workers";
import { instrument } from "@microlabs/otel-cf-workers";

import { HttpAppLive } from "./http";
import { SERVICE_NAME, tracerHttpMiddleware } from "./services/tracer";

declare global {
	// eslint-disable-next-line no-var
	var env: Env;
}

const config: ResolveConfigFn = (_env: Env, _trigger) => {
	return {
		exporter: {
			url: "http://localhost:4318/v1/traces",
			headers: {},
		},
		sampling: {
			headSampler: { ratio: 1 },
		},
		service: { name: SERVICE_NAME },
	};
};

export const workerHandler = {
	async fetch(
		request: Request,
		env: Env,
		context: ExecutionContext,
	): Promise<Response> {
		Object.assign(globalThis, {
			env,
		});

		const handler = HttpApiBuilder.toWebHandler(HttpAppLive, {
			middleware: tracerHttpMiddleware,
		});

		return handler.handler(request);
	},
};

export default instrument(workerHandler, config);
