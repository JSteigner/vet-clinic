import { graphql } from '../../gql';

export const BOOKING_OPTIONS = graphql(`
  query BookingOptions {
    owners {
      id
      name
    }
    vets {
      id
      name
    }
  }
`);

export const OWNER_PETS = graphql(`
  query OwnerPets($ownerId: ID!) {
    ownerPets(ownerId: $ownerId) {
      id
      name
      species
    }
  }
`);

export const PET_OWNER = graphql(`
  query PetOwner($petId: ID!) {
    petOwner(petId: $petId) {
      id
    }
  }
`);

export const CREATE_APPOINTMENT = graphql(`
  mutation CreateAppointment($input: CreateAppointmentInput!) {
    createAppointment(input: $input) {
      id
      startsAt
    }
  }
`);

// What AppointmentEditForm edits, and the vets it offers; APPOINTMENT spreads both.
export const APPOINTMENT_EDIT_FORM_FRAGMENT = graphql(`
  fragment AppointmentEditForm_appointment on Appointment {
    id
    startsAt
    reason
    vet {
      id
    }
  }
`);

export const APPOINTMENT_EDIT_FORM_VET_FRAGMENT = graphql(`
  fragment AppointmentEditForm_vet on Vet {
    id
    name
  }
`);

export const APPOINTMENT = graphql(`
  query Appointment($id: ID!) {
    appointment(id: $id) {
      id
      startsAt
      reason
      status
      pet {
        id
        name
        species
        owner {
          id
          name
        }
      }
      vet {
        id
        name
      }
      ...AppointmentEditForm_appointment
    }
    vets {
      id
      ...AppointmentEditForm_vet
    }
  }
`);

export const UPDATE_APPOINTMENT = graphql(`
  mutation UpdateAppointment($id: ID!, $input: UpdateAppointmentInput!) {
    updateAppointment(id: $id, input: $input) {
      id
      startsAt
      reason
      vet {
        id
        name
      }
    }
  }
`);

export const DELETE_APPOINTMENT = graphql(`
  mutation DeleteAppointment($id: ID!) {
    deleteAppointment(id: $id) {
      id
    }
  }
`);
