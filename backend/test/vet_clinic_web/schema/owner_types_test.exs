defmodule VetClinicWeb.Schema.OwnerTypesTest do
  use VetClinicWeb.ConnCase, async: true

  alias VetClinic.Clinic

  describe "owners query" do
    test "returns active owners with their pets", %{conn: conn} do
      owner = owner_fixture(%{name: "Al"})
      pet = pet_fixture(%{owner_id: owner.id})
      {:ok, _archived} = Clinic.delete_owner(owner_fixture())

      query = "{ owners { id name pets { id } } }"

      assert %{"data" => %{"owners" => [found]}} = graphql(conn, query)
      assert found == %{"id" => "#{owner.id}", "name" => "Al", "pets" => [%{"id" => "#{pet.id}"}]}
    end
  end

  describe "owner query" do
    @query "query ($id: ID!) { owner(id: $id) { name email archivedAt } }"

    test "returns the owner", %{conn: conn} do
      owner = owner_fixture()

      assert %{"data" => %{"owner" => found}} = graphql(conn, @query, %{id: owner.id})
      assert found == %{"name" => owner.name, "email" => owner.email, "archivedAt" => nil}
    end

    test "returns not found for unknown and malformed ids", %{conn: conn} do
      for id <- ["-1", "abc"] do
        assert %{"data" => %{"owner" => nil}, "errors" => [%{"message" => "owner not found"}]} =
                 graphql(conn, @query, %{id: id})
      end
    end
  end

  describe "petOwner query" do
    test "returns the pet's owner", %{conn: conn} do
      pet = pet_fixture()
      query = "query ($petId: ID!) { petOwner(petId: $petId) { id } }"

      assert %{"data" => %{"petOwner" => %{"id" => id}}} =
               graphql(conn, query, %{petId: pet.id})

      assert id == "#{pet.owner_id}"
    end
  end

  describe "createOwner mutation" do
    @mutation """
    mutation ($input: CreateOwnerInput!) {
      createOwner(input: $input) { id name }
    }
    """

    test "creates an owner", %{conn: conn} do
      input = %{name: "Al", email: unique_email()}

      assert %{"data" => %{"createOwner" => %{"name" => "Al"}}} =
               graphql(conn, @mutation, %{input: input})
    end

    test "returns one error per invalid field", %{conn: conn} do
      taken = owner_fixture().email

      assert %{"data" => %{"createOwner" => nil}, "errors" => [error]} =
               graphql(conn, @mutation, %{input: %{name: "Al", email: taken}})

      assert error["message"] == "email has already been taken"
      assert error["extensions"] == %{"field" => "email"}
    end
  end

  describe "updateOwner mutation" do
    @mutation """
    mutation ($id: ID!, $input: UpdateOwnerInput!) {
      updateOwner(id: $id, input: $input) { phone }
    }
    """

    test "updates the owner", %{conn: conn} do
      owner = owner_fixture()

      assert %{"data" => %{"updateOwner" => %{"phone" => "555-0100"}}} =
               graphql(conn, @mutation, %{id: owner.id, input: %{phone: "555-0100"}})
    end

    test "returns not found for an unknown id", %{conn: conn} do
      assert %{"errors" => [%{"message" => "owner not found"}]} =
               graphql(conn, @mutation, %{id: "-1", input: %{}})
    end
  end

  describe "deleteOwner mutation" do
    test "archives the owner", %{conn: conn} do
      owner = owner_fixture()
      mutation = "mutation ($id: ID!) { deleteOwner(id: $id) { archivedAt } }"

      assert %{"data" => %{"deleteOwner" => %{"archivedAt" => archived_at}}} =
               graphql(conn, mutation, %{id: owner.id})

      assert archived_at
      assert Clinic.get_owner(owner.id) == nil
    end
  end
end
