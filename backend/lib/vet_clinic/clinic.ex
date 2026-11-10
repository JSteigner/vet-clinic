defmodule VetClinic.Clinic do
  @moduledoc """
  The clinic's public API. The web layer and scripts call only this module;
  it delegates to the `VetClinic.Owners`, `VetClinic.Pets`, `VetClinic.Vets`
  and `VetClinic.Appointments` contexts.
  """

  alias Ecto.Changeset

  alias VetClinic.{Appointments, Owners, Pets, Repo, Vets}
  alias VetClinic.Appointments.Appointment
  alias VetClinic.Owners.Owner
  alias VetClinic.Pets.Pet
  alias VetClinic.Vets.Vet

  @doc """
  Dataloader source used by the GraphQL schema to batch association loads.
  """
  @spec datasource() :: Dataloader.Ecto.t()
  def datasource do
    Dataloader.Ecto.new(Repo)
  end

  ## Owners

  @spec list_owners() :: [Owner.t()]
  defdelegate list_owners(), to: Owners

  @spec get_owner(integer()) :: Owner.t() | nil
  defdelegate get_owner(id), to: Owners

  @spec get_pet_owner(integer()) :: Owner.t() | nil
  defdelegate get_pet_owner(pet_id), to: Owners

  @spec create_owner(map()) :: {:ok, Owner.t()} | {:error, Changeset.t()}
  defdelegate create_owner(attrs), to: Owners

  @spec update_owner(Owner.t(), map()) :: {:ok, Owner.t()} | {:error, Changeset.t()}
  defdelegate update_owner(owner, attrs), to: Owners

  @spec delete_owner(Owner.t()) :: {:ok, Owner.t()} | {:error, Changeset.t()}
  defdelegate delete_owner(owner), to: Owners

  ## Pets

  @spec get_pet(integer()) :: Pet.t() | nil
  defdelegate get_pet(id), to: Pets

  @spec list_owner_pets(integer()) :: [Pet.t()]
  defdelegate list_owner_pets(owner_id), to: Pets

  @spec create_pet(map()) :: {:ok, Pet.t()} | {:error, Changeset.t()}
  defdelegate create_pet(attrs), to: Pets

  @spec update_pet(Pet.t(), map()) :: {:ok, Pet.t()} | {:error, Changeset.t()}
  defdelegate update_pet(pet, attrs), to: Pets

  @spec delete_pet(Pet.t()) :: {:ok, Pet.t()} | {:error, Changeset.t()}
  defdelegate delete_pet(pet), to: Pets

  ## Vets

  @spec list_vets() :: [Vet.t()]
  defdelegate list_vets(), to: Vets

  @spec get_vet(integer()) :: Vet.t() | nil
  defdelegate get_vet(id), to: Vets

  @spec create_vet(map()) :: {:ok, Vet.t()} | {:error, Changeset.t()}
  defdelegate create_vet(attrs), to: Vets

  @spec update_vet(Vet.t(), map()) :: {:ok, Vet.t()} | {:error, Changeset.t()}
  defdelegate update_vet(vet, attrs), to: Vets

  @spec delete_vet(Vet.t()) :: {:ok, Vet.t()} | {:error, Changeset.t()}
  defdelegate delete_vet(vet), to: Vets

  ## Appointments

  @spec list_daily_clinic_appointments(Date.t()) :: [Appointment.t()]
  defdelegate list_daily_clinic_appointments(date), to: Appointments

  @spec list_vet_appointments(integer(), date: Date.t()) :: [Appointment.t()]
  defdelegate list_vet_appointments(vet_id, opts \\ []), to: Appointments

  @spec list_pet_appointments(integer(), status: Appointment.status()) :: [Appointment.t()]
  defdelegate list_pet_appointments(pet_id, opts \\ []), to: Appointments

  @spec get_appointment(integer()) :: Appointment.t() | nil
  defdelegate get_appointment(id), to: Appointments

  @spec create_appointment(map()) :: {:ok, Appointment.t()} | {:error, Changeset.t()}
  defdelegate create_appointment(attrs), to: Appointments

  @spec update_appointment(Appointment.t(), map()) ::
          {:ok, Appointment.t()} | {:error, Changeset.t()}
  defdelegate update_appointment(appointment, attrs), to: Appointments

  @spec update_appointment_status(Appointment.t(), Appointment.status()) ::
          {:ok, Appointment.t()} | {:error, Changeset.t()}
  defdelegate update_appointment_status(appointment, status), to: Appointments

  @spec delete_appointment(Appointment.t()) :: {:ok, Appointment.t()} | {:error, Changeset.t()}
  defdelegate delete_appointment(appointment), to: Appointments

  @spec today() :: Date.t()
  defdelegate today(), to: Appointments

  @spec clinic_time_zone() :: Calendar.time_zone()
  defdelegate clinic_time_zone(), to: Appointments
end
