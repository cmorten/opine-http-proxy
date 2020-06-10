.PHONY: build ci doc fmt fmt-check lock precommit test typedoc

build:
	@deno run --allow-net --lock=lock.json --reload mod.ts

ci:
	@make fmt-check
	@make build
	@make test

doc:
	@deno doc ./mod.ts

fmt:
	@deno fmt

fmt-check:
	@deno fmt --check

lock:
	@deno run --allow-net --lock=lock.json --lock-write --reload mod.ts

precommit:
	@make lock
	@make typedoc
	@make fmt
	@make fmt

test:
	@deno test --allow-net

typedoc:
	@typedoc --ignoreCompilerErrors --out ./docs --mode modules --includeDeclarations --excludeExternals ./src

