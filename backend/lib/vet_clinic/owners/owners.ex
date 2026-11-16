defmodule VetClinic.Owners do
  @moduledoc """
  Owners: the clinic's clients. Called through `VetClinic.Clinic`.

  Owners are soft-deleted (archived). Lookups skip archived owners unless
  asked to include them, and archived owners can be restored.
  """

  import Ecto.Query, warn: false
  import VetClinic.Archivable

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

  @doc """
  An active owner by ID, or `nil`. Pass `include_archived: true` to also
  find archived owners.
  """
  @spec get_owner(integer(), include_archived: boolean()) :: Owner.t() | nil
  def get_owner(id, opts \\ []) do
    Owner
    |> maybe_active(opts[:include_archived])
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
    archived_at = DateTime.truncate(DateTime.utc_now(), :second)

    # Dialyzer flags this pipeline (call_without_opaque) because of an
    # Ecto.Multi.new/0 + OTP 29 false positive; see .dialyzer_ignore.exs.
    Multi.new()
    |> Appointments.cancel_open_appointments(Pets.owner_pet_ids_query(owner.id))
    |> Pets.archive_owner_pets(owner.id, archived_at)
    |> Multi.update(:owner, Owner.archive_changeset(owner, archived_at))
    |> Repo.transact()
    |> case do
      {:ok, %{owner: owner}} -> {:ok, owner}
      {:error, _step, changeset, _changes} -> {:error, changeset}
    end
  end

  @doc """
  Restores an archived owner, and the pets archived with them (same archive
  time), in one transaction. Pets archived on their own earlier stay archived,
  and appointments cancelled by the archive stay cancelled.
  """
  @spec restore_owner(Owner.t()) :: {:ok, Owner.t()} | {:error, Changeset.t()}
  def restore_owner(%Owner{} = owner) do
    Multi.new()
    |> Pets.restore_owner_pets(owner.id, owner.archived_at)
    |> Multi.update(:owner, Owner.restore_changeset(owner))
    |> Repo.transact()
    |> case do
      {:ok, %{owner: owner}} -> {:ok, owner}
      {:error, _step, changeset, _changes} -> {:error, changeset}
    end
  end
end
