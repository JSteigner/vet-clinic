{:ok, _} = Application.ensure_all_started(:faker)

ExUnit.start()
Ecto.Adapters.SQL.Sandbox.mode(VetClinic.Repo, :manual)
