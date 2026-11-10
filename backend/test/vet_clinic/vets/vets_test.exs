defmodule VetClinic.VetsTest do
  use VetClinic.DataCase, async: true

  alias VetClinic.Vets

  describe "list_vets/0" do
    test "returns vets ordered by name" do
      kim = vet_fixture(%{name: "Dr. Kim"})
      alvarez = vet_fixture(%{name: "Dr. Alvarez"})

      assert Enum.map(Vets.list_vets(), & &1.id) == [alvarez.id, kim.id]
    end
  end

  describe "get_vet/1" do
    test "returns the vet" do
      vet = vet_fixture()

      assert Vets.get_vet(vet.id).id == vet.id
    end

    test "returns nil for an unknown id" do
      assert Vets.get_vet(-1) == nil
    end
  end

  describe "create_vet/1" do
    test "creates a vet" do
      attrs = %{name: "Dr. #{Person.name()}", email: unique_email()}

      assert {:ok, vet} = Vets.create_vet(attrs)
      assert vet.name == attrs.name
    end

    test "rejects a duplicate email" do
      existing = vet_fixture()

      assert {:error, changeset} =
               Vets.create_vet(%{name: "Dr. #{Person.name()}", email: existing.email})

      assert %{email: ["has already been taken"]} = errors_on(changeset)
    end
  end

  describe "update_vet/2" do
    test "updates the vet" do
      new_email = unique_email()

      assert {:ok, vet} = Vets.update_vet(vet_fixture(), %{email: new_email})
      assert vet.email == new_email
    end

    test "returns an error changeset for invalid data" do
      assert {:error, changeset} = Vets.update_vet(vet_fixture(), %{name: nil})
      assert %{name: ["can't be blank"]} = errors_on(changeset)
    end
  end

  describe "delete_vet/1" do
    test "deletes a vet with no appointments" do
      vet = vet_fixture()

      assert {:ok, _} = Vets.delete_vet(vet)
      assert Vets.get_vet(vet.id) == nil
    end

    test "refuses to delete a vet who still has appointments" do
      vet = vet_fixture()
      appointment_fixture(%{vet_id: vet.id})

      assert {:error, changeset} = Vets.delete_vet(vet)
      assert %{appointments: ["vet still has appointments"]} = errors_on(changeset)
      assert Vets.get_vet(vet.id)
    end
  end
end
