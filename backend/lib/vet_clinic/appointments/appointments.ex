defmodule VetClinic.Appointments do
  @moduledoc """
  Appointments and scheduling, including the clinic's time zone.
  Called through `VetClinic.Clinic`.
  """

  import Ecto.Query, warn: false

  alias Ecto.Changeset
  alias Ecto.Multi
  alias Ecto.Query

  alias VetClinic.Appointments.Appointment
  alias VetClinic.Repo

  @open_statuses ~w[scheduled checked_in]a

  @doc """
  Every vet's appointments on the given date in the clinic's time zone,
  ordered by start time. This is the whole clinic's daily schedule.
  """
  @spec list_daily_clinic_appointments(Date.t()) :: [Appointment.t()]
  def list_daily_clinic_appointments(%Date{} = date) do
    Appointment
    |> on_date(date)
    |> order_by(:starts_at)
    |> Repo.all()
  end

  @doc """
  Lists a vet's appointments, ordered by start time.

  ## Options

    * `:date` - only appointments on that date in the clinic's time zone
  """
  @spec list_vet_appointments(integer(), date: Date.t()) :: [Appointment.t()]
  def list_vet_appointments(vet_id, opts \\ []) do
    Appointment
    |> where([a], a.vet_id == ^vet_id)
    |> on_date(opts[:date])
    |> order_by(:starts_at)
    |> Repo.all()
  end

  @doc """
  Lists a pet's appointments, ordered by start time.

  ## Options

    * `:status` - only appointments with that status, e.g. `:completed`
      for history or `:scheduled` for upcoming visits
  """
  @spec list_pet_appointments(integer(), status: Appointment.status()) :: [Appointment.t()]
  def list_pet_appointments(pet_id, opts \\ []) do
    Appointment
    |> where([a], a.pet_id == ^pet_id)
    |> filter_by(:status, opts[:status])
    |> order_by(:starts_at)
    |> Repo.all()
  end

  @spec get_appointment(integer()) :: Appointment.t() | nil
  def get_appointment(id), do: Repo.get(Appointment, id)

  @spec create_appointment(map()) :: {:ok, Appointment.t()} | {:error, Changeset.t()}
  def create_appointment(attrs) do
    %Appointment{}
    |> Appointment.create_changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Reschedules an appointment or changes its reason or vet. The pet can't
  be changed, and a new time must be in the future.
  """
  @spec update_appointment(Appointment.t(), map()) ::
          {:ok, Appointment.t()} | {:error, Changeset.t()}
  def update_appointment(%Appointment{} = appointment, attrs) do
    appointment
    |> Appointment.update_changeset(attrs)
    |> Repo.update()
  end

  @spec update_appointment_status(Appointment.t(), Appointment.status()) ::
          {:ok, Appointment.t()} | {:error, Changeset.t()}
  def update_appointment_status(%Appointment{} = appointment, status) do
    appointment
    |> Appointment.status_changeset(%{status: status})
    |> Repo.update()
  end

  @doc """
  Deletes an appointment booked by mistake. Prefer setting the status to
  `:cancelled`, which keeps the visit in the pet's history.
  """
  @spec delete_appointment(Appointment.t()) :: {:ok, Appointment.t()} | {:error, Changeset.t()}
  def delete_appointment(%Appointment{} = appointment), do: Repo.delete(appointment)

  @doc """
  Adds a step to `multi` that cancels the open (scheduled or checked-in)
  appointments of the pets selected by `pet_ids_query`. Completed and
  already-cancelled appointments are left as they are.
  """
  @spec cancel_open_appointments(Multi.t(), Query.t()) :: Multi.t()
  def cancel_open_appointments(multi, %Query{} = pet_ids_query) do
    now = DateTime.truncate(DateTime.utc_now(), :second)

    query =
      Appointment
      |> where([a], a.pet_id in subquery(pet_ids_query))
      |> where([a], a.status in ^@open_statuses)

    Multi.update_all(multi, :cancelled_appointments, query,
      set: [status: :cancelled, updated_at: now]
    )
  end

  @doc """
  Today's date in the clinic's time zone.
  """
  @spec today() :: Date.t()
  def today do
    clinic_time_zone()
    |> DateTime.now!()
    |> DateTime.to_date()
  end

  @spec clinic_time_zone() :: Calendar.time_zone()
  def clinic_time_zone do
    Application.fetch_env!(:vet_clinic, :clinic_time_zone)
  end

  # Limits the query to appointments starting on `date` (midnight to
  # midnight in the clinic's time zone), or leaves it unchanged for nil.
  defp on_date(query, nil), do: query

  defp on_date(query, %Date{} = date) do
    time_zone = clinic_time_zone()
    from = start_of_day_utc(date, time_zone)
    to = start_of_day_utc(Date.add(date, 1), time_zone)

    where(query, [a], a.starts_at >= ^from and a.starts_at < ^to)
  end

  defp start_of_day_utc(date, time_zone) do
    date
    |> DateTime.new!(~T[00:00:00], time_zone)
    |> DateTime.shift_zone!("Etc/UTC")
  end

  # Adds `field == value` to the query, or leaves it unchanged when no
  # value was given, so optional filters can be chained in a pipeline.
  defp filter_by(query, _field, nil), do: query

  defp filter_by(query, field, value) do
    where(query, [a], field(a, ^field) == ^value)
  end
end
