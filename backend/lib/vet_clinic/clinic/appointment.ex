defmodule VetClinic.Clinic.Appointment do
  use Ecto.Schema
  import Ecto.Changeset

  schema "appointments" do
    field :starts_at, :utc_datetime
    field :reason, :string

    field :status, Ecto.Enum,
      values: [:scheduled, :checked_in, :completed, :cancelled],
      default: :scheduled

    belongs_to :pet, VetClinic.Clinic.Pet

    timestamps(type: :utc_datetime)
  end

  @doc "Changeset for booking a new appointment. Must be in the future."
  def create_changeset(appointment, attrs) do
    appointment
    |> cast(attrs, [:starts_at, :reason, :pet_id])
    |> validate_required([:starts_at, :reason, :pet_id])
    |> validate_length(:reason, max: 255)
    |> validate_future(:starts_at)
    |> assoc_constraint(:pet)
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
