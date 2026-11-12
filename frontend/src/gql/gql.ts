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
    "\n  query DailySchedule($date: Date) {\n    appointments(date: $date) {\n      id\n      startsAt\n      reason\n      status\n      pet {\n        id\n        name\n        species\n        owner {\n          id\n          name\n        }\n      }\n      vet {\n        id\n        name\n      }\n    }\n  }\n": typeof types.DailyScheduleDocument,
    "\n  mutation UpdateAppointmentStatus($id: ID!, $status: AppointmentStatus!) {\n    updateAppointmentStatus(id: $id, status: $status) {\n      id\n      status\n    }\n  }\n": typeof types.UpdateAppointmentStatusDocument,
    "\n  subscription AppointmentChanged {\n    appointmentChanged {\n      id\n      status\n      startsAt\n    }\n  }\n": typeof types.AppointmentChangedDocument,
    "\n  query ClinicTimeZone {\n    clinicTimeZone\n  }\n": typeof types.ClinicTimeZoneDocument,
};
const documents: Documents = {
    "\n  query DailySchedule($date: Date) {\n    appointments(date: $date) {\n      id\n      startsAt\n      reason\n      status\n      pet {\n        id\n        name\n        species\n        owner {\n          id\n          name\n        }\n      }\n      vet {\n        id\n        name\n      }\n    }\n  }\n": types.DailyScheduleDocument,
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
export function graphql(source: "\n  query DailySchedule($date: Date) {\n    appointments(date: $date) {\n      id\n      startsAt\n      reason\n      status\n      pet {\n        id\n        name\n        species\n        owner {\n          id\n          name\n        }\n      }\n      vet {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query DailySchedule($date: Date) {\n    appointments(date: $date) {\n      id\n      startsAt\n      reason\n      status\n      pet {\n        id\n        name\n        species\n        owner {\n          id\n          name\n        }\n      }\n      vet {\n        id\n        name\n      }\n    }\n  }\n"];
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