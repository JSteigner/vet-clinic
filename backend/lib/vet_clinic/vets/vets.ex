defmodule VetClinic.Vets do
  @moduledoc """
  Vets: the clinic's veterinarians. Called through `VetClinic.Clinic`.
  """

  import Ecto.Query, warn: false

  alias Ecto.Changeset

  alias VetClinic.Repo
  alias VetClinic.Search
  alias VetClinic.Vets.Vet

  @spec list_vets() :: [Vet.t()]
  def list_vets do
    Vet
    |> order_by(:name)
    |> Repo.all()
  end

  @doc """
  Vets whose name or email matches `term` (case-insensitive, anywhere), by
  name, up to `limit`. A `nil` term lists them all.
  """
  @spec search_vets(String.t() | nil, pos_integer()) :: [Vet.t()]
  def search_vets(term, limit) do
    Vet
    |> Search.matching(term, [:name, :email])
    |> Search.first_by_name(limit)
    |> Repo.all()
  end

  @spec get_vet(integer()) :: Vet.t() | nil
  def get_vet(id), do: Repo.get(Vet, id)

  @spec create_vet(map()) :: {:ok, Vet.t()} | {:error, Changeset.t()}
  def create_vet(attrs) do
    %Vet{}
    |> Vet.changeset(attrs)
    |> Repo.insert()
  end

  @spec update_vet(Vet.t(), map()) :: {:ok, Vet.t()} | {:error, Changeset.t()}
  def update_vet(%Vet{} = vet, attrs) do
    vet
    |> Vet.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a vet. Returns `{:error, changeset}` if the vet still has
  appointments, since the database refuses to orphan them.
  """
  @spec delete_vet(Vet.t()) :: {:ok, Vet.t()} | {:error, Changeset.t()}
  def delete_vet(%Vet{} = vet) do
    vet
    |> Vet.delete_changeset()
    |> Repo.delete()
  end
end
