defmodule VetClinic.Search do
  @moduledoc """
  Query helpers the contexts share for search. Each context lists the fields
  it searches (plus anything specific to it, like phone digits) and keeps its
  own `search_*` function.
  """

  import Ecto.Query, warn: false

  @doc """
  Narrows `query` to rows where any of `fields` matches `term` (case-insensitive,
  anywhere), or where `extra.(term)` holds. A `nil` term leaves the query as it
  is, listing everything.
  """
  @spec matching(
          Ecto.Queryable.t(),
          String.t() | nil,
          [atom()],
          (String.t() -> Ecto.Query.dynamic_expr())
        ) :: Ecto.Queryable.t()
  def matching(query, term, fields, extra \\ fn _term -> dynamic(false) end)

  def matching(query, nil, _fields, _extra), do: query

  def matching(query, term, fields, extra) do
    pattern = like_pattern(term)

    conditions =
      Enum.reduce(fields, extra.(term), fn field, conditions ->
        dynamic([r], ^conditions or ilike(field(r, ^field), ^pattern))
      end)

    where(query, ^conditions)
  end

  @doc "The first `limit` results, ordered by name."
  @spec first_by_name(Ecto.Queryable.t(), pos_integer()) :: Ecto.Query.t()
  def first_by_name(query, limit) do
    query
    |> order_by(:name)
    |> limit(^limit)
  end

  @doc """
  A LIKE pattern matching `term` anywhere, with LIKE's wildcards escaped so
  they match literally: `"50%"` becomes `"%50\\%%"`.
  """
  @spec like_pattern(String.t()) :: String.t()
  def like_pattern(term) do
    escaped = String.replace(term, ["\\", "%", "_"], &"\\#{&1}")

    "%#{escaped}%"
  end

  @doc """
  The digits in `term` when there are at least 3, for matching phone numbers
  regardless of punctuation ("555-0101" → "5550101"), otherwise `nil`.
  """
  @spec digits(String.t()) :: String.t() | nil
  def digits(term) do
    case String.replace(term, ~r/\D/, "") do
      digits when byte_size(digits) >= 3 -> digits
      _fewer -> nil
    end
  end
end
