defmodule VetClinicWeb.UserSocket do
  @moduledoc """
  Websocket for GraphQL subscriptions, mounted at `/socket` in the
  endpoint. Clients connect here to receive `appointmentChanged` pushes.
  """

  use Phoenix.Socket
  use Absinthe.Phoenix.Socket, schema: VetClinicWeb.Schema

  @impl true
  @spec connect(map(), Phoenix.Socket.t(), map()) :: {:ok, Phoenix.Socket.t()}
  def connect(_params, socket, _connect_info) do
    {:ok, socket}
  end

  # Anonymous sockets: there's no auth yet, so no user to name them by.
  @impl true
  @spec id(Phoenix.Socket.t()) :: nil
  def id(_socket), do: nil
end
