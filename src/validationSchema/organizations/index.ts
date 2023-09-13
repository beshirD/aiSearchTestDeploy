import * as yup from 'yup';

export const organizationValidationSchema = yup.object().shape({
  description: yup.string().nullable(),
  status: yup.string().nullable(),
  industry: yup.string().nullable(),
  name: yup.string().required(),
  user_id: yup.string().nullable().required(),
});
