defmodule VetClinic.SearchTest do
  use VetClinic.DataCase, async: true

  alias VetClinic.Search
  alias VetClinic.Vets.Vet

  describe "like_pattern/1" do
    test "matches the term anywhere" do
      assert Search.like_pattern("lop") == "%lop%"
    end

    test "escapes LIKE wildcards and backslashes" do
      assert Search.like_pattern("50%_\\") == "%50\\%\\_\\\\%"
    end
  end

  describe "digits/1" do
    test "keeps only the digits of a phone-like term" do
      assert Search.digits("555-0101") == "5550101"
      assert Search.digits("(555) 01") == "55501"
    end

    test "returns nil with fewer than 3 digits" do
      assert Search.digits("Rex 2") == nil
      assert Search.digits("rex") == nil
    end
  end

  describe "matching/4 and first_by_name/2" do
    setup do
      %{
        kim: vet_fixture(%{name: "Dr. Kim", email: unique_email()}),
        lee: vet_fixture(%{name: "Dr. Lee", email: "lee.#{unique_email()}"})
      }
    end

    test "matches any of the fields, case-insensitively" do
      assert names(Search.matching(Vet, "KIM", [:name, :email])) == ["Dr. Kim"]
      assert names(Search.matching(Vet, "lee.", [:name, :email])) == ["Dr. Lee"]
    end

    test "also matches the extra condition", %{lee: lee} do
      extra = fn _term -> dynamic([v], v.id == ^lee.id) end

      assert Enum.sort(names(Search.matching(Vet, "kim", [:name], extra))) ==
               ["Dr. Kim", "Dr. Lee"]
    end

    test "leaves the query alone for a nil term" do
      query =
        Vet
        |> Search.matching(nil, [:name])
        |> Search.first_by_name(10)

      assert names(query) == ["Dr. Kim", "Dr. Lee"]
    end

    test "first_by_name/2 orders by name and limits" do
      assert names(Search.first_by_name(Vet, 1)) == ["Dr. Kim"]
    end

    test "treats wildcards in the term literally" do
      assert names(Search.matching(Vet, "Dr_ K", [:name])) == []
    end
  end

  defp names(query) do
    query
    |> Repo.all()
    |> Enum.map(& &1.name)
  end
end
