defmodule VetClinic.Pets do
  @moduledoc """
  Pets: the clinic's patients. Called through `VetClinic.Clinic`.
  """

  import Ecto.Query, warn: false

  alias VetClinic.Pets.Pet
  alias VetClinic.Repo

  def get_pet(id), do: Repo.get(Pet, id)

  @doc """
  All of an owner's pets, ordered by name.
  """
  def list_owner_pets(owner_id) do
    Pet
    |> where([p], p.owner_id == ^owner_id)
    |> order_by(:name)
    |> Repo.all()
  end

  def create_pet(attrs) do
    %Pet{}
    |> Pet.changeset(attrs)
    |> Repo.insert()
  end
end
