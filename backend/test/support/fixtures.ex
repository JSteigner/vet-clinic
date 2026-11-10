defmodule VetClinic.Fixtures do
  @moduledoc """
  Test helpers for creating owners, pets, vets and appointments with
  Faker-generated data.

  Each fixture accepts attributes that override its defaults, and creates
  any parent records it needs (e.g. `pet_fixture/1` creates an owner).
  """

  alias Faker.Cat
  alias Faker.Person
  alias Faker.Phone.EnUs, as: Phone

  alias VetClinic.Appointments.Appointment
  alias VetClinic.Clinic
  alias VetClinic.Repo

  @doc """
  A Faker email made unique with a per-run counter, since emails have a
  unique index and random ones could collide.
  """
  def unique_email do
    "#{System.unique_integer([:positive])}.#{Faker.Internet.email()}"
  end

  def owner_fixture(attrs \\ %{}) do
    {:ok, owner} =
      attrs
      |> Enum.into(%{
        name: Person.name(),
        email: unique_email(),
        phone: Phone.phone()
      })
      |> Clinic.create_owner()

    owner
  end

  def vet_fixture(attrs \\ %{}) do
    {:ok, vet} =
      attrs
      |> Enum.into(%{name: "Dr. #{Person.name()}", email: unique_email()})
      |> Clinic.create_vet()

    vet
  end

  def pet_fixture(attrs \\ %{}) do
    {:ok, pet} =
      attrs
      |> Map.new()
      |> Map.put_new_lazy(:owner_id, fn -> owner_fixture().id end)
      |> Enum.into(%{name: Cat.name(), species: :cat, breed: Cat.breed()})
      |> Clinic.create_pet()

    pet
  end

  @doc """
  Books an appointment through `Clinic.create_appointment/1`, so it starts
  as `:scheduled` and must be in the future (tomorrow by default).
  """
  def appointment_fixture(attrs \\ %{}) do
    {:ok, appointment} =
      attrs
      |> appointment_attrs(from_now(1, :day))
      |> Clinic.create_appointment()

    appointment
  end

  @doc """
  Inserts an appointment directly, bypassing booking validation, so tests
  can create history: past times and any status (`:completed` by default).
  """
  def past_appointment_fixture(attrs \\ %{}) do
    attrs = appointment_attrs(attrs, from_now(-1, :day))

    Repo.insert!(%Appointment{
      pet_id: attrs.pet_id,
      vet_id: attrs.vet_id,
      starts_at: attrs.starts_at,
      reason: attrs.reason,
      status: Map.get(attrs, :status, :completed)
    })
  end

  @doc "A UTC time `amount` units from now (negative for the past), truncated to the second."
  def from_now(amount, unit) do
    DateTime.utc_now()
    |> DateTime.add(amount, unit)
    |> DateTime.truncate(:second)
  end

  defp appointment_attrs(attrs, default_starts_at) do
    attrs
    |> Map.new()
    |> Map.put_new_lazy(:pet_id, fn -> pet_fixture().id end)
    |> Map.put_new_lazy(:vet_id, fn -> vet_fixture().id end)
    |> Enum.into(%{starts_at: default_starts_at, reason: Faker.Lorem.sentence()})
  end
end
