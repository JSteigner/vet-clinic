defmodule VetClinic.Repo.Migrations.AddVets do
  use Ecto.Migration

  def change do
    create table(:vets) do
      add :name, :string, null: false
      add :email, :string, null: false

      timestamps(type: :utc_datetime)
    end

    create unique_index(:vets, [:email])

    alter table(:appointments) do
      add :vet_id, references(:vets, on_delete: :restrict), null: false
    end

    create index(:appointments, [:vet_id])
  end
end
