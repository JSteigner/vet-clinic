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

  def update_vet(%Vet{} = vet, attrs) do
    vet
    |> Vet.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a vet. Returns `{:error, changeset}` if the vet still has
  appointments, since the database refuses to orphan them.
  """
  def delete_vet(%Vet{} = vet) do
    vet
    |> Vet.delete_changeset()
    |> Repo.delete()
  end
end
