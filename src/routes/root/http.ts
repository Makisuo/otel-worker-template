import { HttpApiBuilder } from "@effect/platform";
import { Effect } from "effect";
import { Api } from "../../api";

export const HttpRootLive = HttpApiBuilder.group(Api, "Root", (handlers) =>
	Effect.gen(function* () {
		return handlers.handle("health", () =>
			Effect.gen(function* () {
				yield* program;
				return yield* Effect.succeed("Hello World");
			}).pipe(Effect.withSpan("health")),
		);
	}),
);

const program = Effect.void.pipe(
	Effect.delay("100 millis"),
	// Annotate the span with a key-value pair
	Effect.tap(() => Effect.annotateCurrentSpan("amazing", "sogood")),
	Effect.tap(() => Effect.log("Hello")),
	Effect.tap(() => console.log("Hello World")),
	// Wrap the effect in a span named 'myspan'
	Effect.withSpan("myspan"),
);

const someTestFunc = Effect.fn("someTestFunc")(function* (loops = 10000) {
	for (let i = 0; i < loops; i++) {
		yield* Effect.log(`Hello World-${i}`);
	}

	return yield* Effect.succeed(loops);
});
