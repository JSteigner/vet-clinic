defmodule VetClinicWeb.Schema.VetTypes do
  @moduledoc """
  GraphQL types, queries and mutations for vets.
  """

  use Absinthe.Schema.Notation

  import Absinthe.Resolution.Helpers, only: [dataloader: 1]

  alias VetClinic.Clinic
  alias VetClinicWeb.Resolvers.Vets

  object :vet do
    field :id, non_null(:id)
    field :name, non_null(:string)
    field :email, non_null(:string)

    field :appointments, non_null(list_of(non_null(:appointment))), resolve: dataloader(Clinic)
  end

  input_object :create_vet_input do
    field :name, non_null(:string)
    field :email, non_null(:string)
  end

  input_object :update_vet_input do
    field :name, :string
    field :email, :string
  end

  object :vet_queries do
    @desc "All vets, ordered by name."
    field :vets, non_null(list_of(non_null(:vet))) do
      resolve(&Vets.list_vets/3)
    end

    @desc "A vet by ID."
    field :vet, :vet do
      arg(:id, non_null(:id))
      resolve(&Vets.get_vet/3)
    end
  end

  object :vet_mutations do
    field :create_vet, :vet do
      arg(:input, non_null(:create_vet_input))
      resolve(&Vets.create_vet/3)
    end

    field :update_vet, :vet do
      arg(:id, non_null(:id))
      arg(:input, non_null(:update_vet_input))
      resolve(&Vets.update_vet/3)
    end

    @desc "Deletes a vet. Fails while the vet still has appointments."
    field :delete_vet, :vet do
      arg(:id, non_null(:id))
      resolve(&Vets.delete_vet/3)
    end
  end
end
