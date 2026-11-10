defmodule VetClinic.Appointments do
  @moduledoc """
  Appointments and scheduling, including the clinic's time zone.
  Called through `VetClinic.Clinic`.
  """

  import Ecto.Query, warn: false

  alias VetClinic.Appointments.Appointment
  alias VetClinic.Repo

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

  defp start_of_day_utc(date, time_zone) do
    date
    |> DateTime.new!(~T[00:00:00], time_zone)
    |> DateTime.shift_zone!("Etc/UTC")
  end
end
