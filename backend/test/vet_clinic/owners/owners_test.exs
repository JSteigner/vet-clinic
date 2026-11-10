defmodule VetClinic.OwnersTest do
  use VetClinic.DataCase, async: true

  alias VetClinic.Owners

  describe "list_owners/0" do
    test "returns active owners ordered by name" do
      bea = owner_fixture(%{name: "Bea"})
      al = owner_fixture(%{name: "Al"})
      {:ok, _} = Owners.delete_owner(owner_fixture(%{name: "Cy"}))

      assert Enum.map(Owners.list_owners(), & &1.id) == [al.id, bea.id]
    end
  end

  describe "get_owner/1" do
    test "returns the owner" do
      owner = owner_fixture()

      assert Owners.get_owner(owner.id).id == owner.id
    end

    test "returns nil for an archived owner" do
      {:ok, owner} = Owners.delete_owner(owner_fixture())

      assert Owners.get_owner(owner.id) == nil
    end

    test "returns nil for an unknown id" do
      assert Owners.get_owner(-1) == nil
    end
  end

  describe "get_pet_owner/1" do
    test "returns the pet's owner" do
      owner = owner_fixture()
      pet = pet_fixture(%{owner_id: owner.id})

      assert Owners.get_pet_owner(pet.id).id == owner.id
    end

    test "returns nil for an unknown pet" do
      assert Owners.get_pet_owner(-1) == nil
    end
  end

  describe "create_owner/1" do
    test "creates an owner" do
      attrs = %{name: Person.name(), email: unique_email()}

      assert {:ok, owner} = Owners.create_owner(attrs)
      assert owner.name == attrs.name
      assert owner.archived_at == nil
    end

    test "returns an error changeset for invalid data" do
      assert {:error, changeset} = Owners.create_owner(%{name: nil, email: "not-an-email"})
      assert %{name: ["can't be blank"], email: ["must be a valid email"]} = errors_on(changeset)
    end

    test "rejects a duplicate email" do
      existing = owner_fixture()

      assert {:error, changeset} =
               Owners.create_owner(%{name: Person.name(), email: existing.email})

      assert %{email: ["has already been taken"]} = errors_on(changeset)
    end
  end

  describe "update_owner/2" do
    test "updates the owner" do
      new_name = Person.name()

      assert {:ok, owner} = Owners.update_owner(owner_fixture(), %{name: new_name})
      assert owner.name == new_name
    end

    test "returns an error changeset for invalid data" do
      assert {:error, changeset} = Owners.update_owner(owner_fixture(), %{email: "nope"})
      assert %{email: ["must be a valid email"]} = errors_on(changeset)
    end
  end

  describe "delete_owner/1" do
    setup do
      owner = owner_fixture()
      pet = pet_fixture(%{owner_id: owner.id})

      %{
        owner: owner,
        pet: pet,
        scheduled: appointment_fixture(%{pet_id: pet.id}),
        checked_in: past_appointment_fixture(%{pet_id: pet.id, status: :checked_in}),
        completed: past_appointment_fixture(%{pet_id: pet.id, status: :completed})
      }
    end

    test "archives the owner and their pets", %{owner: owner, pet: pet} do
      assert {:ok, archived} = Owners.delete_owner(owner)
      assert archived.archived_at

      assert Repo.reload!(pet).archived_at
    end

    test "cancels open appointments but keeps completed ones", context do
      {:ok, _} = Owners.delete_owner(context.owner)

      assert Repo.reload!(context.scheduled).status == :cancelled
      assert Repo.reload!(context.checked_in).status == :cancelled
      assert Repo.reload!(context.completed).status == :completed
    end

    test "leaves other owners alone", %{owner: owner} do
      other_pet = pet_fixture()
      other_appointment = appointment_fixture(%{pet_id: other_pet.id})

      {:ok, _} = Owners.delete_owner(owner)

      refute Repo.reload!(other_pet).archived_at
      assert Repo.reload!(other_appointment).status == :scheduled
    end
  end
end
