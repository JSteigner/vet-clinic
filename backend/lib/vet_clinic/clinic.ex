defmodule VetClinic.Clinic do
  @moduledoc """
  The Clinic context: owners, their pets, vets, and appointments that
  book a pet with a vet.
  """

  import Ecto.Query, warn: false

  alias VetClinic.Clinic.{Appointment, Owner, Pet, Vet}
  alias VetClinic.Repo

  @doc """
  Dataloader source used by the GraphQL schema to batch association loads.
  """
  def datasource do
    Dataloader.Ecto.new(Repo)
  end

  ## Owners

  def list_owners do
    Owner
    |> order_by(:name)
    |> Repo.all()
  end

  def get_owner(id), do: Repo.get(Owner, id)

  def create_owner(attrs) do
    %Owner{}
    |> Owner.changeset(attrs)
    |> Repo.insert()
  end

  ## Vets

  def list_vets do
    Vet
    |> order_by(:name)
    |> Repo.all()
  end

  def get_vet(id), do: Repo.get(Vet, id)

  def create_vet(attrs) do
    %Vet{}
    |> Vet.changeset(attrs)
    |> Repo.insert()
  end

  ## Pets

  def get_pet(id), do: Repo.get(Pet, id)

  def create_pet(attrs) do
    %Pet{}
    |> Pet.changeset(attrs)
    |> Repo.insert()
  end

  ## Appointments

  @doc """
  Lists appointments on the given date in the clinic's time zone,
  ordered by start time.
  """
  def list_appointments_on(%Date{} = date) do
    time_zone = clinic_time_zone()
    from = start_of_day_utc(date, time_zone)
    to = start_of_day_utc(Date.add(date, 1), time_zone)

    Appointment
    |> where([a], a.starts_at >= ^from and a.starts_at < ^to)
    |> order_by(:starts_at)
    |> Repo.all()
  end

  @doc """
  Today's date in the clinic's time zone.
  """
  def today do
    clinic_time_zone()
    |> DateTime.now!()
    |> DateTime.to_date()
  end

  def clinic_time_zone do
    Application.fetch_env!(:vet_clinic, :clinic_time_zone)
  end

  defp start_of_day_utc(date, time_zone) do
    date
    |> DateTime.new!(~T[00:00:00], time_zone)
    |> DateTime.shift_zone!("Etc/UTC")
  end

  def get_appointment(id), do: Repo.get(Appointment, id)

  def create_appointment(attrs) do
    %Appointment{}
    |> Appointment.create_changeset(attrs)
    |> Repo.insert()
  end

  def update_appointment_status(%Appointment{} = appointment, status) do
    appointment
    |> Appointment.status_changeset(%{status: status})
    |> Repo.update()
  end
end
