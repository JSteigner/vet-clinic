# Vet Clinic

A small veterinary clinic app for managing **owners**, their **pets** and **appointments**, with a schedule that updates live.

Built with **Elixir/Phoenix + Absinthe (GraphQL)** on the back end and **React + Apollo Client** on the front end, the stack I'm aiming to work in. The app is deliberately small; the goal is a polished, well-tested example rather than a sprawling one.

> 🚧 **Work in progress.** The data layer is done. The GraphQL API and the React frontend are next. See [Status](#status).

<!-- Screenshot / demo GIF goes here once the frontend is built -->

## Features

- **Today's schedule.** Shows the clinic's appointments for the day, in the clinic's own time zone.
- **Live updates.** A GraphQL subscription pushes new bookings and status changes (checked in, completed, cancelled) to every open browser.
- **Booking.** Book an appointment for a pet. Times in the past and unknown pets are rejected with clear validation errors.
- **Patients.** Owners and their pets.

## Tech stack

| Layer | Tech |
|---|---|
| API | Elixir 1.20, OTP 29, Phoenix 1.8 (API only) |
| GraphQL | Absinthe 1.12, Absinthe.Phoenix (subscriptions over Phoenix Channels), Dataloader |
| Database | PostgreSQL 16 via Ecto |
| Frontend | React, TypeScript, Vite, Apollo Client |
| Quality | ExUnit, Credo (strict), `mix format`, compile with warnings as errors |

## Status

- [x] Postgres via Docker Compose
- [x] Phoenix API scaffold with Absinthe dependencies
- [x] `Clinic` context: Owner, Pet and Appointment schemas, validations, migration
- [x] Configurable clinic time zone (`CLINIC_TIME_ZONE`)
- [x] Seed data
- [ ] GraphQL schema: queries, mutations, `appointmentChanged` subscription
- [ ] ExUnit tests for resolvers and subscriptions
- [ ] React + Apollo frontend
- [ ] Deployment

## GraphQL API (planned)

```graphql
type Query {
  owners: [Owner!]!
  pet(id: ID!): Pet
  appointments(date: Date): [Appointment!]!   # defaults to today in the clinic's time zone
}

type Mutation {
  createAppointment(petId: ID!, startsAt: DateTime!, reason: String!): Appointment
  updateAppointmentStatus(id: ID!, status: AppointmentStatus!): Appointment
}

type Subscription {
  appointmentChanged: Appointment!   # fires on create and status change
}
```

## Getting started

### Prerequisites

- Elixir 1.20 / OTP 29 and Node 22 (versions pinned in `.tool-versions` for asdf)
- Docker

### Run it

```bash
# 1. Start Postgres (listens on port 5433 so it won't clash with a local Postgres)
docker compose up -d

# 2. Install deps, create and migrate the database, load seed data
cd backend
mix setup
mix run priv/repo/seeds.exs

# 3. Start the API on http://localhost:4000
mix phx.server
```

### Configuration

| Env var | Default | Purpose |
|---|---|---|
| `CLINIC_TIME_ZONE` | `America/Chicago` | The clinic's local zone. "Today" and day-based queries use this zone's midnight to midnight; times are stored in UTC. |

### Checks

```bash
cd backend
mix precommit   # compile with warnings as errors, format, credo --strict, test
```

## Project structure

```
vet-clinic/
├── docker-compose.yml        # Postgres 16 on port 5433
├── backend/                  # Phoenix + Absinthe API
│   ├── lib/vet_clinic/       # Business logic (Clinic context and schemas)
│   ├── lib/vet_clinic_web/   # Web layer: endpoint, router, GraphQL schema
│   ├── priv/repo/            # Migrations and seeds
│   └── test/
└── frontend/                 # React + Apollo (coming soon)
```

## Built with Claude Code

This project was built with [Claude Code](https://claude.com/claude-code), Anthropic's AI coding agent, as a hands-on use of my Claude Code certification. I set the requirements, the architecture and the code style, and reviewed every change. Claude Code did the scaffolding and implementation under that direction.

Some of what that looked like:

- **Project rules in [`CLAUDE.md`](CLAUDE.md).** It holds the Elixir style guide, architecture boundaries (no `Repo` calls from the web layer, thin resolvers) and the `mix precommit` check that every change has to pass.
- **Plan first.** The plan was written and approved in plan mode before any code was generated.
- **Manual approval.** Every file edit and command was reviewed and approved individually.
- **Attributed commits.** Commits written with Claude carry a `Co-Authored-By` trailer.
