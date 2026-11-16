defmodule VetClinic.ErrorsTest do
  use ExUnit.Case, async: true

  alias Ecto.Changeset

  alias VetClinic.Errors

  describe "validation_errors/1" do
    test "fills placeholders such as %{count} from the error's options" do
      result =
        %{name: "Al", reason: "Checkup"}
        |> changeset()
        |> Changeset.validate_length(:name, min: 3)
        |> Errors.validation_errors()

      assert result == {:error, %{name: ["should be at least 3 character(s)"]}}
    end

    test "keeps messages without placeholders and groups them by field" do
      result =
        %{name: "Al"}
        |> changeset()
        |> Changeset.add_error(:name, "is taken")
        |> Errors.validation_errors()

      assert result == {:error, %{name: ["is taken"], reason: ["can't be blank"]}}
    end

    test "ignores anything that isn't a changeset" do
      assert Errors.validation_errors("pet not found") == :ignore
    end
  end

  # A schemaless changeset, so these tests need no database.
  defp changeset(attrs) do
    {%{}, %{name: :string, reason: :string}}
    |> Changeset.cast(attrs, [:name, :reason])
    |> Changeset.validate_required([:reason])
  end
end
