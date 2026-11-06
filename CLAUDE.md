# Vet Clinic

Portfolio app: Phoenix + Absinthe (GraphQL) backend in `backend/`, React + Apollo frontend in `frontend/`.
Postgres runs in Docker on port **5433** (`docker compose up -d`). Port 5432 belongs to another project; don't touch it.

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
- Run `mix format` before finishing a change.
