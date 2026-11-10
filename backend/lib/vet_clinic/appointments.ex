defmodule VetClinic.Appointments do
  @moduledoc """
  Appointments and scheduling, including the clinic's time zone.
  Called through `VetClinic.Clinic`.
  """

  import Ecto.Query, warn: false

  alias VetClinic.Appointments.Appointment
  alias VetClinic.Repo

  @doc """
  Every vet's appointments on the given date in the clinic's time zone,
  ordered by start time. This is the whole clinic's daily schedule.
  """
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
  def list_pet_appointments(pet_id, opts \\ []) do
    Appointment
    |> where([a], a.pet_id == ^pet_id)
    |> filter_by(:status, opts[:status])
    |> order_by(:starts_at)
    |> Repo.all()
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
