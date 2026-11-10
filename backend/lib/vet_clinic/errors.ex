defmodule VetClinic.Errors do
  @moduledoc """
  Turns domain errors into plain data, so callers such as the web layer
  never need to know about Ecto. Called through `VetClinic.Clinic`.
  """

  alias Ecto.Changeset

  @typedoc "Error messages per field, e.g. `%{email: [\"has already been taken\"]}`."
  @type messages :: %{atom() => [String.t()]}

  @doc """
  Returns `{:error, messages}` for an invalid changeset, with placeholders
  like `%{count}` filled in, or `:ignore` for anything that isn't a
  changeset (e.g. a "not found" string), so callers can leave it as is.
  """
  @spec validation_errors(term()) :: {:error, messages()} | :ignore
  def validation_errors(%Changeset{} = changeset) do
    {:error, Changeset.traverse_errors(changeset, &interpolate/1)}
  end

  def validation_errors(_other), do: :ignore

  defp interpolate({message, opts}) do
    Regex.replace(~r/%{(\w+)}/, message, fn _match, key ->
      opts
      |> Keyword.get(String.to_existing_atom(key), key)
      |> to_string()
    end)
  end
end
