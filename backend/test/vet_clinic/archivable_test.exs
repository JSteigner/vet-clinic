defmodule VetClinic.ArchivableTest do
  use VetClinic.DataCase, async: true

  alias VetClinic.Archivable
  alias VetClinic.Owners
  alias VetClinic.Owners.Owner

  setup do
    active = owner_fixture()
    {:ok, archived} = Owners.delete_owner(owner_fixture())

    %{active: active, archived: archived}
  end

  test "active/1 keeps only active records", %{active: active} do
    assert ids(Archivable.active(Owner)) == MapSet.new([active.id])
  end

  test "archived/1 keeps only archived records", %{archived: archived} do
    assert ids(Archivable.archived(Owner)) == MapSet.new([archived.id])
  end

  test "maybe_active/2 includes archived records only when asked", context do
    assert ids(Archivable.maybe_active(Owner, nil)) == MapSet.new([context.active.id])

    assert ids(Archivable.maybe_active(Owner, true)) ==
             MapSet.new([context.active.id, context.archived.id])
  end

  test "archived_or_active/3 switches between the two", context do
    assert ids(Archivable.archived_or_active(Owner, true)) == MapSet.new([context.archived.id])
    assert ids(Archivable.archived_or_active(Owner, false)) == MapSet.new([context.active.id])
  end

  test "archived_or_active/3 includes archived records when asked, unless only archived",
       context do
    assert ids(Archivable.archived_or_active(Owner, false, true)) ==
             MapSet.new([context.active.id, context.archived.id])

    assert ids(Archivable.archived_or_active(Owner, true, true)) ==
             MapSet.new([context.archived.id])
  end

  defp ids(query) do
    query
    |> Repo.all()
    |> MapSet.new(& &1.id)
  end
end
