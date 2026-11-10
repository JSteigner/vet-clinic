defmodule VetClinicWeb.Schema do
  @moduledoc """
  The GraphQL schema. Types, queries, mutations and subscriptions live in
  the per-context type modules under `VetClinicWeb.Schema`; this module
  pulls them together and sets up Dataloader and the mutation error
  middleware.
  """

  use Absinthe.Schema

  alias Absinthe.Middleware

  alias VetClinic.Clinic
  alias VetClinicWeb.Schema.Middleware.ChangesetErrors

  import_types Absinthe.Type.Custom
  import_types VetClinicWeb.Schema.{AppointmentTypes, OwnerTypes, PetTypes, VetTypes}

  query do
    import_fields :owner_queries
    import_fields :pet_queries
    import_fields :vet_queries
    import_fields :appointment_queries
  end

  mutation do
    import_fields :owner_mutations
    import_fields :pet_mutations
    import_fields :vet_mutations
    import_fields :appointment_mutations
  end

  subscription do
    import_fields :appointment_subscriptions
  end

  @impl true
  @spec context(map()) :: map()
  def context(context) do
    loader = Dataloader.add_source(Dataloader.new(), Clinic, Clinic.datasource())

    Map.put(context, :loader, loader)
  end

  @impl true
  @spec plugins() :: [atom()]
  def plugins do
    [Middleware.Dataloader | Absinthe.Plugin.defaults()]
  end

  # Mutations return changeset errors; turn them into one error per field.
  @impl true
  @spec middleware([Middleware.spec()], Absinthe.Type.Field.t(), Absinthe.Type.Object.t()) ::
          [Middleware.spec()]
  def middleware(middleware, _field, %{identifier: :mutation}) do
    middleware ++ [ChangesetErrors]
  end

  def middleware(middleware, _field, _object), do: middleware
end
