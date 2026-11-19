import { graphql } from '../../gql';

// What VetForm edits; VET spreads it.
export const VET_FORM_FRAGMENT = graphql(`
  fragment VetForm_vet on Vet {
    id
    name
    email
  }
`);

export const VETS = graphql(`
  query Vets {
    vets {
      id
      name
      email
    }
  }
`);

export const VET = graphql(`
  query Vet($id: ID!) {
    vet(id: $id) {
      id
      name
      email
      ...VetForm_vet
    }
  }
`);

export const VET_APPOINTMENTS = graphql(`
  query VetAppointments($vetId: ID!, $date: Date, $status: AppointmentStatus) {
    vetAppointments(vetId: $vetId, date: $date, status: $status) {
      id
      startsAt
      reason
      status
      pet {
        id
        name
        owner {
          id
          name
        }
      }
    }
  }
`);

export const CREATE_VET = graphql(`
  mutation CreateVet($input: CreateVetInput!) {
    createVet(input: $input) {
      id
      name
      email
    }
  }
`);

export const UPDATE_VET = graphql(`
  mutation UpdateVet($id: ID!, $input: UpdateVetInput!) {
    updateVet(id: $id, input: $input) {
      id
      name
      email
    }
  }
`);

export const DELETE_VET = graphql(`
  mutation DeleteVet($id: ID!) {
    deleteVet(id: $id) {
      id
    }
  }
`);
