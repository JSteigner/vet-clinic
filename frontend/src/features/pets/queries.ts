import { graphql } from '../../gql';

// What PetForm edits; PET spreads it.
export const PET_FORM_FRAGMENT = graphql(`
  fragment PetForm_pet on Pet {
    id
    name
    species
    breed
    birthDate
  }
`);

export const PET = graphql(`
  query Pet($id: ID!, $includeArchived: Boolean) {
    pet(id: $id, includeArchived: $includeArchived) {
      id
      name
      species
      breed
      birthDate
      archivedAt
      owner {
        id
        name
      }
      ...PetForm_pet
    }
  }
`);

export const PET_APPOINTMENTS = graphql(`
  query PetAppointments($petId: ID!, $status: AppointmentStatus, $includeArchived: Boolean) {
    petAppointments(petId: $petId, status: $status, includeArchived: $includeArchived) {
      id
      startsAt
      reason
      status
      vet {
        id
        name
      }
    }
  }
`);

export const CREATE_PET = graphql(`
  mutation CreatePet($input: CreatePetInput!) {
    createPet(input: $input) {
      id
      name
      species
      breed
      archivedAt
    }
  }
`);

export const UPDATE_PET = graphql(`
  mutation UpdatePet($id: ID!, $input: UpdatePetInput!) {
    updatePet(id: $id, input: $input) {
      id
      name
      species
      breed
      birthDate
    }
  }
`);

export const DELETE_PET = graphql(`
  mutation DeletePet($id: ID!) {
    deletePet(id: $id) {
      id
      archivedAt
    }
  }
`);

export const RESTORE_PET = graphql(`
  mutation RestorePet($id: ID!) {
    restorePet(id: $id) {
      id
      archivedAt
    }
  }
`);
