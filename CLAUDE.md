@backend/AGENTS.md

# Project: VetClinic (Elixir 1.20.4 / OTP 29 / Phoenix 1.8.16 / Absinthe 1.12.0)

Portfolio app: Phoenix + Absinthe GraphQL API in `backend/`, React + Apollo frontend in `frontend/`.
Postgres runs in Docker on port **5433** (`docker compose up -d`). Port 5432 belongs to another project; don't touch it.

## Commands
Run these from `backend/`:
- Test: `mix test` (single test: `mix test test/path_test.exs:42`)
- Before finishing any task: `mix precommit` (compile with warnings as errors, unlock unused deps, format, `credo --strict`, test)

## Architecture
- Business logic lives in contexts under `lib/vet_clinic/`. Resolvers and controllers in `lib/vet_clinic_web/` stay thin.
- Never call Repo from the web layer.
- GraphQL types go in `lib/vet_clinic_web/schema/`, resolvers in `lib/vet_clinic_web/resolvers/`. Load associations with Dataloader (`Clinic.datasource/0`), not per-row queries.
- Subscriptions are triggered from mutations through Absinthe `trigger`. Don't publish manually from contexts.

## Conventions
- Pattern-match in function heads; use `with` for ok/error chains.
- All writes go through changesets; use Ecto.Multi for multi-step writes.
- Resolvers return `{:ok, result}` or `{:error, reason}`. Turn changeset errors into GraphQL errors; never raise.

## Elixir style

Follow the [Elixir Style Guide](https://github.com/christopheradams/elixir_style_guide), especially the [Expressions](https://github.com/christopheradams/elixir_style_guide#expressions) section:

- Never write a pipe chain on one line. Put each step of a pipeline on its own line:
  ```elixir
  # Bad
  Owner |> order_by(:name) |> Repo.all()

  # Good
  Owner
  |> order_by(:name)
  |> Repo.all()
  ```
- Don't pipe just once. Use a plain function call instead (`Repo.get(Owner, id)`, not `Owner |> Repo.get(id)`).
- Start a pipeline with a bare value (variable, module or struct), not a function call.
- Group aliases that share a parent module with curly braces:
  ```elixir
  alias VetClinic.Clinic.{Appointment, Owner, Pet}
  alias VetClinic.Repo
  ```

## Don'ts
- Don't modify existing migrations; create new ones.
- Ask before adding deps to `mix.exs`.
