import { graphql } from '../../gql';

export const DAILY_SCHEDULE = graphql(`
  query DailySchedule($date: Date) {
    appointments(date: $date) {
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
    }
  }
`);

export const UPDATE_APPOINTMENT_STATUS = graphql(`
  mutation UpdateAppointmentStatus($id: ID!, $status: AppointmentStatus!) {
    updateAppointmentStatus(id: $id, status: $status) {
      id
      status
    }
  }
`);

export const APPOINTMENT_CHANGED = graphql(`
  subscription AppointmentChanged {
    appointmentChanged {
      id
      status
      startsAt
    }
  }
`);
