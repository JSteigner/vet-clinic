@backend/AGENTS.md

# Project: VetClinic (Elixir 1.20.4 / OTP 29 / Phoenix 1.8.16 / Absinthe 1.12.0)

Portfolio app: Phoenix + Absinthe GraphQL API in `backend/`, React + Apollo frontend in `frontend/`.
Postgres 18 on port 5432 by default: a local install (Postgres.app here) or `docker compose up -d`. Override the connection with `DB_HOST`, `DB_PORT`, `DB_USER` and `DB_PASSWORD`.

## Commands
Run these from `backend/`:
- Test: `mix test` (single test: `mix test test/path_test.exs:42`)
- Before finishing any task: `mix precommit` (compile with warnings as errors, unlock unused deps, format, `credo --strict`, `dialyzer`, then tests with a 90% minimum coverage via `mix coveralls`). Check its exit code (`mix precommit; echo $?`), not just the last lines: a failing test doesn't stop the run.
- Coverage report: `mix coveralls.html` (writes `cover/excoveralls.html`)

## Architecture
- Business logic lives in contexts under `lib/vet_clinic/`. Resolvers and controllers in `lib/vet_clinic_web/` stay thin.
- `VetClinic.Clinic` is the public API. It delegates to the per-schema contexts (`Owners`, `Pets`, `Vets`, `Appointments`). The web layer and scripts call `Clinic`, never a context directly. A function lives in the context of the schema it returns.
- Never use Ecto (Repo, changesets, queries) in the web layer. Go through `Clinic`; e.g. `Clinic.validation_errors/1` turns a changeset into plain `%{field => [message]}` data.
- GraphQL types go in `lib/vet_clinic_web/schema/`, resolvers in `lib/vet_clinic_web/resolvers/`. Load associations with Dataloader (`Clinic.datasource/0`), not per-row queries.
- Subscriptions are triggered from mutations through Absinthe `trigger`. Don't publish manually from contexts.

## Tests
- Test files mirror `lib/` (e.g. `test/vet_clinic/pets/pets_test.exs`) and use `VetClinic.DataCase`.
- Build data with the `VetClinic.Fixtures` helpers (imported by `DataCase`) and Faker (`Cat`, `Lorem`, `Person`, `Phone` are aliased in `DataCase`). Use literal values only when the exact value matters, e.g. names for ordering or an invalid email.
- Use `past_appointment_fixture/1` for history (past times, any status); `appointment_fixture/1` books through the API, so it must be in the future.

## Conventions
- Pattern-match in function heads; use `with` for ok/error chains.
- All writes go through changesets; use Ecto.Multi for multi-step writes.
- Resolvers return `{:ok, result}` or `{:error, reason}`. Turn changeset errors into GraphQL errors; never raise.
- Every public function has a `@spec` (including `defdelegate`s in `Clinic`), and every schema defines `@type t`. Enum fields get their own type, e.g. `Appointment.status()`.
- Domain functions take `integer()` IDs. GraphQL IDs arrive as strings, so resolvers parse them first and turn a non-numeric ID into a "not found" error.

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
- Order module directives as `@moduledoc`, `@behaviour`, `use`, `import`, `require`, `alias`, module attributes, `defstruct`, `@type`, with a blank line between each group.
- Every module starts with a `@moduledoc` directly under `defmodule` (`@moduledoc false` for internal modules), followed by a blank line.
  ```elixir
  defmodule VetClinic.Clinic.Pet do
    @moduledoc """
    A patient of the clinic.
    """

    use Ecto.Schema

    import Ecto.Changeset

    alias VetClinic.Clinic.{Appointment, Owner}
  ```
- In Ecto schemas, declare changeset fields as module attributes using the `~w[]a` sigil, and put enum values in their own attribute:
  ```elixir
  @required_fields ~w[name species owner_id]a
  @optional_fields ~w[breed birth_date]a
  @fields @required_fields ++ @optional_fields

  @species ~w[dog cat bird rabbit other]a

  schema "pets" do
    field :species, Ecto.Enum, values: @species
  ```
  Then use `cast(attrs, @fields)` and `validate_required(@required_fields)` in the changeset.
- If a module name is written out in full more than once in a file, alias it and use the short name everywhere, including in typespecs. A module used only once stays fully qualified.
  ```elixir
  alias VetClinic.Appointments.Appointment

  has_many :appointments, Appointment
  appointments: [Appointment.t()] | Ecto.Association.NotLoaded.t()
  ```
- Put external aliases (Ecto, Faker, ...) first and `VetClinic` aliases second, with a blank line between the two groups:
  ```elixir
  alias Ecto.Changeset
  alias Ecto.Multi

  alias VetClinic.Appointments.Appointment
  alias VetClinic.Repo
  ```
- Group aliases that share a parent module with curly braces:
  ```elixir
  alias VetClinic.Clinic.{Appointment, Owner, Pet}
  alias VetClinic.Repo
  ```
- Exception: never use curly braces with Absinthe's `import_types`. Write one `import_types` per module. With the `{A, B}` form, Elixir doesn't record the type modules as compile-time dependencies of the schema, so changing a type module leaves a stale compiled schema (fields missing at runtime).

## Frontend (`frontend/`)
React 19, TypeScript 7 (strict), Vite 8, Tailwind CSS 4, Apollo Client. Run these from `frontend/`:
- Dev server: `npm run dev` (http://localhost:5173; expects the API on http://localhost:4000)
- Test: `npm test` (watch mode) or `npx vitest run src/path.test.tsx`
- Before finishing any frontend task: `npm run check` (`graphql-codegen --check`, `tsc -b`, `oxlint --deny-warnings`, `prettier --check`, then `vitest run --coverage`)
- Format: `npm run format`
- After any GraphQL API change: `npm run schema` (re-exports `schema.graphql` from the backend), then `npm run codegen` (regenerates `src/gql/`)

Conventions:
- Code lives in `src/features/<area>/` (pages, components, `queries.ts`, tests beside them); shared UI in `src/components/`, helpers in `src/lib/`.
- Write GraphQL documents with the generated `graphql()` from `src/gql` and let hooks infer their types. Never hand-write types for API data or pass generics like `useQuery<T>()`. Don't edit `src/gql/`; it's generated.
- Use arrow functions for components and helpers, not `function` declarations: `const Layout = () => (...)` with `export default Layout` at the bottom, and `export const formatInZone = (...) => ...` for named exports.
- Style with Tailwind classes. No CSS files besides `src/index.css`.
- Test components with Testing Library, querying by role and label text, not class names or test IDs.
- Prettier formats the code (no semicolons, single quotes, sorted Tailwind classes); don't hand-format.

## Don'ts
- Don't modify existing migrations; create new ones.
- Every migration must be reversible. Prefer `change/0` with reversible operations (use `modify ... from:` when altering columns); otherwise write explicit `up/0` and `down/0`. Verify with `mix ecto.migrate && mix ecto.rollback && mix ecto.migrate` before finishing. A migration that adds a NOT NULL column without a default can't re-run over existing rows, so check that kind on an empty database (`mix ecto.reset` in dev).
- Ask before adding deps to `mix.exs` or `frontend/package.json`.
