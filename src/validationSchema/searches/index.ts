import * as yup from 'yup';

export const searchValidationSchema = yup.object().shape({
  query: yup.string().required(),
  status: yup.string().required(),
  type: yup.string().required(),
  results_count: yup.number().integer().required(),
  user_id: yup.string().nullable().required(),
});
