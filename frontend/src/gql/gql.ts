/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query BookingOptions {\n    owners {\n      id\n      name\n    }\n    vets {\n      id\n      name\n    }\n  }\n": typeof types.BookingOptionsDocument,
    "\n  query OwnerPets($ownerId: ID!) {\n    ownerPets(ownerId: $ownerId) {\n      id\n      name\n      species\n    }\n  }\n": typeof types.OwnerPetsDocument,
    "\n  mutation CreateAppointment($input: CreateAppointmentInput!) {\n    createAppointment(input: $input) {\n      id\n      startsAt\n    }\n  }\n": typeof types.CreateAppointmentDocument,
    "\n  fragment AppointmentEditForm_appointment on Appointment {\n    id\n    startsAt\n    reason\n    vet {\n      id\n    }\n  }\n": typeof types.AppointmentEditForm_AppointmentFragmentDoc,
    "\n  fragment AppointmentEditForm_vet on Vet {\n    id\n    name\n  }\n": typeof types.AppointmentEditForm_VetFragmentDoc,
    "\n  query Appointment($id: ID!) {\n    appointment(id: $id) {\n      id\n      startsAt\n      reason\n      status\n      pet {\n        id\n        name\n        species\n        owner {\n          id\n          name\n        }\n      }\n      vet {\n        id\n        name\n      }\n      ...AppointmentEditForm_appointment\n    }\n    vets {\n      id\n      ...AppointmentEditForm_vet\n    }\n  }\n": typeof types.AppointmentDocument,
    "\n  mutation UpdateAppointment($id: ID!, $input: UpdateAppointmentInput!) {\n    updateAppointment(id: $id, input: $input) {\n      id\n      startsAt\n      reason\n      vet {\n        id\n        name\n      }\n    }\n  }\n": typeof types.UpdateAppointmentDocument,
    "\n  mutation DeleteAppointment($id: ID!) {\n    deleteAppointment(id: $id) {\n      id\n    }\n  }\n": typeof types.DeleteAppointmentDocument,
    "\n  fragment AppointmentRow_appointment on Appointment {\n    id\n    startsAt\n    reason\n    status\n    pet {\n      id\n      name\n      species\n      owner {\n        id\n        name\n      }\n    }\n    vet {\n      id\n      name\n    }\n  }\n": typeof types.AppointmentRow_AppointmentFragmentDoc,
    "\n  query DailySchedule($date: Date) {\n    appointments(date: $date) {\n      id\n      ...AppointmentRow_appointment\n    }\n  }\n": typeof types.DailyScheduleDocument,
    "\n  mutation UpdateAppointmentStatus($id: ID!, $status: AppointmentStatus!) {\n    updateAppointmentStatus(id: $id, status: $status) {\n      id\n      status\n    }\n  }\n": typeof types.UpdateAppointmentStatusDocument,
    "\n  subscription AppointmentChanged {\n    appointmentChanged {\n      id\n      status\n      startsAt\n    }\n  }\n": typeof types.AppointmentChangedDocument,
    "\n  query ClinicTimeZone {\n    clinicTimeZone\n  }\n": typeof types.ClinicTimeZoneDocument,
};
const documents: Documents = {
    "\n  query BookingOptions {\n    owners {\n      id\n      name\n    }\n    vets {\n      id\n      name\n    }\n  }\n": types.BookingOptionsDocument,
    "\n  query OwnerPets($ownerId: ID!) {\n    ownerPets(ownerId: $ownerId) {\n      id\n      name\n      species\n    }\n  }\n": types.OwnerPetsDocument,
    "\n  mutation CreateAppointment($input: CreateAppointmentInput!) {\n    createAppointment(input: $input) {\n      id\n      startsAt\n    }\n  }\n": types.CreateAppointmentDocument,
    "\n  fragment AppointmentEditForm_appointment on Appointment {\n    id\n    startsAt\n    reason\n    vet {\n      id\n    }\n  }\n": types.AppointmentEditForm_AppointmentFragmentDoc,
    "\n  fragment AppointmentEditForm_vet on Vet {\n    id\n    name\n  }\n": types.AppointmentEditForm_VetFragmentDoc,
    "\n  query Appointment($id: ID!) {\n    appointment(id: $id) {\n      id\n      startsAt\n      reason\n      status\n      pet {\n        id\n        name\n        species\n        owner {\n          id\n          name\n        }\n      }\n      vet {\n        id\n        name\n      }\n      ...AppointmentEditForm_appointment\n    }\n    vets {\n      id\n      ...AppointmentEditForm_vet\n    }\n  }\n": types.AppointmentDocument,
    "\n  mutation UpdateAppointment($id: ID!, $input: UpdateAppointmentInput!) {\n    updateAppointment(id: $id, input: $input) {\n      id\n      startsAt\n      reason\n      vet {\n        id\n        name\n      }\n    }\n  }\n": types.UpdateAppointmentDocument,
    "\n  mutation DeleteAppointment($id: ID!) {\n    deleteAppointment(id: $id) {\n      id\n    }\n  }\n": types.DeleteAppointmentDocument,
    "\n  fragment AppointmentRow_appointment on Appointment {\n    id\n    startsAt\n    reason\n    status\n    pet {\n      id\n      name\n      species\n      owner {\n        id\n        name\n      }\n    }\n    vet {\n      id\n      name\n    }\n  }\n": types.AppointmentRow_AppointmentFragmentDoc,
    "\n  query DailySchedule($date: Date) {\n    appointments(date: $date) {\n      id\n      ...AppointmentRow_appointment\n    }\n  }\n": types.DailyScheduleDocument,
    "\n  mutation UpdateAppointmentStatus($id: ID!, $status: AppointmentStatus!) {\n    updateAppointmentStatus(id: $id, status: $status) {\n      id\n      status\n    }\n  }\n": types.UpdateAppointmentStatusDocument,
    "\n  subscription AppointmentChanged {\n    appointmentChanged {\n      id\n      status\n      startsAt\n    }\n  }\n": types.AppointmentChangedDocument,
    "\n  query ClinicTimeZone {\n    clinicTimeZone\n  }\n": types.ClinicTimeZoneDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query BookingOptions {\n    owners {\n      id\n      name\n    }\n    vets {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  query BookingOptions {\n    owners {\n      id\n      name\n    }\n    vets {\n      id\n      name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query OwnerPets($ownerId: ID!) {\n    ownerPets(ownerId: $ownerId) {\n      id\n      name\n      species\n    }\n  }\n"): (typeof documents)["\n  query OwnerPets($ownerId: ID!) {\n    ownerPets(ownerId: $ownerId) {\n      id\n      name\n      species\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateAppointment($input: CreateAppointmentInput!) {\n    createAppointment(input: $input) {\n      id\n      startsAt\n    }\n  }\n"): (typeof documents)["\n  mutation CreateAppointment($input: CreateAppointmentInput!) {\n    createAppointment(input: $input) {\n      id\n      startsAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment AppointmentEditForm_appointment on Appointment {\n    id\n    startsAt\n    reason\n    vet {\n      id\n    }\n  }\n"): (typeof documents)["\n  fragment AppointmentEditForm_appointment on Appointment {\n    id\n    startsAt\n    reason\n    vet {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment AppointmentEditForm_vet on Vet {\n    id\n    name\n  }\n"): (typeof documents)["\n  fragment AppointmentEditForm_vet on Vet {\n    id\n    name\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Appointment($id: ID!) {\n    appointment(id: $id) {\n      id\n      startsAt\n      reason\n      status\n      pet {\n        id\n        name\n        species\n        owner {\n          id\n          name\n        }\n      }\n      vet {\n        id\n        name\n      }\n      ...AppointmentEditForm_appointment\n    }\n    vets {\n      id\n      ...AppointmentEditForm_vet\n    }\n  }\n"): (typeof documents)["\n  query Appointment($id: ID!) {\n    appointment(id: $id) {\n      id\n      startsAt\n      reason\n      status\n      pet {\n        id\n        name\n        species\n        owner {\n          id\n          name\n        }\n      }\n      vet {\n        id\n        name\n      }\n      ...AppointmentEditForm_appointment\n    }\n    vets {\n      id\n      ...AppointmentEditForm_vet\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateAppointment($id: ID!, $input: UpdateAppointmentInput!) {\n    updateAppointment(id: $id, input: $input) {\n      id\n      startsAt\n      reason\n      vet {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateAppointment($id: ID!, $input: UpdateAppointmentInput!) {\n    updateAppointment(id: $id, input: $input) {\n      id\n      startsAt\n      reason\n      vet {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteAppointment($id: ID!) {\n    deleteAppointment(id: $id) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteAppointment($id: ID!) {\n    deleteAppointment(id: $id) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment AppointmentRow_appointment on Appointment {\n    id\n    startsAt\n    reason\n    status\n    pet {\n      id\n      name\n      species\n      owner {\n        id\n        name\n      }\n    }\n    vet {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  fragment AppointmentRow_appointment on Appointment {\n    id\n    startsAt\n    reason\n    status\n    pet {\n      id\n      name\n      species\n      owner {\n        id\n        name\n      }\n    }\n    vet {\n      id\n      name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query DailySchedule($date: Date) {\n    appointments(date: $date) {\n      id\n      ...AppointmentRow_appointment\n    }\n  }\n"): (typeof documents)["\n  query DailySchedule($date: Date) {\n    appointments(date: $date) {\n      id\n      ...AppointmentRow_appointment\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateAppointmentStatus($id: ID!, $status: AppointmentStatus!) {\n    updateAppointmentStatus(id: $id, status: $status) {\n      id\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateAppointmentStatus($id: ID!, $status: AppointmentStatus!) {\n    updateAppointmentStatus(id: $id, status: $status) {\n      id\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription AppointmentChanged {\n    appointmentChanged {\n      id\n      status\n      startsAt\n    }\n  }\n"): (typeof documents)["\n  subscription AppointmentChanged {\n    appointmentChanged {\n      id\n      status\n      startsAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ClinicTimeZone {\n    clinicTimeZone\n  }\n"): (typeof documents)["\n  query ClinicTimeZone {\n    clinicTimeZone\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;