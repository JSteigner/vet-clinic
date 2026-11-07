# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# It wipes existing clinic data first, so it can be re-run safely in dev.
# Appointment times are relative to "today" in the clinic's time zone.

alias VetClinic.Clinic
alias VetClinic.Clinic.{Appointment, Owner, Pet}
alias VetClinic.Repo

Repo.delete_all(Appointment)
Repo.delete_all(Pet)
Repo.delete_all(Owner)

owners =
  for attrs <- [
        %{name: "Maria Lopez", email: "maria.lopez@example.com", phone: "555-0101"},
        %{name: "James Carter", email: "james.carter@example.com", phone: "555-0102"},
        %{name: "Priya Shah", email: "priya.shah@example.com", phone: "555-0103"},
        %{name: "Tom Becker", email: "tom.becker@example.com", phone: "555-0104"}
      ],
      into: %{} do
    {:ok, owner} = Clinic.create_owner(attrs)
    {owner.name, owner}
  end

pets =
  for {owner_name, attrs} <- [
        {"Maria Lopez", %{name: "Biscuit", species: :dog, breed: "Golden Retriever", birth_date: ~D[2019-04-12]}},
        {"Maria Lopez", %{name: "Mochi", species: :cat, breed: "Siamese", birth_date: ~D[2021-08-30]}},
        {"James Carter", %{name: "Rex", species: :dog, breed: "German Shepherd", birth_date: ~D[2017-01-05]}},
        {"James Carter", %{name: "Kiwi", species: :bird, breed: "Budgerigar", birth_date: ~D[2023-03-18]}},
        {"Priya Shah", %{name: "Luna", species: :cat, breed: "Maine Coon", birth_date: ~D[2020-11-02]}},
        {"Priya Shah", %{name: "Clover", species: :rabbit, breed: "Holland Lop", birth_date: ~D[2022-06-21]}},
        {"Tom Becker", %{name: "Duke", species: :dog, breed: "Beagle", birth_date: ~D[2015-09-14]}},
        {"Tom Becker", %{name: "Pickle", species: :other, breed: "Leopard Gecko", birth_date: ~D[2021-02-07]}}
      ],
      into: %{} do
    owner = Map.fetch!(owners, owner_name)
    {:ok, pet} = Clinic.create_pet(Map.put(attrs, :owner_id, owner.id))
    {pet.name, pet}
  end

time_zone = Clinic.clinic_time_zone()
today = Clinic.today()

at = fn days_from_today, time ->
  today
  |> Date.add(days_from_today)
  |> DateTime.new!(time, time_zone)
  |> DateTime.shift_zone!("Etc/UTC")
end

appointments = [
  {"Biscuit", at.(0, ~T[08:30:00]), "Annual checkup and vaccines", :completed},
  {"Luna", at.(0, ~T[09:30:00]), "Dental cleaning", :checked_in},
  {"Rex", at.(0, ~T[11:00:00]), "Limping on back left leg", :scheduled},
  {"Kiwi", at.(0, ~T[13:30:00]), "Beak and nail trim", :scheduled},
  {"Duke", at.(0, ~T[15:00:00]), "Senior wellness bloodwork", :scheduled},
  {"Mochi", at.(0, ~T[16:00:00]), "Skin rash follow-up", :cancelled},
  {"Clover", at.(1, ~T[10:00:00]), "Spay consultation", :scheduled},
  {"Pickle", at.(1, ~T[14:00:00]), "Shedding problems", :scheduled},
  {"Biscuit", at.(2, ~T[09:00:00]), "Ear infection recheck", :scheduled}
]

for {pet_name, starts_at, reason, status} <- appointments do
  Repo.insert!(%Appointment{
    pet_id: Map.fetch!(pets, pet_name).id,
    starts_at: starts_at,
    reason: reason,
    status: status
  })
end

IO.puts("Seeded #{map_size(owners)} owners, #{map_size(pets)} pets, #{length(appointments)} appointments.")
