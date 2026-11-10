defmodule VetClinicWeb.Resolvers.Owners do
  @moduledoc """
  Resolvers for owner queries and mutations. They call only `VetClinic.Clinic`.
  """

  alias Absinthe.Resolution

  alias VetClinic.Clinic
  alias VetClinic.Owners.Owner
  alias VetClinicWeb.Resolvers.Helpers

  @spec list_owners(term(), map(), Resolution.t()) :: Helpers.result([Owner.t()])
  def list_owners(_parent, _args, _resolution) do
    {:ok, Clinic.list_owners()}
  end

  @spec get_owner(term(), map(), Resolution.t()) :: Helpers.result(Owner.t())
  def get_owner(_parent, %{id: id}, _resolution) do
    Helpers.fetch(id, &Clinic.get_owner/1, "owner")
  end

  @spec get_pet_owner(term(), map(), Resolution.t()) :: Helpers.result(Owner.t())
  def get_pet_owner(_parent, %{pet_id: pet_id}, _resolution) do
    Helpers.fetch(pet_id, &Clinic.get_pet_owner/1, "owner")
  end

  @spec create_owner(term(), map(), Resolution.t()) :: Helpers.result(Owner.t())
  def create_owner(_parent, %{input: input}, _resolution) do
    Clinic.create_owner(input)
  end

  @spec update_owner(term(), map(), Resolution.t()) :: Helpers.result(Owner.t())
  def update_owner(_parent, %{id: id, input: input}, _resolution) do
    with {:ok, owner} <- Helpers.fetch(id, &Clinic.get_owner/1, "owner") do
      Clinic.update_owner(owner, input)
    end
  end

  @spec delete_owner(term(), map(), Resolution.t()) :: Helpers.result(Owner.t())
  def delete_owner(_parent, %{id: id}, _resolution) do
    with {:ok, owner} <- Helpers.fetch(id, &Clinic.get_owner/1, "owner") do
      Clinic.delete_owner(owner)
    end
  end
end
