defmodule VetClinicWeb.Schema.Middleware.ChangesetErrors do
  @moduledoc """
  Turns a mutation's validation failure into one GraphQL error per invalid
  field, named the way GraphQL clients see it, e.g.
  `"startsAt must be in the future"` with `extensions: %{field: "startsAt"}`.
  Other errors, such as "owner not found", pass through unchanged.
  """

  @behaviour Absinthe.Middleware

  alias Absinthe.Resolution

  alias VetClinic.Clinic

  @impl true
  @spec call(Resolution.t(), term()) :: Resolution.t()
  def call(%Resolution{errors: [error]} = resolution, _config) do
    case Clinic.validation_errors(error) do
      {:error, messages} ->
        %{resolution | value: nil, errors: format(messages, resolution.adapter)}

      :ignore ->
        resolution
    end
  end

  def call(resolution, _config), do: resolution

  # Uses the schema's adapter so field names match the API (starts_at -> startsAt).
  defp format(messages, adapter) do
    Enum.flat_map(messages, fn {field, field_messages} ->
      external_field = adapter.to_external_name(Atom.to_string(field), :field)

      Enum.map(
        field_messages,
        &%{message: "#{external_field} #{&1}", extensions: %{field: external_field}}
      )
    end)
  end
end
