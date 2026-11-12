defmodule VetClinicWeb.Resolvers.Appointments do
  @moduledoc """
  Resolvers for appointment queries and mutations. They call only
  `VetClinic.Clinic`.
  """

  alias Absinthe.Resolution

  alias VetClinic.Appointments.Appointment
  alias VetClinic.Clinic
  alias VetClinicWeb.Resolvers.Helpers

  @spec clinic_time_zone(term(), map(), Resolution.t()) :: Helpers.result(String.t())
  def clinic_time_zone(_parent, _args, _resolution) do
    {:ok, Clinic.clinic_time_zone()}
  end

  @spec list_daily_clinic_appointments(term(), map(), Resolution.t()) ::
          Helpers.result([Appointment.t()])
  def list_daily_clinic_appointments(_parent, args, _resolution) do
    date = Map.get_lazy(args, :date, &Clinic.today/0)

    {:ok, Clinic.list_daily_clinic_appointments(date)}
  end

  @spec get_appointment(term(), map(), Resolution.t()) :: Helpers.result(Appointment.t())
  def get_appointment(_parent, %{id: id}, _resolution) do
    fetch_appointment(id)
  end

  @spec list_vet_appointments(term(), map(), Resolution.t()) ::
          Helpers.result([Appointment.t()])
  def list_vet_appointments(_parent, %{vet_id: vet_id} = args, _resolution) do
    with {:ok, vet} <- Helpers.fetch(vet_id, &Clinic.get_vet/1, "vet") do
      {:ok, Clinic.list_vet_appointments(vet.id, filters(args, [:date]))}
    end
  end

  @spec list_pet_appointments(term(), map(), Resolution.t()) ::
          Helpers.result([Appointment.t()])
  def list_pet_appointments(_parent, %{pet_id: pet_id} = args, _resolution) do
    with {:ok, pet} <- Helpers.fetch(pet_id, &Clinic.get_pet/1, "pet") do
      {:ok, Clinic.list_pet_appointments(pet.id, filters(args, [:status]))}
    end
  end

  @spec create_appointment(term(), map(), Resolution.t()) :: Helpers.result(Appointment.t())
  def create_appointment(_parent, %{input: input}, _resolution) do
    Clinic.create_appointment(input)
  end

  @spec update_appointment(term(), map(), Resolution.t()) :: Helpers.result(Appointment.t())
  def update_appointment(_parent, %{id: id, input: input}, _resolution) do
    with {:ok, appointment} <- fetch_appointment(id) do
      Clinic.update_appointment(appointment, input)
    end
  end

  @spec update_appointment_status(term(), map(), Resolution.t()) ::
          Helpers.result(Appointment.t())
  def update_appointment_status(_parent, %{id: id, status: status}, _resolution) do
    with {:ok, appointment} <- fetch_appointment(id) do
      Clinic.update_appointment_status(appointment, status)
    end
  end

  @spec delete_appointment(term(), map(), Resolution.t()) :: Helpers.result(Appointment.t())
  def delete_appointment(_parent, %{id: id}, _resolution) do
    with {:ok, appointment} <- fetch_appointment(id) do
      Clinic.delete_appointment(appointment)
    end
  end

  defp fetch_appointment(id) do
    Helpers.fetch(id, &Clinic.get_appointment/1, "appointment")
  end

  # Optional GraphQL args become the keyword filters the context expects.
  defp filters(args, keys) do
    args
    |> Map.take(keys)
    |> Map.to_list()
  end
end
