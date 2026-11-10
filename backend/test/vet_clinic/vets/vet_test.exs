defmodule VetClinic.Vets.VetTest do
  use VetClinic.DataCase, async: true

  alias VetClinic.Vets.Vet

  describe "changeset/2" do
    test "is valid with a name and email" do
      changeset = Vet.changeset(%Vet{}, valid_attrs())

      assert changeset.valid?
    end

    test "requires a name and email" do
      changeset = Vet.changeset(%Vet{}, %{})

      assert %{name: ["can't be blank"], email: ["can't be blank"]} = errors_on(changeset)
    end

    test "rejects a malformed email" do
      changeset = Vet.changeset(%Vet{}, %{valid_attrs() | email: "not-an-email"})

      assert %{email: ["must be a valid email"]} = errors_on(changeset)
    end
  end

  describe "delete_changeset/1" do
    test "guards against deleting a vet who still has appointments" do
      changeset = Vet.delete_changeset(%Vet{})

      assert [%{constraint: "appointments_vet_id_fkey", type: :foreign_key}] =
               changeset.constraints
    end
  end

  defp valid_attrs do
    %{name: "Dr. #{Person.name()}", email: unique_email()}
  end
end
