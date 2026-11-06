defmodule VetClinic.Repo.Migrations.CreateClinicTables do
  use Ecto.Migration

  def change do
    create table(:owners) do
      add :name, :string, null: false
      add :email, :string, null: false
      add :phone, :string

      timestamps(type: :utc_datetime)
    end

    create unique_index(:owners, [:email])

    create table(:pets) do
      add :name, :string, null: false
      add :species, :string, null: false
      add :breed, :string
      add :birth_date, :date
      add :owner_id, references(:owners, on_delete: :delete_all), null: false

      timestamps(type: :utc_datetime)
    end

    create index(:pets, [:owner_id])

    create table(:appointments) do
      add :starts_at, :utc_datetime, null: false
      add :reason, :string, null: false
      add :status, :string, null: false, default: "scheduled"
      add :pet_id, references(:pets, on_delete: :delete_all), null: false

      timestamps(type: :utc_datetime)
    end

    create index(:appointments, [:pet_id])
    create index(:appointments, [:starts_at])
  end
end
