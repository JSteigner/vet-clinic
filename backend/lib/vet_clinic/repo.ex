defmodule VetClinic.Repo do
  @moduledoc """
  Ecto repository for the clinic's PostgreSQL database.
  """

  use Ecto.Repo,
    otp_app: :vet_clinic,
    adapter: Ecto.Adapters.Postgres
end
