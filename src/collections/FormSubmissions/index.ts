import type { CollectionConfig } from 'payload/types'

import type { PluginConfig } from '../../types'
import createCharge from './hooks/createCharge'
import sendEmail from './hooks/sendEmail'
import validateSubmissionField from './validators/validateSubmissionField'
import { prepareSubmissionForValidation } from './hooks/validateSubmission'

// all settings can be overridden by the config
export const generateSubmissionCollection = (formConfig: PluginConfig): CollectionConfig => {
  const newConfig: CollectionConfig = {
    ...(formConfig?.formSubmissionOverrides || {}),
    slug: formConfig?.formSubmissionOverrides?.slug || 'form-submissions',
    access: {
      create: () => true,
      update: () => false,
      read: ({ req: { user } }) => !!user, // logged-in users,
      ...(formConfig?.formSubmissionOverrides?.access || {}),
    },
    admin: {
      ...(formConfig?.formSubmissionOverrides?.admin || {}),
      enableRichTextRelationship: false,
    },
    hooks: {
      beforeChange: [
        data => createCharge(data, formConfig),
        data => sendEmail(data, formConfig),
        ...(formConfig?.formSubmissionOverrides?.hooks?.beforeChange || []),
      ],
      beforeValidate: [
        data => prepareSubmissionForValidation(data, formConfig),
        ...(formConfig?.formSubmissionOverrides?.hooks?.beforeValidate || []),
      ],
      ...(formConfig?.formSubmissionOverrides?.hooks || {}),
    },
    fields: [
      {
        name: 'form',
        type: 'relationship',
        relationTo: formConfig?.formOverrides?.slug || 'forms',
        required: true,
        admin: {
          readOnly: true,
        },
      },
      {
        name: 'submissionData',
        type: 'array',
        admin: {
          readOnly: true,
        },
        fields: [
          {
            name: 'field',
            type: 'text',
            required: true,
          },
          {
            name: 'value',
            type: 'text',
            required: true,
            validate: validateSubmissionField(formConfig),
          },
        ],
      },
      ...(formConfig?.formSubmissionOverrides?.fields || []),
    ],
  }

  const paymentFieldConfig = formConfig?.fields?.payment

  if (paymentFieldConfig) {
    newConfig.fields.push({
      name: 'payment',
      type: 'group',
      admin: {
        readOnly: true,
      },
      fields: [
        {
          name: 'field',
          label: 'Field',
          type: 'text',
        },
        {
          name: 'status',
          label: 'Status',
          type: 'text',
        },
        {
          name: 'amount',
          type: 'number',
          admin: {
            description: 'Amount in cents',
          },
        },
        {
          name: 'paymentProcessor',
          type: 'text',
        },
        {
          name: 'creditCard',
          label: 'Credit Card',
          type: 'group',
          fields: [
            {
              name: 'token',
              label: 'token',
              type: 'text',
            },
            {
              name: 'brand',
              label: 'Brand',
              type: 'text',
            },
            {
              name: 'number',
              label: 'Number',
              type: 'text',
            },
          ],
        },
      ],
    })
  }

  return newConfig
}
