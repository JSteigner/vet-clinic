defmodule VetClinic.Owners do
  @moduledoc """
  Owners: the clinic's clients. Called through `VetClinic.Clinic`.

  Owners are soft-deleted (archived), and lookups skip archived owners.
  """

  import Ecto.Query, warn: false

  alias Ecto.Multi
  alias VetClinic.Appointments
  alias VetClinic.Owners.Owner
  alias VetClinic.Pets
  alias VetClinic.Repo

  def list_owners do
    Owner
    |> active()
    |> order_by(:name)
    |> Repo.all()
  end

  def get_owner(id) do
    Owner
    |> active()
    |> Repo.get(id)
  end

  @doc """
  The owner of the given pet, or `nil` if the pet doesn't exist.
  """
  def get_pet_owner(pet_id) do
    Owner
    |> join(:inner, [o], p in assoc(o, :pets))
    |> where([_o, p], p.id == ^pet_id)
    |> Repo.one()
  end

  def create_owner(attrs) do
    %Owner{}
    |> Owner.changeset(attrs)
    |> Repo.insert()
  end

  def update_owner(%Owner{} = owner, attrs) do
    owner
    |> Owner.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Archives an owner and all of their pets, and cancels those pets' open
  appointments, in one transaction. Completed appointments are kept.
  """
  def delete_owner(%Owner{} = owner) do
    Multi.new()
    |> Appointments.cancel_open_appointments(Pets.owner_pet_ids_query(owner.id))
    |> Pets.archive_owner_pets(owner.id)
    |> Multi.update(:owner, Owner.archive_changeset(owner))
    |> Repo.transact()
    |> case do
      {:ok, %{owner: owner}} -> {:ok, owner}
      {:error, _step, changeset, _changes} -> {:error, changeset}
    end
  end

  defp active(query), do: where(query, [o], is_nil(o.archived_at))
end
