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
  query Pet($id: ID!) {
    pet(id: $id) {
      id
      name
      species
      breed
      birthDate
      owner {
        id
        name
      }
      ...PetForm_pet
    }
  }
`);

export const PET_APPOINTMENTS = graphql(`
  query PetAppointments($petId: ID!, $status: AppointmentStatus) {
    petAppointments(petId: $petId, status: $status) {
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
