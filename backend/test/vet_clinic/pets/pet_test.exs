defmodule VetClinic.Pets.PetTest do
  use VetClinic.DataCase, async: true

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
