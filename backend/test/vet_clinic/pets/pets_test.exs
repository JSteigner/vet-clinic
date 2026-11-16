defmodule VetClinic.PetsTest do
  use VetClinic.DataCase, async: true

  alias VetClinic.Owners
  alias VetClinic.Pets

  describe "get_pet/1" do
    test "returns the pet" do
      pet = pet_fixture()

      assert Pets.get_pet(pet.id).id == pet.id
    end

    test "returns nil for an archived pet" do
      {:ok, pet} = Pets.delete_pet(pet_fixture())

      assert Pets.get_pet(pet.id) == nil
    end

    test "finds an archived pet with include_archived" do
      {:ok, pet} = Pets.delete_pet(pet_fixture())

      assert Pets.get_pet(pet.id, include_archived: true).id == pet.id
    end
  end

  describe "restore_pet/1" do
    test "restores an archived pet" do
      {:ok, pet} = Pets.delete_pet(pet_fixture())

      assert {:ok, restored} = Pets.restore_pet(pet)
      assert restored.archived_at == nil
      assert Pets.get_pet(pet.id)
    end

    test "is refused while the owner is archived" do
      pet = pet_fixture()
      {:ok, _owner} = Owners.delete_owner(Owners.get_owner(pet.owner_id))
      archived_pet = Pets.get_pet(pet.id, include_archived: true)

      assert {:error, changeset} = Pets.restore_pet(archived_pet)
      assert %{owner: ["is archived; restore the owner first"]} = errors_on(changeset)
      assert Repo.reload!(pet).archived_at
    end
  end

  describe "list_owner_pets/1" do
    test "returns the owner's active pets ordered by name" do
      owner = owner_fixture()
      rex = pet_fixture(%{owner_id: owner.id, name: "Rex"})
      biscuit = pet_fixture(%{owner_id: owner.id, name: "Biscuit"})
      {:ok, _} = Pets.delete_pet(pet_fixture(%{owner_id: owner.id, name: "Mochi"}))
      _other_owners_pet = pet_fixture()

      assert Enum.map(Pets.list_owner_pets(owner.id), & &1.id) == [biscuit.id, rex.id]
    end
  end

  describe "create_pet/1" do
    test "creates a pet" do
      owner = owner_fixture()
      attrs = %{name: Cat.name(), species: :cat, breed: Cat.breed(), owner_id: owner.id}

      assert {:ok, pet} = Pets.create_pet(attrs)
      assert pet.name == attrs.name
      assert pet.owner_id == owner.id
    end

    test "rejects an owner that doesn't exist" do
      attrs = %{name: Cat.name(), species: :cat, owner_id: -1}

      assert {:error, changeset} = Pets.create_pet(attrs)
      assert %{owner: ["does not exist"]} = errors_on(changeset)
    end

    test "returns an error changeset for invalid data" do
      assert {:error, changeset} = Pets.create_pet(%{species: :dragon})
      assert %{name: ["can't be blank"], species: ["is invalid"]} = errors_on(changeset)
    end
  end

  describe "update_pet/2" do
    test "updates the pet" do
      new_breed = Cat.breed()

      assert {:ok, pet} = Pets.update_pet(pet_fixture(), %{breed: new_breed})
      assert pet.breed == new_breed
    end

    test "returns an error changeset for invalid data" do
      assert {:error, changeset} = Pets.update_pet(pet_fixture(), %{species: :dragon})
      assert %{species: ["is invalid"]} = errors_on(changeset)
    end
  end

  describe "delete_pet/1" do
    setup do
      pet = pet_fixture()

      %{
        pet: pet,
        scheduled: appointment_fixture(%{pet_id: pet.id}),
        checked_in: past_appointment_fixture(%{pet_id: pet.id, status: :checked_in}),
        completed: past_appointment_fixture(%{pet_id: pet.id, status: :completed})
      }
    end

    test "archives the pet but not its owner", %{pet: pet} do
      assert {:ok, archived} = Pets.delete_pet(pet)
      assert archived.archived_at

      assert Owners.get_owner(pet.owner_id)
    end

    test "cancels open appointments but keeps completed ones", context do
      {:ok, _} = Pets.delete_pet(context.pet)

      assert Repo.reload!(context.scheduled).status == :cancelled
      assert Repo.reload!(context.checked_in).status == :cancelled
      assert Repo.reload!(context.completed).status == :completed
    end

    test "leaves other pets' appointments alone", %{pet: pet} do
      other_appointment = appointment_fixture()

      {:ok, _} = Pets.delete_pet(pet)

      assert Repo.reload!(other_appointment).status == :scheduled
    end
  end

  describe "search_pets/2" do
    setup do
      %{
        rex: pet_fixture(%{name: "Rex", species: :dog}),
        mochi: pet_fixture(%{name: "Mochi", species: :cat}),
        clover: pet_fixture(%{name: "Clover", species: :rabbit})
      }
    end

    test "matches names, case-insensitively" do
      assert names(Pets.search_pets("REX", limit: 5)) == ["Rex"]
    end

    test "matches part of a species name" do
      assert names(Pets.search_pets("ca", limit: 5)) == ["Mochi"]
      assert names(Pets.search_pets("Rab", limit: 5)) == ["Clover"]
    end

    test "searches archived pets only when asked", %{rex: rex} do
      {:ok, _} = Pets.delete_pet(rex)

      assert names(Pets.search_pets("rex", limit: 5)) == []
      assert names(Pets.search_pets("rex", archived: true, limit: 5)) == ["Rex"]
    end

    test "lists pets by name for a nil term, up to the limit" do
      assert names(Pets.search_pets(nil, limit: 2)) == ["Clover", "Mochi"]
    end
  end

  defp names(pets), do: Enum.map(pets, & &1.name)
end
