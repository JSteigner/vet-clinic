defmodule VetClinicWeb.Schema.PetTypesTest do
  use VetClinicWeb.ConnCase, async: true

  alias VetClinic.Clinic

  describe "pet query" do
    @query """
    query ($id: ID!) {
      pet(id: $id) { name species birthDate owner { id } appointments { id } }
    }
    """

    test "returns the pet with its owner and appointments", %{conn: conn} do
      pet = pet_fixture(%{species: :dog, birth_date: ~D[2020-05-01]})
      appointment = appointment_fixture(%{pet_id: pet.id})

      assert %{"data" => %{"pet" => found}} = graphql(conn, @query, %{id: pet.id})

      assert found == %{
               "name" => pet.name,
               "species" => "DOG",
               "birthDate" => "2020-05-01",
               "owner" => %{"id" => "#{pet.owner_id}"},
               "appointments" => [%{"id" => "#{appointment.id}"}]
             }
    end

    test "returns not found for an archived pet", %{conn: conn} do
      {:ok, pet} = Clinic.delete_pet(pet_fixture())

      assert %{"errors" => [%{"message" => "pet not found"}]} =
               graphql(conn, @query, %{id: pet.id})
    end
  end

  describe "ownerPets query" do
    @query "query ($ownerId: ID!) { ownerPets(ownerId: $ownerId) { name } }"

    test "returns the owner's active pets by name", %{conn: conn} do
      owner = owner_fixture()
      pet_fixture(%{owner_id: owner.id, name: "Rex"})
      pet_fixture(%{owner_id: owner.id, name: "Ace"})

      assert %{"data" => %{"ownerPets" => [%{"name" => "Ace"}, %{"name" => "Rex"}]}} =
               graphql(conn, @query, %{ownerId: owner.id})
    end

    test "returns not found for an unknown owner", %{conn: conn} do
      assert %{"errors" => [%{"message" => "owner not found"}]} =
               graphql(conn, @query, %{ownerId: "-1"})
    end
  end

  describe "createPet mutation" do
    @mutation """
    mutation ($input: CreatePetInput!) {
      createPet(input: $input) { name species owner { id } }
    }
    """

    test "creates a pet for the owner", %{conn: conn} do
      owner = owner_fixture()
      input = %{ownerId: owner.id, name: "Rex", species: "DOG"}

      assert %{"data" => %{"createPet" => created}} = graphql(conn, @mutation, %{input: input})

      assert created == %{
               "name" => "Rex",
               "species" => "DOG",
               "owner" => %{"id" => "#{owner.id}"}
             }
    end

    test "returns an error for an unknown owner", %{conn: conn} do
      input = %{ownerId: "-1", name: "Rex", species: "DOG"}

      assert %{"errors" => [%{"message" => "owner does not exist"}]} =
               graphql(conn, @mutation, %{input: input})
    end
  end

  describe "updatePet mutation" do
    test "updates the pet", %{conn: conn} do
      pet = pet_fixture()

      mutation = """
      mutation ($id: ID!, $input: UpdatePetInput!) {
        updatePet(id: $id, input: $input) { breed }
      }
      """

      assert %{"data" => %{"updatePet" => %{"breed" => "Tabby"}}} =
               graphql(conn, mutation, %{id: pet.id, input: %{breed: "Tabby"}})
    end
  end

  describe "deletePet mutation" do
    test "archives the pet and cancels its open appointments", %{conn: conn} do
      appointment = appointment_fixture()
      mutation = "mutation ($id: ID!) { deletePet(id: $id) { archivedAt } }"

      assert %{"data" => %{"deletePet" => %{"archivedAt" => archived_at}}} =
               graphql(conn, mutation, %{id: appointment.pet_id})

      assert archived_at
      assert Clinic.get_appointment(appointment.id).status == :cancelled
    end
  end
end
