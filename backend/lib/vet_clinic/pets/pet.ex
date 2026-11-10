defmodule VetClinic.Pets.Pet do
  @moduledoc """
  A patient of the clinic. Every pet belongs to an owner and can have
  many appointments.
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias Ecto.Association.NotLoaded
  alias Ecto.Changeset
  alias VetClinic.Appointments.Appointment
  alias VetClinic.Owners.Owner

  @required_fields ~w[name species owner_id]a
  @optional_fields ~w[breed birth_date]a
  @fields @required_fields ++ @optional_fields

  @species ~w[dog cat bird rabbit other]a

  @type species :: :dog | :cat | :bird | :rabbit | :other

  @type t :: %__MODULE__{
          __meta__: Ecto.Schema.Metadata.t(),
          id: integer() | nil,
          name: String.t() | nil,
          species: species() | nil,
          breed: String.t() | nil,
          birth_date: Date.t() | nil,
          archived_at: DateTime.t() | nil,
          owner_id: integer() | nil,
          owner: Owner.t() | NotLoaded.t(),
          appointments: [Appointment.t()] | NotLoaded.t(),
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  schema "pets" do
    field :name, :string
    field :species, Ecto.Enum, values: @species
    field :breed, :string
    field :birth_date, :date
    field :archived_at, :utc_datetime

    belongs_to :owner, Owner
    has_many :appointments, Appointment

    timestamps(type: :utc_datetime)
  end

  @spec changeset(t(), map()) :: Changeset.t()
  def changeset(pet, attrs) do
    pet
    |> cast(attrs, @fields)
    |> validate_required(@required_fields)
    |> assoc_constraint(:owner)
  end

  @doc "Marks the pet as archived (soft-deleted)."
  @spec archive_changeset(t()) :: Changeset.t()
  def archive_changeset(pet) do
    change(pet, archived_at: DateTime.truncate(DateTime.utc_now(), :second))
  end
end
