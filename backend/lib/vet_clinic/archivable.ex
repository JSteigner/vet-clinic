defmodule VetClinic.Archivable do
  @moduledoc """
  Query helpers for soft-deleted (archived) schemas: anything with an
  `archived_at` column, such as owners and pets. They filter the query's
  first binding, so one copy serves every such schema. Import into a context.
  """

  import Ecto.Query, warn: false

  @doc "Only records that aren't archived."
  @spec active(Ecto.Queryable.t()) :: Ecto.Query.t()
  def active(query), do: where(query, [r], is_nil(r.archived_at))

  @doc "Only archived records."
  @spec archived(Ecto.Queryable.t()) :: Ecto.Query.t()
  def archived(query), do: where(query, [r], not is_nil(r.archived_at))

  @doc "Only active records, unless `include_archived` is true."
  @spec maybe_active(Ecto.Queryable.t(), boolean() | nil) :: Ecto.Queryable.t()
  def maybe_active(query, true = _include_archived), do: query
  def maybe_active(query, _include_archived), do: active(query)

  @doc "Only archived records when `archived` is true, otherwise only active ones."
  @spec archived_or_active(Ecto.Queryable.t(), boolean() | nil) :: Ecto.Query.t()
  def archived_or_active(query, true = _archived), do: archived(query)
  def archived_or_active(query, _archived), do: active(query)
end
