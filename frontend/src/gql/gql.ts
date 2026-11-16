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
    "\n  fragment OwnerForm_owner on Owner {\n    id\n    name\n    email\n    phone\n  }\n": typeof types.OwnerForm_OwnerFragmentDoc,
    "\n  query Owners {\n    owners {\n      id\n      name\n      email\n      phone\n      pets {\n        id\n        archivedAt\n      }\n    }\n  }\n": typeof types.OwnersDocument,
    "\n  query Owner($id: ID!, $includeArchived: Boolean) {\n    owner(id: $id, includeArchived: $includeArchived) {\n      id\n      name\n      email\n      phone\n      archivedAt\n      ...OwnerForm_owner\n      pets {\n        id\n        name\n        species\n        breed\n        archivedAt\n      }\n    }\n  }\n": typeof types.OwnerDocument,
    "\n  mutation CreateOwner($input: CreateOwnerInput!) {\n    createOwner(input: $input) {\n      id\n      name\n      email\n      phone\n      pets {\n        id\n        archivedAt\n      }\n    }\n  }\n": typeof types.CreateOwnerDocument,
    "\n  mutation UpdateOwner($id: ID!, $input: UpdateOwnerInput!) {\n    updateOwner(id: $id, input: $input) {\n      id\n      name\n      email\n      phone\n    }\n  }\n": typeof types.UpdateOwnerDocument,
    "\n  mutation DeleteOwner($id: ID!) {\n    deleteOwner(id: $id) {\n      id\n      archivedAt\n    }\n  }\n": typeof types.DeleteOwnerDocument,
    "\n  mutation RestoreOwner($id: ID!) {\n    restoreOwner(id: $id) {\n      id\n      name\n      email\n      phone\n      archivedAt\n      pets {\n        id\n        archivedAt\n      }\n    }\n  }\n": typeof types.RestoreOwnerDocument,
    "\n  fragment PetForm_pet on Pet {\n    id\n    name\n    species\n    breed\n    birthDate\n  }\n": typeof types.PetForm_PetFragmentDoc,
    "\n  query Pet($id: ID!, $includeArchived: Boolean) {\n    pet(id: $id, includeArchived: $includeArchived) {\n      id\n      name\n      species\n      breed\n      birthDate\n      archivedAt\n      owner {\n        id\n        name\n      }\n      ...PetForm_pet\n    }\n  }\n": typeof types.PetDocument,
    "\n  query PetAppointments($petId: ID!, $status: AppointmentStatus, $includeArchived: Boolean) {\n    petAppointments(petId: $petId, status: $status, includeArchived: $includeArchived) {\n      id\n      startsAt\n      reason\n      status\n      vet {\n        id\n        name\n      }\n    }\n  }\n": typeof types.PetAppointmentsDocument,
    "\n  mutation CreatePet($input: CreatePetInput!) {\n    createPet(input: $input) {\n      id\n      name\n      species\n      breed\n      archivedAt\n    }\n  }\n": typeof types.CreatePetDocument,
    "\n  mutation UpdatePet($id: ID!, $input: UpdatePetInput!) {\n    updatePet(id: $id, input: $input) {\n      id\n      name\n      species\n      breed\n      birthDate\n    }\n  }\n": typeof types.UpdatePetDocument,
    "\n  mutation DeletePet($id: ID!) {\n    deletePet(id: $id) {\n      id\n      archivedAt\n    }\n  }\n": typeof types.DeletePetDocument,
    "\n  mutation RestorePet($id: ID!) {\n    restorePet(id: $id) {\n      id\n      archivedAt\n    }\n  }\n": typeof types.RestorePetDocument,
    "\n  fragment AppointmentRow_appointment on Appointment {\n    id\n    startsAt\n    reason\n    status\n    pet {\n      id\n      name\n      species\n      owner {\n        id\n        name\n      }\n    }\n    vet {\n      id\n      name\n    }\n  }\n": typeof types.AppointmentRow_AppointmentFragmentDoc,
    "\n  query DailySchedule($date: Date) {\n    appointments(date: $date) {\n      id\n      ...AppointmentRow_appointment\n    }\n  }\n": typeof types.DailyScheduleDocument,
    "\n  mutation UpdateAppointmentStatus($id: ID!, $status: AppointmentStatus!) {\n    updateAppointmentStatus(id: $id, status: $status) {\n      id\n      status\n    }\n  }\n": typeof types.UpdateAppointmentStatusDocument,
    "\n  subscription AppointmentChanged {\n    appointmentChanged {\n      id\n      status\n      startsAt\n    }\n  }\n": typeof types.AppointmentChangedDocument,
    "\n  fragment VetForm_vet on Vet {\n    id\n    name\n    email\n  }\n": typeof types.VetForm_VetFragmentDoc,
    "\n  query Vets {\n    vets {\n      id\n      name\n      email\n    }\n  }\n": typeof types.VetsDocument,
    "\n  query Vet($id: ID!) {\n    vet(id: $id) {\n      id\n      name\n      email\n      ...VetForm_vet\n    }\n  }\n": typeof types.VetDocument,
    "\n  query VetAppointments($vetId: ID!, $date: Date) {\n    vetAppointments(vetId: $vetId, date: $date) {\n      id\n      startsAt\n      reason\n      status\n      pet {\n        id\n        name\n        owner {\n          id\n          name\n        }\n      }\n    }\n  }\n": typeof types.VetAppointmentsDocument,
    "\n  mutation CreateVet($input: CreateVetInput!) {\n    createVet(input: $input) {\n      id\n      name\n      email\n    }\n  }\n": typeof types.CreateVetDocument,
    "\n  mutation UpdateVet($id: ID!, $input: UpdateVetInput!) {\n    updateVet(id: $id, input: $input) {\n      id\n      name\n      email\n    }\n  }\n": typeof types.UpdateVetDocument,
    "\n  mutation DeleteVet($id: ID!) {\n    deleteVet(id: $id) {\n      id\n    }\n  }\n": typeof types.DeleteVetDocument,
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
    "\n  fragment OwnerForm_owner on Owner {\n    id\n    name\n    email\n    phone\n  }\n": types.OwnerForm_OwnerFragmentDoc,
    "\n  query Owners {\n    owners {\n      id\n      name\n      email\n      phone\n      pets {\n        id\n        archivedAt\n      }\n    }\n  }\n": types.OwnersDocument,
    "\n  query Owner($id: ID!, $includeArchived: Boolean) {\n    owner(id: $id, includeArchived: $includeArchived) {\n      id\n      name\n      email\n      phone\n      archivedAt\n      ...OwnerForm_owner\n      pets {\n        id\n        name\n        species\n        breed\n        archivedAt\n      }\n    }\n  }\n": types.OwnerDocument,
    "\n  mutation CreateOwner($input: CreateOwnerInput!) {\n    createOwner(input: $input) {\n      id\n      name\n      email\n      phone\n      pets {\n        id\n        archivedAt\n      }\n    }\n  }\n": types.CreateOwnerDocument,
    "\n  mutation UpdateOwner($id: ID!, $input: UpdateOwnerInput!) {\n    updateOwner(id: $id, input: $input) {\n      id\n      name\n      email\n      phone\n    }\n  }\n": types.UpdateOwnerDocument,
    "\n  mutation DeleteOwner($id: ID!) {\n    deleteOwner(id: $id) {\n      id\n      archivedAt\n    }\n  }\n": types.DeleteOwnerDocument,
    "\n  mutation RestoreOwner($id: ID!) {\n    restoreOwner(id: $id) {\n      id\n      name\n      email\n      phone\n      archivedAt\n      pets {\n        id\n        archivedAt\n      }\n    }\n  }\n": types.RestoreOwnerDocument,
    "\n  fragment PetForm_pet on Pet {\n    id\n    name\n    species\n    breed\n    birthDate\n  }\n": types.PetForm_PetFragmentDoc,
    "\n  query Pet($id: ID!, $includeArchived: Boolean) {\n    pet(id: $id, includeArchived: $includeArchived) {\n      id\n      name\n      species\n      breed\n      birthDate\n      archivedAt\n      owner {\n        id\n        name\n      }\n      ...PetForm_pet\n    }\n  }\n": types.PetDocument,
    "\n  query PetAppointments($petId: ID!, $status: AppointmentStatus, $includeArchived: Boolean) {\n    petAppointments(petId: $petId, status: $status, includeArchived: $includeArchived) {\n      id\n      startsAt\n      reason\n      status\n      vet {\n        id\n        name\n      }\n    }\n  }\n": types.PetAppointmentsDocument,
    "\n  mutation CreatePet($input: CreatePetInput!) {\n    createPet(input: $input) {\n      id\n      name\n      species\n      breed\n      archivedAt\n    }\n  }\n": types.CreatePetDocument,
    "\n  mutation UpdatePet($id: ID!, $input: UpdatePetInput!) {\n    updatePet(id: $id, input: $input) {\n      id\n      name\n      species\n      breed\n      birthDate\n    }\n  }\n": types.UpdatePetDocument,
    "\n  mutation DeletePet($id: ID!) {\n    deletePet(id: $id) {\n      id\n      archivedAt\n    }\n  }\n": types.DeletePetDocument,
    "\n  mutation RestorePet($id: ID!) {\n    restorePet(id: $id) {\n      id\n      archivedAt\n    }\n  }\n": types.RestorePetDocument,
    "\n  fragment AppointmentRow_appointment on Appointment {\n    id\n    startsAt\n    reason\n    status\n    pet {\n      id\n      name\n      species\n      owner {\n        id\n        name\n      }\n    }\n    vet {\n      id\n      name\n    }\n  }\n": types.AppointmentRow_AppointmentFragmentDoc,
    "\n  query DailySchedule($date: Date) {\n    appointments(date: $date) {\n      id\n      ...AppointmentRow_appointment\n    }\n  }\n": types.DailyScheduleDocument,
    "\n  mutation UpdateAppointmentStatus($id: ID!, $status: AppointmentStatus!) {\n    updateAppointmentStatus(id: $id, status: $status) {\n      id\n      status\n    }\n  }\n": types.UpdateAppointmentStatusDocument,
    "\n  subscription AppointmentChanged {\n    appointmentChanged {\n      id\n      status\n      startsAt\n    }\n  }\n": types.AppointmentChangedDocument,
    "\n  fragment VetForm_vet on Vet {\n    id\n    name\n    email\n  }\n": types.VetForm_VetFragmentDoc,
    "\n  query Vets {\n    vets {\n      id\n      name\n      email\n    }\n  }\n": types.VetsDocument,
    "\n  query Vet($id: ID!) {\n    vet(id: $id) {\n      id\n      name\n      email\n      ...VetForm_vet\n    }\n  }\n": types.VetDocument,
    "\n  query VetAppointments($vetId: ID!, $date: Date) {\n    vetAppointments(vetId: $vetId, date: $date) {\n      id\n      startsAt\n      reason\n      status\n      pet {\n        id\n        name\n        owner {\n          id\n          name\n        }\n      }\n    }\n  }\n": types.VetAppointmentsDocument,
    "\n  mutation CreateVet($input: CreateVetInput!) {\n    createVet(input: $input) {\n      id\n      name\n      email\n    }\n  }\n": types.CreateVetDocument,
    "\n  mutation UpdateVet($id: ID!, $input: UpdateVetInput!) {\n    updateVet(id: $id, input: $input) {\n      id\n      name\n      email\n    }\n  }\n": types.UpdateVetDocument,
    "\n  mutation DeleteVet($id: ID!) {\n    deleteVet(id: $id) {\n      id\n    }\n  }\n": types.DeleteVetDocument,
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
export function graphql(source: "\n  fragment OwnerForm_owner on Owner {\n    id\n    name\n    email\n    phone\n  }\n"): (typeof documents)["\n  fragment OwnerForm_owner on Owner {\n    id\n    name\n    email\n    phone\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Owners {\n    owners {\n      id\n      name\n      email\n      phone\n      pets {\n        id\n        archivedAt\n      }\n    }\n  }\n"): (typeof documents)["\n  query Owners {\n    owners {\n      id\n      name\n      email\n      phone\n      pets {\n        id\n        archivedAt\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Owner($id: ID!, $includeArchived: Boolean) {\n    owner(id: $id, includeArchived: $includeArchived) {\n      id\n      name\n      email\n      phone\n      archivedAt\n      ...OwnerForm_owner\n      pets {\n        id\n        name\n        species\n        breed\n        archivedAt\n      }\n    }\n  }\n"): (typeof documents)["\n  query Owner($id: ID!, $includeArchived: Boolean) {\n    owner(id: $id, includeArchived: $includeArchived) {\n      id\n      name\n      email\n      phone\n      archivedAt\n      ...OwnerForm_owner\n      pets {\n        id\n        name\n        species\n        breed\n        archivedAt\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateOwner($input: CreateOwnerInput!) {\n    createOwner(input: $input) {\n      id\n      name\n      email\n      phone\n      pets {\n        id\n        archivedAt\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateOwner($input: CreateOwnerInput!) {\n    createOwner(input: $input) {\n      id\n      name\n      email\n      phone\n      pets {\n        id\n        archivedAt\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateOwner($id: ID!, $input: UpdateOwnerInput!) {\n    updateOwner(id: $id, input: $input) {\n      id\n      name\n      email\n      phone\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateOwner($id: ID!, $input: UpdateOwnerInput!) {\n    updateOwner(id: $id, input: $input) {\n      id\n      name\n      email\n      phone\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteOwner($id: ID!) {\n    deleteOwner(id: $id) {\n      id\n      archivedAt\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteOwner($id: ID!) {\n    deleteOwner(id: $id) {\n      id\n      archivedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RestoreOwner($id: ID!) {\n    restoreOwner(id: $id) {\n      id\n      name\n      email\n      phone\n      archivedAt\n      pets {\n        id\n        archivedAt\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation RestoreOwner($id: ID!) {\n    restoreOwner(id: $id) {\n      id\n      name\n      email\n      phone\n      archivedAt\n      pets {\n        id\n        archivedAt\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment PetForm_pet on Pet {\n    id\n    name\n    species\n    breed\n    birthDate\n  }\n"): (typeof documents)["\n  fragment PetForm_pet on Pet {\n    id\n    name\n    species\n    breed\n    birthDate\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Pet($id: ID!, $includeArchived: Boolean) {\n    pet(id: $id, includeArchived: $includeArchived) {\n      id\n      name\n      species\n      breed\n      birthDate\n      archivedAt\n      owner {\n        id\n        name\n      }\n      ...PetForm_pet\n    }\n  }\n"): (typeof documents)["\n  query Pet($id: ID!, $includeArchived: Boolean) {\n    pet(id: $id, includeArchived: $includeArchived) {\n      id\n      name\n      species\n      breed\n      birthDate\n      archivedAt\n      owner {\n        id\n        name\n      }\n      ...PetForm_pet\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PetAppointments($petId: ID!, $status: AppointmentStatus, $includeArchived: Boolean) {\n    petAppointments(petId: $petId, status: $status, includeArchived: $includeArchived) {\n      id\n      startsAt\n      reason\n      status\n      vet {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query PetAppointments($petId: ID!, $status: AppointmentStatus, $includeArchived: Boolean) {\n    petAppointments(petId: $petId, status: $status, includeArchived: $includeArchived) {\n      id\n      startsAt\n      reason\n      status\n      vet {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreatePet($input: CreatePetInput!) {\n    createPet(input: $input) {\n      id\n      name\n      species\n      breed\n      archivedAt\n    }\n  }\n"): (typeof documents)["\n  mutation CreatePet($input: CreatePetInput!) {\n    createPet(input: $input) {\n      id\n      name\n      species\n      breed\n      archivedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdatePet($id: ID!, $input: UpdatePetInput!) {\n    updatePet(id: $id, input: $input) {\n      id\n      name\n      species\n      breed\n      birthDate\n    }\n  }\n"): (typeof documents)["\n  mutation UpdatePet($id: ID!, $input: UpdatePetInput!) {\n    updatePet(id: $id, input: $input) {\n      id\n      name\n      species\n      breed\n      birthDate\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeletePet($id: ID!) {\n    deletePet(id: $id) {\n      id\n      archivedAt\n    }\n  }\n"): (typeof documents)["\n  mutation DeletePet($id: ID!) {\n    deletePet(id: $id) {\n      id\n      archivedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RestorePet($id: ID!) {\n    restorePet(id: $id) {\n      id\n      archivedAt\n    }\n  }\n"): (typeof documents)["\n  mutation RestorePet($id: ID!) {\n    restorePet(id: $id) {\n      id\n      archivedAt\n    }\n  }\n"];
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
export function graphql(source: "\n  fragment VetForm_vet on Vet {\n    id\n    name\n    email\n  }\n"): (typeof documents)["\n  fragment VetForm_vet on Vet {\n    id\n    name\n    email\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Vets {\n    vets {\n      id\n      name\n      email\n    }\n  }\n"): (typeof documents)["\n  query Vets {\n    vets {\n      id\n      name\n      email\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Vet($id: ID!) {\n    vet(id: $id) {\n      id\n      name\n      email\n      ...VetForm_vet\n    }\n  }\n"): (typeof documents)["\n  query Vet($id: ID!) {\n    vet(id: $id) {\n      id\n      name\n      email\n      ...VetForm_vet\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query VetAppointments($vetId: ID!, $date: Date) {\n    vetAppointments(vetId: $vetId, date: $date) {\n      id\n      startsAt\n      reason\n      status\n      pet {\n        id\n        name\n        owner {\n          id\n          name\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query VetAppointments($vetId: ID!, $date: Date) {\n    vetAppointments(vetId: $vetId, date: $date) {\n      id\n      startsAt\n      reason\n      status\n      pet {\n        id\n        name\n        owner {\n          id\n          name\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateVet($input: CreateVetInput!) {\n    createVet(input: $input) {\n      id\n      name\n      email\n    }\n  }\n"): (typeof documents)["\n  mutation CreateVet($input: CreateVetInput!) {\n    createVet(input: $input) {\n      id\n      name\n      email\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateVet($id: ID!, $input: UpdateVetInput!) {\n    updateVet(id: $id, input: $input) {\n      id\n      name\n      email\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateVet($id: ID!, $input: UpdateVetInput!) {\n    updateVet(id: $id, input: $input) {\n      id\n      name\n      email\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteVet($id: ID!) {\n    deleteVet(id: $id) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteVet($id: ID!) {\n    deleteVet(id: $id) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ClinicTimeZone {\n    clinicTimeZone\n  }\n"): (typeof documents)["\n  query ClinicTimeZone {\n    clinicTimeZone\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;