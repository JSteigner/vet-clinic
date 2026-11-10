defmodule VetClinic.Pets do
  @moduledoc """
  Pets: the clinic's patients. Called through `VetClinic.Clinic`.

  Pets are soft-deleted (archived). Lookups skip archived pets, but their
  appointments keep pointing at them, so history stays readable.
  """

  import Ecto.Query, warn: false

  alias Ecto.Changeset
  alias Ecto.Multi
  alias VetClinic.Appointments
  alias VetClinic.Pets.Pet
  alias VetClinic.Repo

  @spec get_pet(integer()) :: Pet.t() | nil
  def get_pet(id) do
    Pet
    |> active()
    |> Repo.get(id)
  end

  @doc """
  All of an owner's active pets, ordered by name.
  """
  @spec list_owner_pets(integer()) :: [Pet.t()]
  def list_owner_pets(owner_id) do
    Pet
    |> active()
    |> where([p], p.owner_id == ^owner_id)
    |> order_by(:name)
    |> Repo.all()
  end

  @spec create_pet(map()) :: {:ok, Pet.t()} | {:error, Changeset.t()}
  def create_pet(attrs) do
    %Pet{}
    |> Pet.changeset(attrs)
    |> Repo.insert()
  end

  @spec update_pet(Pet.t(), map()) :: {:ok, Pet.t()} | {:error, Changeset.t()}
  def update_pet(%Pet{} = pet, attrs) do
    pet
    |> Pet.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Archives a pet and cancels its open (scheduled or checked-in)
  appointments, in one transaction. Completed appointments are kept.
  """
  @spec delete_pet(Pet.t()) :: {:ok, Pet.t()} | {:error, Changeset.t()}
  def delete_pet(%Pet{} = pet) do
    pet_ids =
      Pet
      |> where([p], p.id == ^pet.id)
      |> select([p], p.id)

    # Dialyzer flags this pipeline (call_without_opaque) because of an
    # Ecto.Multi.new/0 + OTP 29 false positive; see .dialyzer_ignore.exs.
    Multi.new()
    |> Appointments.cancel_open_appointments(pet_ids)
    |> Multi.update(:pet, Pet.archive_changeset(pet))
    |> Repo.transact()
    |> case do
      {:ok, %{pet: pet}} -> {:ok, pet}
      {:error, _step, changeset, _changes} -> {:error, changeset}
    end
  end

  @doc """
  Adds a step to `multi` that archives all of an owner's active pets.
  """
  @spec archive_owner_pets(Multi.t(), integer()) :: Multi.t()
  def archive_owner_pets(multi, owner_id) do
    now = DateTime.truncate(DateTime.utc_now(), :second)

    query =
      Pet
      |> active()
      |> where([p], p.owner_id == ^owner_id)

    Multi.update_all(multi, :archived_pets, query, set: [archived_at: now, updated_at: now])
  end

  @doc """
  A query selecting the IDs of all of an owner's pets, for use as a subquery.
  """
  @spec owner_pet_ids_query(integer()) :: Ecto.Query.t()
  def owner_pet_ids_query(owner_id) do
    Pet
    |> where([p], p.owner_id == ^owner_id)
    |> select([p], p.id)
  end

  defp active(query), do: where(query, [p], is_nil(p.archived_at))
end
