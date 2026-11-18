defmodule VetClinicWeb.Resolvers.Search do
  @moduledoc """
  Resolvers for the search query. `search/3` normalizes the arguments into a
  search, and each group's resolver runs its query only if the search
  includes that group. They call only `VetClinic.Clinic`.
  """

  alias Absinthe.Resolution

  alias VetClinic.Clinic
  alias VetClinic.Owners.Owner
  alias VetClinic.Pets.Pet
  alias VetClinic.Vets.Vet
  alias VetClinicWeb.Resolvers.Helpers

  @max_limit 50

  @typedoc "A normalized search, passed to the group resolvers as their parent."
  @type search :: %{
          term: String.t() | nil,
          archived: boolean(),
          include_archived: boolean(),
          types: [:owner | :pet | :vet] | nil,
          limit: pos_integer()
        }

  @spec search(term(), map(), Resolution.t()) :: Helpers.result(search())
  def search(_parent, args, _resolution) do
    {:ok,
     %{
       term: normalize_term(args[:term]),
       archived: args.archived,
       include_archived: args.include_archived,
       types: args[:types],
       limit: clamp_limit(args.limit)
     }}
  end

  @spec owners(search(), map(), Resolution.t()) :: Helpers.result([Owner.t()])
  def owners(search, _args, _resolution) do
    {:ok, run(search, :owner, &Clinic.search_owners(&1.term, archive_opts(&1)))}
  end

  @spec pets(search(), map(), Resolution.t()) :: Helpers.result([Pet.t()])
  def pets(search, _args, _resolution) do
    {:ok, run(search, :pet, &Clinic.search_pets(&1.term, archive_opts(&1)))}
  end

  @spec vets(search(), map(), Resolution.t()) :: Helpers.result([Vet.t()])
  def vets(search, _args, _resolution) do
    {:ok, run(search, :vet, &Clinic.search_vets(&1.term, &1.limit))}
  end

  # A term shorter than 2 characters is treated as no term.
  defp normalize_term(nil), do: nil

  defp normalize_term(term) do
    case String.trim(term) do
      trimmed when byte_size(trimmed) >= 2 -> trimmed
      _short -> nil
    end
  end

  defp clamp_limit(limit) do
    limit
    |> max(1)
    |> min(@max_limit)
  end

  defp archive_opts(search) do
    [archived: search.archived, include_archived: search.include_archived, limit: search.limit]
  end

  defp run(search, type, query) do
    if includes?(search, type), do: query.(search), else: []
  end

  # Vets aren't archived, so an archived search never includes them; without a
  # term, only an explicit archived search or type list lists anything.
  defp includes?(%{archived: true}, :vet), do: false
  defp includes?(%{term: nil, archived: false, types: nil}, _type), do: false
  defp includes?(%{types: types}, type) when is_list(types), do: type in types
  defp includes?(_search, _type), do: true
end
