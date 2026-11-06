defmodule VetClinic.Clinic.Pet do
  use Ecto.Schema
  import Ecto.Changeset

  schema "pets" do
    field :name, :string
    field :species, Ecto.Enum, values: [:dog, :cat, :bird, :rabbit, :other]
    field :breed, :string
    field :birth_date, :date

    belongs_to :owner, VetClinic.Clinic.Owner
    has_many :appointments, VetClinic.Clinic.Appointment

    timestamps(type: :utc_datetime)
  end

  def changeset(pet, attrs) do
    pet
    |> cast(attrs, [:name, :species, :breed, :birth_date, :owner_id])
    |> validate_required([:name, :species, :owner_id])
    |> assoc_constraint(:owner)
  end
end
