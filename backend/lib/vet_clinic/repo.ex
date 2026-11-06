defmodule VetClinic.Repo do
  use Ecto.Repo,
    otp_app: :vet_clinic,
    adapter: Ecto.Adapters.Postgres
end
