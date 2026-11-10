defmodule VetClinic.Pets do
  @moduledoc """
  Pets: the clinic's patients. Called through `VetClinic.Clinic`.
  """

  alias VetClinic.Pets.Pet
  alias VetClinic.Repo

  def get_pet(id), do: Repo.get(Pet, id)

  def create_pet(attrs) do
    %Pet{}
    |> Pet.changeset(attrs)
    |> Repo.insert()
  end
end
