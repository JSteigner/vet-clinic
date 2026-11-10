defmodule VetClinic.Owners.OwnerTest do
  use VetClinic.DataCase, async: true

  alias VetClinic.Owners.Owner

  describe "changeset/2" do
    test "is valid with a name and email" do
      changeset = Owner.changeset(%Owner{}, valid_attrs())

      assert changeset.valid?
    end

    test "requires a name and email" do
      changeset = Owner.changeset(%Owner{}, %{})

      assert %{name: ["can't be blank"], email: ["can't be blank"]} = errors_on(changeset)
    end

    test "rejects a malformed email" do
      changeset = Owner.changeset(%Owner{}, %{valid_attrs() | email: "not-an-email"})

      assert %{email: ["must be a valid email"]} = errors_on(changeset)
    end

    test "doesn't let archived_at be set directly" do
      attrs = Map.put(valid_attrs(), :archived_at, DateTime.utc_now())

      changeset = Owner.changeset(%Owner{}, attrs)

      refute Map.has_key?(changeset.changes, :archived_at)
    end
  end

  describe "archive_changeset/1" do
    test "sets archived_at" do
      changeset = Owner.archive_changeset(%Owner{})

      assert %DateTime{} = get_change(changeset, :archived_at)
    end
  end

  defp valid_attrs do
    %{name: Person.name(), email: unique_email(), phone: Phone.phone()}
  end
end
