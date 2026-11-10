defmodule VetClinic.Owners do
  @moduledoc """
  Owners: the clinic's clients. Called through `VetClinic.Clinic`.
  """

  import Ecto.Query, warn: false

  alias VetClinic.Owners.Owner
  alias VetClinic.Repo

  def list_owners do
    Owner
    |> order_by(:name)
    |> Repo.all()
  end

  def get_owner(id), do: Repo.get(Owner, id)

  def create_owner(attrs) do
    %Owner{}
    |> Owner.changeset(attrs)
    |> Repo.insert()
  end
end
