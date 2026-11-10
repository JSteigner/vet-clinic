defmodule VetClinicWeb.Schema.OwnerTypes do
  @moduledoc """
  GraphQL types, queries and mutations for owners.
  """

  use Absinthe.Schema.Notation

  import Absinthe.Resolution.Helpers, only: [dataloader: 1]

  alias VetClinic.Clinic
  alias VetClinicWeb.Resolvers.Owners

  object :owner do
    field :id, non_null(:id)
    field :name, non_null(:string)
    field :email, non_null(:string)
    field :phone, :string

    @desc "When the owner was archived (soft-deleted), or null while active."
    field :archived_at, :datetime

    @desc "All of the owner's pets, including archived ones (check archivedAt)."
    field :pets, non_null(list_of(non_null(:pet))), resolve: dataloader(Clinic)
  end

  input_object :create_owner_input do
    field :name, non_null(:string)
    field :email, non_null(:string)
    field :phone, :string
  end

  input_object :update_owner_input do
    field :name, :string
    field :email, :string
    field :phone, :string
  end

  object :owner_queries do
    @desc "Active owners, ordered by name."
    field :owners, non_null(list_of(non_null(:owner))) do
      resolve(&Owners.list_owners/3)
    end

    @desc "An active owner by ID."
    field :owner, :owner do
      arg(:id, non_null(:id))
      resolve(&Owners.get_owner/3)
    end

    @desc "The owner of a pet."
    field :pet_owner, :owner do
      arg(:pet_id, non_null(:id))
      resolve(&Owners.get_pet_owner/3)
    end
  end

  object :owner_mutations do
    field :create_owner, :owner do
      arg(:input, non_null(:create_owner_input))
      resolve(&Owners.create_owner/3)
    end

    field :update_owner, :owner do
      arg(:id, non_null(:id))
      arg(:input, non_null(:update_owner_input))
      resolve(&Owners.update_owner/3)
    end

    @desc "Archives the owner and their pets, and cancels open appointments."
    field :delete_owner, :owner do
      arg(:id, non_null(:id))
      resolve(&Owners.delete_owner/3)
    end
  end
end
