defmodule VetClinic.Clinic do
  @moduledoc """
  The clinic's public API. The web layer and scripts call only this module;
  it delegates to the `VetClinic.Owners`, `VetClinic.Pets`, `VetClinic.Vets`
  and `VetClinic.Appointments` contexts.
  """

  alias VetClinic.{Appointments, Owners, Pets, Repo, Vets}

  @doc """
  Dataloader source used by the GraphQL schema to batch association loads.
  """
  def datasource do
    Dataloader.Ecto.new(Repo)
  end

  ## Owners

  defdelegate list_owners(), to: Owners
  defdelegate get_owner(id), to: Owners
  defdelegate create_owner(attrs), to: Owners

  ## Pets

  defdelegate get_pet(id), to: Pets
  defdelegate create_pet(attrs), to: Pets

  ## Vets

  defdelegate list_vets(), to: Vets
  defdelegate get_vet(id), to: Vets
  defdelegate create_vet(attrs), to: Vets

  ## Appointments

  defdelegate list_appointments_on(date), to: Appointments
  defdelegate get_appointment(id), to: Appointments
  defdelegate create_appointment(attrs), to: Appointments
  defdelegate update_appointment_status(appointment, status), to: Appointments
  defdelegate today(), to: Appointments
  defdelegate clinic_time_zone(), to: Appointments
end
