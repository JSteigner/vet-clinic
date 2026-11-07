defmodule VetClinic.Clinic.Appointment do
  @moduledoc """
  A booked visit for a pet with a vet. The owner is reached through the pet.

  Status starts as `:scheduled` and moves to `:checked_in` and `:completed`,
  or to `:cancelled`. `starts_at` is stored in UTC.
  """

  use Ecto.Schema

  import Ecto.Changeset

  @required_fields ~w[starts_at reason pet_id vet_id]a
  @optional_fields ~w[]a
  @fields @required_fields ++ @optional_fields

  @statuses ~w[scheduled checked_in completed cancelled]a

  schema "appointments" do
    field :starts_at, :utc_datetime
    field :reason, :string
    field :status, Ecto.Enum, values: @statuses, default: :scheduled

    belongs_to :pet, VetClinic.Clinic.Pet
    belongs_to :vet, VetClinic.Clinic.Vet

    timestamps(type: :utc_datetime)
  end

  @doc "Changeset for booking a new appointment. Must be in the future."
  def create_changeset(appointment, attrs) do
    appointment
    |> cast(attrs, @fields)
    |> validate_required(@required_fields)
    |> validate_length(:reason, max: 255)
    |> validate_future(:starts_at)
    |> assoc_constraint(:pet)
    |> assoc_constraint(:vet)
  end

  @doc "Changeset for moving an appointment through its lifecycle."
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
