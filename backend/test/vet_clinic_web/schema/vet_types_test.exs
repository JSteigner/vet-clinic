defmodule VetClinicWeb.Schema.VetTypesTest do
  use VetClinicWeb.ConnCase, async: true

  describe "vets query" do
    test "returns vets by name with their appointments", %{conn: conn} do
      vet = vet_fixture(%{name: "Dr. Kim"})
      vet_fixture(%{name: "Dr. Alvarez"})
      appointment = appointment_fixture(%{vet_id: vet.id})

      query = "{ vets { name appointments { id } } }"

      assert %{"data" => %{"vets" => vets}} = graphql(conn, query)

      assert vets == [
               %{"name" => "Dr. Alvarez", "appointments" => []},
               %{"name" => "Dr. Kim", "appointments" => [%{"id" => "#{appointment.id}"}]}
             ]
    end
  end

  describe "vet query" do
    @query "query ($id: ID!) { vet(id: $id) { name } }"

    test "returns the vet", %{conn: conn} do
      vet = vet_fixture()

      assert %{"data" => %{"vet" => %{"name" => name}}} = graphql(conn, @query, %{id: vet.id})
      assert name == vet.name
    end

    test "returns not found for an unknown id", %{conn: conn} do
      assert %{"errors" => [%{"message" => "vet not found"}]} =
               graphql(conn, @query, %{id: "-1"})
    end
  end

  describe "createVet mutation" do
    @mutation "mutation ($input: CreateVetInput!) { createVet(input: $input) { name } }"

    test "creates a vet", %{conn: conn} do
      input = %{name: "Dr. Okafor", email: unique_email()}

      assert %{"data" => %{"createVet" => %{"name" => "Dr. Okafor"}}} =
               graphql(conn, @mutation, %{input: input})
    end

    test "returns an error for an invalid email", %{conn: conn} do
      input = %{name: "Dr. Okafor", email: "nope"}

      assert %{"errors" => [%{"message" => "email must be a valid email"}]} =
               graphql(conn, @mutation, %{input: input})
    end
  end

  describe "updateVet mutation" do
    test "updates the vet", %{conn: conn} do
      vet = vet_fixture()

      mutation = """
      mutation ($id: ID!, $input: UpdateVetInput!) {
        updateVet(id: $id, input: $input) { name }
      }
      """

      assert %{"data" => %{"updateVet" => %{"name" => "Dr. Lee"}}} =
               graphql(conn, mutation, %{id: vet.id, input: %{name: "Dr. Lee"}})
    end
  end

  describe "deleteVet mutation" do
    @mutation "mutation ($id: ID!) { deleteVet(id: $id) { id } }"

    test "deletes a vet with no appointments", %{conn: conn} do
      vet = vet_fixture()

      assert %{"data" => %{"deleteVet" => %{"id" => id}}} =
               graphql(conn, @mutation, %{id: vet.id})

      assert id == "#{vet.id}"
    end

    test "fails while the vet has appointments", %{conn: conn} do
      appointment = appointment_fixture()

      assert %{"errors" => [%{"message" => "appointments still exist for this vet"}]} =
               graphql(conn, @mutation, %{id: appointment.vet_id})
    end
  end
end
