import { z } from 'zod/v4';
import { getLocale } from '$lib/context';
import * as m from '$lib/paraglide/messages.js';

z.config({
  customError: (iss) => {
    const locale = getLocale();

    if (iss.origin === 'string' && iss.code === 'too_small' && iss.minimum === 1) {
      return m.form_invalid_nonempty({}, { locale });
    } else if (iss.origin === 'string' && iss.code === 'too_small') {
      return m.form_invalid_minimum({ minimum: iss.minimum }, { locale });
    } else if (iss.origin === 'number' && iss.code === 'too_small') {
      return m.form_invalid_number_too_small({ minimum: iss.minimum }, { locale });
    }
  }
});

export { z };