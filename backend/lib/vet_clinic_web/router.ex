defmodule VetClinicWeb.Router do
  use VetClinicWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", VetClinicWeb do
    pipe_through :api
  end
end
