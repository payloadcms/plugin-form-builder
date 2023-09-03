import { PluginConfig } from '../../../types'
import { PayloadRequest, Field } from 'payload/types'

interface UnknownFormSubmission {
  data?: Partial<any> | undefined
  req?: PayloadRequest | undefined
  operation: 'create' | 'update'
  originalDoc?: any
}

interface FormSubmission {
  data: {
    form: string
    submissionData: {
      field: string
      value: string
    }[]
  }
  req: PayloadRequest
  operation: 'create' | 'update'
}

export const prepareSubmissionForValidation = async (
  unknownFormSubmission: UnknownFormSubmission,
  formConfig: PluginConfig,
) => {
  const {
    req: { payload },
    data,
  } = unknownFormSubmission as FormSubmission

  const { form, submissionData } = data

  const query = await payload?.find({
    collection: formConfig?.formOverrides?.slug || 'forms',
    where: {
      id: {
        equals: form,
      },
    },
  })

  if (!query?.docs[0]) {
    throw new Error('Form not found')
  }

  const fieldConfigs = query?.docs[0].fields as Field[]

  fieldConfigs.map(field => {
    if ('name' in field && !submissionData.find(s => s.field === field.name)) {
      // If any fields are missing from the submission data, add them with an empty string and allow them to be validated on the field level
      submissionData.push({ field: field.name, value: '' })
    }
  })

  return { ...data, submissionData }
}
