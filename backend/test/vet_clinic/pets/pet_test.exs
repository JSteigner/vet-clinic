defmodule VetClinic.Pets.PetTest do
  use VetClinic.DataCase, async: true

  alias VetClinic.Owners.Owner
  alias VetClinic.Pets.Pet

  describe "changeset/2" do
    test "is valid with a name, species and owner" do
      changeset = Pet.changeset(%Pet{}, valid_attrs())

      assert changeset.valid?
    end

    test "requires a name, species and owner" do
      changeset = Pet.changeset(%Pet{}, %{})

      assert %{
               name: ["can't be blank"],
               species: ["can't be blank"],
               owner_id: ["can't be blank"]
             } = errors_on(changeset)
    end

    test "rejects an unknown species" do
      changeset = Pet.changeset(%Pet{}, %{valid_attrs() | species: :dragon})

      assert %{species: ["is invalid"]} = errors_on(changeset)
    end

    test "doesn't let archived_at be set directly" do
      attrs = Map.put(valid_attrs(), :archived_at, DateTime.utc_now())

      changeset = Pet.changeset(%Pet{}, attrs)

      refute Map.has_key?(changeset.changes, :archived_at)
    end
  end

  describe "restore_changeset/1" do
    test "clears archived_at when the owner is active" do
      pet = %Pet{archived_at: ~U[2026-01-02 03:04:05Z], owner: %Owner{archived_at: nil}}
      changeset = Pet.restore_changeset(pet)

      assert changeset.valid?
      assert changeset.changes == %{archived_at: nil}
    end

    test "is refused while the owner is archived" do
      archived = ~U[2026-01-02 03:04:05Z]

      changeset =
        Pet.restore_changeset(%Pet{archived_at: archived, owner: %Owner{archived_at: archived}})

      assert %{owner: ["is archived; restore the owner first"]} = errors_on(changeset)
    end
  end

  describe "archive_changeset/1" do
    test "sets archived_at" do
      changeset = Pet.archive_changeset(%Pet{})

      assert %DateTime{} = get_change(changeset, :archived_at)
    end
  end

  defp valid_attrs do
    %{name: Cat.name(), species: :cat, breed: Cat.breed(), owner_id: 1}
  end
end
