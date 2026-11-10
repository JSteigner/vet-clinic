defmodule VetClinic.Owners.Owner do
  @moduledoc """
  A pet owner: a client of the clinic. Email addresses are unique.
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias Ecto.Changeset
  alias VetClinic.Pets.Pet

  @required_fields ~w[name email]a
  @optional_fields ~w[phone]a
  @fields @required_fields ++ @optional_fields

  @type t :: %__MODULE__{
          __meta__: Ecto.Schema.Metadata.t(),
          id: integer() | nil,
          name: String.t() | nil,
          email: String.t() | nil,
          phone: String.t() | nil,
          archived_at: DateTime.t() | nil,
          pets: [Pet.t()] | Ecto.Association.NotLoaded.t(),
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  schema "owners" do
    field :name, :string
    field :email, :string
    field :phone, :string
    field :archived_at, :utc_datetime

    has_many :pets, Pet

    timestamps(type: :utc_datetime)
  end

  @spec changeset(t(), map()) :: Changeset.t()
  def changeset(owner, attrs) do
    owner
    |> cast(attrs, @fields)
    |> validate_required(@required_fields)
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "must be a valid email")
    |> unique_constraint(:email)
  end

  @doc "Marks the owner as archived (soft-deleted)."
  @spec archive_changeset(t()) :: Changeset.t()
  def archive_changeset(owner) do
    change(owner, archived_at: DateTime.truncate(DateTime.utc_now(), :second))
  end
end
