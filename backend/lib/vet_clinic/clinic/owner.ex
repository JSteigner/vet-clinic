defmodule VetClinic.Clinic.Owner do
  @moduledoc """
  A pet owner: a client of the clinic. Email addresses are unique.
  """

  use Ecto.Schema

  import Ecto.Changeset

  @required_fields ~w[name email]a
  @optional_fields ~w[phone]a
  @fields @required_fields ++ @optional_fields

  schema "owners" do
    field :name, :string
    field :email, :string
    field :phone, :string

    has_many :pets, VetClinic.Clinic.Pet

    timestamps(type: :utc_datetime)
  end

  def changeset(owner, attrs) do
    owner
    |> cast(attrs, @fields)
    |> validate_required(@required_fields)
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "must be a valid email")
    |> unique_constraint(:email)
  end
end
