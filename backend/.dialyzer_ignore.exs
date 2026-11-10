# Dialyzer warnings that are known false positives. `list_unused_filters` in
# mix.exs reports any entry here that no longer matches a warning, so remove
# entries once the underlying issue is fixed.
[
  # Ecto.Multi.new/0 bakes its internal MapSet into the struct at compile
  # time, so OTP 29's Dialyzer treats a fresh Multi as violating the opaque
  # MapSet.t() inside Ecto.Multi.t(). It flags any call that receives a new
  # Multi, even Ecto's own Multi.update/3. The code runs correctly.
  # Affects Owners.delete_owner/1 and Pets.delete_pet/1.
  {"lib/vet_clinic/owners.ex", :call_without_opaque},
  {"lib/vet_clinic/pets.ex", :call_without_opaque}
]
