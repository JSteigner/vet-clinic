defmodule VetClinicWeb.Router do
  @moduledoc """
  Routes for the GraphQL API. Queries and mutations are served at
  `/api/graphql`; subscriptions go over the `/socket` websocket. In dev,
  the GraphiQL explorer is at `/api/graphiql`.
  """

  use VetClinicWeb, :router

  alias VetClinicWeb.Schema

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api" do
    pipe_through :api

    forward "/graphql", Absinthe.Plug, schema: Schema
  end

  # GraphiQL serves an HTML page, so it skips the JSON-only :api pipeline.
  if Application.compile_env(:vet_clinic, :dev_routes) do
    scope "/api" do
      forward "/graphiql", Absinthe.Plug.GraphiQL,
        schema: Schema,
        socket: VetClinicWeb.UserSocket
    end
  end
end
