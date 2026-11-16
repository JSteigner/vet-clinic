import Config

# Configure your database
#
# The MIX_TEST_PARTITION environment variable can be used
# to provide built-in test partitioning in CI environment.
# Run `mix help test` for more information.
#
# Works with a local Postgres (Postgres.app, Homebrew) or docker-compose.yml;
# override with DB_HOST, DB_PORT, DB_USER and DB_PASSWORD.
config :vet_clinic, VetClinic.Repo,
  username: System.get_env("DB_USER", "postgres"),
  password: System.get_env("DB_PASSWORD", "postgres"),
  hostname: System.get_env("DB_HOST", "localhost"),
  port: String.to_integer(System.get_env("DB_PORT", "5432")),
  database: "vet_clinic_test#{System.get_env("MIX_TEST_PARTITION")}",
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: System.schedulers_online() * 2

# No server during `mix test`. The Playwright e2e tests start one with
# `MIX_ENV=test mix phx.server`, talking to the Vite server on 5174.
config :vet_clinic, VetClinicWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "CvrqAQRxU0C6JUe+T9QXvl8WUfDYFl+5dfbFdU06qRQ4wdSox0hWMv5Lns+kq32x",
  server: false,
  check_origin: false

config :vet_clinic, :cors_origins, ["http://localhost:5174"]

# Mounts Phoenix.Ecto.SQL.Sandbox in the endpoint, so each e2e test runs in
# its own database transaction that's rolled back afterwards.
config :vet_clinic, :sql_sandbox, true

# Print only warnings and errors during test
config :logger, level: :warning

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime

# Sort query params output of verified routes for robust url comparisons
config :phoenix,
  sort_verified_routes_query_params: true
