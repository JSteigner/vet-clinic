defmodule VetClinic.Clinic.Owner do
  use Ecto.Schema
  import Ecto.Changeset

  schema "owners" do
    field :name, :string
    field :email, :string
    field :phone, :string

    has_many :pets, VetClinic.Clinic.Pet

    timestamps(type: :utc_datetime)
  end

  def changeset(owner, attrs) do
    owner
    |> cast(attrs, [:name, :email, :phone])
    |> validate_required([:name, :email])
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "must be a valid email")
    |> unique_constraint(:email)
  end
end
