defmodule VetClinic.Vets.Vet do
  @moduledoc """
  A veterinarian at the clinic. Every appointment is booked with a vet.
  Email addresses are unique.
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias Ecto.Changeset

  alias VetClinic.Appointments.Appointment

  @required_fields ~w[name email]a
  @optional_fields ~w[]a
  @fields @required_fields ++ @optional_fields

  @type t :: %__MODULE__{
          __meta__: Ecto.Schema.Metadata.t(),
          id: integer() | nil,
          name: String.t() | nil,
          email: String.t() | nil,
          appointments: [Appointment.t()] | Ecto.Association.NotLoaded.t(),
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  schema "vets" do
    field :name, :string
    field :email, :string

    has_many :appointments, Appointment

    timestamps(type: :utc_datetime)
  end

  @spec changeset(t(), map()) :: Changeset.t()
  def changeset(vet, attrs) do
    vet
    |> cast(attrs, @fields)
    |> validate_required(@required_fields)
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "must be a valid email")
    |> unique_constraint(:email)
  end

  @doc """
  Changeset for deleting a vet. Turns the database's refusal to delete a vet
  who still has appointments into a changeset error.
  """
  @spec delete_changeset(t()) :: Changeset.t()
  def delete_changeset(vet) do
    vet
    |> change()
    |> no_assoc_constraint(:appointments, message: "vet still has appointments")
  end
end
