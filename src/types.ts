import type { Block, CollectionConfig, Field } from 'payload/types'

export interface BlockConfig {
  block: Block
  validate?: (value: unknown) => boolean | string
}

export function isValidBlockConfig(blockConfig: BlockConfig | string): blockConfig is BlockConfig {
  return (
    typeof blockConfig !== 'string' &&
    typeof blockConfig?.block?.slug === 'string' &&
    Array.isArray(blockConfig?.block?.fields)
  )
}

export interface FieldValues {
  [key: string]: string | number | boolean | null | undefined
}

export type PaymentFieldConfig = Partial<Field> & {
  paymentProcessor: Partial<SelectField>
}

export type FieldConfig = Partial<Field> | PaymentFieldConfig

export interface FieldsConfig {
  select?: boolean | FieldConfig
  text?: boolean | FieldConfig
  textarea?: boolean | FieldConfig
  email?: boolean | FieldConfig
  state?: boolean | FieldConfig
  country?: boolean | FieldConfig
  checkbox?: boolean | FieldConfig
  number?: boolean | FieldConfig
  message?: boolean | FieldConfig
  payment?: boolean | FieldConfig
  [key: string]: boolean | FieldConfig | undefined
}

export type BeforeEmail = (emails: FormattedEmail[]) => FormattedEmail[] | Promise<FormattedEmail[]>
export type HandlePayment = (data: any) => void

export interface PluginConfig {
  fields?: FieldsConfig
  formSubmissionOverrides?: Partial<CollectionConfig>
  formOverrides?: Partial<CollectionConfig>
  beforeEmail?: BeforeEmail
  handlePayment?: HandlePayment
  redirectRelationships?: string[]
}

export interface TextField {
  blockType: 'text'
  blockName?: string
  width?: number
  name: string
  label?: string
  defaultValue?: string
  required?: boolean
}

export interface TextAreaField {
  blockType: 'textarea'
  blockName?: string
  width?: number
  name: string
  label?: string
  defaultValue?: string
  required?: boolean
}

export interface SelectFieldOption {
  label: string
  value: string
}

export interface SelectField {
  blockType: 'select'
  blockName?: string
  width?: number
  name: string
  label?: string
  defaultValue?: string
  required?: boolean
  options: SelectFieldOption[]
}

export interface PriceCondition {
  fieldToUse: string
  condition: 'equals' | 'notEquals' | 'hasValue'
  valueForCondition: string
  operator: 'add' | 'subtract' | 'multiply' | 'divide'
  valueType: 'static' | 'valueOfField'
  valueForOperator: string | number // TODO: make this a number, see ./collections/Forms/DynamicPriceSelector.tsx
}

export interface PaymentField {
  blockType: 'payment'
  blockName?: string
  width?: number
  name: string
  label?: string
  defaultValue?: string
  required?: boolean
  paymentProcessor: string
  basePrice: number
  priceConditions: PriceCondition[]
}

export interface EmailField {
  blockType: 'email'
  blockName?: string
  width?: number
  name: string
  label?: string
  defaultValue?: string
  required?: boolean
}

export interface StateField {
  blockType: 'state'
  blockName?: string
  width?: number
  name: string
  label?: string
  defaultValue?: string
  required?: boolean
}

export interface CountryField {
  blockType: 'country'
  blockName?: string
  width?: number
  name: string
  label?: string
  defaultValue?: string
  required?: boolean
}

export interface CheckboxField {
  blockType: 'checkbox'
  blockName?: string
  width?: number
  name: string
  label?: string
  defaultValue?: boolean
  required?: boolean
}

export interface MessageField {
  blockType: 'message'
  blockName?: string
  message: unknown
}

export type FormFieldBlock =
  | TextField
  | TextAreaField
  | SelectField
  | EmailField
  | StateField
  | CountryField
  | CheckboxField
  | MessageField
  | PaymentField

export interface Email {
  emailTo: string
  emailFrom: string
  cc?: string
  bcc?: string
  replyTo?: string
  subject: string
  message?: any // TODO: configure rich text type
}

export interface FormattedEmail {
  to: string
  cc?: string
  bcc?: string
  from: string
  subject: string
  html: string
  replyTo: string
}

export interface Redirect {
  type: 'reference' | 'custom'
  reference?: {
    relationTo: string
    value: string | unknown
  }
  url: string
}

export interface Form {
  id: string
  title: string
  fields: FormFieldBlock[]
  submitButtonLabel?: string
  confirmationType: 'message' | 'redirect'
  confirmationMessage?: any // TODO: configure rich text type
  redirect?: Redirect
  emails: Email[]
}

export interface SubmissionValue {
  field: string
  value: unknown
}

export interface FormSubmission {
  form: string | Form
  submissionData: SubmissionValue[]
}
