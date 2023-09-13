import * as yup from 'yup';

export const linkValidationSchema = yup.object().shape({
  url: yup.string().required(),
  description: yup.string().nullable(),
  status: yup.string().required(),
  type: yup.string().required(),
  user_id: yup.string().nullable().required(),
});
