# Vet Clinic

A small veterinary clinic app for managing **owners**, their **pets**, the clinic's **vets** and **appointments**, with a schedule that updates live.

Built with **Elixir/Phoenix + Absinthe (GraphQL)** on the back end and **React + Apollo Client** on the front end. The app is deliberately small; the goal is a polished, well-tested example rather than a sprawling one.

> 🚧 **Work in progress.** The back end (data layer and GraphQL API) is done and tested. The React frontend is next. See [Status](#status).

<!-- Screenshot / demo GIF goes here once the frontend is built -->

## Features

- **Today's schedule.** Shows the clinic's appointments for the day, in the clinic's own time zone.
- **Live updates.** A GraphQL subscription pushes new bookings and status changes (checked in, completed, cancelled) to every open browser.
- **Booking.** Book, reschedule or reassign an appointment for a pet with a vet. Times in the past and unknown pets or vets are rejected with clear, per-field errors.
- **Visit history.** A pet's appointments filtered by status, e.g. completed visits for history or scheduled ones for what's coming up.
- **Patients and vets.** Owners and their pets, and the vets who see them, with a vet's schedule for any day.
- **Safe deletes.** Deleting an owner or pet archives it instead of erasing it, and cancels their open appointments while keeping completed visits. A vet can't be deleted while they still have appointments.

## Tech stack

| Layer | Tech |
|---|---|
| API | Elixir 1.20, OTP 29, Phoenix 1.8 (API only) |
| GraphQL | Absinthe 1.12, Absinthe.Phoenix (subscriptions over Phoenix Channels), Dataloader |
| Database | PostgreSQL 18 via Ecto |
| Frontend | React, TypeScript, Vite, Apollo Client |
| Quality | ExUnit with Faker, ExCoveralls (90% minimum), Credo (strict), Dialyzer, `mix format`, compile with warnings as errors |

## Status

- [x] Postgres setup: local install or Docker Compose
- [x] Phoenix API scaffold with Absinthe dependencies
- [x] Owner, Pet, Vet and Appointment schemas with per-schema contexts behind the `Clinic` API
- [x] Every appointment is booked with a vet
- [x] Full CRUD, with soft delete for owners and pets
- [x] Configurable clinic time zone (`CLINIC_TIME_ZONE`)
- [x] Seed data
- [x] GraphQL schema: queries, mutations, `appointmentChanged` subscription
- [x] ExUnit tests for the domain layer (schemas, contexts, Clinic API)
- [x] ExUnit tests for the GraphQL API over HTTP and the subscription socket
- [ ] React + Apollo frontend
- [ ] Deployment

## GraphQL API

| Endpoint | What |
|---|---|
| `POST /api/graphql` | Queries and mutations |
| `ws://localhost:4000/socket` | Subscriptions (Absinthe over Phoenix Channels) |
| `/api/graphiql` | GraphiQL explorer with the full schema and docs (dev only) |

```graphql
type Query {
  owners: [Owner!]!                       # active owners, by name
  owner(id: ID!): Owner
  petOwner(petId: ID!): Owner
  pet(id: ID!): Pet
  ownerPets(ownerId: ID!): [Pet!]!
  vets: [Vet!]!
  vet(id: ID!): Vet
  appointments(date: Date): [Appointment!]!          # clinic schedule; defaults to today in the clinic's time zone
  appointment(id: ID!): Appointment
  vetAppointments(vetId: ID!, date: Date): [Appointment!]!
  petAppointments(petId: ID!, status: AppointmentStatus): [Appointment!]!
}

type Mutation {
  createOwner(input: CreateOwnerInput!): Owner
  updateOwner(id: ID!, input: UpdateOwnerInput!): Owner
  deleteOwner(id: ID!): Owner             # archives the owner and their pets
  createPet(input: CreatePetInput!): Pet
  updatePet(id: ID!, input: UpdatePetInput!): Pet
  deletePet(id: ID!): Pet                 # archives the pet
  createVet(input: CreateVetInput!): Vet
  updateVet(id: ID!, input: UpdateVetInput!): Vet
  deleteVet(id: ID!): Vet                 # fails while the vet has appointments
  createAppointment(input: CreateAppointmentInput!): Appointment
  updateAppointment(id: ID!, input: UpdateAppointmentInput!): Appointment
  updateAppointmentStatus(id: ID!, status: AppointmentStatus!): Appointment
  deleteAppointment(id: ID!): Appointment
}

type Subscription {
  appointmentChanged: Appointment!        # fires on booking, rescheduling and status changes
}
```

Nested fields such as `owners { pets { appointments { vet { name } } } }` are batched with Dataloader, so they don't cost a query per row.

**Errors.** An unknown or malformed ID returns a `"pet not found"` style error. Invalid input returns one error per field, named the way the API names it:

```json
{
  "data": { "createAppointment": null },
  "errors": [
    {
      "message": "startsAt must be in the future",
      "extensions": { "field": "startsAt" },
      "path": ["createAppointment"]
    }
  ]
}
```

## Getting started

### Prerequisites

- Elixir 1.20 / OTP 29 and Node 22 (versions pinned in `.tool-versions` for asdf)
- PostgreSQL 18 on port 5432, with a `postgres` / `postgres` superuser. Use either:
  - **A local install**, such as [Postgres.app](https://postgresapp.com) or `brew install postgresql@18`, or
  - **Docker**: `docker compose up -d` starts one for you.

### Run it

```bash
# Only if you're using Docker for Postgres
docker compose up -d

# Install deps, create and migrate the database, load seed data
cd backend
mix setup

# Start the API on http://localhost:4000
mix phx.server
```

Then open http://localhost:4000/api/graphiql to explore the API. Try `{ appointments { startsAt reason pet { name } vet { name } } }`.

### Configuration

| Env var | Default | Purpose |
|---|---|---|
| `CLINIC_TIME_ZONE` | `America/Chicago` | The clinic's local zone. "Today" and day-based queries use this zone's midnight to midnight; times are stored in UTC. |
| `DB_HOST` | `localhost` | Postgres host (dev and test) |
| `DB_PORT` | `5432` | Postgres port. Docker Compose uses it too, so `DB_PORT=5433` moves both if 5432 is taken. |
| `DB_USER` / `DB_PASSWORD` | `postgres` / `postgres` | Postgres credentials (dev and test) |

Browser origins allowed to call the API (CORS) are set with `config :vet_clinic, :cors_origins` in `config/dev.exs`, which allows the Vite dev server at `http://localhost:5173`.

### Checks

```bash
cd backend
mix precommit         # compile with warnings as errors, format, credo --strict, tests + 90% coverage, dialyzer
mix coveralls.html    # browsable coverage report in cover/excoveralls.html
```

## Project structure

```
vet-clinic/
├── docker-compose.yml        # Optional Postgres 18 on port 5432
├── backend/                  # Phoenix + Absinthe API
│   ├── lib/vet_clinic/       # Business logic: Clinic API, per-schema contexts
│   ├── lib/vet_clinic_web/   # Web layer: endpoint, router, socket
│   │   ├── schema.ex         # Root GraphQL schema
│   │   ├── schema/           # Types, queries and mutations per context; error middleware
│   │   └── resolvers/        # Thin resolvers that call the Clinic API
│   ├── priv/repo/            # Migrations and seeds
│   └── test/                 # Domain tests, plus GraphQL tests over HTTP and the socket
└── frontend/                 # React + Apollo (coming soon)
```

## Built with Claude Code

This project was built with [Claude Code](https://claude.com/claude-code), Anthropic's AI coding agent, as a hands-on use of my Claude Code certification. I set the requirements, the architecture and the code style, and reviewed every change. Claude Code did the scaffolding and implementation under that direction.

Some of what that looked like:

- **Project rules in [`CLAUDE.md`](CLAUDE.md).** It holds the Elixir style guide, architecture boundaries (no Ecto in the web layer, thin resolvers) and the `mix precommit` check that every change has to pass.
- **Plan first.** The plan was written and approved in plan mode before any code was generated.
- **Manual approval.** Every file edit and command was reviewed and approved individually.
- **Attributed commits.** Commits written with Claude carry a `Co-Authored-By` trailer.
