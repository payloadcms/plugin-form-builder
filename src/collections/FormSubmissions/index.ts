import { CollectionConfig } from 'payload/types';
import { FormConfig } from '../../types';
import sendEmail from './hooks/sendEmail';
import createCharge from './hooks/createCharge';

// all settings can be overridden by the config
export const generateSubmissionCollection = (formConfig: FormConfig): CollectionConfig => {
  const newConfig: CollectionConfig = {
    slug: formConfig?.formSubmissionOverrides?.slug || 'formSubmissions',
    access: {
      create: () => true,
      update: () => false,
      read: ({ req: { user } }) => !!user, // logged-in users,
      ...formConfig?.formSubmissionOverrides?.access || {}
    },
    admin: {
      enableRichTextRelationship: false
    },
    hooks: {
      beforeChange: [
        (data) => createCharge(data, formConfig),
        (data) => sendEmail(data, formConfig),
        ...formConfig?.formSubmissionOverrides?.hooks?.beforeChange || []
      ],
      ...formConfig?.formSubmissionOverrides?.hooks || {}
    },
    fields: [
      {
        name: 'form',
        type: 'relationship',
        relationTo: 'forms',
        required: true,
        admin: {
          readOnly: true
        },
      },
      {
        name: 'submissionData',
        type: 'array',
        admin: {
          readOnly: true
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
            validate: (value: unknown) => {
              // TODO:
              // create a validation function that dynamically
              // relies on the field type and its options as configured.

              // How to access sibling data from this field?
              // Need the `name` of the field in order to validate it.

              // Might not be possible to use this validation function.
              // Instead, might need to do all validation in a `beforeValidate` collection hook.

              if (typeof value !== 'undefined') {
                return true;
              }

              return 'This field is required.';
            },
          },
        ],
      },
      ...formConfig?.formSubmissionOverrides?.fields || []
    ],
  };

  const paymentFieldConfig = formConfig?.fields?.payment;

  if (paymentFieldConfig) {
    newConfig.fields.push({
      name: 'payment',
      type: 'group',
      admin: {
        readOnly: true
      },
      fields: [
        {
          name: 'field',
          label: 'Field',
          type: 'text'
        },
        {
          name: 'status',
          label: 'Status',
          type: 'text'
        },
        {
          name: 'amount',
          type: 'number'
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
              type: 'text'
            },
            {
              name: 'brand',
              label: 'Brand',
              type: 'text'
            },
            {
              name: 'number',
              label: 'Number',
              type: 'text'
            }
          ]
        }
      ]
    })
  }

  return newConfig;
}
