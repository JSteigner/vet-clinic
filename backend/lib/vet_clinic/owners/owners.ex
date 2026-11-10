defmodule VetClinic.Owners do
  @moduledoc """
  Owners: the clinic's clients. Called through `VetClinic.Clinic`.

  Owners are soft-deleted (archived), and lookups skip archived owners.
  """

  import Ecto.Query, warn: false

  alias Ecto.Changeset
  alias Ecto.Multi

  alias VetClinic.Appointments
  alias VetClinic.Owners.Owner
  alias VetClinic.Pets
  alias VetClinic.Repo

  @spec list_owners() :: [Owner.t()]
  def list_owners do
    Owner
    |> active()
    |> order_by(:name)
    |> Repo.all()
  end

  @spec get_owner(integer()) :: Owner.t() | nil
  def get_owner(id) do
    Owner
    |> active()
    |> Repo.get(id)
  end

  @doc """
  The owner of the given pet, or `nil` if the pet doesn't exist.
  """
  @spec get_pet_owner(integer()) :: Owner.t() | nil
  def get_pet_owner(pet_id) do
    Owner
    |> join(:inner, [o], p in assoc(o, :pets))
    |> where([_o, p], p.id == ^pet_id)
    |> Repo.one()
  end

  @spec create_owner(map()) :: {:ok, Owner.t()} | {:error, Changeset.t()}
  def create_owner(attrs) do
    %Owner{}
    |> Owner.changeset(attrs)
    |> Repo.insert()
  end

  @spec update_owner(Owner.t(), map()) :: {:ok, Owner.t()} | {:error, Changeset.t()}
  def update_owner(%Owner{} = owner, attrs) do
    owner
    |> Owner.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Archives an owner and all of their pets, and cancels those pets' open
  appointments, in one transaction. Completed appointments are kept.
  """
  @spec delete_owner(Owner.t()) :: {:ok, Owner.t()} | {:error, Changeset.t()}
  def delete_owner(%Owner{} = owner) do
    # Dialyzer flags this pipeline (call_without_opaque) because of an
    # Ecto.Multi.new/0 + OTP 29 false positive; see .dialyzer_ignore.exs.
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
