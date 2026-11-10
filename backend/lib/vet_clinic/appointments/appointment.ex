defmodule VetClinic.Appointments.Appointment do
  @moduledoc """
  A booked visit for a pet with a vet. The owner is reached through the pet.

  Status starts as `:scheduled` and moves to `:checked_in` and `:completed`,
  or to `:cancelled`. `starts_at` is stored in UTC.
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias Ecto.Association.NotLoaded
  alias Ecto.Changeset
  alias VetClinic.Pets.Pet
  alias VetClinic.Vets.Vet

  @required_fields ~w[starts_at reason pet_id vet_id]a
  @optional_fields ~w[]a
  @fields @required_fields ++ @optional_fields

  @updatable_fields ~w[starts_at reason vet_id]a

  @statuses ~w[scheduled checked_in completed cancelled]a

  @type status :: :scheduled | :checked_in | :completed | :cancelled

  @type t :: %__MODULE__{
          __meta__: Ecto.Schema.Metadata.t(),
          id: integer() | nil,
          starts_at: DateTime.t() | nil,
          reason: String.t() | nil,
          status: status(),
          pet_id: integer() | nil,
          pet: Pet.t() | NotLoaded.t(),
          vet_id: integer() | nil,
          vet: Vet.t() | NotLoaded.t(),
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  schema "appointments" do
    field :starts_at, :utc_datetime
    field :reason, :string
    field :status, Ecto.Enum, values: @statuses, default: :scheduled

    belongs_to :pet, Pet
    belongs_to :vet, Vet

    timestamps(type: :utc_datetime)
  end

  @doc "Changeset for booking a new appointment. Must be in the future."
  @spec create_changeset(t(), map()) :: Changeset.t()
  def create_changeset(appointment, attrs) do
    appointment
    |> cast(attrs, @fields)
    |> validate_required(@required_fields)
    |> validate_length(:reason, max: 255)
    |> validate_future(:starts_at)
    |> assoc_constraint(:pet)
    |> assoc_constraint(:vet)
  end

  @doc """
  Changeset for rescheduling or changing the reason or vet. The pet can't
  change, and a new time must be in the future.
  """
  @spec update_changeset(t(), map()) :: Changeset.t()
  def update_changeset(appointment, attrs) do
    appointment
    |> cast(attrs, @updatable_fields)
    |> validate_required(@updatable_fields)
    |> validate_length(:reason, max: 255)
    |> validate_future(:starts_at)
    |> assoc_constraint(:vet)
  end

  @doc "Changeset for moving an appointment through its lifecycle."
  @spec status_changeset(t(), map()) :: Changeset.t()
  def status_changeset(appointment, attrs) do
    appointment
    |> cast(attrs, [:status])
    |> validate_required([:status])
  end

  defp validate_future(changeset, field) do
    validate_change(changeset, field, fn ^field, value ->
      if DateTime.compare(value, DateTime.utc_now()) == :gt,
        do: [],
        else: [{field, "must be in the future"}]
    end)
  end
end
