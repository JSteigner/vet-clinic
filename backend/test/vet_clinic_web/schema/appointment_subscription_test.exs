defmodule VetClinicWeb.Schema.AppointmentSubscriptionTest do
  use VetClinicWeb.SubscriptionCase

  @subscription "subscription { appointmentChanged { id status } }"

  @create """
  mutation ($input: CreateAppointmentInput!) {
    createAppointment(input: $input) { id }
  }
  """

  @update_status """
  mutation ($id: ID!, $status: AppointmentStatus!) {
    updateAppointmentStatus(id: $id, status: $status) { id }
  }
  """

  test "pushes booked appointments to subscribers", %{socket: socket} do
    subscription_id = subscribe(socket)

    input = %{
      "petId" => pet_fixture().id,
      "vetId" => vet_fixture().id,
      "startsAt" => DateTime.to_iso8601(from_now(1, :day)),
      "reason" => "Checkup"
    }

    ref = push_doc(socket, @create, variables: %{"input" => input})
    assert_reply ref, :ok, %{data: %{"createAppointment" => %{"id" => id}}}

    assert_push "subscription:data", push
    assert push.subscriptionId == subscription_id
    assert push.result.data["appointmentChanged"] == %{"id" => id, "status" => "SCHEDULED"}
  end

  test "pushes status changes to subscribers", %{socket: socket} do
    appointment = appointment_fixture()
    subscription_id = subscribe(socket)

    variables = %{"id" => appointment.id, "status" => "CHECKED_IN"}
    ref = push_doc(socket, @update_status, variables: variables)
    assert_reply ref, :ok, _reply

    assert_push "subscription:data", push
    assert push.subscriptionId == subscription_id

    assert push.result.data["appointmentChanged"] == %{
             "id" => "#{appointment.id}",
             "status" => "CHECKED_IN"
           }
  end

  defp subscribe(socket) do
    ref = push_doc(socket, @subscription)
    assert_reply ref, :ok, %{subscriptionId: subscription_id}

    subscription_id
  end
end
