defmodule VetClinic.AppointmentsTest do
  use VetClinic.DataCase, async: true

  alias VetClinic.Appointments

  # A future date, so appointments on it can be booked through the API.
  setup do
    %{day: Date.add(Appointments.today(), 3)}
  end

  describe "list_daily_clinic_appointments/1" do
    test "returns every vet's appointments that day, ordered by time", %{day: day} do
      afternoon = appointment_fixture(%{starts_at: local(day, ~T[14:00:00])})
      morning = appointment_fixture(%{starts_at: local(day, ~T[09:00:00])})
      _next_day = appointment_fixture(%{starts_at: local(Date.add(day, 1), ~T[09:00:00])})

      assert ids(Appointments.list_daily_clinic_appointments(day)) == [morning.id, afternoon.id]
    end

    test "uses the clinic's time zone for day boundaries", %{day: day} do
      # 11:30 PM local time is already the next day in UTC.
      late_evening = appointment_fixture(%{starts_at: local(day, ~T[23:30:00])})

      assert ids(Appointments.list_daily_clinic_appointments(day)) == [late_evening.id]
      assert Appointments.list_daily_clinic_appointments(Date.add(day, 1)) == []
    end
  end

  describe "list_vet_appointments/2" do
    test "returns all of the vet's appointments, ordered by time", %{day: day} do
      vet = vet_fixture()

      later =
        appointment_fixture(%{vet_id: vet.id, starts_at: local(Date.add(day, 1), ~T[10:00:00])})

      sooner = appointment_fixture(%{vet_id: vet.id, starts_at: local(day, ~T[10:00:00])})
      _other_vets = appointment_fixture()

      assert ids(Appointments.list_vet_appointments(vet.id)) == [sooner.id, later.id]
    end

    test "can be limited to one date", %{day: day} do
      vet = vet_fixture()
      on_day = appointment_fixture(%{vet_id: vet.id, starts_at: local(day, ~T[10:00:00])})
      appointment_fixture(%{vet_id: vet.id, starts_at: local(Date.add(day, 1), ~T[10:00:00])})

      assert ids(Appointments.list_vet_appointments(vet.id, date: day)) == [on_day.id]
    end
  end

  describe "list_pet_appointments/2" do
    setup do
      pet = pet_fixture()

      %{
        pet: pet,
        completed: past_appointment_fixture(%{pet_id: pet.id, status: :completed}),
        scheduled: appointment_fixture(%{pet_id: pet.id})
      }
    end

    test "returns all of the pet's appointments, ordered by time", context do
      _other_pets = appointment_fixture()

      assert ids(Appointments.list_pet_appointments(context.pet.id)) ==
               [context.completed.id, context.scheduled.id]
    end

    test "can be filtered by status", context do
      assert ids(Appointments.list_pet_appointments(context.pet.id, status: :completed)) ==
               [context.completed.id]

      assert ids(Appointments.list_pet_appointments(context.pet.id, status: :scheduled)) ==
               [context.scheduled.id]
    end
  end

  describe "get_appointment/1" do
    test "returns the appointment" do
      appointment = appointment_fixture()

      assert Appointments.get_appointment(appointment.id).id == appointment.id
    end

    test "returns nil for an unknown id" do
      assert Appointments.get_appointment(-1) == nil
    end
  end

  describe "create_appointment/1" do
    test "books a scheduled appointment" do
      attrs = %{
        pet_id: pet_fixture().id,
        vet_id: vet_fixture().id,
        starts_at: from_now(1, :day),
        reason: Lorem.sentence()
      }

      assert {:ok, appointment} = Appointments.create_appointment(attrs)
      assert appointment.status == :scheduled
      assert appointment.reason == attrs.reason
    end

    # Postgres reports only the first foreign key it rejects, so each test
    # has exactly one missing record.
    test "rejects a pet that doesn't exist" do
      attrs = %{
        pet_id: -1,
        vet_id: vet_fixture().id,
        starts_at: from_now(1, :day),
        reason: Lorem.sentence()
      }

      assert {:error, changeset} = Appointments.create_appointment(attrs)
      assert %{pet: ["does not exist"]} = errors_on(changeset)
    end

    test "rejects a vet that doesn't exist" do
      attrs = %{
        pet_id: pet_fixture().id,
        vet_id: -1,
        starts_at: from_now(1, :day),
        reason: Lorem.sentence()
      }

      assert {:error, changeset} = Appointments.create_appointment(attrs)
      assert %{vet: ["does not exist"]} = errors_on(changeset)
    end
  end

  describe "update_appointment/2" do
    test "reschedules and changes the vet" do
      new_vet = vet_fixture()
      new_time = from_now(2, :day)

      assert {:ok, appointment} =
               Appointments.update_appointment(appointment_fixture(), %{
                 starts_at: new_time,
                 vet_id: new_vet.id
               })

      assert appointment.starts_at == new_time
      assert appointment.vet_id == new_vet.id
    end

    test "rejects a vet that doesn't exist" do
      assert {:error, changeset} =
               Appointments.update_appointment(appointment_fixture(), %{vet_id: -1})

      assert %{vet: ["does not exist"]} = errors_on(changeset)
    end
  end

  describe "update_appointment_status/2" do
    test "moves the appointment to the new status" do
      assert {:ok, appointment} =
               Appointments.update_appointment_status(appointment_fixture(), :checked_in)

      assert appointment.status == :checked_in
    end

    test "rejects an unknown status" do
      assert {:error, changeset} =
               Appointments.update_appointment_status(appointment_fixture(), :lost)

      assert %{status: ["is invalid"]} = errors_on(changeset)
    end
  end

  describe "delete_appointment/1" do
    test "deletes the appointment" do
      appointment = appointment_fixture()

      assert {:ok, _} = Appointments.delete_appointment(appointment)
      assert Appointments.get_appointment(appointment.id) == nil
    end
  end

  describe "today/0 and clinic_time_zone/0" do
    test "today is the current date in the clinic's time zone" do
      time_zone = Appointments.clinic_time_zone()

      assert time_zone == Application.fetch_env!(:vet_clinic, :clinic_time_zone)
      assert Appointments.today() == DateTime.to_date(DateTime.now!(time_zone))
    end
  end

  # A UTC time for `time` on `date` in the clinic's time zone.
  defp local(date, time) do
    date
    |> DateTime.new!(time, Appointments.clinic_time_zone())
    |> DateTime.shift_zone!("Etc/UTC")
  end

  defp ids(appointments), do: Enum.map(appointments, & &1.id)
end
