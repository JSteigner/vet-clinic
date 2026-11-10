defmodule VetClinicWeb.Resolvers.Helpers do
  @moduledoc """
  Shared resolver helpers. GraphQL IDs arrive as strings, while the domain
  takes `integer()` IDs, so these parse them first and turn a malformed or
  unknown ID into a "not found" error instead of raising.
  """

  @typedoc "What a resolver returns to Absinthe."
  @type result(value) :: {:ok, value} | {:error, term()}

  @doc """
  Parses `id` and loads the record with `get`, returning
  `{:error, "<label> not found"}` for a malformed or unknown ID.
  """
  @spec fetch(String.t(), (integer() -> struct() | nil), String.t()) ::
          {:ok, struct()} | {:error, String.t()}
  def fetch(id, get, label) do
    with {:ok, int_id} <- parse_id(id),
         %_{} = record <- get.(int_id) do
      {:ok, record}
    else
      _not_found -> {:error, "#{label} not found"}
    end
  end

  defp parse_id(id) do
    case Integer.parse(id) do
      {int_id, ""} -> {:ok, int_id}
      _other -> :error
    end
  end
end
