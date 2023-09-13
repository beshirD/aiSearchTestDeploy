import * as yup from 'yup';

export const botValidationSchema = yup.object().shape({
  name: yup.string().required(),
  description: yup.string().nullable(),
  status: yup.string().required(),
  type: yup.string().required(),
  organization_id: yup.string().nullable().required(),
});
