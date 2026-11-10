defmodule VetClinicWeb.Schema.PetTypes do
  @moduledoc """
  GraphQL types, queries and mutations for pets.
  """

  use Absinthe.Schema.Notation

  import Absinthe.Resolution.Helpers, only: [dataloader: 1]

  alias VetClinic.Clinic
  alias VetClinicWeb.Resolvers.Pets

  enum :species do
    value(:dog)
    value(:cat)
    value(:bird)
    value(:rabbit)
    value(:other)
  end

  object :pet do
    field :id, non_null(:id)
    field :name, non_null(:string)
    field :species, non_null(:species)
    field :breed, :string
    field :birth_date, :date

    @desc "When the pet was archived (soft-deleted), or null while active."
    field :archived_at, :datetime

    field :owner, non_null(:owner), resolve: dataloader(Clinic)

    field :appointments, non_null(list_of(non_null(:appointment))), resolve: dataloader(Clinic)
  end

  input_object :create_pet_input do
    field :owner_id, non_null(:id)
    field :name, non_null(:string)
    field :species, non_null(:species)
    field :breed, :string
    field :birth_date, :date
  end

  input_object :update_pet_input do
    field :name, :string
    field :species, :species
    field :breed, :string
    field :birth_date, :date
  end

  object :pet_queries do
    @desc "An active pet by ID."
    field :pet, :pet do
      arg(:id, non_null(:id))
      resolve(&Pets.get_pet/3)
    end

    @desc "An owner's active pets, ordered by name."
    field :owner_pets, non_null(list_of(non_null(:pet))) do
      arg(:owner_id, non_null(:id))
      resolve(&Pets.list_owner_pets/3)
    end
  end

  object :pet_mutations do
    field :create_pet, :pet do
      arg(:input, non_null(:create_pet_input))
      resolve(&Pets.create_pet/3)
    end

    field :update_pet, :pet do
      arg(:id, non_null(:id))
      arg(:input, non_null(:update_pet_input))
      resolve(&Pets.update_pet/3)
    end

    @desc "Archives the pet and cancels its open appointments."
    field :delete_pet, :pet do
      arg(:id, non_null(:id))
      resolve(&Pets.delete_pet/3)
    end
  end
end
