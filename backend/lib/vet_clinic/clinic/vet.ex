defmodule VetClinic.Clinic.Vet do
  @moduledoc """
  A veterinarian at the clinic. Every appointment is booked with a vet.
  Email addresses are unique.
  """

  use Ecto.Schema

  import Ecto.Changeset

  @required_fields ~w[name email]a
  @optional_fields ~w[]a
  @fields @required_fields ++ @optional_fields

  schema "vets" do
    field :name, :string
    field :email, :string

    has_many :appointments, VetClinic.Clinic.Appointment

    timestamps(type: :utc_datetime)
  end

  def changeset(vet, attrs) do
    vet
    |> cast(attrs, @fields)
    |> validate_required(@required_fields)
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "must be a valid email")
    |> unique_constraint(:email)
  end
end
