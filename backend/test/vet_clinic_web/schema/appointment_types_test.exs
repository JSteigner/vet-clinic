defmodule VetClinicWeb.Schema.AppointmentTypesTest do
  use VetClinicWeb.ConnCase, async: true

  alias VetClinic.Clinic

  describe "appointments query" do
    @query "query ($date: Date) { appointments(date: $date) { id pet { id } vet { id } } }"

    test "returns the clinic's schedule for a date", %{conn: conn} do
      appointment = appointment_fixture()
      date = clinic_date(appointment.starts_at)

      assert %{"data" => %{"appointments" => [found]}} =
               graphql(conn, @query, %{date: Date.to_iso8601(date)})

      assert found == %{
               "id" => "#{appointment.id}",
               "pet" => %{"id" => "#{appointment.pet_id}"},
               "vet" => %{"id" => "#{appointment.vet_id}"}
             }
    end

    test "defaults to today", %{conn: conn} do
      appointment_fixture()

      assert %{"data" => %{"appointments" => []}} = graphql(conn, @query)
    end
  end

  describe "appointment query" do
    @query "query ($id: ID!) { appointment(id: $id) { reason status } }"

    test "returns the appointment", %{conn: conn} do
      appointment = appointment_fixture()

      assert %{"data" => %{"appointment" => found}} =
               graphql(conn, @query, %{id: appointment.id})

      assert found == %{"reason" => appointment.reason, "status" => "SCHEDULED"}
    end

    test "returns not found for an unknown id", %{conn: conn} do
      assert %{"errors" => [%{"message" => "appointment not found"}]} =
               graphql(conn, @query, %{id: "-1"})
    end
  end

  describe "vetAppointments query" do
    @query """
    query ($vetId: ID!, $date: Date) {
      vetAppointments(vetId: $vetId, date: $date) { id }
    }
    """

    test "returns the vet's appointments, optionally for a date", %{conn: conn} do
      tomorrow = appointment_fixture()
      next_week = appointment_fixture(%{vet_id: tomorrow.vet_id, starts_at: from_now(7, :day)})
      date = Date.to_iso8601(clinic_date(tomorrow.starts_at))

      assert %{"data" => %{"vetAppointments" => all}} =
               graphql(conn, @query, %{vetId: tomorrow.vet_id})

      assert %{"data" => %{"vetAppointments" => on_date}} =
               graphql(conn, @query, %{vetId: tomorrow.vet_id, date: date})

      assert ids(all) == ["#{tomorrow.id}", "#{next_week.id}"]
      assert ids(on_date) == ["#{tomorrow.id}"]
    end

    test "returns not found for an unknown vet", %{conn: conn} do
      assert %{"errors" => [%{"message" => "vet not found"}]} =
               graphql(conn, @query, %{vetId: "-1"})
    end
  end

  describe "petAppointments query" do
    @query """
    query ($petId: ID!, $status: AppointmentStatus) {
      petAppointments(petId: $petId, status: $status) { id }
    }
    """

    test "filters the pet's appointments by status", %{conn: conn} do
      upcoming = appointment_fixture()
      past = past_appointment_fixture(%{pet_id: upcoming.pet_id})

      assert %{"data" => %{"petAppointments" => history}} =
               graphql(conn, @query, %{petId: upcoming.pet_id, status: "COMPLETED"})

      assert %{"data" => %{"petAppointments" => all}} =
               graphql(conn, @query, %{petId: upcoming.pet_id})

      assert ids(history) == ["#{past.id}"]
      assert ids(all) == ["#{past.id}", "#{upcoming.id}"]
    end

    test "returns not found for an unknown pet", %{conn: conn} do
      assert %{"errors" => [%{"message" => "pet not found"}]} =
               graphql(conn, @query, %{petId: "-1"})
    end
  end

  describe "createAppointment mutation" do
    @mutation """
    mutation ($input: CreateAppointmentInput!) {
      createAppointment(input: $input) { status pet { id } vet { id } }
    }
    """

    test "books an appointment", %{conn: conn} do
      pet = pet_fixture()
      vet = vet_fixture()
      input = booking(pet.id, vet.id, from_now(1, :day))

      assert %{"data" => %{"createAppointment" => created}} =
               graphql(conn, @mutation, %{input: input})

      assert created == %{
               "status" => "SCHEDULED",
               "pet" => %{"id" => "#{pet.id}"},
               "vet" => %{"id" => "#{vet.id}"}
             }
    end

    test "uses camelCase field names in errors", %{conn: conn} do
      input = booking(pet_fixture().id, vet_fixture().id, from_now(-1, :day))

      assert %{"errors" => [error]} = graphql(conn, @mutation, %{input: input})
      assert error["message"] == "startsAt must be in the future"
      assert error["extensions"] == %{"field" => "startsAt"}
    end
  end

  describe "updateAppointment mutation" do
    test "reschedules the appointment", %{conn: conn} do
      appointment = appointment_fixture()
      starts_at = from_now(2, :day)

      mutation = """
      mutation ($id: ID!, $input: UpdateAppointmentInput!) {
        updateAppointment(id: $id, input: $input) { startsAt }
      }
      """

      variables = %{id: appointment.id, input: %{startsAt: DateTime.to_iso8601(starts_at)}}

      assert %{"data" => %{"updateAppointment" => %{"startsAt" => updated}}} =
               graphql(conn, mutation, variables)

      assert updated == DateTime.to_iso8601(starts_at)
    end
  end

  describe "updateAppointmentStatus mutation" do
    test "changes the status", %{conn: conn} do
      appointment = appointment_fixture()

      mutation = """
      mutation ($id: ID!, $status: AppointmentStatus!) {
        updateAppointmentStatus(id: $id, status: $status) { status }
      }
      """

      assert %{"data" => %{"updateAppointmentStatus" => %{"status" => "CHECKED_IN"}}} =
               graphql(conn, mutation, %{id: appointment.id, status: "CHECKED_IN"})
    end
  end

  describe "deleteAppointment mutation" do
    test "deletes the appointment", %{conn: conn} do
      appointment = appointment_fixture()
      mutation = "mutation ($id: ID!) { deleteAppointment(id: $id) { id } }"

      assert %{"data" => %{"deleteAppointment" => %{"id" => _id}}} =
               graphql(conn, mutation, %{id: appointment.id})

      assert Clinic.get_appointment(appointment.id) == nil
    end
  end

  defp clinic_date(datetime) do
    datetime
    |> DateTime.shift_zone!(Clinic.clinic_time_zone())
    |> DateTime.to_date()
  end

  defp booking(pet_id, vet_id, starts_at) do
    %{
      petId: pet_id,
      vetId: vet_id,
      startsAt: DateTime.to_iso8601(starts_at),
      reason: "Checkup"
    }
  end

  defp ids(appointments), do: Enum.map(appointments, & &1["id"])
end
