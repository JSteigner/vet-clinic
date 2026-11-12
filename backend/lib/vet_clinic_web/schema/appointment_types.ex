defmodule VetClinicWeb.Schema.AppointmentTypes do
  @moduledoc """
  GraphQL types, queries, mutations and the live-update subscription for
  appointments.
  """

  use Absinthe.Schema.Notation

  import Absinthe.Resolution.Helpers, only: [dataloader: 1]

  alias VetClinic.Clinic
  alias VetClinicWeb.Resolvers.Appointments

  enum :appointment_status do
    value(:scheduled)
    value(:checked_in)
    value(:completed)
    value(:cancelled)
  end

  object :appointment do
    field :id, non_null(:id)
    field :starts_at, non_null(:datetime)
    field :reason, non_null(:string)
    field :status, non_null(:appointment_status)
    field :pet, non_null(:pet), resolve: dataloader(Clinic)
    field :vet, non_null(:vet), resolve: dataloader(Clinic)
  end

  input_object :create_appointment_input do
    field :pet_id, non_null(:id)
    field :vet_id, non_null(:id)
    field :starts_at, non_null(:datetime)
    field :reason, non_null(:string)
  end

  @desc "Reschedule, or change the reason or vet. The pet can't be changed."
  input_object :update_appointment_input do
    field :starts_at, :datetime
    field :reason, :string
    field :vet_id, :id
  end

  object :appointment_queries do
    @desc """
    The clinic's IANA time zone, e.g. "America/Chicago". Dates in
    appointment queries are days in this zone.
    """
    field :clinic_time_zone, non_null(:string) do
      resolve &Appointments.clinic_time_zone/3
    end

    @desc """
    The whole clinic's schedule for a date in the clinic's time zone,
    ordered by start time. Defaults to today.
    """
    field :appointments, non_null(list_of(non_null(:appointment))) do
      arg(:date, :date)
      resolve(&Appointments.list_daily_clinic_appointments/3)
    end

    @desc "An appointment by ID."
    field :appointment, :appointment do
      arg(:id, non_null(:id))
      resolve(&Appointments.get_appointment/3)
    end

    @desc "A vet's appointments, ordered by start time, optionally for one date."
    field :vet_appointments, non_null(list_of(non_null(:appointment))) do
      arg(:vet_id, non_null(:id))
      arg(:date, :date)
      resolve(&Appointments.list_vet_appointments/3)
    end

    @desc """
    A pet's appointments, ordered by start time. Filter by status, e.g.
    COMPLETED for history or SCHEDULED for upcoming visits.
    """
    field :pet_appointments, non_null(list_of(non_null(:appointment))) do
      arg(:pet_id, non_null(:id))
      arg(:status, :appointment_status)
      resolve(&Appointments.list_pet_appointments/3)
    end
  end

  object :appointment_mutations do
    @desc "Book an appointment for a pet with a vet. Must be in the future."
    field :create_appointment, :appointment do
      arg(:input, non_null(:create_appointment_input))
      resolve(&Appointments.create_appointment/3)
    end

    field :update_appointment, :appointment do
      arg(:id, non_null(:id))
      arg(:input, non_null(:update_appointment_input))
      resolve(&Appointments.update_appointment/3)
    end

    field :update_appointment_status, :appointment do
      arg(:id, non_null(:id))
      arg(:status, non_null(:appointment_status))
      resolve(&Appointments.update_appointment_status/3)
    end

    @desc "Deletes an appointment booked by mistake. Prefer cancelling it."
    field :delete_appointment, :appointment do
      arg(:id, non_null(:id))
      resolve(&Appointments.delete_appointment/3)
    end
  end

  object :appointment_subscriptions do
    @desc "Fires when an appointment is booked, rescheduled or changes status."
    field :appointment_changed, non_null(:appointment) do
      config(fn _args, _resolution -> {:ok, topic: "appointments"} end)

      trigger([:create_appointment, :update_appointment, :update_appointment_status],
        topic: fn _appointment -> "appointments" end
      )
    end
  end
end
