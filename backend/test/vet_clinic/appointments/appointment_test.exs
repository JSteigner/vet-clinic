defmodule VetClinic.Appointments.AppointmentTest do
  use VetClinic.DataCase, async: true

  alias VetClinic.Appointments.Appointment

  describe "create_changeset/2" do
    test "is valid with a future time, reason, pet and vet" do
      changeset = Appointment.create_changeset(%Appointment{}, valid_attrs())

      assert changeset.valid?
    end

    test "requires a time, reason, pet and vet" do
      changeset = Appointment.create_changeset(%Appointment{}, %{})

      assert %{
               starts_at: ["can't be blank"],
               reason: ["can't be blank"],
               pet_id: ["can't be blank"],
               vet_id: ["can't be blank"]
             } = errors_on(changeset)
    end

    test "rejects a time in the past" do
      attrs = %{valid_attrs() | starts_at: from_now(-1, :hour)}

      changeset = Appointment.create_changeset(%Appointment{}, attrs)

      assert %{starts_at: ["must be in the future"]} = errors_on(changeset)
    end

    test "rejects a reason longer than 255 characters" do
      attrs = %{valid_attrs() | reason: String.duplicate("a", 256)}

      changeset = Appointment.create_changeset(%Appointment{}, attrs)

      assert %{reason: ["should be at most 255 character(s)"]} = errors_on(changeset)
    end

    test "always starts as scheduled, ignoring a given status" do
      attrs = Map.put(valid_attrs(), :status, :completed)

      changeset = Appointment.create_changeset(%Appointment{}, attrs)

      assert get_field(changeset, :status) == :scheduled
    end
  end

  describe "update_changeset/2" do
    test "changes the time, reason and vet" do
      attrs = %{starts_at: from_now(2, :day), reason: Lorem.sentence(), vet_id: 7}

      changeset = Appointment.update_changeset(existing_appointment(), attrs)

      assert changeset.valid?
      assert %{starts_at: _, reason: _, vet_id: 7} = changeset.changes
    end

    test "doesn't change the pet" do
      changeset = Appointment.update_changeset(existing_appointment(), %{pet_id: 99})

      refute Map.has_key?(changeset.changes, :pet_id)
    end

    test "rejects rescheduling into the past" do
      attrs = %{starts_at: from_now(-1, :hour)}

      changeset = Appointment.update_changeset(existing_appointment(), attrs)

      assert %{starts_at: ["must be in the future"]} = errors_on(changeset)
    end

    test "rejects clearing a required field" do
      changeset = Appointment.update_changeset(existing_appointment(), %{reason: nil})

      assert %{reason: ["can't be blank"]} = errors_on(changeset)
    end
  end

  describe "status_changeset/2" do
    test "accepts a known status" do
      changeset = Appointment.status_changeset(existing_appointment(), %{status: :checked_in})

      assert get_change(changeset, :status) == :checked_in
    end

    test "rejects an unknown status" do
      changeset = Appointment.status_changeset(existing_appointment(), %{status: :lost})

      assert %{status: ["is invalid"]} = errors_on(changeset)
    end
  end

  defp valid_attrs do
    %{starts_at: from_now(1, :day), reason: Lorem.sentence(), pet_id: 1, vet_id: 1}
  end

  defp existing_appointment do
    struct(Appointment, Map.put(valid_attrs(), :id, 1))
  end
end
