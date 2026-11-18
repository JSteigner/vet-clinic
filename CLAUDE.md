@backend/AGENTS.md

# Project: VetClinic (Elixir 1.20 / OTP 29 / Phoenix 1.8 / Absinthe 1.12)

Portfolio app: Phoenix + Absinthe GraphQL API in `backend/`, React + Apollo frontend in `frontend/`.
Postgres 18 on port 5432 by default: a local install (Postgres.app here) or `docker compose up -d`. Override the connection with `DB_HOST`, `DB_PORT`, `DB_USER` and `DB_PASSWORD`.

## Commands
Run these from `backend/`:
- Test: `mix test` (single test: `mix test test/path_test.exs:42`)
- Before finishing any task: `mix precommit` (compile with warnings as errors, unlock unused deps, `hex.audit` for retired or vulnerable packages, format, `credo --strict`, `dialyzer`, then tests with a 90% minimum coverage via `mix coveralls`). Check its exit code (`mix precommit; echo $?`), not just the last lines: a failing test doesn't stop the run.
- Coverage report: `mix coveralls.html` (writes `cover/excoveralls.html`)

## Architecture
- Business logic lives in contexts under `lib/vet_clinic/`. Resolvers and controllers in `lib/vet_clinic_web/` stay thin.
- `VetClinic.Clinic` is the public API. It delegates to the per-schema contexts (`Owners`, `Pets`, `Vets`, `Appointments`). The web layer and scripts call `Clinic`, never a context directly. A function lives in the context of the schema it returns.
- Never use Ecto (Repo, changesets, queries) in the web layer. Go through `Clinic`; e.g. `Clinic.validation_errors/1` turns a changeset into plain `%{field => [message]}` data.
- GraphQL types go in `lib/vet_clinic_web/schema/`, resolvers in `lib/vet_clinic_web/resolvers/`. Load associations with Dataloader (`Clinic.datasource/0`), not per-row queries.
- Subscriptions are triggered from mutations through Absinthe `trigger`. Don't publish manually from contexts.
- Archived (soft-deleted) owners and pets are left out by default. A query that can return them takes `includeArchived: Boolean = false` in GraphQL and an `include_archived:` option in the context, built with the `VetClinic.Archivable` helpers.
- Evolve the GraphQL API additively. Ask before removing or renaming a field, argument or type; deprecate it first (`deprecate: "use X"`) so clients can move off it.

## Changes across the stack
A change to the GraphQL API isn't done until the frontend matches it:
1. Change the API and pass `mix precommit` in `backend/`.
2. In `frontend/`, run `npm run schema` (re-exports `schema.graphql`), then `npm run codegen`.
3. Update the frontend for the new types and pass `npm run check`.

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

Follow the [Elixir Style Guide](https://github.com/christopheradams/elixir_style_guide). `credo --strict` (in `mix precommit`, configured in `backend/.credo.exs`) enforces most of it: pipes one step per line, no single-step pipes, pipes starting with a bare value, a `@moduledoc` on every module, directive order (`@moduledoc`, `@behaviour`, `use`, `import`, `require`, `alias`), and aliases for nested modules called more than once. Fix what it reports rather than disabling checks.

Credo can't check these, so follow them by hand:

- Private functions (`defp`) go at the bottom of the module, after every public function, in tests too (after the last `test`/`describe`).
- After the directives come module attributes, `defstruct`, then `@type`. Put a blank line between each group, including after the `@moduledoc`:
  ```elixir
  defmodule VetClinic.Pets.Pet do
    @moduledoc """
    A patient of the clinic.
    """

    use Ecto.Schema

    import Ecto.Changeset

    alias VetClinic.Appointments.Appointment
    alias VetClinic.Owners.Owner
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
- Credo's alias check only counts function calls. The rule is wider: if a module name is written out in full more than once in a file (calls, structs, typespecs), alias it and use the short name everywhere. A module used only once stays fully qualified.
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
  alias VetClinic.{Appointments, Errors, Owners, Pets, Repo, Vets}
  alias VetClinic.Appointments.Appointment
  ```
- Exception: never use curly braces with Absinthe's `import_types`. Write one `import_types` per module. With the `{A, B}` form, Elixir doesn't record the type modules as compile-time dependencies of the schema, so changing a type module leaves a stale compiled schema (fields missing at runtime).

## Frontend (`frontend/`)
React 19, TypeScript 7 (strict), Vite 8, Tailwind CSS 4, Apollo Client. Run these from `frontend/`:
- Dev server: `npm run dev` (http://localhost:5173; expects the API on http://localhost:4000)
- Test: `npm test` (watch mode) or `npx vitest run src/path.test.tsx`
- Before finishing any frontend task: `npm run check` (`npm run audit`, `graphql-codegen --check`, `tsc -b`, `oxlint --deny-warnings`, `prettier --check`, then `vitest run --coverage` with a 90% minimum for lines, statements, functions and branches)
- Format: `npm run format`
- Dependency audit: `npm run audit` (audit-ci) fails on any advisory in runtime deps (shipped to browsers) and on high/critical ones in dev deps. Moderate dev-only advisories print but pass; don't "fix" them with `npm audit fix --force`, which can downgrade majors. An advisory with no fixed release yet can go in `frontend/audit-ci.jsonc`'s allowlist with notes on why and an `expiry` about a month out; ask first, and remove the entry once a fix ships.
- End-to-end: `npm run e2e` (Playwright, specs in `e2e/`). Needs Postgres. Starts its own Phoenix in the test env (4002, test database) and Vite (5174), separate from the dev servers on 4000/5173, which can keep running. Not part of `npm run check`; run it after changes to pages or the API.
- After any GraphQL API change: `npm run schema` (re-exports `schema.graphql` from the backend), then `npm run codegen` (regenerates `src/gql/`)

Conventions:
- Code lives in `src/features/<area>/` (pages, components, `queries.ts`, tests beside them); shared UI in `src/components/`, helpers in `src/lib/`.
- Name GraphQL document constants in SCREAMING_CASE (`DAILY_SCHEDULE`), so they never clash with the generated PascalCase result types (`DailyScheduleQuery`).
- Write GraphQL documents with the generated `graphql()` from `src/gql` and let hooks infer their types. Never hand-write types for API data or pass generics like `useQuery<T>()`. Don't edit `src/gql/`; it's generated.
- E2E specs import `test` from `e2e/fixtures.ts`, which runs each test in its own database transaction (Phoenix.Ecto.SQL.Sandbox) and rolls it back, so test data is never left behind; never point e2e at the dev database. Each test starts empty: set up its data through the API with the helpers in `e2e/helpers.ts` (unique names and emails), and test the feature itself through the UI. A browser context a spec opens itself needs `userAgent: sandbox` to join the test's transaction.

Apollo Client:
- Server data comes from Apollo only. Read `data` and derive from it; don't copy query results into `useState` (except to seed a form's draft values).
- No `useEffect` for fetching; use `useQuery` / `useLazyQuery` / `useSubscription`.
- Always select `id` on object types so the normalized cache works. Use `typePolicies` for types without `id` or for merging paginated lists instead of working around the cache.
- Mutations return the changed object so the cache updates itself. After creates/deletes, update plain lists with `cache.modify` or `update`; refetch lists the server filters (e.g. `appointments(date:)`), since the client can't tell which ones the change belongs to.
- Every component that queries handles `loading`, `error`, and empty states.
- Colocate each component's data needs as a fragment in its feature's `queries.ts`; parent queries spread child fragments. Name fragments `ComponentName_prop` (e.g. `AppointmentRow_appointment`) and type the prop with the generated fragment type (`AppointmentRow_AppointmentFragment`).

React state:
- Derive values during render instead of syncing them into state with `useEffect` (e.g. compute `fullName` from `first` and `last`, filter a list from its query data).
- Use the updater form when new state depends on the old: `setCount((count) => count + 1)`.
- Keep state as local as possible; lift it only as far as the components that share it.

Code style:
- Use arrow functions for components and helpers, not `function` declarations: `const Layout = () => (...)` with `export default Layout` at the bottom, and `export const formatInZone = (...) => ...` for named exports.
- Type form submit handlers with `SubmitEvent<HTMLFormElement>`, not `FormEvent` (deprecated in `@types/react` 19.3). Don't use deprecated APIs; `tsc` and oxlint won't flag them.
- Style with Tailwind classes. No CSS files besides `src/index.css`.
- Test components with Testing Library, querying by role and label text, not class names or test IDs.
- Prettier formats the code (semicolons, single quotes, sorted Tailwind classes); don't hand-format.

## Don'ts
- Don't modify existing migrations; create new ones.
- Every migration must be reversible. Prefer `change/0` with reversible operations (use `modify ... from:` when altering columns); otherwise write explicit `up/0` and `down/0`. Verify with `mix ecto.migrate && mix ecto.rollback && mix ecto.migrate` before finishing. A migration that adds a NOT NULL column without a default can't re-run over existing rows, so check that kind on an empty database (`mix ecto.reset` in dev).
- Ask before adding deps to `mix.exs` or `frontend/package.json`.
