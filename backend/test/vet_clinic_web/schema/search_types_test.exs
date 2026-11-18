defmodule VetClinicWeb.Schema.SearchTypesTest do
  use VetClinicWeb.ConnCase, async: true

  alias VetClinic.Clinic

  @query """
  query (
    $term: String
    $archived: Boolean
    $includeArchived: Boolean
    $types: [SearchType!]
    $limit: Int
  ) {
    search(
      term: $term
      archived: $archived
      includeArchived: $includeArchived
      types: $types
      limit: $limit
    ) {
      owners { name }
      pets { name owner { name } }
      vets { name }
    }
  }
  """

  setup do
    owner = owner_fixture(%{name: "Rexford Hale", email: unique_email(), phone: "555-0199"})

    %{
      owner: owner,
      pet: pet_fixture(%{owner_id: owner.id, name: "Rex", species: :dog}),
      vet: vet_fixture(%{name: "Dr. Rexa", email: unique_email()})
    }
  end

  test "returns matches grouped by type", %{conn: conn} do
    assert search(conn, %{term: "rex"}) == %{
             "owners" => [%{"name" => "Rexford Hale"}],
             "pets" => [%{"name" => "Rex", "owner" => %{"name" => "Rexford Hale"}}],
             "vets" => [%{"name" => "Dr. Rexa"}]
           }
  end

  test "returns nothing for a term under 2 characters", %{conn: conn} do
    assert search(conn, %{term: " r "}) == %{"owners" => [], "pets" => [], "vets" => []}
  end

  test "limits the groups to the given types", %{conn: conn} do
    assert search(conn, %{term: "rex", types: ["PET"]}) == %{
             "owners" => [],
             "pets" => [%{"name" => "Rex", "owner" => %{"name" => "Rexford Hale"}}],
             "vets" => []
           }
  end

  test "lists a group without a term when its type is given", %{conn: conn} do
    assert %{"vets" => [%{"name" => "Dr. Rexa"}], "owners" => []} =
             search(conn, %{types: ["VET"]})
  end

  test "searches archived owners and pets, never vets", %{conn: conn, owner: owner} do
    {:ok, _} = Clinic.delete_owner(owner)

    assert search(conn, %{term: "rex"}) == %{
             "owners" => [],
             "pets" => [],
             "vets" => [%{"name" => "Dr. Rexa"}]
           }

    assert search(conn, %{archived: true}) == %{
             "owners" => [%{"name" => "Rexford Hale"}],
             "pets" => [%{"name" => "Rex", "owner" => %{"name" => "Rexford Hale"}}],
             "vets" => []
           }
  end

  test "searches archived owners and pets alongside active ones with includeArchived", %{
    conn: conn,
    owner: owner
  } do
    active = owner_fixture(%{name: "Rexanne Bell", email: unique_email()})
    {:ok, _} = Clinic.delete_owner(owner)

    assert search(conn, %{term: "rex", includeArchived: true}) == %{
             "owners" => [%{"name" => active.name}, %{"name" => "Rexford Hale"}],
             "pets" => [%{"name" => "Rex", "owner" => %{"name" => "Rexford Hale"}}],
             "vets" => [%{"name" => "Dr. Rexa"}]
           }
  end

  test "clamps the limit to at least 1", %{conn: conn} do
    vet_fixture(%{name: "Dr. Rexb", email: unique_email()})

    assert %{"vets" => [%{"name" => "Dr. Rexa"}]} =
             search(conn, %{term: "dr. rex", limit: 0})
  end

  defp search(conn, variables) do
    %{"data" => %{"search" => results}} = graphql(conn, @query, variables)

    results
  end
end
