import { graphql } from '../../gql';

// What OwnerForm edits; OWNER spreads it.
export const OWNER_FORM_FRAGMENT = graphql(`
  fragment OwnerForm_owner on Owner {
    id
    name
    email
    phone
  }
`);

export const OWNERS = graphql(`
  query Owners {
    owners {
      id
      name
      email
      phone
      pets {
        id
        archivedAt
      }
    }
  }
`);

export const OWNER = graphql(`
  query Owner($id: ID!) {
    owner(id: $id) {
      id
      name
      email
      phone
      ...OwnerForm_owner
      pets {
        id
        name
        species
        breed
        archivedAt
      }
    }
  }
`);

export const CREATE_OWNER = graphql(`
  mutation CreateOwner($input: CreateOwnerInput!) {
    createOwner(input: $input) {
      id
      name
      email
      phone
      pets {
        id
        archivedAt
      }
    }
  }
`);

export const UPDATE_OWNER = graphql(`
  mutation UpdateOwner($id: ID!, $input: UpdateOwnerInput!) {
    updateOwner(id: $id, input: $input) {
      id
      name
      email
      phone
    }
  }
`);

export const DELETE_OWNER = graphql(`
  mutation DeleteOwner($id: ID!) {
    deleteOwner(id: $id) {
      id
      archivedAt
    }
  }
`);
