defmodule VetClinicWeb.Resolvers.Vets do
  @moduledoc """
  Resolvers for vet queries and mutations. They call only `VetClinic.Clinic`.
  """

  alias Absinthe.Resolution

  alias VetClinic.Clinic
  alias VetClinic.Vets.Vet
  alias VetClinicWeb.Resolvers.Helpers

  @spec list_vets(term(), map(), Resolution.t()) :: Helpers.result([Vet.t()])
  def list_vets(_parent, _args, _resolution) do
    {:ok, Clinic.list_vets()}
  end

  @spec get_vet(term(), map(), Resolution.t()) :: Helpers.result(Vet.t())
  def get_vet(_parent, %{id: id}, _resolution) do
    Helpers.fetch(id, &Clinic.get_vet/1, "vet")
  end

  @spec create_vet(term(), map(), Resolution.t()) :: Helpers.result(Vet.t())
  def create_vet(_parent, %{input: input}, _resolution) do
    Clinic.create_vet(input)
  end

  @spec update_vet(term(), map(), Resolution.t()) :: Helpers.result(Vet.t())
  def update_vet(_parent, %{id: id, input: input}, _resolution) do
    with {:ok, vet} <- Helpers.fetch(id, &Clinic.get_vet/1, "vet") do
      Clinic.update_vet(vet, input)
    end
  end

  @spec delete_vet(term(), map(), Resolution.t()) :: Helpers.result(Vet.t())
  def delete_vet(_parent, %{id: id}, _resolution) do
    with {:ok, vet} <- Helpers.fetch(id, &Clinic.get_vet/1, "vet") do
      Clinic.delete_vet(vet)
    end
  end
end
