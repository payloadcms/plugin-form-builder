import type { PluginConfig } from '../../../types'
import { PaginatedDocs } from 'payload/dist/mongoose/types'
import { CollectionConfig, TextField, Validate } from 'payload/types'

type validationSubmissionField = (
  formConfig: PluginConfig,
) => Validate<string, { form: string }, { field: string; value: string }, TextField>

const validateSubmissionField: validationSubmissionField = formConfig => async (value, options) => {
  const fieldName = options.siblingData.field

  const query: PaginatedDocs<CollectionConfig> | undefined = await options.payload?.find({
    collection: formConfig?.formOverrides?.slug || 'forms',
    where: {
      id: {
        equals: options.data.form,
      },
    },
  })

  const fieldConfig = query?.docs[0].fields.find(
    field => 'name' in field && field.name === fieldName,
  )

  if (fieldConfig) {
    if ('required' in fieldConfig && fieldConfig.required && !value) {
      return 'This field is required'
    }
  } else {
    return 'invalid field name'
  }

  return true
}

export default validateSubmissionField
