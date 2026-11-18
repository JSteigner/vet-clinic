import { graphql } from '../../gql';

export const SEARCH = graphql(`
  query Search(
    $term: String
    $archived: Boolean
    $includeArchived: Boolean
    $types: [SearchType!]
    $limit: Int
  ) {
    search(
      term: $term
      archived: $archived
      includeArchived: $includeArchived
      types: $types
      limit: $limit
    ) {
      owners {
        id
        name
        email
        phone
        archivedAt
      }
      pets {
        id
        name
        species
        archivedAt
        owner {
          id
          name
        }
      }
      vets {
        id
        name
        email
      }
    }
  }
`);
