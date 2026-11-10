defmodule VetClinic.Pets.Pet do
  @moduledoc """
  A patient of the clinic. Every pet belongs to an owner and can have
  many appointments.
  """

  use Ecto.Schema

  import Ecto.Changeset

  @required_fields ~w[name species owner_id]a
  @optional_fields ~w[breed birth_date]a
  @fields @required_fields ++ @optional_fields

  @species ~w[dog cat bird rabbit other]a

  schema "pets" do
    field :name, :string
    field :species, Ecto.Enum, values: @species
    field :breed, :string
    field :birth_date, :date

    belongs_to :owner, VetClinic.Owners.Owner
    has_many :appointments, VetClinic.Appointments.Appointment

    timestamps(type: :utc_datetime)
  end

  def changeset(pet, attrs) do
    pet
    |> cast(attrs, @fields)
    |> validate_required(@required_fields)
    |> assoc_constraint(:owner)
  end
end
