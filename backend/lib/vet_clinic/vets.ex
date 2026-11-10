defmodule VetClinic.Vets do
  @moduledoc """
  Vets: the clinic's veterinarians. Called through `VetClinic.Clinic`.
  """

  import Ecto.Query, warn: false

  alias VetClinic.Repo
  alias VetClinic.Vets.Vet

  def list_vets do
    Vet
    |> order_by(:name)
    |> Repo.all()
  end

  def get_vet(id), do: Repo.get(Vet, id)

  def create_vet(attrs) do
    %Vet{}
    |> Vet.changeset(attrs)
    |> Repo.insert()
  end
end
