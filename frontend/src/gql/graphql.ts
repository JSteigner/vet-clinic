/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type ClinicTimeZoneQueryVariables = Exact<{ [key: string]: never; }>;


export type ClinicTimeZoneQuery = { clinicTimeZone: string };


export const ClinicTimeZoneDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ClinicTimeZone"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clinicTimeZone"}}]}}]} as unknown as DocumentNode<ClinicTimeZoneQuery, ClinicTimeZoneQueryVariables>;