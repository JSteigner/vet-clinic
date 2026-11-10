defmodule VetClinic.ClinicTest do
  @moduledoc """
  Clinic only delegates to the contexts, whose behavior has its own tests.
  These tests check that every public function is wired up.
  """

  use VetClinic.DataCase, async: true

  alias VetClinic.Clinic

  test "datasource/0 returns a Dataloader source" do
    assert %Dataloader.Ecto{} = Clinic.datasource()
  end

  test "owner functions delegate to Owners" do
    owner = owner_fixture()
    pet = pet_fixture(%{owner_id: owner.id})

    assert [%{id: owner_id}] = Clinic.list_owners()
    assert owner_id == owner.id
    assert Clinic.get_owner(owner.id).id == owner.id
    assert Clinic.get_pet_owner(pet.id).id == owner.id

    assert {:ok, created} = Clinic.create_owner(%{name: Person.name(), email: unique_email()})
    assert {:ok, _} = Clinic.update_owner(created, %{phone: Phone.phone()})
    assert {:ok, %{archived_at: %DateTime{}}} = Clinic.delete_owner(created)
  end

  test "pet functions delegate to Pets" do
    owner = owner_fixture()
    pet = pet_fixture(%{owner_id: owner.id})

    assert Clinic.get_pet(pet.id).id == pet.id
    assert [%{id: pet_id}] = Clinic.list_owner_pets(owner.id)
    assert pet_id == pet.id

    assert {:ok, created} =
             Clinic.create_pet(%{name: Cat.name(), species: :cat, owner_id: owner.id})

    assert {:ok, _} = Clinic.update_pet(created, %{breed: Cat.breed()})
    assert {:ok, %{archived_at: %DateTime{}}} = Clinic.delete_pet(created)
  end

  test "vet functions delegate to Vets" do
    vet = vet_fixture()

    assert [%{id: vet_id}] = Clinic.list_vets()
    assert vet_id == vet.id
    assert Clinic.get_vet(vet.id).id == vet.id

    assert {:ok, created} = Clinic.create_vet(%{name: Person.name(), email: unique_email()})
    assert {:ok, _} = Clinic.update_vet(created, %{name: Person.name()})
    assert {:ok, _} = Clinic.delete_vet(created)
  end

  test "appointment functions delegate to Appointments" do
    appointment = appointment_fixture()
    date = Clinic.today()
    tomorrow = Date.add(date, 1)

    assert is_binary(Clinic.clinic_time_zone())
    assert is_list(Clinic.list_daily_clinic_appointments(tomorrow))
    assert [%{id: id}] = Clinic.list_vet_appointments(appointment.vet_id)
    assert id == appointment.id
    assert [%{id: ^id}] = Clinic.list_pet_appointments(appointment.pet_id, status: :scheduled)
    assert Clinic.get_appointment(appointment.id).id == appointment.id

    assert {:ok, _} = Clinic.update_appointment(appointment, %{reason: Lorem.sentence()})

    assert {:ok, %{status: :checked_in}} =
             Clinic.update_appointment_status(appointment, :checked_in)

    assert {:ok, _} = Clinic.delete_appointment(appointment)

    assert {:ok, _} =
             Clinic.create_appointment(%{
               pet_id: pet_fixture().id,
               vet_id: vet_fixture().id,
               starts_at: from_now(1, :day),
               reason: Lorem.sentence()
             })
  end
end
