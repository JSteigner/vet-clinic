defmodule VetClinic.Repo.Migrations.AddArchivedAt do
  use Ecto.Migration

  # Owners and pets are soft-deleted (archived) so appointment history is
  # never lost. The foreign keys switch from :delete_all to :restrict so the
  # database refuses any hard delete that would cascade into that history.
  # A purge job can still delete archived records bottom-up (appointments,
  # then pets, then owners).
  #
  # Reversible: `add` is undone automatically, and `modify ... from:` gives
  # Ecto the previous foreign key to restore on rollback.
  def change do
    alter table(:owners) do
      add :archived_at, :utc_datetime
    end

    alter table(:pets) do
      add :archived_at, :utc_datetime

      modify :owner_id, references(:owners, on_delete: :restrict),
        from: references(:owners, on_delete: :delete_all)
    end

    alter table(:appointments) do
      modify :pet_id, references(:pets, on_delete: :restrict),
        from: references(:pets, on_delete: :delete_all)
    end
  end
end
