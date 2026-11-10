defmodule VetClinicWeb.Resolvers.Pets do
  @moduledoc """
  Resolvers for pet queries and mutations. They call only `VetClinic.Clinic`.
  """

  alias Absinthe.Resolution

  alias VetClinic.Clinic
  alias VetClinic.Pets.Pet
  alias VetClinicWeb.Resolvers.Helpers

  @spec get_pet(term(), map(), Resolution.t()) :: Helpers.result(Pet.t())
  def get_pet(_parent, %{id: id}, _resolution) do
    Helpers.fetch(id, &Clinic.get_pet/1, "pet")
  end

  @spec list_owner_pets(term(), map(), Resolution.t()) :: Helpers.result([Pet.t()])
  def list_owner_pets(_parent, %{owner_id: owner_id}, _resolution) do
    with {:ok, owner} <- Helpers.fetch(owner_id, &Clinic.get_owner/1, "owner") do
      {:ok, Clinic.list_owner_pets(owner.id)}
    end
  end

  @spec create_pet(term(), map(), Resolution.t()) :: Helpers.result(Pet.t())
  def create_pet(_parent, %{input: input}, _resolution) do
    Clinic.create_pet(input)
  end

  @spec update_pet(term(), map(), Resolution.t()) :: Helpers.result(Pet.t())
  def update_pet(_parent, %{id: id, input: input}, _resolution) do
    with {:ok, pet} <- Helpers.fetch(id, &Clinic.get_pet/1, "pet") do
      Clinic.update_pet(pet, input)
    end
  end

  @spec delete_pet(term(), map(), Resolution.t()) :: Helpers.result(Pet.t())
  def delete_pet(_parent, %{id: id}, _resolution) do
    with {:ok, pet} <- Helpers.fetch(id, &Clinic.get_pet/1, "pet") do
      Clinic.delete_pet(pet)
    end
  end
end
