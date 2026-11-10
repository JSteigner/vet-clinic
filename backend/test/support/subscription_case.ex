defmodule VetClinicWeb.SubscriptionCase do
  @moduledoc """
  Test case for GraphQL subscriptions. Connects a `VetClinicWeb.UserSocket`
  and joins the Absinthe channel, so tests can `push_doc/3` subscriptions
  and mutations and `assert_push "subscription:data"`.

  Subscription results are resolved outside the test process, so these
  tests can't run async (the sandbox has to be shared).
  """

  use ExUnit.CaseTemplate

  import Phoenix.ChannelTest

  alias Absinthe.Phoenix.SubscriptionTest

  @endpoint VetClinicWeb.Endpoint

  using do
    quote do
      use Absinthe.Phoenix.SubscriptionTest, schema: VetClinicWeb.Schema

      import Phoenix.ChannelTest
      import VetClinic.Fixtures

      @endpoint VetClinicWeb.Endpoint
    end
  end

  setup tags do
    VetClinic.DataCase.setup_sandbox(tags)

    {:ok, socket} = connect(VetClinicWeb.UserSocket, %{})
    {:ok, socket} = SubscriptionTest.join_absinthe(socket)

    {:ok, socket: socket}
  end
end
