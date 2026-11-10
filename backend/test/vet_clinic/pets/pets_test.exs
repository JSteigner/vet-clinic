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
end
