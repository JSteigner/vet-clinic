defmodule VetClinicWeb.Schema.SearchTypes do
  @moduledoc """
  The search query: find owners, pets and vets by name and other fields,
  including archived owners and pets.
  """

  use Absinthe.Schema.Notation

  alias VetClinicWeb.Resolvers.Search

  enum :search_type do
    value :owner
    value :pet
    value :vet
  end

  @desc "Search results, grouped by type. Each group is only queried if selected."
  object :search_results do
    field :owners, non_null(list_of(non_null(:owner))), resolve: &Search.owners/3
    field :pets, non_null(list_of(non_null(:pet))), resolve: &Search.pets/3
    field :vets, non_null(list_of(non_null(:vet))), resolve: &Search.vets/3
  end

  object :search_queries do
    @desc """
    Owners (name, email, phone), pets (name, species) and vets (name, email)
    matching `term`, case-insensitive, by name. `archived` searches archived
    owners and pets instead (vets aren't archived); `types` limits the groups.
    Without a term of at least 2 characters, it lists the chosen groups when
    `archived` or `types` is given, and returns nothing otherwise.
    """
    field :search, non_null(:search_results) do
      arg :term, :string
      arg :archived, :boolean, default_value: false
      arg :types, list_of(non_null(:search_type))
      @desc "Results per group, 1 to 50."
      arg :limit, :integer, default_value: 5
      resolve &Search.search/3
    end
  end
end
