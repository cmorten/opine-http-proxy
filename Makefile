.PHONY: build ci doc fmt fmt-check lint lock precommit test typedoc

build:
	@deno run --allow-net --allow-read --lock=lock.json --reload mod.ts

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

lint:
	@deno lint --unstable

lock:
	@deno run --allow-net --allow-read --lock=lock.json --lock-write --reload mod.ts

precommit:
	@make lock
	@make typedoc
	@make fmt
	@make fmt

test:
	@deno test --allow-net --allow-read

typedoc:
	@rm -rf docs
	@typedoc --ignoreCompilerErrors --out ./docs --mode modules --includeDeclarations --excludeExternals --name opine-http-proxy ./src
	@make fmt
	@make fmt
	@echo 'future: true\nencoding: "UTF-8"\ninclude:\n  - "_*_.html"\n  - "_*_.*.html"' > ./docs/_config.yaml
